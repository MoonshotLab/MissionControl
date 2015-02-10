var ChromeCast = require('./chromecast');
var mediaManager = require('./media-manager');
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var events = require('events');
var emitter = new events.EventEmitter();
var chromecasts = [];


module.exports = function(){
  browser.on('serviceUp', function(service){
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


  // { channelId : 123, chromecastIds : [123, 456, 789] }
  this.play = function(opts){
    var filtered = chromecasts.filter(function(chromecast){
      if(opts.chromecastIds.indexOf(chromecast.id) != -1) return true;
    });

    mediaManager.create({ channelId : opts.channelId, chromecasts : filtered });
  };


  return emitter;
};
