// set a 16x9 aspect ratio
var playerHeight = $('html').height();
var playerWidth  = playerHeight * 1.7777;



// delete the video-player dom elements whenver we load
// new videos
var cleanStage = function(next){
  $('#video-player').remove();
  $('body').append('<div id="video-player"></div>');
  next();
};



var playVideo = function(host, id){
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
    '<iframe src="//player.vimeo.com/video/' + id,
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

  $('#video-player').append(tag);

  var player = $f($('#video-player').find('iframe')[0]);
  player.addEvent('ready', function(){
    player.addEvent('finish', function(){
      console.log('all done');
    });
    player.addEvent('playProgress', function(data){
      console.log(data);
    });
  });
};



var playYoutubeVideo = function(id){
  new YT.Player('video-player', {
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
        console.log('state change', e);
      }
    }
  });
};
