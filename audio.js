// //References:
// //https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
// //http://srchea.com/apps/sound-visualizer-web-audio-api-webgl/
// //http://srchea.com/experimenting-with-web-audio-api-three-js-webgl
// //http://code.tutsplus.com/tutorials/the-web-audio-api-what-is-it--cms-23735
// //http://www.michaelbromley.co.uk/blog/42/audio-visualization-with-web-audio-canvas-and-the-soundcloud-api
// //http://webaudiodemos.appspot.com/slides/mediademo/
//
//
// var ctx = new (window.AudioContext || window.webkitAudioContext)(); //webkitAudioContext is for Safari users; ctx is a container for all sound
// var buf;
// var src, srcJs;
// var analyser = ctx.createAnalyser(); //returns an AnalyserNode, which provides real-time frequency and time-domain analysis information
// analyser.smoothingTimeConstant = 1;
// var dataArray;
// var boost = 0;
// var time = 0;
// var mp3_location = 'mp3/sample.mp3';
//
// function loadFile() {
//     var req = new XMLHttpRequest();
//     req.open("GET",mp3_location,true);
//     req.responseType = "arraybuffer";
//     req.onload = function() {
//         //decode the loaded data
//         ctx.decodeAudioData(req.response, function(buffer) {
//             buf = buffer; //the ArrayBuffer is converted to an AudioBuffer, which holds our audio data in memory
//             play();
//         });
//     };
//     req.send();
// }
//
// loadFile(); //load and decode mp3 file
//
// //play the loaded file
// function play() {
//     //create a source node from the buffer (type: AudioBufferSourceNode)
//     src = ctx.createBufferSource(); //src is the "record player"
//
//     src.buffer = buf; //src.buffer is the "record"
//     src.loop = true;
//
//     //connect to the final output node (the speakers)
//     src.connect(analyser); //connect the record player to the AnalyserNode (where real-time data is)
//
//     analyser.connect(ctx.destination); //ctx.destination is the speakers
//     //play immediately
//     src.start();
//     playing = true;
// }
//
// function stop(){
//   src.stop();
//   console.log("it's over!");
// }
//
// analyser.fftSize = 2048;
// var bufferLength = analyser.frequencyBinCount; //bufferLength == 1024
// dataArray = new Uint8Array(bufferLength); //dataArray length == 1024, each element can be between 0 and 255
// //canvasCtx.clearRect(0,0, WIDTH, HEIGHT);
//
// function draw(){
//   drawVisual = requestAnimationFrame(draw); //keep looping the drawing function once it has been started
//
//   //copies the current wave-form/time domain into a Uint8Array called dataArray
//   analyser.getByteTimeDomainData(dataArray); //grab the time domain data and copy it into our array
//
//
// }
//
// draw();
