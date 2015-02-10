exports.lookup = function(){
  return [{
    contentId   : 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
    contentType : 'video/mp4',
    streamType  : 'BUFFERED',

    metadata    : {
      type          : 0,
      metadataType  : 0,
      title         : "Big Buck Bunny",
      images        : [{
        url         : 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
      }]
    }
  }];
};
