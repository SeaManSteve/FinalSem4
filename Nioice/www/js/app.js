


var app = {
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        window.location.href = "map.html";
    },
};

app.initialize();