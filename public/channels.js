var isValidUrl = function(url){
  var valid = false;

  var validUrls = ['youtube.com/playlist', 'vimeo.com/album'];
  validUrls.forEach(function(validUrl){
    if(url.indexOf(validUrl) != -1) valid = true;
  });

  return valid;
};



var createChannel = function(e){
  if(e) e.preventDefault();

  var urlInput = $('#channel-input').val();
  if(!isValidUrl(urlInput))
    alert('That\'s not a youtube playlist or a vimeo album dood');
  else
    socket.emit('add-channel', { url : urlInput });
};



var addChannel = function(channel){
  $('#channel-input').val('');
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

  // if a vimeo playlist is not found, try again by requesting an auth token
  if(err.statusCode == 404){
    var url = $('#channel-input').val();
    if(isValidUrl(url)) localStorage.setItem('url', url);
    window.location.href = [
      'https://api.vimeo.com/oauth/authorize?',
      'response_type=code',
      '&client_id=' + config.VIMEO_CLIENT_ID,
      '&redirect_uri=' + config.VIMEO_AUTH_CALLBACK
    ].join('');
  } else{
    alert(JSON.stringify(err));
    console.error(err);
  }
});



$(function(){
  // parse the url query params on page load
  var searchTerms = location.search.replace('?', '').split('&');
  var queryParams = {};
  searchTerms.forEach(function(term){
    var split = term.split('=');
    queryParams[split[0]] = split[1];
  });

  // if page loads with a query of 'token' pull the local storage url and
  // submit the token along with the stored url back as a new add channel event
  if(queryParams.token){
    var url = localStorage.getItem('url');
    $('#channel-input').val(url);
    if(isValidUrl(url)){
      socket.emit('add-channel', {
        url   : url,
        token : queryParams.token
      });
    }
  }

  // fetch channels on page load
  $.ajax({ url : '/api/channels' })
    .done(function(data){
      data.forEach(addChannel);
    });

  // create a new channel
  $('#create-channel').click(createChannel);
});
