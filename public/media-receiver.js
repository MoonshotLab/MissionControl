// add a debug hook so we can easily look at values
window.DEBUG = true;



// store the current host and player so we know which API methods to call for
// each service
window.currentHost = 'youtube';
window.player = null;



// Setup a message hub to listen for messages being sent to the chromecast
cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.ERROR);
window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
window.messageBus = castReceiverManager.getCastMessageBus('urn:x-cast:com.barkley.moonshot.atmosphere');



// e.data :
//    videoId (optional)  : the video id to load if using the load action
//    host (required)     : youtube or vimeo
//    action  (required)  : 'play' || 'pause' || 'load'
window.messageBus.onMessage = function(e){
  var data = null;
  try{
    data = JSON.parse(e.data);

    if(window.DEBUG) console.log(data);

    // handle load, play, and pause events
    if(data.action == 'load'){
      playVideo(data.host, data.videoId);
    } else if(data.action == 'play'){
      if(window.currentHost == 'youtube')
        window.player.playVideo();
      else if(window.currentHost == 'vimeo')
        window.player.play();
    } else if(data.action == 'pause'){
      if(window.currentHost == 'youtube')
        window.player.pauseVideo();
      else if(window.currentHost == 'vimeo')
        window.player.pause();
    }
  } catch(err){
    console.log(err);
  }
};



// If we're not doing anything, shuther down
var appConfig = new cast.receiver.CastReceiverManager.Config();
appConfig.maxInactivity = 10;
castReceiverManager.start(appConfig);



// set a 16x9 aspect ratio
var playerHeight = 0;
var playerWidth  = 0;
$(function(){
  playerHeight = $('html').height();
  playerWidth  = playerHeight * 1.7777;
});



// delete the video-player dom elements whenver we load
// new videos
var cleanStage = function(next){
  $('#video-player').remove();
  next();
};



var playVideo = function(host, id){
  window.currentHost = host;

  if(host == 'vimeo'){
    cleanStage(function(){
      playVimeoVideo(id);
    });
  } else if(host == 'youtube'){
    cleanStage(function(){
      playYoutubeVideo(id);
    });
  }
};



var playVimeoVideo = function(id){
  var tag = [
    '<iframe id="video-player" src="//player.vimeo.com/video/' + id,
    '?autoplay=1',
    '&byline=0',
    '&badge=0',
    '&title=0"',
    ' width=' + playerWidth,
    ' height=' + playerHeight,
    ' frameborder="0"',
    ' allowfullscreen >',
    '</iframe>'
  ].join('');

  $('body').append(tag);

  window.player = $f($('#video-player')[0]);
  window.player.addEvent('ready', function(){
    window.player.addEvent('finish', function(){
      window.messageBus.broadcast(JSON.stringify({
        type    : 'MEDIA_STATUS',
        state   : 'DONE'
      }));
      if(window.DEBUG) console.log('PLAYER STATE: DONE');
    });
  });
};



var playYoutubeVideo = function(id){
  $('body').append('<div id="video-player"></div>');

  window.player = new YT.Player('video-player', {
    height      : playerHeight,
    width       : playerWidth,
    videoId     : id,
    playerVars  : {
      controls        : 0,
      modestbranding  : 1,
      showinfo        : 0,
      rel             : 0
    },
    events      : {
      onReady : function(e){
        e.target.playVideo();
      },
      onStateChange : function(e){
        var playerState = null;
        for(var key in YT.PlayerState){
          if(YT.PlayerState[key] == e.data)
            playerState = key;
        }

        window.messageBus.broadcast(JSON.stringify({
          type    : 'MEDIA_STATUS',
          state   : playerState
        }));
        if(window.DEBUG) console.log('PLAYER STATE:', playerState);
      }
    }
  });
};
