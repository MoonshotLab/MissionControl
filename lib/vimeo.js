var Q = require('q');
var needle = require('needle');


var getInfo = function(opts){
  var deferred = Q.defer();
  var url = opts.baseUrl + '/info.json';

  needle.get(url, function(err, res){
    if(err) deferred.reject(err);
    else{
      var contents = res.body;

      opts.parsedResponse = {
        title     : contents.title,
        subtitle  : contents.description,
        url       : contents.url,
        poster    : contents.thumbnail_large,
        author    : {
          name    : contents.user_display_name,
          user_url: contents.user_url
        }
      };

      deferred.resolve(opts);
    }
  });

  return deferred.promise;
};


var getVideos = function(opts){
  var deferred = Q.defer();
  var url = opts.baseUrl + '/videos.json';

  needle.get(url, function(err, res){
    if(err) deferred.reject(err);
    else{
      opts.parsedResponse.videos = [];
      var videos = res.body;
      videos.forEach(function(video){
        opts.parsedResponse.videos.push({
          title   : video.title,
          url     : video.url,
          id      : video.id,
          poster  : video.thumbnail_large
        });
      });

      deferred.resolve(opts.parsedResponse);
    }
  });

  return deferred.promise;
};


exports.fetchAlbum = function(playlistId){
  var deferred = Q.defer();

  var baseUrl = 'http://vimeo.com/api/v2/album/' + playlistId;

  getInfo({ baseUrl : baseUrl, parsedResponse : {} })
    .then(getVideos)
    .then(deferred.resolve)
    .fail(deferred.reject);

  return deferred.promise;
};
