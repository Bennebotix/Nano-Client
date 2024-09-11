CLI.init('cli')

var mobile = document.querySelector('#mobile');
setInterval(() => {
    mobile.focus();
    mobile.value = '';
})

function listenForWaitingServiceWorker(reg, callback) {
    function awaitStateChange() {
        reg.installing.addEventListener('statechange', function () {
            if (this.state === 'installed') callback(reg);
        });
    }
    if (!reg) return;
    if (reg.waiting) return callback(reg);
    if (reg.installing) awaitStateChange();
    reg.addEventListener('updatefound', awaitStateChange);
}

// reload once when the new Service Worker starts activating
var refreshing;
navigator.serviceWorker.addEventListener('controllerchange',
    function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    }
);
function promptUserToRefresh(reg) {
    // this is just an example
    // don't use window.confirm in real life; it's terrible
    if (window.confirm("New version available! OK to refresh?")) {
        reg.waiting.postMessage('skipWaiting');
    }
}
listenForWaitingServiceWorker(reg, promptUserToRefresh);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => {
          console.log("service worker registered", res);      
          if (navigator.onLine) {
              res.unregister();
          }
                   })
      .catch(err => console.log("service worker not registered", err))
  })
}
