var http = require('http');

var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.config('video:video_channel', 3);

var pngStream = client.getPngStream();
//pngStream.on('data', handlePngStream);

var lastPng;

pngStream.on('error', console.log)
        .on('data', function(pngBuffer) {
            lastPng = pngBuffer;
        });

var sampleRate = 500;

var finiteStateBot = {
    state: 'takeoff'  
};

var runLogic = function() {
    var findLine = function() {
        var lineCheck = checkForLine();
        
        lineCheck = lineCheck * (scale || 1);
        
        
        
    };

    var trackLine = function() {

    };

    var centerBox = function() {
        this.stop();
    };

    var land = function() {
        this.land();
        state = 'landing';
    };
    
    switch (state) {
        case 'takeOff':
            break;
        
        case 'findLine':
            findLine();
            break;
        
        case 'lineFound':
            followLine();
            break;
            
        case 'tracking':
            trackLine();
            break;
        
        case 'boxFound':
            centerBox();
            break;
        
        case 'boxCentered':
            land();
            break;
        
        case 'landing':
            return 1;
        
        default:
            findLine();
            break;
    }
};

var eventLoop = setInterval(function() {
    // do stuff w/ lastPng
    var done = runLogic();
    
    if (done) {
        clearInterval(eventLoop);
    }
}, sampleRate);

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