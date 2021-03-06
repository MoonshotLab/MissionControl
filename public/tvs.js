var channels = [];



var makeChannelSelector = function(opts){
  $('#channel-selector').remove();
  $('body').append(
    templates.channelSelector(channels)
  );

  $('#channel-selector').css({
    top   : opts.y,
    left  : opts.x
  });

  var $selector = $('#channel-selector');

  $selector.find('a.close').click(function(){
    $selector.remove();
  });

  $selector.find('a.channel').click(function(){
    $selector.remove();

    var channelId = $(this).data('channel-id');
    socket.emit('change-channel', {
      chromecastId  : opts.chromecastId,
      channelId     : channelId
    });
  });
};



var addChromecast = function(chromecast){
  $('#chromecast-list').append(
    templates.chromecastDetails(chromecast)
  );

  $('#chromecast-' + chromecast.id).find('.channel').click(function(e){
    e.preventDefault();
    makeChannelSelector({
      chromecastId  : chromecast.id,
      x             : e.clientX,
      y             : e.clientY
    });
  });

  $('#chromecast-' + chromecast.id)
    .find('.controls').find('li').click(function(e){
      var directive = $(this).data('directive');
      socket.emit('chromecast-control', {
        chromecastId  : chromecast.id,
        directive     : directive
      });
  });
};



$(function(){

  // fetch chromecasts on page load
  $.ajax({ url : '/api/chromecasts' })
    .done(function(chromecasts){
      chromecasts.forEach(addChromecast);
  });

  // fetch channels on page load
  $.ajax({ url : '/api/channels' })
    .done(function(data){
      channels = data;
    });
});


// listen for new chromecasts
socket.on('new-chromecast', addChromecast);

// remove chromecasts
socket.on('remove-chromecast', function(chromecast){
  $('#chromecast-' + chromecast.id).remove();
});


// listen for new channels
socket.on('new-channel', function(channel){
  channels.push(channel);
});

// listen for channel changes
socket.on('change-channel', function(data){
  $('#chromecast-' + data.chromecastId).find('.channel')
    .find('span.title').text(data.channel.title);
});

// listen for removed channels
socket.on('removed-channel', function(channel){
  channels = _.without(
    channels, _.findWhere(arr, {_id: channel._id })
  );
});

// listen for changes on the chromecast
socket.on('chromecast-status-update', function(data){
  if(data.type == 'MEDIA-STATUS'){

    // show if we're playing or paused
    $('#chromecast-' + data.chromecastId).find('.controls')
      .find('li').removeClass('active');
    if(data.status == 'PAUSED'){
      $('#chromecast-' + data.chromecastId).find('.controls')
        .find('li.pause').addClass('active');
    } else if(data.status == 'PLAYING'){
      $('#chromecast-' + data.chromecastId).find('.controls')
        .find('li.play').addClass('active');
    }

    if(data.currentVideo){
      $('#chromecast-' + data.chromecastId)
        .find('.now-playing').find('.value')
        .text(data.currentVideo.title);
    }
  }
});


// just show errors i guess
socket.on('error', function(err){
  console.error(err);
});
