$(function(){

  // fetch channels on page load
  $.ajax({
    url : '/api/channels',
  }).done(function(data){
    console.log('channels:', data);
  });
});


// listen for new channels
socket.on('new-channel', function(channel){
  console.log('channel added', channel);
});

// listen for removed channels
socket.on('removed-channel', function(channel){
  console.log('channel removed', channel);
});
