var templates = {};

templates.channelDetails = _.template([
  '<li class="channel-details" data-channel-id="<%= _id %>" id="channel-<%= _id %>">',
    '<a class="fa fa-ban delete-channel" data-channel-id="<%= _id %>" href="#"></a>',
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
          '<span class="value">',
            '<% _.each(videos, function(video){ %>',
              '<a target="_blank" href="<%= video.url%>" >',
                '<%= video.title %>',
              '</a>, ',
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
