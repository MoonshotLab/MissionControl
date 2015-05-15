var ChromeCast = require('./chromecast');
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var events = require('events');
var emitter = new events.EventEmitter();
var chromecasts = [];


exports.init = function(){
  // for some reason these things tend to report 'up' frequently
  browser.on('serviceUp', function(service){
    if(!chromecastExists(service.txtRecord.id)){
      console.log('chromecast detected -', service.name);
      createChromecast(service);
    }
  });

  // remove the chromecast from the array if service down event
  browser.on('serviceDown', function(service){
    var chromecast = getById(service.id);
    if(chromecast){
      emitter.emit('remove-chromecast', { id : chromecast.id });
      removeChromecastById(service.name);
    }
  });

  browser.start();
};



exports.getEmitter = function(){
  return emitter;
};



exports.getAll = function(){
  var data = [];

  chromecasts.forEach(function(chromecast){
    data.push(chromecast.getAbbreviated());
  });

  return data;
};



// id - 123
var getById = function(id){
  var chromecast = null;

  chromecasts.forEach(function(cast){
    if(id == cast.id) chromecast = cast;
  });

  return chromecast;
};
exports.getById = getById;



var chromecastExists = function(id){
  var exists = false;

  for(var i = 0; i < chromecasts.length; i++){
    if(chromecasts[i].id == id) exists = true;
  }

  return exists;
};



var createChromecast = function(service){
  var chromecast = new ChromeCast({
    id        : service.txtRecord.id,
    name      : service.name,
    address   : service.addresses[0]
  });

  chromecasts.push(chromecast);

  // event handlers
  chromecast.emitter.on('connected', function(){
    emitter.emit('new-chromecast', chromecast.getAbbreviated());
  });
  chromecast.emitter.on('media-status', function(message){
    emitter.emit('media-status', message);
  });
  chromecast.emitter.on('visibility-status', function(message){
    emitter.emit('visibility-status', message);
  });
  chromecast.emitter.on('error', function(err){
    if(err.type == 'timeout'){
      emitter.emit('remove-chromecast', { id : chromecast.id });
      removeChromecastById(chromecast.id);
    } else {
      emitter.emit('error', err);
    }
  });
};



// id - 123
var removeChromecastById = function(id){
  for(var i = 0; i < chromecasts.length; i++){
    if(chromecasts[i].id == id) {
      chromecasts.splice(i, 1);
      break;
    }
  }
};
