var createChannel = function(e){
  if(e) e.preventDefault();

  var urlInput = $('#channel-input').val();
  var validUrls = ['youtube.com/playlist', 'vimeo.com/album'];
  var urlIsValid = false;
  validUrls.forEach(function(url){
    if(urlInput.indexOf(url) != -1) urlIsValid = true;
  });

  if(!urlIsValid)
    alert('That\'s not a youtube playlist or a vimeo album dood');
  else{
    socket.emit('add-channel', { url : urlInput });
    $('#channel-input').val('');
  }
};



var addChannel = function(channel){
  $('#channel-list').append(
    templates.channelDetails(channel)
  );

  // attach click events so we can destroy the channel
  $('#channel-' + channel._id)
    .find('.delete')
    .click(function(e){
      e.preventDefault();

      var id = $(this).data('channel-id');
      socket.emit('destroy-channel', { id : id });
    });
};



// listen for new channels
socket.on('new-channel', addChannel);

// listen for removed channels
socket.on('removed-channel', function(channel){
  $('#channel-' + channel._id).remove();
});

// just show errors i guess
socket.on('error', function(err){
  console.error(err);
});



$(function(){
  // fetch channels on page load
  $.ajax({ url : '/api/channels' })
    .done(function(data){
      data.forEach(addChannel);
    });

  // create a new channel
  $('#create-channel').click(createChannel);
});
