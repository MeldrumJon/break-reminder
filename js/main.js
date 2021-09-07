import Config from './Config.js';
import * as noti from './noti.js';

function s2mmss(seconds) {
    return '' + Math.floor(seconds/60) + 'm ' + (seconds % 60) + 's';
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

// Ask for notification permissions
const dom_cfg_notification = document.getElementById('cfg_notification');
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
if (noti.push_status() === "denied") {
    dom_cfg_notification.checked = false;
    dom_cfg_notification.disabled = true;
}
else if (noti.push_status() !== "granted") {
    dom_cfg_notification.checked = false;
}

// Show countdown length
const dom_counter = document.getElementById('counter');
const dom_cfg_time = document.getElementById('cfg_time');
dom_cfg_time.addEventListener('change', function() {
    if (!count_intervalID) { // Countdown not active
        dom_counter.innerHTML = '' + dom_cfg_time.value;
    }
});
dom_counter.innerHTML = s2mmss(cfg.time);

// Add user content
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

function notify() {
    if (cfg.notification) {
        let notification = noti.push('Reminder', {
            body: cfg.msg,
            requireInteraction: cfg.ninteract,
            silent: cfg.nsilent,
            renotify: cfg.nrenotify
        });
        notification.onclick = function() {
            notification.close();
        }
    }
    if (cfg.title) {
        noti.title(cfg.msg);
    }
    //if (cfg.sound) {
    //}
    if (cfg.alert) { // Last since it is blocking
        noti.alert(cfg.msg);
    }
}

// Test Button
const dom_btn_test = document.getElementById('btn_test');
const dom_test_counter = document.getElementById('counter_test');
const test_length = parseInt(dom_test_counter.innerHTML);
let test_intervalID = null;
dom_btn_test.onclick = function() {
    if (test_intervalID) { return; }
    let remaining = test_length;
    function update() {
        --remaining;
        if (remaining < 0) {
            window.clearInterval(test_intervalID);
            test_intervalID = null;
            dom_test_counter.innerHTML = '' + test_length;
            notify();
        }
        else {
            dom_test_counter.innerHTML = s2mmss(remaining);
        }
    }
    update();
    test_intervalID = window.setInterval(update, 1000);
}

// Real Button
const dom_btn_countdown = document.getElementById('btn_countdown');
let count_intervalID = null;
dom_btn_countdown.onclick = function() {
    dom_btn_countdown.innerHTML = 'Restart';
    if (count_intervalID) {
        window.clearInterval(count_intervalID);
        count_intervalID = null;
    }
    let remaining = parseInt(cfg.time);
    function update() {
        --remaining;
        if (remaining == -1) {
            notify();
        }
        dom_counter.innerHTML = s2mmss(remaining);
    }
    update();
    count_intervalID = window.setInterval(update, 1000);
}
