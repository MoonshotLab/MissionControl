var CastClient = require('castv2-client').Client;
var MediaReceiver = require('./media-receiver');
var events = require('events');
var channels = require('./channels');
var utils = require('./utils');



var Chromecast = function(opts){
  var self = this;
  for(var key in opts){
    self[key] = opts[key];
  }

  this.emitter = new events.EventEmitter();
  this.client = new CastClient();
  this.visibility = null;
  this.mediaStatus = null;
  this.player = null;
  this.channel = {};
  this.videoIndex = 0;

  this.client.connect(opts.address, function(){
    console.log('chromecast connected -', self.name);
  });

  this.client.on('error', function(err){
    console.log('chromecast Error -', self.name, err);
    self.emitter.emit('error', parseError(err));
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

  this.client.launch(MediaReceiver, function(err, player){
    if(err){
      console.log('chromecast Error -', self.name, err);
      self.emitter.emit('error', err);
    } else{
      self.player = player;

      channels.lookup(channelId).then(function(channel){
        self.channel = channel;
        self.control('load', channel.videos[self.videoIndex].id, channel.type);
      });

      self.player.on('visibility-status', function(status){
        // state can have the following values:
        // unknown, visible, notvisible
        self.visibility = status.state;
        self.emitter.emit('visibility-status', {
          chromecastId  : self.id,
          type          : status.type,
          status        : status.state
        });
      });

      self.player.on('media-status', function(status){
        // player state can have the following values:
        // BUFFERING, CUED, ENDED, PAUSED, PLAYING, UNSTARTED
        self.mediaStatus = status.state;
        self.emitter.emit('media-status', {
          chromecastId  : self.id,
          type          : status.type,
          status        : status.state,
          currentVideo  : self.channel.videos[self.videoIndex]
        });

        if(status.state == 'ENDED'){
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



Chromecast.prototype.getAbbreviated = function(){
  return {
    id          : this.id,
    name        : this.name,
    connected   : this.connected,
    videoIndex  : this.videoIndex,
    channel     : this.channel,
    address     : this.address,
    mediaStatus : this.mediaStatus,
    visibility  : this.visibility,
    description : utils.findChromecastDescriptionByName(this.name)
  };
};



// errors comeback in a completely ridiculous fashion
var parseError = function(message){
  var err = { type : null, message : message };

  try{
    for(var key in message){
      if(message[key] == 'ETIMEDOUT') err.type = 'timeout';
    }
  } catch(e){ /* swallow */ }

  return err;
};


module.exports = Chromecast;
