var socket = io();

$(function(){

  $('#add-channel').click(function(){
    var inputVal = $('#channel-input').val();
    if(inputVal.indexOf('youtube.com/playlist') == -1)
      alert('That\'s not a youtube playlist dood');
    else
      socket.emit('add-channel', { url : inputVal });
  });
});
