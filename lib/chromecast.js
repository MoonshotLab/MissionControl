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
  this.channel = {};
  this.videoIndex = 0;

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
    else{
      self.emitter.emit('status-update', {
        chromecastId  : self.id,
        status        : status
      });
    }
  });
};



// 'play' || 'pause' || 'next' || 'prev'
Chromecast.prototype.control = function(directive){
  if(this.channel && this.player){

    switch(directive){
      case 'next':
        this.videoIndex++;
        if(!this.channel.videos[this.videoIndex])
          this.videoIndex = 0;
        if(this.player){
          this.player.stop();
          this.play(this.channel.videos[this.videoIndex].id);
        }
        break;

      case 'prev':
        if(this.videoIndex === 0)
          this.videoIndex = this.chanel.videos.length - 1;
        else this.videoIndex--;
        this.player.stop();
        this.play(this.channel.videos[this.videoIndex].id);
        break;

      case 'pause':
        this.player.pause();
        break;

      case 'play':
        this.player.play();
        break;
    }
  }
};



// channelId - someMongoId
Chromecast.prototype.startChannel = function(channelId){
  var self = this;

  this.client.launch(Youtube, function(err, player){
    if(err) self.emitter.emit('error', err);
    else{
      self.player = player;

      channels.lookup(channelId).then(function(channel){
        self.channel = channel;
        self.play(self.channel.videos[self.videoIndex].id);
      });

      self.player.on('status', function(status){
        // player state can have the following values:
        // IDLE, LOADING, LOADED, PLAYING, PAUSED, STOPPED, SEEKING, ERROR
        self.emitter.emit('status-update', {
          chromecastId  : self.id,
          status        : status
        });

        if(status.playerState == 'IDLE' && status.idleReason == 'FINISHED'){
          self.videoIndex++;
          if(!self.channel.videos[self.videoIndex]) self.videoIndex = 0;
          self.play(self.channel.videos[self.videoIndex].id);
        }
      });
    }
  });
};


module.exports = Chromecast;
