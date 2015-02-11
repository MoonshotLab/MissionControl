var socket = io();


var addChannel = function(channel){
  $('#channel-list').append(
    templates.channelDetails(channel)
  );

  // attach click events so we can destroy the channel
  $('#channel-' + channel._id)
    .find('.delete-channel')
    .click(function(e){
      e.preventDefault();

      var id = $(this).data('channel-id');
      socket.emit('destroy-channel', { id : id });
    });
};

$(function(){

  // fetch channels on page load
  $.ajax({
    url : '/api/channels',
  }).done(function(data){
    data.forEach(addChannel);
  });


  // add a new channel
  $('#add-channel').click(function(e){
    e.preventDefault();

    var inputVal = $('#channel-input').val();
    if(inputVal.indexOf('youtube.com/playlist') == -1)
      alert('That\'s not a youtube playlist dood');
    else
      socket.emit('add-channel', { url : inputVal });
  });
});


// listen for new channels
socket.on('new-channel', addChannel);

// listen for removed channels
socket.on('removed-channel', function(channel){
  $('#channel-' + channel._id).remove();
});
