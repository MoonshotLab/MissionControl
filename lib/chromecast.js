var CastClient = require('castv2-client').Client;
var Youtube = require('castv2-youtube').Youtube;
var events = require('events');
var channels = require('./channels');



var Chromecast = function(opts){
  var self = this;
  for(var key in opts){
    self[key] = opts[key];
  }

  this.emitter = new events.EventEmitter();
  this.client = new CastClient();
  this.player = null;

  this.client.connect(opts.address, function(){
    self.connected = true;
  });

  this.client.on('error', function(err){
    self.emitter.emit('error', err);
  });

  return this;
};



// media - '7lncfxYM4VM'
Chromecast.prototype.play = function(media){
  this.player.load(media, { autoplay : true }, function(err, status){
    if(err) self.emitter.emit('error', err);
    else self.emitter.emit(status.playerState, status);
  });
};



// channelId - someMongoId
Chromecast.prototype.startChannel = function(channelId){
  var self = this;
  var mediaIndex = 0;
  var channel = null;

  this.client.launch(Youtube, function(err, player){
    if(err) self.emitter.emit('error', err);
    else{
      self.player = player;
      channels.lookup(channelId).then(function(daChannel){
        channel = daChannel;
        self.play(channel.videos[mediaIndex].id);
      });

      self.player.on('status', function(status){
        // player state can have the following values:
        // IDLE, LOADING, LOADED, PLAYING, PAUSED, STOPPED, SEEKING, ERROR
        self.emitter.emit('status', status);

        if(status.player == 'IDLE' && status.idleReason == 'FINISHED'){
          mediaIndex++;
          if(!channel.videos[mediaIndex]) mediaIndex = 0;
          self.play(channel.videos[mediaIndex].id);
        }
      });
    }
  });
};


module.exports = Chromecast;
