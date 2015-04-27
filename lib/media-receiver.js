var util                    = require('util');
var castv2Cli               = require('castv2-client');
var Application             = castv2Cli.Application;
var MediaController         = castv2Cli.MediaController;
var MediaReceiverController = require('./media-receiver-controller');

function MediaReceiver(client, session) {
  Application.apply(this, arguments);

  var self = this;

  this.media = this.createController(MediaController);
  this.mediaReceiver = this.createController(MediaReceiverController);
  this.media.on('status', function(){
    self.emit('status', status);
  });
}


MediaReceiver.APP_ID = '0F962A19';
util.inherits(MediaReceiver, Application);



// videoId (optional) : the video id to load
// service (required) : youtube or vimeo
// action  (required) : 'play' || 'pause' || 'next' || 'prev'
MediaReceiver.prototype.control = function(opts){
  this.mediaReceiver.control.apply(this.mediaReceiver, arguments);
};


module.exports = MediaReceiver;
