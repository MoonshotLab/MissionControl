// create web server
var express = require('express');
var http = require('http');
var path = require('path');
var crypto = require('crypto');
var config = require('./config')();
var vimeo = require('./lib/vimeo');
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
  res.render('tvs');
});

// pass vimeo client id and callback so the client can redirect to vimeo
// authentication if necessary
app.get('/channels', function(req ,res){
  res.render('channels', {
    config : {
      VIMEO_CLIENT_ID     : config.VIMEO_CLIENT_ID,
      VIMEO_AUTH_CALLBACK : config.VIMEO_AUTH_CALLBACK
    }
  });
});

app.get('/tvs', function(req ,res){
  res.render('tvs');
});

// deal with vimeo authentication callback and encrypt the token for proper
// client handling
app.get('/vimeo-auth-callback', function(req ,res){
  vimeo.getAccessToken(req.query.code)
    .then(function(accessToken){
      var cipher = crypto.createCipher('aes-256-ctr', config.CRYPTO_KEY);
      var crypted = cipher.update(accessToken, 'utf8', 'hex');
      crypted += cipher.final('hex');

      res.redirect('/channels?token=' + crypted);
    })
    .fail(function(err){
      console.log(err);
    });
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

  // {
  //    url   : a youtube paylist url or vimeo album url
  //    token : optional token if the vimeo album is private
  // }
  socket.on('add-channel', function(opts){
    channels.create(opts).then(function(channel){
      io.sockets.emit('new-channel', channel);
    }).fail(function(err){
      io.sockets.emit('error', err);
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
    var chromecast = chromecasts.getById(opts.chromecastId);
    chromecast.startChannel(opts.channelId);

    channels.lookup(opts.channelId).then(function(channel){
      io.sockets.emit('change-channel', {
        chromecastId  : opts.chromecastId,
        channel       : channel
      });
    });
  });

  // { chromecastId : 123, directive : 'play' || 'pause' || 'next' || 'prev'}
  socket.on('chromecast-control', function(opts){
    var chromecast = chromecasts.getById(opts.chromecastId);
    chromecast.control(opts.directive);
  });
});
