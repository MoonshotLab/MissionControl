var config = require('../config')();
var url = require('url');
var youtube = require('./youtube');
var vimeo = require('./vimeo');
var ObjectID = require("mongodb").ObjectID;
var Q = require('q');
var channels;


require('mongodb').MongoClient.connect(config.DB_CONNECT, function(err, db){
  if(err) console.log('error connecting to db', err);
  else console.log('connected to db');

  channels = db.collection('channels');
});



// {
//    url   : a youtube paylist url or vimeo album url
//    token : optional token if the vimeo album is private
// }
exports.create = function(opts){
  var deferred = Q.defer();

  if(opts.url.indexOf('youtube.com/playlist') != -1){
    var playlistId = url.parse(opts.url, true).query.list;
    youtube.fetchPlaylist(playlistId)
      .then(save)
      .then(deferred.resolve)
      .fail(deferred.reject);
  } else if(opts.url.indexOf('vimeo.com/album') != -1){
    var routeParts = url.parse(opts.url).path.split('/');
    var albumId = routeParts[routeParts.length - 1];
    vimeo.fetchAlbum({ albumId : albumId, encryptedToken : opts.token })
      .then(save)
      .then(deferred.resolve)
      .fail(deferred.reject);
  }

  return deferred.promise;
};


// mongo id - '54da8afad27c5b3e0b467617'
exports.destroy = function(id){
  var deferred = Q.defer();

  channels.remove({ _id : ObjectID(id)}, function(err, res){
    if(err) deferred.reject(err);
    else deferred.resolve(id);
  });

  return deferred.promise;
};



exports.getAll = function(){
  var deferred = Q.defer();

  channels.find().toArray(function(err, res){
    if(err) deferred.reject(err);
    else deferred.resolve(res);
  });

  return deferred.promise;
};


// channelData - an object
var save = function(channelData){
  var deferred = Q.defer();

  channels.insert(channelData, function(err, res){
    if(err) deferred.reject(err);
    else deferred.resolve(channelData);
  });

  return deferred.promise;
};



// id - 'someMongoRecordId'
exports.lookup = function(id){
  var deferred = Q.defer();

  channels.findOne({ _id : ObjectID(id)}, function(err, res){
    if(err) deferred.reject(err);
    else deferred.resolve(res);
  });

  return deferred.promise;
};
