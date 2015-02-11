var ChromeCast = require('./chromecast');
var mediaManager = require('./media-manager');
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
      chromecast.play(opts.channelId);
    }
  });
};
