var angle = require('./angle');

var callback = function (result) {
  console.log(result.action, result.val);
}

var diag = angle.handlePick('./sample-images/diagonal-high4.png', callback);
var online = angle.handlePick('./sample-images/line-center.png', callback);
var edgeBlack = angle.handlePick('./sample-images/box-line-8-ft2.png', callback);
var allBlack = angle.handlePick('./sample-images/black2.png', callback);