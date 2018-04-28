console.log('hello world');

const xhrElement = document.getElementById('xhr');

var data = null;

var xhr             = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
        xhrElement.innerHTML = this.responseText;
    }
});

xhr.open("GET", "/remote.html");
xhr.setRequestHeader("cache-control", "no-cache");

xhr.send(data);
