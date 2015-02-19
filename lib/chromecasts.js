var ChromeCast = require('./chromecast');
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var events = require('events');
var emitter = new events.EventEmitter();
var chromecasts = [];


exports.init = function(){
  browser.on('serviceUp', function(service){
    console.log('chromecast detected - ', service.name);

    var chromecast = new ChromeCast({
      id        : service.txtRecord.id, // no idea if this is correct
      name      : service.name,
      address   : service.addresses[0]
    });

    chromecasts.push(chromecast);
    chromecast.emitter.on('status-update', function(data){
      emitter.emit('status-update', data);
    });
    chromecast.emitter.on('error', function(err){
      emitter.emit('error', err);
    });
  });

  browser.on('serviceDown', function(service){
    console.log('chromecast lost', service);
  });

  browser.start();
};



exports.getEmitter = function(){
  return emitter;
};



exports.getAll = function(){
  var data = [];

  chromecasts.forEach(function(chromecast){
    data.push({
      id          : chromecast.id,
      name        : chromecast.name,
      connected   : chromecast.connected,
      videoIndex  : chromecast.videoIndex,
      channel     : chromecast.channel,
      address     : chromecast.address
    });
  });

  return data;
};



// id - 123
exports.getById = function(id){
  var chromecast = null;

  chromecasts.forEach(function(cast){
    if(id == cast.id) chromecast = cast;
  });

  return chromecast;
};
