import Config from './Config.js';
import * as noti from './noti.js';

/*
 * Config
 */
const cfg = new Config('cfg', 'cfg_');
const dom_cfg = document.getElementById('cfg');
dom_cfg.addEventListener('change', function() {
    cfg.save();
    return false;
});

// Disable DOM elements
//const dom_cfg_nrepeat = document.getElementById('cfg_nrepeat');
//const dom_cfg_nperiod = document.getElementById('cfg_nperiod');
//dom_cfg_nrepeat.addEventListener('change', function() {
//    dom_cfg_nperiod.disabled = !dom_cfg_nrepeat.checked;
//});

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
console.log(noti.push_status());
if (noti.push_status() === "denied") {
    dom_cfg_notification.checked = false;
    dom_cfg_notification.disabled = true;
}
else if (noti.push_status() !== "granted") {
    dom_cfg_notification.checked = false;
}

// Show countdown length
const dom_countdown = document.getElementById('countdown');
const dom_cfg_time = document.getElementById('cfg_time');
dom_cfg_time.addEventListener('change', function() {
    if (!count_intervalID) { // Countdown not active
        dom_countdown.innerHTML = '' + dom_cfg_time.value;
    }
});
dom_countdown.innerHTML = '' + cfg.time;

/* 
 * Countdown
 */

function notify() {
    if (cfg.notification) {
        noti.push('Reminder', {
            body: cfg.msg,
            requireInteraction: cfg.ninteract,
            silent: cfg.nsilent,
            renotify: cfg.nrenotify
        });
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
const dom_test_countdown = document.getElementById('countdown_test');
const test_length = parseInt(dom_test_countdown.innerHTML);
let test_intervalID = null;
dom_btn_test.onclick = function() {
    if (test_intervalID) { return; }
    let remaining = test_length;
    function update() {
        --remaining;
        if (remaining < 0) {
            window.clearInterval(test_intervalID);
            test_intervalID = null;
            dom_test_countdown.innerHTML = '' + test_length;
            notify();
        }
        else {
            dom_test_countdown.innerHTML = '' + remaining;
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
        dom_countdown.innerHTML = '' + remaining;
    }
    update();
    count_intervalID = window.setInterval(update, 1000);
}
