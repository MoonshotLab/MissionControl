var templates = {};

templates.channelDetails = _.template([
  '<li class="details" data-channel-id="<%= _id %>" id="channel-<%= _id %>">',
    '<a class="fa fa-ban delete" data-channel-id="<%= _id %>" href="#"></a>',
    '<div class="meta">',
      '<ul>',
        '<li class="channel-name">',
          '<%= title %>',
        '</li>',
        '<li class="created-by">',
          '<span class="key">Created By</span>',
          '<span class="value">',
            '<a target="_blank" href="<%= author.url %>">',
              '<%= author.name %>',
            '</a>',
          '</span>',
        '</li>',
        '<li class="videos">',
          '<span class="key">Videos</span>',
          '<span class="value full-list">',
            '<% _.each(videos, function(video, index){ %>',
              '<a target="_blank" href="<%= video.url%>" >',
                '<%= video.title %>',
              '</a>',
              '<% if(index != videos.length - 1){ %>',
                ', ',
              '<% } %>',
            '<% }); %>',
          '</span>',
        '</li>',
      '</li>',
    '</div>',
  '</li>'
].join(''));


templates.channelSelector = _.template([
  '<div id="channel-selector">',
    '<header>',
      '<a class="close fa fa-times" href="#"></a>',
      '<h2>Select Channel</h2>',
    '</header>',
    '<ul>',
      '<% _.each(channels, function(channel){ %>',
        '<li>',
          '<a href="#" class="channel" data-channel-id="<%= channel._id %>">',
            '<%= channel.title %>',
          '</a>',
        '</li>',
      '<% }); %>',
    '</ul>',
  '</div>'
].join(''));


templates.chromecastDetails = _.template([
  '<li class="details" data-chromecast-id="<%= id %>" id="chromecast-<%= id %>">',
    '<div class="connection-status">',
      '<i class="fa fa-eye" title="Chromecast showing on TV" />',
    '</div>',
    '<div class="info">',
      '<div class="channel">',
        '<a data-chromecast-id="<%= id %>">',
          'Tuned into ',
          '<span class="title">',
            '<% if(!channel.title){ %>',
              'nothing :(',
            '<% } else{ %>',
              '<%= channel.title %>',
            '<% }%>',
          '</span>',
        '</a>',
      '</div>',
      '<h2 class="chromecast-name">',
        '<%= name %>',
      '</h2>',
      '<h3 class="chromecast-description">',
        '<%= description %>',
      '</h3>',
      '<div class="meta">',
        '<ul>',
          '<li class="now-playing">',
            '<span class="key">Now Playing</span>',
            '<span class="value">',
              '<% if(channel.videos){ %>',
                '<%= channel.videos[videoIndex].title %>',
              '<% } %>',
            '</span>',
          '</li>',
        '</ul>',
      '</div>',
    '</div>',
    '<ul class="controls">',
      "<% var playClass = ''; var pauseClass = '' %>",
      "<% if(mediaStatus == 'PLAYING') playClass = 'active'; %>",
      "<% if(mediaStatus == 'PAUSED') pauseClass = 'active'; %>",
      '<li class="play <%= playClass %>" data-directive="play"><a href="#" class="fa fa-play"></a></li>',
      '<li class="pause <%= pauseClass %>" data-directive="pause"><a href="#" class="fa fa-pause"></a></li>',
      '<li class="prev" data-directive="prev"><a href="#" class="fa fa-step-backward"></a></li>',
      '<li class="next" data-directive="next"><a href="#" class="fa fa-step-forward"></a></li>',
    '</ul>',
  '</li>'
].join(''));
