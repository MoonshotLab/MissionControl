var socket = io();

$(function(){
  $('a').click(function(){
    socket.emit('play-channel', { channelId : 1, chromecastIds : [1, 2, 3] });
  });
});
