var chromecasts = [];



// create clients
var CastClient = require('castv2-client').Client;
var createClient = function(chromecast){
  chromecast.client = new CastClient();
  chromecasts.push(chromecast);

  chromecast.client.connect(chromecast.address, function(){
    
  });

  chromecast.client.on('error', function(err){
    console.log(err);
  });
};



// create the mdns browser and search for chrome casts on the network
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));

browser.on('serviceUp', function(service){
  service.addresses.forEach(function(address){
    createClient({
      connected : false,
      name      : service.name,
      address   : address
    });
  });
});

browser.start();



// get all connected clients
exports.getAll = function(){
  return chromecasts;
};
