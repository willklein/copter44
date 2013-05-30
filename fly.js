var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.takeoff();

client.after(1000, function() {
//    this.clockwise(0.5);
//    this.forward(1);
    this.stop();
}).after(3000, function() {
    this.stop();
    this.land();
});