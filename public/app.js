var socket = io();

$(function(){
  $('a').click(function(){
    socket.emit('play-channel', {
      channelId     : 1,
      chromecastIds : ['7d4d252eef4e84dce64037d5103e99da']
    });
  });
});
