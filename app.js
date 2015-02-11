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

app.get('/channels', function(req ,res){
  res.render('channels');
});

app.get('/tvs', function(req ,res){
  res.render('tvs');
});


// api
app.get('/api/channels', function(req, res){
  channels.getAll().then(function(channels){
    res.send(channels);
  });
});

app.get('/api/chromecasts', function(req, res){
  res.send(chromecasts.getAll());
});




var channels = require('./lib/channels');
var chromecasts = require('./lib/chromecasts');
chromecasts.init();
var io = require('socket.io')(server);


// message from the chromecasts back down to the interface
chromecasts.getEmitter().on('status-update', function(data){
  io.sockets.emit('chromecast-status-update', data);
});
chromecasts.getEmitter().on('error', function(err){
  io.sockets.emit('error', err);
});


// create a controlling device the web interface can use
// to manipulate the chromecasts
io.on('connection', function(socket){

  // { url : 'https://someyoutubeplaylist' }
  socket.on('add-channel', function(opts){
    channels.create(opts.url).then(function(channel){
      io.sockets.emit('new-channel', channel);
    });
  });

  // { id : '54da8afad27c5b3e0b467617' }
  socket.on('destroy-channel', function(opts){
    channels.destroy(opts.id).then(function(channelId){
      io.sockets.emit('removed-channel', { _id : channelId });
    });
  });

  // { channelId : 123, chromecastId : 123 }
  socket.on('change-channel', function(opts){
    chromecasts.startChannel(opts);
    io.sockets.emit('change-channel', opts);
  });
});
