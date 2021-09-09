import Config from './Config.js';
import * as noti from './noti.js';

function s2mmss(seconds) {
    if (seconds < 0) {
        return '- ' + Math.floor(-seconds/60) + 'm ' + (-seconds % 60) + 's';
    }
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
    if (!intervalID) { // Countdown not active
        dom_counter.innerHTML = s2mmss(dom_cfg_time.value);
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
    if (cfg.alert) { // Last since it is blocking
        noti.alert(cfg.msg);
    }
}

function countdown(seconds, dom_countdown) {
    let target = new Date(Date.now() + 1000*seconds);
    let notified = 0;

    function update() {
        let difference = target.getTime() - Date.now();
        dom_countdown.innerHTML = s2mmss(Math.floor((difference-1)/1000));
        if (!notified && difference < 0) {
            notified = 1;
            notify();
        }
    }
    update();
    return window.setInterval(update, 1000);
}

// Test Button
const test_length = 3;
const dom_btn_test = document.getElementById('btn_test');
const dom_counter_test = document.getElementById('counter_test');
dom_counter_test.innerHTML = s2mmss(test_length);

let test_intervalID = null;

dom_btn_test.onclick = function() {
    if (test_intervalID) { // Restart
        window.clearInterval(test_intervalID);
        test_intervalID = null;
    }
    test_intervalID = countdown(test_length, dom_counter_test);
}

// Real Button
const dom_btn_countdown = document.getElementById('btn_countdown');
// const dom_counter in settings area

let intervalID = null;

dom_btn_countdown.onclick = function() {
    dom_btn_countdown.innerHTML = 'Restart';

    if (intervalID) { // Restart
        window.clearInterval(intervalID);
        intervalID = null;
    }
    intervalID = countdown(parseInt(cfg.time), dom_counter);
}

