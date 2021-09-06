/*
 * Page Title
 */

let page_title = document.title;

export function title(msg) {
    if (document.hasFocus()) { return; }
    let toggle = function() {
        document.title = (document.title === page_title) ? msg : page_title;
    }
    let interval_id = window.setInterval(toggle, 1000);

    let clear = function() {
        window.removeEventListener('focus', clear);
        window.clearInterval(interval_id);
        document.title = page_title;
    }
    window.addEventListener('focus', clear);
}

/*
 * Window Alert
 */

export function alert(msg) {
    window.alert(msg);
}

/*
 * Push Notifications
 */

export function push_ask_permission(callback) {
    function checkNotificationPromise() {
        try {
            Notification.requestPermission().then();
        } catch {
            return false;
        }
        return true;
    }

    function handlePermission(permission) {
        if(!('permission' in Notification)) {
            Notification.permission = permission;
        }
        callback(permission);
    }

    // Let's check if the browser supports notifications
    if (!"Notification" in window) {
        console.log("This browser does not support notifications.");
    } else {
        if (checkNotificationPromise()) {
            Notification.requestPermission()
            .then(function (permission) {
                handlePermission(permission);
            })
        } else {
            Notification.requestPermission(function(permission) {
                handlePermission(permission);
            });
        }
    }
}

export function push_status() {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
}

/*
 * Wrapper for Notification.constructor
 */
export function push(title, obj) {
    return new Notification(title, obj);
}

/*
 * Sounds
 */

export function sound(dom_audio) {
    dom_audio.currentTime = 0;
    dom_audio.play();
}

