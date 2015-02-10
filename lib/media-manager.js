var channels = require('./channels');


// { channelId : 123, chromecasts : [{chromecast...}, {chromecast...}] }
exports.create = function(opts){
  // loop over all other managers, check and see if any are unused. release

  // look to see if all are done, then play the next one
  var channel = channels.lookup(opts.channelId);
  var mediaIndex = 0;
  var numDone = 0;

  var onDone = function(){
    numDone++;
    if(numDone == opts.chromecasts.length){
      numDone = 0;
      mediaIndex++;
      if(!channel[mediaIndex]) mediaIndex = 0;

      opts.chromecasts.forEach(function(chromecast){
        chromecast.play(channel[mediaIndex]);
      });
    }
  };

  opts.chromecasts.forEach(function(chromecast){
    chromecast.play(channel[mediaIndex]);
    chromecast.emitter.on('IDLE', onDone);
  });
};
