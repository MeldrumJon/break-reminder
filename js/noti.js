/*
 * Toggle Title
 */

const noti_class = 'noti';
const page_title = document.title;

// If msg == string, toggle that message in the window title
// if msg == null, revert the message to the last page title
export function toggle_title(msg) {
    document.title = 
        (msg === null) ? page_title :
        (document.title === page_title) ? msg : 
        page_title;
}

/*
 * Toggle Class
 */

export function toggle_class(stop=false) {
    if (stop) {
        document.body.classList.remove('noti');
        return;
    }
    if (document.body.classList.contains('noti')) {
        document.body.classList.remove('noti');
    }
    else {
        document.body.classList.add('noti');
    }
}

/*
 * Window Alert
 */

export function alert(msg) {
    window.alert(msg);
}

/*
 * Window Focus
 */

export function focus() {
    window.focus();
}

/*
 * Push Notifications
 */

var push_noti = null;

export function push_ask_permission(callback) {
    if (Notification.permission === 'granted') { 
        callback(Notification.permission);
        return;
    }

    // Let's check if the browser supports notifications
    if (!"Notification" in window) {
        console.log("This browser does not support notifications.");
    } else {
        Notification.requestPermission().then(function (permission) {
            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }
            callback(permission);
        });
    }
}

export function push_status() {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
}

export function push_push(title, obj, cb_onclick, cb_onclose) {
    push_noti = new Notification(title, obj);
    push_noti.onclick = function() {
        push_noti.onclose = null;
        push_noti.close();
        cb_onclick();
        push_noti = null;
    }
    push_noti.onclose = function() {
        cb_onclose();
        push_noti = null;
    }
}

export function push_unpush() {
    if (push_noti) {
        push_noti.onclick = null;
        push_noti.onclose = null;
        push_noti.close();
        push_noti = null;
    }
}

export function toggle_push(title, obj, cb_onclick, cb_onclose) {
    if (push_noti) {
        push_unpush();
    }
    else {
        push_push(title, obj, cb_onclick, cb_onclose);
    }
}

/*
 * Sounds
 */

export function sound(dom_audio) {
    dom_audio.currentTime = 0;
    dom_audio.play();
}

/*
 * Clear
 */

export function clear(c) {
    toggle_title(null);
    toggle_class(true);
    push_unpush();
}
