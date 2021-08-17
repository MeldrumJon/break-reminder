const ask = document.getElementById('ask');
ask.onclick = function () {
  pushAsk();
}

const btn = document.getElementById('push');

btn.onclick = function() {
  let noti = new Notification("test2",{
    body: "Hello world",
    requireInteraction: true
  });
}

function pushAsk() {
  function checkNotificationPromise() {
    try {
      Notification.requestPermission().then();
    }
    catch {
      return false;
    }
    return true;
  }

  function handlePermission(permission) {
    if(!('permission' in Notification)) {
      Notification.permission = permission;
    }
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

function pushStatus() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

function pushNotify(title, body) {
  let obj;
  if (body) {
    obj = {body: body};
  }
  return new Notification(title, obj);
}
