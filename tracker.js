var http = require('http');

var angle = require('./angle.js');

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

var state = 'takeoff';

var translate = function(action) {
    switch(action.action) {
        case 'goForward':
            return 'forward';
        case 'onCourseMaybe':
            return 'on';
        case 'rotate':
            return (action.val < 3.14 / 2) ? 'right' : 'left';
        
        default:
            return 'box';
    }
    
//    angle.handlePick()
    // 'right'
    // 'left'
    // 'forward'
    // 'on'
    return state;  
};

var runLogic = function(action) {

    var land = function() {
        this.land();
        state = 'landing';
    };

    var lineCheck = translate(action);
    
    if (lineCheck === 'lost') {
        land();
    }
    
    var findLine = function() {
        switch (lineCheck) {
            // on the line
            case 'forward':
            case 'on':
                front(0.25);
                state = 'lineFound';
                break;
            
            case 'right':
                clockwise(0.25);
                break;
            case 'left':
                clockwise(0.25);
                break;
        }
    };

    var followLine = function() {
        switch (lineCheck) {
            
            case 'forward':
                front(0.25);
                break;
            
            case 'on':
                front(0.25);
                state = 'tracking';
                break;

            case 'right':
                clockwise(0.25);
                break;
            case 'left':
                clockwise(0.25);
                break;
        }
    };

    var trackLine = function() {
        switch (lineCheck) {
            case 'on':
                front(0.25);
                break;
            case 'right':
                clockwise(0.25);
                break;
            case 'left':
                clockwise(0.25);
                break;
            
            case 'box':
                land();
        }
    };

    var centerBox = function() {
        this.stop();
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
    var done = angle.handlePick(lastPng, runLogic);
    
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