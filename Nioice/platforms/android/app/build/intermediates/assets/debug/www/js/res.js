var app = {
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);

    },
    onDeviceReady: function () {
        console.log("Cordova is ready on New Page");
        generateTakenSpots();
    }
};
var imgArray = [];
var userArray = [];
function generateTakenSpots(){
    var dbRef = firebase.database().ref().child('SpotList');
    var stringDiv;
    var userID;
    var userNameTxt;
    var dbRef2 = firebase.database().ref().child("userList");

    
    dbRef.on("value", function (snapshot) {
        refreshArrays();
        snapshot.forEach(function (childshot) {
           if(!childshot.child("open").val()){
               alert(childshot.child("platePhoto").val());
              stringDiv = $("<img>").attr({
                  src: "data:image/x-icon;base64," + childshot.child("platePhoto").val()
              }).height(50).width(50);

              imgArray.push(stringDiv);
              userID = childshot.child("userId").val();
               dbRef2.on("value",function (snapshot1) {
                   snapshot1.forEach(function (childshot1) {
                       if(userID === childshot1.child("id").val()){
                           userNameTxt = $("<p></p>").text(childshot1.child("name").val());
                           userArray.push(userNameTxt);
                       }
                   });
               });
           }
        });
        dbRef2.on("value",function (snapshot1) {
            snapshot1.forEach(function (childshot1) {
                if(userID === childshot1.child("id").val()){
                    userNameTxt = $("<p></p>").text(childshot1.child("name").val());
                    userArray.push(userNameTxt);
                }
            });
        });
        for (var i = 0; i < imgArray.length; i++){
            $("body").append(imgArray[i]);
            $("body").append(userArray[i]);
        }
    });
}



function refreshArrays(){
    imgArray = [];
    userArray = [];
}
app.initialize();