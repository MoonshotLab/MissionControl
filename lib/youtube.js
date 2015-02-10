var Q = require('q');
var needle = require('needle');


exports.fetchPlaylist = function(playlistId){
  var deferred = Q.defer();

  var url = [
    'http://gdata.youtube.com/feeds/api/playlists/',
    playlistId,
    '?v=2&alt=json'
  ].join('');

  needle.get(url, function(err, res){
    if(err) deferred.reject(err);
    else{
      var contents = res.body.feed;
      var parsedResponse = {
        title     : contents.title.$t,
        subtitle  : contents.subtitle.$t,
        url       : contents.link[0].href,
        author    : {
          name    : contents.author[0].name.$t,
          url     : contents.author[0].uri.$t,
        },
        videos    : []
      };

      contents.entry.forEach(function(entry){
        parsedResponse.videos.push({
          title : entry.title.$t,
          url   : entry.link[0].href,
          id    : entry.media$group.yt$videoid.$t
        });
      });

      deferred.resolve(parsedResponse);
    }
  });

  return deferred.promise;
};
