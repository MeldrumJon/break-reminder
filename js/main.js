import Config from './Config.js';
import SecondsTimer from './SecondsTimer.js';
import * as noti from './noti.js';

const s2mmss = function(seconds) {
    const neg = (seconds < 0);
    const min = neg ? Math.floor(-seconds/60) : Math.floor(seconds/60);
    const sec = neg ? (-seconds % 60) : (seconds % 60);

    const neg_str = neg ? '-' : '';
    let min_str = '' + min;
    let sec_str = '' + sec;
    if (min_str.length<=1) min_str = '0' + min_str;
    if (sec_str.length<=1) sec_str = '0' + sec_str;

    return neg_str + min_str + ':' + sec_str;
}

/*
 * Config
 */

const cfg = new Config('cfg', 'cfg_');

const dom_cfg = document.getElementById('cfg');

dom_cfg.addEventListener('change', function() {
    cfg.save();
    return false;
});

/* Notification Permissions */

const dom_cfg_notification = document.getElementById('cfg_notification');

if (noti.push_status() === "denied") {
    dom_cfg_notification.checked = false;
    dom_cfg_notification.disabled = true;
}
else if (noti.push_status() !== "granted") {
    dom_cfg_notification.checked = false;
}

dom_cfg_notification.addEventListener('change', function() {
    if (!dom_cfg_notification.checked) {
        return;
    };
    noti.push_ask_permission(function(permission) {
        if (permission === "denied") {
            dom_cfg_notification.checked = false;
            dom_cfg_notification.disabled = true;
        }
        else if (permission !== "granted") {
            dom_cfg_notification.checked = false;
        }
    });
});

/* Update Timer/Countdown Seconds */

const parseTime = function(amount, units) {
    switch (units) {
        case 'days':
            amount = 24*amount;
        case 'hours':
            amount = 60*amount;
        case 'minutes':
            amount = 60*amount;
        case 'seconds':
            amount = amount;
    }
    return amount;
}

const dom_cfg_time = document.getElementById('cfg_time');
const dom_cfg_units = document.getElementById('cfg_units');

const onTimeChange = function() {
    timer.set_seconds(parseTime(dom_cfg_time.value, dom_cfg_units.value));
}

dom_cfg_time.addEventListener('change', onTimeChange);
dom_cfg_units.addEventListener('change', onTimeChange);

/* User Content */

// Set elm's inner HTML, allowing user-provided scripts
const setInnerHTML = function(elm, html) {
  elm.innerHTML = html;
  Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
    const newScript = document.createElement("script");
    Array.from(oldScript.attributes)
      .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

const dom_user = document.getElementById('user');
const dom_cfg_user = document.getElementById('cfg_user');

const setUserContent = function() {
    setInnerHTML(dom_user, dom_cfg_user.value);
    document.body.classList.remove('user', 'nouser');
    if (dom_cfg_user.value !== '') {
        document.body.classList.add('user');
    }
    else {
        document.body.classList.add('nouser');
    }
}

dom_cfg_user.addEventListener('change', setUserContent);
setUserContent();

/*
 * UI FSM
 */

const dom_body = document.getElementById('reminder');
const dom_cfg_open = document.getElementById('cfg_open');
const dom_cfg_close = document.getElementById('cfg_close');

dom_cfg_open.addEventListener('click', function() {
    dom_body.classList.add('settings');
});

dom_cfg_close.addEventListener('click', function() {
    dom_body.classList.remove('settings');
});

if (cfg._init) {
    dom_body.classList.add('settings');
}

/* 
 * Countdown
 */

const dom_counter = document.getElementById('counter');

let force_show_remaining = false;
dom_counter.addEventListener('click', function() {
    force_show_remaining = !force_show_remaining;
});

const time_update = function(remainder) {
    if (cfg.remaining || force_show_remaining || !this.running() || this.timeup()) {
        dom_counter.innerHTML = s2mmss(remainder);
    }
    else {
        dom_counter.innerHTML = '&middot;&middot;&middot;';
    }

    if (document.hasFocus() || !this.running()) {
        noti.clear();
    }
    else if (this.running() && this.timeup() && (remainder % 2) == 0) {
        if (cfg.title) {
            noti.toggle_title(cfg.msg);
        }
        if (cfg.colors) {
            noti.toggle_class();
        }
        if (cfg.notification && cfg.notifications.nrepeat) {
            noti.toggle_push('Reminder', {
                body: cfg.msg,
                requireInteraction: cfg.notifications.ninteract,
                silent: cfg.notifications.nsilent,
                renotify: cfg.notifications.nrenotify
            }, function cb_onclick() {
                timer.action(cfg.auto.noticlick);
            }, function cb_onclose() {
                if (!document.hasFocus()) {
                    timer.action(cfg.auto.noticlose);
                }
            });
        }
    }
}

const time_up = function() {
    if (cfg.notification && !cfg.notifications.nrepeat) {
        noti.push_push('Reminder', {
            body: cfg.msg,
            requireInteraction: cfg.notifications.ninteract,
            silent: cfg.notifications.nsilent,
            renotify: cfg.notifications.nrenotify
        }, function cb_onclick() {
            timer.action(cfg.auto.noticlick);
        }, function cb_onclose() {
            if (!document.hasFocus()) {
                timer.action(cfg.auto.noticlose);
            }
        });
    }
    if (cfg.focus) {
        noti.focus();
    }
    if (cfg.alert) { // Last since it is blocking
        noti.alert(cfg.msg);
        // this == timer
        this.action(cfg.auto.alertack);
    }
}

const timer = new SecondsTimer(parseTime(cfg.time, cfg.units), time_update, time_up);

const dom_btn_start = document.getElementById('btn_start');
const dom_btn_pause = document.getElementById('btn_pause');
const dom_btn_stop = document.getElementById('btn_stop');
const dom_btn_restart = document.getElementById('btn_restart');
dom_btn_start.addEventListener('click', function() { timer.start(); });
dom_btn_pause.addEventListener('click', function() { timer.pause(); });
dom_btn_stop.addEventListener('click', function() { timer.stop(); });
dom_btn_restart.addEventListener('click', function() { timer.restart(); });

window.addEventListener('focus', function() {
    timer.action(cfg.auto.onfocus);
    noti.toggle_class(true);
});
window.addEventListener('blur', function() {
    timer.action(cfg.auto.onblur);
    force_show_remaining = false;
});

if (cfg.auto.load) {
    timer.start();
}

