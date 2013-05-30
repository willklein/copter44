var cv = require('opencv');
var _ = require('underscore');

var isRed = function(r, g, b) {
  var RED = 150;
  //console.log(r, g, b);
  return ((r > g + 50) && (r > b + 50));
}

var isBlack = function(r, g, b) {
  var BLACK = 50;
  return (r < BLACK && g < BLACK && b < BLACK);
}



var handlePick = function (pick, callback) {
//    console.log('pick.length: ' + pick.length);
  //im.pixelRow(0).length
  cv.readImage(pick, function(err, im) {
    var radius = im.height() / 2 * .95;
    var centerX = im.width() / 2;
    var centerY = im.height() / 2;
    //console.log('radius', radius);
    //console.log('centerX', centerX);
    //console.log('centerY', centerY);

    var getPoint = function(angle, radius) {
      var deltaX = Math.floor(Math.cos(angle) * radius);
      var deltaY = Math.floor(Math.sin(angle) * radius);
      //console.log('angle, radius, deltaX, deltaY', angle, radius, deltaX, deltaY);
      var x = centerX + deltaX;
      var y = centerY - deltaY;
      //console.log('(x,y)', x, y);

      var pixRow = im.pixelRow(y);
      var offset = x * 3;
      var b = pixRow[offset];
      var g = pixRow[offset + 1];
      var r = pixRow[offset + 2];
      var rgb = [r, g, b];
      //console.log('rgb', rgb);
      return rgb;
    };

    var fullCircle = 2 * Math.PI;
    var steps = 360;
    var stepAngle = fullCircle / steps;

    var reds = [];
    var blacks = [];

    for(var i = 0; i < steps; i++) {
      //console.log('Starting', i)
      var angle = 0 + i * stepAngle;
      //console.log('angle', angle);
      var rgb = getPoint(angle, radius);
      
      if (isRed.apply(null, rgb)) {
        //console.log('isRed', angle);
        reds.push(angle);
      }

      if (isBlack.apply(null, rgb)) {
        //console.log('isBlack', angle);
        blacks.push(angle);
      }
    }

    var minRed = _.min(reds);
    var maxRed = _.max(reds);
    console.log('minRed, maxRed', minRed, maxRed);
    var twoReds = maxRed > minRed + Math.PI;
    var newAngle, sum;

    if (blacks.length > 300) {
      callback({ action: 'land' });
    } else if(blacks.length > 10) {
      callback({ action: 'onBlacks' });
    } else if (twoReds && minRed > Math.PI * 3/8 && minRed < Math.PI * 5/8) {
      callback({ action: 'goForward' });
    } else if (twoReds) {
      callback({ action: 'onCourseMaybe' });
    } else {
      sum = _.reduce(reds, function(memo, num){ return memo + num; }, 0);
      newAngle = sum / reds.length;
      if (typeof newAngle !== 'number') { newAngle = 0; }
      callback({ action: 'rotate', val: newAngle });
    } 

  });

};

module.exports = { handlePick: handlePick };

