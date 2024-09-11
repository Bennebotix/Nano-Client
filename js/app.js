CLI.init('cli');

var mobile = document.querySelector('#mobile');
setInterval(() => {
    mobile.focus();
    mobile.value = '';
})

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
