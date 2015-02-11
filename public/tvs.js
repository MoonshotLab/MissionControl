var channels = [];

$(function(){

  // fetch channels on page load
  $.ajax({
    url : '/api/channels',
  }).done(function(data){
    channels = data;
  });

  // attach events, remove old channel selectors
  $('a.channel').click(function(e){
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
