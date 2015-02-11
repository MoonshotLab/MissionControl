var ChromeCast = require('./chromecast');
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var events = require('events');
var emitter = new events.EventEmitter();
var chromecasts = [];


exports.init = function(){
  browser.on('serviceUp', function(service){
    console.log('mdns service working');

    service.addresses.forEach(function(address){
      var chromecast = new ChromeCast({
        id        : service.txtRecord.id, // no idea if this is correct
        name      : service.name,
        address   : address
      });

      chromecasts.push(chromecast);
      chromecast.emitter.on('status-update', function(data){
        emitter.emit('status-update', data);
      });
      chromecast.emitter.on('error', function(err){
        emitter.emit('error', err);
      });
    });
  });

  browser.start();
};


exports.getEmitter = function(){
  return emitter;
};


// { channelId : 123, chromecastId : 123 }
exports.startChannel = function(opts){
  chromecasts.forEach(function(chromecast){
    if(opts.chromecastId == chromecast.id){
      chromecast.startChannel(opts.channelId);
    }
  });
};
