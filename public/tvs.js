var channels = [];

$(function(){

  // fetch chromecasts on page load
  $.ajax({
    url : '/api/chromecasts',
  }).done(function(chromecasts){
    chromecasts.forEach(function(chromecast){
      $('#chromecast-list').append(
        templates.tvDetails(chromecast)
      );
      attachTvEvents(chromecast.id);
    });
  });

  // fetch channels on page load
  $.ajax({
    url : '/api/channels',
  }).done(function(data){
    channels = data;
  });
});


// listen for new channels
socket.on('new-channel', function(channel){
  channels.push(channel);
});


// listen for removed channels
socket.on('removed-channel', function(channel){
  channels = _.without(
    channels, _.findWhere(arr, {_id: channel._id })
  );
});


// listen for changes on the chromecast, like buffering and
// new media
socket.on('chromecast-status-update', function(data){
  if(data.status.media && data.status.media.metadata){
    $('#chromecast-' + data.chromecastId)
      .find('.now-playing').find('.value')
      .text(data.status.media.metadata.title);
  }
});

// just dump errors
socket.on('error', function(err){
  console.error(err);
});


var attachTvEvents = function(chromecastId){
  $('#chromecast-' + chromecastId).find('a.channel').click(function(e){
    e.preventDefault();
    $('#channel-selector').remove();

    var chromeCastId = $(this).data('chromecast-id');
    $('body').append(templates.channelSelector(channels));
    attachChannelSelectorEvents(chromeCastId);
    $('#channel-selector').css({
      top : e.clientY,
      left : e.clientX
    });
  });
};


var attachChannelSelectorEvents = function(chromecastId){
  var $selector = $('#channel-selector');

  $selector.find('a.close').click(function(){
    $('#channel-selector').remove();
  });

  $selector.find('a.channel').click(function(){
    $('#channel-selector').remove();
    var channelId = $(this).data('channel-id');
    socket.emit('change-channel', {
      chromecastId  : chromecastId,
      channelId     : channelId
    });
  });
};
