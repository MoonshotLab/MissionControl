var Q = require('q');
var needle = require('needle');
var crypto = require('crypto');
var config = require('../config')();



// {
//    token   : some access token
//    albumId : some album id
// }
var getAlbumInfo = function(opts){
  var deferred = Q.defer();

  var url = 'http://vimeo.com/api/v2/album/' + opts.albumId + '/info.json';
  needle.get(url, function(err, res, body){
    if(err) deferred.reject(err);
    else{
      opts.userId = res.body.user_id;
      opts.parsedResponse = {
        title     : body.title,
        subtitle  : body.description,
        url       : body.url,
        poster    : body.thumbnail_large,
        author    : {
          name    : body.user_display_name,
          user_url: body.user_url
        }
      };

      deferred.resolve(opts);
    }
  });

  return deferred.promise;
};




// {
//    token   : some access token
//    albumId : some album id
//    userId  : some user id
//    parsedResponse : vimeo album info
// }
var getVideos = function(opts){
  var deferred = Q.defer();

  var url = [
    'https://api.vimeo.com/users/',
    opts.userId,
    '/albums/',
    opts.albumId,
    '/videos'
  ].join('');

  var options = {};
  options.headers = { 'Authorization' : 'bearer ' + opts.token };

  needle.get(url, options, function(err, res, body){
    if(res.statusCode == 200){
      opts.parsedResponse.videos = [];

      var contents = JSON.parse(body.toString());
      contents.data.forEach(function(video){
        var poster = null;
        try{
          poster = video.pictures.sizes[video.pictures.sizes.length - 1].link;
        } catch(e){ console.log('could not get poster', e); }

        opts.parsedResponse.videos.push({
          title   : video.name,
          url     : video.link,
          id      : video.id,
          poster  : poster
        });
      });

      deferred.resolve(opts.parsedResponse);
    } else deferred.reject(err);
  });

  return deferred.promise;
};



// code : the string token given to the client which we'll exchange
// for the access token
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



// {
//    albumId : the album id we're fetching
//    encryptedToken : the encrypted token from the client
// }
exports.fetchAlbum = function(opts){
  var deferred = Q.defer();

  var decipher = crypto.createCipher('aes-256-ctr', config.CRYPTO_KEY);
  accessToken = decipher.update(opts.encryptedToken, 'hex', 'utf8');
  accessToken += decipher.final('utf8');

  getAlbumInfo({ albumId : opts.albumId, token : accessToken })
    .then(getVideos)
    .then(deferred.resolve)
    .fail(deferred.reject);

  return deferred.promise;
};
