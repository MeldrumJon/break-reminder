import Config from './Config.js';
import SecondsTimer from './SecondsTimer.js';
import * as noti from './noti.js';

function s2mmss(seconds) {
    let neg = (seconds < 0);
    let min = neg ? Math.floor(-seconds/60) : Math.floor(seconds/60);
    let sec = neg ? (-seconds % 60) : (seconds % 60);

    let neg_str = neg ? '-' : '';
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

console.log(cfg);

// Notification Permissions
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

// Update Timer Seconds
const dom_cfg_time = document.getElementById('cfg_time');
dom_cfg_time.addEventListener('change', function() {
    timer.set_seconds(parseInt(dom_cfg_time.value));
});

// User Content
const dom_user = document.getElementById('user');
const dom_cfg_user = document.getElementById('cfg_user');
dom_user.innerHTML = dom_cfg_user.value;
dom_cfg_user.addEventListener('change', function() {
    dom_user.innerHTML = dom_cfg_user.value;
});

/*
 * UI FSM
 */

const dom_body = document.getElementById('reminder');
const dom_cfg_open = document.getElementById('cfg_open');
dom_cfg_open.addEventListener('click', function() {
    dom_body.classList.add('settings');
});
const dom_cfg_close = document.getElementById('cfg_close');
dom_cfg_close.addEventListener('click', function() {
    dom_body.classList.remove('settings');
});
if (cfg._init) {
    dom_body.classList.add('settings');
}

/* 
 * Countdown
 */

let notification = null;

function notify(tmr) {
    if (cfg.title) {
        noti.title(cfg.msg);
    }
    if (cfg.notification) {
        if (notification) {
            notification.onclick = null;
            notification.onclose = null;
            notification.close();
            notification = null;
        }
        notification = noti.push('Reminder', {
            body: cfg.msg,
            requireInteraction: cfg.ninteract,
            silent: cfg.nsilent,
            renotify: cfg.nrenotify
        });
        notification.onclick = function() {
            notification.onclose = null;
            notification.close();
            tmr.action(cfg.auto.noticlick);
        }
        notification.onclose = function() {
            if (!document.hasFocus()) {
                tmr.action(cfg.auto.noticlose);
            }
        }
    }
    if (cfg.focus) {
        window.focus();
    }
    if (cfg.alert) { // Last since it is blocking
        noti.alert(cfg.msg);
        tmr.action(cfg.auto.alertack);
    }
}

// Normal Countdown
const dom_counter = document.getElementById('counter');
const timer = new SecondsTimer(parseInt(cfg.time), function(remainder) {
    dom_counter.innerHTML = s2mmss(remainder);
}, function() {
    notify(timer);
});

const dom_btn_start = document.getElementById('btn_start');
dom_btn_start.addEventListener('click', function() {
    timer.start();
});
const dom_btn_pause = document.getElementById('btn_pause');
dom_btn_pause.addEventListener('click', function() {
    timer.pause();
});
const dom_btn_stop = document.getElementById('btn_stop');
dom_btn_stop.addEventListener('click', function() {
    timer.stop();
});
const dom_btn_restart = document.getElementById('btn_restart');
dom_btn_restart.addEventListener('click', function() {
    timer.restart();
});

// Test Countdown
const dom_counter_test = document.getElementById('counter_test');
const test_timer = new SecondsTimer(3, function(remainder) {
    dom_counter_test.innerHTML = s2mmss(remainder);
}, function() {
    test_timer.stop();
    notify(test_timer);
    test_timer.stop();
});
const dom_btn_test = document.getElementById('btn_test');
dom_btn_test.addEventListener('click', function() {
    test_timer.start();
});

window.addEventListener('focus', function() {
    timer.action(cfg.auto.onfocus);
});
window.addEventListener('blur', function() {
    timer.action(cfg.auto.onblur);
});

if (cfg.auto.load) {
    timer.start();
}

