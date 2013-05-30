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
    console.log('- action: ' + action.action);
    switch(action.action) {
        case 'goForward':
            return 'forward';
        
        case 'onCourseMaybe':
            return 'on';
        
        case 'rotate':
            console.log('-    val: ' + action.val);
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
    console.log('state: ' + state);

    var land = function() {
        client.land();
        state = 'landing';
    };

    var lineCheck = translate(action);
    
    if (lineCheck === 'lost') {
        land();
    }
    console.log('lineCheck: ' + lineCheck);
    
    var findLine = function() {
        switch (lineCheck) {
            // on the line
            case 'forward':
            case 'on':
                client.front(0.1);
                state = 'lineFound';
                break;
            
            case 'right':
                client.clockwise(0.25);
                break;
            case 'left':
                client.clockwise(0.25);
                break;
        }
    };

    var followLine = function() {
        switch (lineCheck) {
            
            case 'forward':
                client.front(0.25);
                break;
            
            case 'on':
                client.front(0.25);
                state = 'tracking';
                break;

            case 'right':
                client.clockwise(0.25);
                break;
            case 'left':
                client.clockwise(0.25);
                break;
        }
    };

    var trackLine = function() {
        switch (lineCheck) {
            case 'on':
                client.front(0.25);
                break;
            case 'right':
                client.clockwise(0.25);
                break;
            case 'left':
                client.clockwise(0.25);
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
    if (!lastPng) return;
    
    // do stuff w/ lastPng
    angle.handlePick(lastPng, runLogic);
    
    if (state === 'landing') {
        clearInterval(eventLoop);
    }
}, sampleRate);


client.takeoff();

client.up(2);

client.after(4000, function() {
//    this.clockwise(0.5);
//    this.forward(1);
    this.stop();
}).after(1000, function() {
    this.stop();
    this.land();
    pngStream.end();
});