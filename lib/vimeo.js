var Q = require('q');
var needle = require('needle');
var crypto = require('crypto');
var config = require('../config')();


var getInfo = function(opts){
  var deferred = Q.defer();
  var url = opts.baseUrl + '/info.json';

  needle.get(url, function(err, res){
    if(err) deferred.reject(err);
    else if(res.statusCode === 404) deferred.reject({ statusCode : 404 });
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


exports.getAccessToken = function(code){
  var deferred = Q.defer();

  var url = 'https://api.vimeo.com/oauth/access_token';
  var encodedAuth = new Buffer(config.VIMEO_CLIENT_ID + ':' + config.VIMEO_SECRET).toString('base64');
  var options = { headers : { 'Authorization' : 'Basic ' + encodedAuth }};
  var data = [
    'grant_type=authorization_code',
    '&code=', code,
    '&redirect_uri=', config.VIMEO_AUTH_CALLBACK
  ].join('');

  needle.post(url, data, options, function(err, res){
    if(err) deferred.reject(err);
    else deferred.resolve(res.body.access_token);
  });

  return deferred.promise;
};


exports.fetchAlbum = function(opts){
  var deferred = Q.defer();

  if(opts.encryptedToken){
    var decipher = crypto.createCipher('aes-256-ctr', config.CRYPTO_KEY);
    var accessToken = decipher.update(opts.encryptedToken, 'hex', 'utf8');
    accessToken += decipher.final('utf8');
  }

  var baseUrl = 'http://vimeo.com/api/v2/album/' + opts.playlistId;

  getInfo({ baseUrl : baseUrl, parsedResponse : {} })
    .then(getVideos)
    .then(deferred.resolve)
    .fail(deferred.reject);

  return deferred.promise;
};
