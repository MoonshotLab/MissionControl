var ChromeCast = require('./chromecast');
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var events = require('events');
var emitter = new events.EventEmitter();
var chromecasts = [];


exports.init = function(){
  browser.on('serviceUp', function(service){
    console.log('chromecast detected -', service.name);

    // just incase it's already connected
    removeChromecastByName(service.name);

    var chromecast = new ChromeCast({
      id        : service.txtRecord.id,
      name      : service.name,
      address   : service.addresses[0]
    });

    chromecasts.push(chromecast);

    // event handlers
    chromecast.emitter.on('media-status', function(message){
      emitter.emit('media-status', message);
    });
    chromecast.emitter.on('visibility-status', function(message){
      emitter.emit('visibility-status', message);
    });
    chromecast.emitter.on('error', function(err){
      emitter.emit('error', err);
    });
  });

  // remove the chromecast from the array if service down event
  browser.on('serviceDown', function(service){
    console.log('chromecast lost - ', service.name);
    removeChromecastByName(service.name);
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



// name - "troposphere"
var removeChromecastByName = function(name){
  for(var i = 0; i < chromecasts.length; i++){
    if(chromecasts[i].name == name) {
      chromecasts.splice(i, 1);
      break;
    }
  }
};
