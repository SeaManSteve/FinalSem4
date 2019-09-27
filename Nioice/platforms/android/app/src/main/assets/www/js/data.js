var app = {
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        // Load the Visualization API and the corechart package.
        google.charts.load('current', {'packages':['corechart']});

        // Set a callback to run when the Google Visualization API is loaded.
        google.charts.setOnLoadCallback(drawChart);
    },
    onDeviceReady: function () {
        console.log("Cordova is ready on New Page");
    }
};

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