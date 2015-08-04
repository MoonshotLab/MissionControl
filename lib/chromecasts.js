var ChromeCast = require('./chromecast');
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var events = require('events');
var emitter = new events.EventEmitter();
var chromecasts = [];


exports.init = function(){
  // for some reason these things tend to report 'up' frequently
  browser.on('serviceUp', function(service){
    var chromecast = getByName(service.name);
    if(chromecast)
      removeChromecastById(chromecast.id);
    console.log('chromecast detected -', service.name);
    createChromecast(service);
  });

  // remove the chromecast from the array if service down event
  browser.on('serviceDown', function(service){
    var chromecast = getById(service.id);
    if(chromecast)
      removeChromecastById(chromecast.id);
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



// name - 'Troposphere'
var getByName = function(name){
  var chromecast = null;

  chromecasts.forEach(function(cast){
    if(name == cast.name) chromecast = cast;
  });

  return chromecast;
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
    if(err.type == 'timeout') removeChromecastById(chromecast.id);
    else emitter.emit('error', err);
  });
};



// id - 123
var removeChromecastById = function(id){
  for(var i = 0; i < chromecasts.length; i++){
    if(chromecasts[i].id == id) {
      emitter.emit('remove-chromecast', { id : chromecasts[i].id });
      chromecasts.splice(i, 1);
      break;
    }
  }
};
