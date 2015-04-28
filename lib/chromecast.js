var CastClient = require('castv2-client').Client;
var MediaReceiver = require('./media-receiver');
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
    console.log('chromecast connected');
    self.connected = true;
  });

  this.client.on('error', function(err){
    console.log('client error', err);
    self.emitter.emit('error', err);
  });

  return this;
};



// directive  : 'play' || 'pause' || 'next' || 'prev' || 'load'
// videoId    : '7lncfxYM4VM'
// host       : 'youtube' || 'vimeo'
Chromecast.prototype.control = function(directive, videoId, host){
  if(this.channel && this.player){

    switch(directive){
      case 'next':
        this.videoIndex++;
        if(!this.channel.videos[this.videoIndex]) this.videoIndex = 0;
        this.player.control({
          action  : 'load',
          videoId : this.channel.videos[this.videoIndex].id,
          host    : this.channel.type
        });
        break;

      case 'prev':
        if(this.videoIndex === 0) this.videoIndex = this.chanel.videos.length - 1;
        else this.videoIndex--;
        this.player.control({
          action  : 'load',
          videoId : this.channel.videos[this.videoIndex].id,
          host    : this.channel.type
        });
        break;

      case 'pause':
        this.player.control({ action : 'pause' });
        break;

      case 'play':
        this.player.control({ action : 'play' });
        break;

      case 'load':
        this.player.control({ action : 'load', videoId : videoId, host : host });
        break;
    }
  }
};



// channelId - someMongoId
Chromecast.prototype.startChannel = function(channelId){
  var self = this;

  console.log('starting channel...');

  this.client.launch(MediaReceiver, function(err, player){
    if(err){
      console.log('channel error', err);
      self.emitter.emit('error', err);
    } else{
      self.player = player;

      channels.lookup(channelId).then(function(channel){
        self.channel = channel;
        self.control('load', channel.videos[self.videoIndex].id, channel.type);
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
          self.control(
            'load',
            self.channel.videos[self.videoIndex].id,
            self.channel.type
          );
        }
      });
    }
  });
};


module.exports = Chromecast;
