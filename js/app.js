CLI.init('cli');

var unregisterServiceWorker = () => {};

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then(res => {
            console.log("service worker registered", res);      
            if (navigator.onLine) {
               serviceWorkerUnregister = () => {
                 res.unregister();
                 window.reload();
               };
            }
                     })
        .catch(err => console.log("service worker not registered", err))
    })
  }
}

registerServiceWorker();
