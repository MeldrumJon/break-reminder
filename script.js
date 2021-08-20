const ask = document.getElementById('ask');
ask.onclick = function () {
  pushAsk();
}

const btn = document.getElementById('push');

btn.onclick = function() {
  let i = 0;
  //let interval = window.setInterval(function() {
  //  let n = new Notification("Hello world notification", {
  //    body: "test multiple notification: " + i++,
  //    tag: 'myNotiTag',
  //    renotify: true,
  //    requireInteraction: true
  //  });

  //  n.onclick = function() {
  //    window.clearInterval(interval);
  //    n.close();
  //  }
  //}, 1000);

    window.setInterval(function() {
      alert("This is an alert!");
    }, 3000);
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
