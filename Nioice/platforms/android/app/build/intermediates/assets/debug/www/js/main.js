var app = {
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        google.charts.load('current', {'packages':['corechart']});
        // Set a callback to run when the Google Visualization API is loaded.
        google.charts.setOnLoadCallback(drawChart);
    },
    onDeviceReady: function () {
        $("#btnLogOut").hide();
        $("#container").hide();
        $("#dataView").hide();
        $("#imgView").hide();
        cordova.plugins.notification.local.on("trigger", function(notification) {
            total += 1;
            firebase.database().ref().child("SpotList").child('Spot' + selectedID).update({
                open:true,
                plate: "placeholder",
                platePhoto: "placeholder",
                userId: 0
            });
            firebase.database().ref().child("userList").child("user" + loginUser).update({
                openRes: 1,
                totalRes: total
            });
        });
      //  getMapLocation();
        getMap();
    }
};
var long = undefined;
var lati = undefined;
var mark;
var spots = [];
var selectedID = -1;
var loginUser = -1;
var aval = 1;
var photoData;
var total;
var edit;
function Spot() {
    constructor(id, imgLic,  lat, long, opem)
    {
        this.id = id;
        this.imgLic = imgLic;
        this.lat = lat;
        this.long = long;
        this.open = open;
    }
}

function getMapLocation(){
    navigator.geolocation.getCurrentPosition(onMapSuccess, onMapError,{enableHighAccuracy: true} );
}
function startMap() {
    var pos;

    var bigOne = document.getElementById('bigGay');
    var dbRef = firebase.database().ref().child('SpotList');
    var path;

    dbRef.on('value', function (snapshot) {
        refreshMarkers();
        snapshot.forEach(function (childShot) {
            var pos = {lat :parseFloat(childShot.child("lat").val()), lng:parseFloat(childShot.child("long").val())};
            if (childShot.child("open").val()){
                path = "https://firebasestorage.googleapis.com/v0/b/babainskifinal.appspot.com/o/check.png?alt=media&token=2932eac0-cc82-42a4-9c5f-6b16da95730a" ;
            }else{
                path = "https://firebasestorage.googleapis.com/v0/b/babainskifinal.appspot.com/o/a11675768.png?alt=media&token=d224da17-0604-4e38-8184-1ea940dd326d" ;
            }
            id = "" + childShot.child("id").val();
            mark = new google.maps.Marker({
                position: pos,
                map:map,
                title:id,
                note:childShot.child("open").val(),
                icon: path
            });
            spots.push(mark);
            google.maps.event.addListener(mark, 'click', function(){
                if(!this.note){
                    if(edit){
                        selectedID = this.title;
                        navigator.notification.confirm(
                            'Are you sure you want to delete this reservation ',
                            deleteRes,
                            'Confirm Reservation'
                        );
                        $("#imgView").show();
                        $("#imgView").attr("src", "data:image/x-icon;base64," + childShot.child("platePhoto").val());

                    }
                    alert("This Spot is already reserved, if there is no one in this spot, or if you" +
                        " think that this is an error and contact on of the condo board members" +
                        " to resove this issue.");

                }else{
                    if (aval !== 0){
                        selectedID = this.title;
                        alert("You've Selected Spot"+ selectedID);
                    }
                }
            });
        })
    });

}
function deleteRes(deleteVal) {
    if (deleteVal !== 1 && deleteVal !== 0 && deleteVal !== 2){
        firebase.database().ref().child("SpotList").child('Spot' + selectedID).update({
            open:true,
            plate: "placeholder",
            platePhoto: "placeholder"
        });
        $("#imgView").hide();
    }

}
function refreshMarkers() {
    for (var i = 0; i < spots.length; i++){
        spots[i].setMap(null);
    }
    spots = [];
}
function onConfirm(buttonResult) {
    takePhoto();
    navigator.notification.prompt(
        'Please enter the license plate of your guest',
        onPrompt,
        'Confirm Visitor Plate',
        ['Ok', 'Cancel'],
        'License #'
    );
}
function onPrompt(results) {

    aval = 0;
    firebase.database().ref().child("SpotList").child('Spot' + selectedID).update({
        open:false,
        plate: results.input1,
        platePhoto: photoData,
        userId:loginUser
    });
    firebase.database().ref().child("userList").child("user" + loginUser).update({
        openRes: 0

    });

    
}
//var onMapSuccess = function(position){
  //  long = position.coords.longitude;
    //lati = position.coords.latitude;

//    getMap(lati, long);
//}

function getMap(){
    var mapOptions = {
        center: new google.maps.LatLng(43.37663034291629, -79.80706995037127),
        zoom:17,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    startMap();
}
function onMapError(error){
    console.log("code: " + error.code + '\n' +
    'message: ' + error.message + '\n');
}
function takePhoto() {
    var options = {
        destinationType: Camera.DestinationType.DATA_URL,
        cameraDirection: Camera.Direction.FRONT,
        allowEdit: true,
        correctOrientation: true
    };
    navigator.camera.getPicture(cameraSuccess, cameraError, options);

}
function cameraSuccess(imageData) {
    photoData = imageData;
}
function cameraError(errorData){
    alert("Camera Error!c");
}
$("#btnSave").click(function () {
    if (loginUser === -1) {
        alert("You must log in to reserve a spot!");
    }else if(selectedID === -1){
        alert("You must select a spot!");
    }else if (aval === 0){
        alert("You already have a space reserved, if this is an error contact one of your condo board members");
    }else{
        navigator.notification.confirm(
            'Are you sure you want to reserve spot '
            + selectedID + " for the next 24 hours? You will be prompted to" +
            "take a photo of your guests licenece plate",
            onConfirm,
            'Confirm Reservation'
        );
        cordova.plugins.notification.local.schedule({
            title: "Reservation expired!",
            text: "Your reservation on spot" + selectedID + " has ended!",
            trigger: {in: 60, unit: "second"},
            foreground: true,
            background: true
        });
    }
});

$("#btnSubmit").click(function () {
   var username = $("#username").val().trim();
   var password = $("#password").val().trim();
    var dbRef = firebase.database().ref().child('userList');
    dbRef.on('value', function (snapshot) {
        snapshot.forEach(function (childShot) {
            if (childShot.child("username").val() === username && childShot.child("password").val() === password) {
                $("#UserId").text(childShot.child("name").val());
                $("#loginText").text("Reservations available to use:" + childShot.child("openRes").val());
                $("#loginform").hide();
                $("#btnLogOut").show();
                $("#btnSubmit").hide();
                loginUser = childShot.child("id").val();
                aval = childShot.child("openRes").val();
                total = childShot.child("totalRes").val();
                if(childShot.child("role").val() === "admin"){
                    $("#dataView").show();
                    edit = true;
                }else{
                    edit = false;
                }
            }
        });
    });

});
$("#btnLogOut").click(function () {
   $("#UserId").text("No user Selected");
   $("#loginText").text("Login");
   $("#loginform").show();
   $("#btnLogOut").hide();
   $("#btnSubmit").show();
   $("#dataView").hide();
   loginUser = -1;
});

$("#dataView").click(function () {
    var checked = $(this);
    if($("#container").is(":visible")){
        $("#container").hide();
    }else{
        $("#container").show();
    }
});
var array = [];
function drawChart(){

    var dbRef = firebase.database().ref().child('userList');

    dbRef.on('value', function (snapshot) {
        refreshArray();
        snapshot.forEach(function (childShot) {
            var user = {name: childShot.child("name").val(), timesUsed: childShot.child("totalRes").val()};
            array.push(user);

        });
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'UserName');
        data.addColumn('number', 'Number of Reservations');
        for(var i = 0; i < array.length;i++){
            data.addRows([[array[i].name, array[i].timesUsed]]);
        }
        var pieOptions = {
            'title':'User Data',
            'titleTextStyle':{color: 'white', fontName: 'Helvetica, Arial, sans-serif', fontSize:20},
            'legend':{textStyle:{color: 'white', fontName: 'Helvetica, Arial, sans-serif', fontSize:10}},
            'width':300,
            'height':300,
            'backgroundColor':'#3a3a3a',
            'is3D':true
        };

        var barOptions ={
            'title':'User Data',
            'titleTextStyle':{color: 'white', fontName: 'Helvetica, Arial, sans-serif', fontSize:20},
            'legend':{textStyle:{color: 'white', fontName: 'Helvetica, Arial, sans-serif', fontSize:10}},
            'width':300,
            'height':300,
            'backgroundColor':'#3a3a3a',
            'vAxis':{
                title:'Users',
                titleTextStyle:{color: 'white', fontName: 'Helvetica, Arial, sans-serif', fontSize:10},
                textStyle:{color: 'white', fontName: 'Helvetica, Arial, sans-serif'}
            },
            'hAxis':{
                title:'Times Reserved',
                titleTextStyle:{color: 'white', fontName: 'Helvetica, Arial, sans-serif'},
                textStyle:{color: 'white', fontName: 'Helvetica, Arial, sans-serif'}
            }

        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        var barChart = new google.visualization.BarChart(document.getElementById('bar_div'));
        chart.draw(data, pieOptions);
        barChart.draw(data, barOptions);
    });
}
function refreshArray(){
    array = [];
}


app.initialize();