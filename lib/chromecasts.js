var ChromeCast = require('./chromecast');
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var events = require('events');
var emitter = new events.EventEmitter();
var chromecasts = [];


module.exports = function(io){
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

  return emitter;
};
