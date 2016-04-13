var ctx = new (window.AudioContext || window.webkitAudioContext)();
var buf;
var src;
var analyser = ctx.createAnalyser();
var canvas = document.getElementById('canvas');
var canvasCtx = canvas.getContext('2d');
var mp3_location = 'mp3/sample.mp3';
var WIDTH = 800;
var HEIGHT = 200;
function loadFile() {
    var req = new XMLHttpRequest();
    req.open("GET",mp3_location,true);
    req.responseType = "arraybuffer";
    req.onload = function() {
        //decode the loaded data
        ctx.decodeAudioData(req.response, function(buffer) {
            buf = buffer;
            play();
        });
    };
    req.send();
}

loadFile(); //load and decode mp3 file

//play the loaded file
function play() {
    //create a source node from the buffer
    src = ctx.createBufferSource();
    src.buffer = buf;
    //connect to the final output node (the speakers)
    src.connect(analyser);
    analyser.connect(ctx.destination);
    //play immediately
    src.start();
    playing = true;
}

function stop(){
  src.stop();
  console.log("it's over!");
}

analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
canvasCtx.clearRect(0,0, WIDTH, HEIGHT);

function draw(){
  drawVisual = requestAnimationFrame(draw); //keep looping the drawing function once it has been started
  analyser.getByteTimeDomainData(dataArray); //grab the time domain data and copy it into our array
  canvasCtx.fillStyle = 'rgb(255, 102, 255)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT); //fill canvas w/ solid color
  canvasCtx.lineWidth = 2; //line width of the wave
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)'; //color of the wave
  canvasCtx.beginPath(); //begin drawing the path
  var sliceWidth = WIDTH * 1.0 / bufferLength; //determine the width of each segment of the line to be drawn by dividing the canvas width by the array length
  var x = 0;
  for(var i = 0; i < bufferLength; i++) { //run through a loop, defining the position of a small segment of the wave for each point in the buffer at a certain height based on the data point value form the array
    var v = dataArray[i] / 128.0;
    var y = v * HEIGHT/2;
    canvasCtx.strokeStyle ='rgb(0,' + x + ',' + y + ')';
    if(i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  canvasCtx.lineTo(canvas.width, canvas.height/2);
  canvasCtx.stroke();
}

draw();
