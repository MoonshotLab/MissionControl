exports.findChromecastDescriptionByName = function(name){
  if(name == 'Troposphere'){
    return '1st Floor Stage';
  } else if(name == 'Stratosphere'){
    return '2nd Floor Speed Dating';
  } else if(name == 'Mesosphere'){
    return '4th floor North East Corner';
  } else if(name == 'Thermosphere'){
    return '4th floor South East Corner';
  } else {
    return 'A TV at Barkley'
  }
};
