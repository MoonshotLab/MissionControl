var CastClient = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var events = require('events');



var Chromecast = function(opts){
  this.emitter = new events.EventEmitter();
  this.client = new CastClient();

  this.client.connect(opts.address, function(){
    chromecast.connected = true;
  });

  this.client.on('error', function(err){
    emitter.emit('error', err);
  });
};



Chromecast.prototype.play = function(){
  var self = this;

  var attachPlayerEvents = function(player){
    player.on('status', function(status){
      console.log(status);
    });

    player.load(media, { autoplay : true }, function(err, status){
      if(err) self.emitter.emit('error', err);
    });
  };

  this.client.launch(DefaultMediaReceiver, function(err, player){
    if(err) self.emitter.emit('error', err);
    else attachPlayerEvents(player);
  });
};



module.exports = Chromecast;
