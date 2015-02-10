// create web server
var express = require('express');
var http = require('http');
var path = require('path');
var port = process.env.PORT || 3000;
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var server = http.Server(app);
server.listen(port, function(){
  console.log('server started, listening on port ' + port + '...');
});



// some routes and stuff
app.get('/', function(req ,res){
  res.render('index');
});



// create chromecasts
var chromecasts = require('./lib/chromecasts');
chromecasts.init();
chromecasts.getEmitter().on('media-stopped', function(){

});


// create sockets
var io = require('socket.io')(server);
io.on('connection', function(socket){

  // { channelId : 123, chromecastIds : [123, 456, 789] }
  socket.on('play-channel', function(opts){
    chromecasts.play(opts);
    // socket.broadcast.emit('play-channel', opts);
  });
});
