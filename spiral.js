var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.takeoff();

client.after(5000, function() {
    this.clockwise(2);
//    this.forward(1);
    this.stop();
}).after(3000, function() {
    this.stop();
    this.land();
});