//var fs = require('fs');
var http = require('http');

var arDrone = require('ar-drone');
var client  = arDrone.createClient();

//var stream = require('ar-drone-png-stream');
//
//stream(client, { port: 8081 });

//require('ar-drone-png-stream')(client, { port: 8001 });


//var once = 0;
//var handlePngStream = function(chunk) {
//    if (once) return;
//    
//    fs.writeFile('image.png', chunk, function (err) {
//        if (err) throw err;
//        console.log('It\'s saved!');
//        once = 1;
//    });
//};
//

client.config('video:video_channel', 3);

var pngStream = client.getPngStream();
//pngStream.on('data', handlePngStream);

var lastPng;
pngStream
        .on('error', console.log)
        .on('data', function(pngBuffer) {
            lastPng = pngBuffer;
        });

var server = http.createServer(function(req, res) {
    if (!lastPng) {
        res.writeHead(503);
        res.end('Did not receive any png data yet.');
        return;
    }

    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(lastPng);
});

server.listen(3000, function() {
    console.log('Serving latest png on port 8080 ...');
});

// switch to bottom camera
//client.config('video:video_channel', '2');

client.takeoff();

client.up(2);

client.after(8000, function() {
//    this.clockwise(0.5);
//    this.forward(1);
    this.stop();
}).after(1000, function() {
    this.stop();
    this.land();
    pngStream.end();
}). after(5000, function() {
    server.close();
});