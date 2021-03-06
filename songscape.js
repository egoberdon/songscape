// standard global variables
var container, scene, camera, renderer, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// controls
var parameters;
var gui;
var faceCall = 0;

//face models
var loader = new THREE.JSONLoader(); // init the loader util
var face = eli = 'obj/finalFace.json'; //normal eli face
var steve = 'obj/steve.json'; //alternate face for steve mode
var steve_mode = false; //steve mode boolean flag

//lighting
var sun, sun_y;
var light, back_light;

var materialFront, materialSide, materialArray; //for faces
var textMesh, textGeom, textParams, textMaterial, textWidth; //for faces
var front, side, materials, params, geom, myTextMaterial, width; //for 3D text messages
var myMesh; //for 3D text messages
var textZ = -200;
var textZM = -200;
var textAnyZ = -200;
var score = 0;

var message;
var showMessage = false;
var messageIsShowing = false;
var showedDoLess = false;
var particlesOn = false;
var fadeToWhite = false;
var didExecute = false;
var secondsPassed = 0;
var elapsed, currOpacity;
var particleGroup, particleAttributes;
var differenceArray = []; //used to calculate particle positions for each face; initialized in init() with initDifferenceArray()


var targetList = [];
var floor;
var skyBox;
var projector, mouse = { x: 0, y: 0 };
var cameraZPosition = 400;
var cameraYPosition = 150;

//booleans
var moving = false;
var startMovement = false;
var color = false;


var intersects; //holds all face objects that the Raycaster intersects with

var sphereGeom, sphere, redMaterial;

var activeLasers = [];

var val = 50; //starting value for face changing
var gVal = 0xff0000;

//audio

var ctx = new (window.AudioContext || window.webkitAudioContext)(); //webkitAudioContext is for Safari users; ctx is a container for all sound
var buf;
var src, srcJs;
var analyser = ctx.createAnalyser(); //returns an AnalyserNode, which provides real-time frequency and time-domain analysis information
analyser.smoothingTimeConstant = 1;
var dataArray;
var boost = 0;
var time = 0;
var mp3_location = 'mp3/sample0.mp3';
var playing = false;

init();
animate();

function init()
{
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(10,100,cameraZPosition);
	camera.lookAt(scene.position);
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	light = new THREE.PointLight(0xffffff);
	light.intensity = 2;

	back_light = new THREE.PointLight(0xffffff); //add a little light behind camera to fake ambient effect
	back_light.intensity = .5;
	back_light.position.set(0,100,500);
	scene.add(back_light);

	sun = new THREE.Mesh(
	    new THREE.SphereGeometry( 10, 16, 8 ),
	    new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
	);
	sun_y = 100;
  sun.position.set(0,sun_y, -600);
 	scene.add(sun);
	light.position = sun.position; //these are the same
	scene.add(light);

	createSky();
	createScoreText();
	createFloor();
	createFaces();
	createGUI();

	initDifferenceArray();

	// when the mouse moves, call the given function
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );

	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();

	//audio stuff
	analyser.fftSize = 2048;
	var bufferLength = analyser.frequencyBinCount; //bufferLength == 1024
	dataArray = new Uint8Array(bufferLength); //dataArray length == 1024, each element can be between 0 and 255

}

function loadFile() {
    var req = new XMLHttpRequest();
    req.open("GET",mp3_location,true);
    req.responseType = "arraybuffer";
    req.onload = function() {
        //decode the loaded data
        ctx.decodeAudioData(req.response, function(buffer) {
            buf = buffer; //the ArrayBuffer is converted to an AudioBuffer, which holds our audio data in memory
            play();
        });
    };
    req.send();
}

function play() {
    //create a source node from the buffer (type: AudioBufferSourceNode)
    src = ctx.createBufferSource(); //src is the "record player"

    src.buffer = buf; //src.buffer is the "record"
    src.loop = true;

    //connect to the final output node (the speakers)
    src.connect(analyser); //connect the record player to the AnalyserNode (where real-time data is)

    analyser.connect(ctx.destination); //ctx.destination is the speakers
    //play immediately
    src.start();
    playing = true;
}

function createSky(){
	//CODE FROM Stemkoski Skybox.html; TODO: customize with own sky images/textures
	var imagePrefix = "images/space-";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".jpg";
	var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add(skyBox);
}

function createFaces(){
	if (steve_mode){
		face = steve;
	}
	else {
		face = eli;
	}
	loader.load(face, function (geometry) {
		// ROWS OF FACES
		var faceLeft;
		var faceRight;
		var leftShapeMaterial = new THREE.MeshPhongMaterial( { color:0xffffff, transparent:true, opacity:1, ambient:0xff0000 } );
		var rightShapeMaterial = new THREE.MeshPhongMaterial( { color:0xffffff, transparent:true, opacity:1, ambient:0xfff000 } );
		var zFacePosition = 200; // starting z-coordinate for faces
		for (var i = 0; i < 6; i++) {
			// left row
			faceLeft = new THREE.Mesh(geometry,leftShapeMaterial);
			faceLeft.position.set(-100, 45, zFacePosition);
			faceLeft.scale.set(5,5,5);
			scene.add(faceLeft);
			targetList.push(faceLeft); //update score when face is clicked
			// right row
			faceRight = new THREE.Mesh(geometry,rightShapeMaterial);
			faceRight.position.set(100, 45, zFacePosition);
			faceRight.scale.set(5,5,5);
			faceRight.rotateY(180);
			scene.add(faceRight);
			targetList.push(faceRight); //update score when face is clicked
			zFacePosition -= 150; // go deeper
		}
	});
}

function removeFaces() {
	var currFace;
	for (var i = 0; i < targetList.length; i++) {
		currFace = targetList[i];
		scene.remove(currFace);
	}
	targetList = [];
}

function updateFaces(zFacePosition){ //the first shall become the last
		var leftFace = targetList.shift(); //remove and return first face in array
		var rightFace = targetList.shift(); //remove and return first (previously second) face in array
		leftFace.position.setZ(zFacePosition);
		rightFace.position.setZ(zFacePosition);
		targetList.push(leftFace); //add face with new z-position to end of array
		targetList.push(rightFace);
}

function createGUI() {
	var gui = new dat.GUI();
	parameters = {
		c: "", // start with empty String in text box
		selector: "sample0",
		custom: "",
	};
	gui.add( parameters, 'c' ).name('cheat codes').onChange(function(newValue)
	{
		//change faces to Steve faces
		if (steve_mode == false && newValue == "stevemode") {
			steve_mode = true;
			removeFaces(); //remove existing faces
			createFaces(); //add new steve faces
		}
		//switch back to original Eli faces
		if (steve_mode == true && newValue == "elimode") {
			steve_mode = false;
			removeFaces(); //remove existing faces
			createFaces(); //add new steve faces
		}
		//get a million points
		if (newValue == "pointz") {
			score += 1000000;
			refreshScoreText();
		}
	});
	gui.add( parameters, 'selector', [0,1,2,3]).name('select song').onChange(function(newValue)
	{
		mp3_location = "mp3/sample" + newValue + ".mp3";
	});
	gui.add( parameters, 'custom' ).name('custom track').onChange(function(newValue)
	{
		mp3_location = newValue;
	});
	gui.open();
}

function createFloor(){
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/mars.jpg' );
	var floorTextureBump = new THREE.ImageUtils.loadTexture( 'images/bump.jpg');
	var floorMaterial = new THREE.MeshPhongMaterial( {
		map: floorTexture,
		bumpMap	: floorTextureBump,
		bumpScale: 0.05,side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(5000, 5000);
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    //rotate 90 degrees around the xaxis so we can see the terrain
    floor.rotation.x = -Math.PI/-2;
    // Then set the z position to where it is in the loop (distance of camera)
    floor.position.z = cameraZPosition - 400;
    floor.position.y -=0.5;
    //add the floor to the scene
    scene.add(floor);
}

function createScoreText() {
	// add 3D text
	materialFront = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	materialSide = new THREE.MeshBasicMaterial( { color: 0x000088 } );
	materialArray = [ materialFront, materialSide ];
	textParams = {
		size: 30, height: 4, curveSegments: 3,
		font: "helvetiker", weight: "bold", style: "normal",
		bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
		material: 0, extrudeMaterial: 1
	};
	textGeom = new THREE.TextGeometry( "Score: " + score, textParams);

	textMaterial = new THREE.MeshFaceMaterial(materialArray);
	textMesh = new THREE.Mesh(textGeom, textMaterial );

	textGeom.computeBoundingBox();
	textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
	textMesh.position.set(-400, 150, textZ);
	textMesh.rotation.x = -Math.PI / 4;
	scene.add(textMesh);
}

function createAnyText(message, isCreating) {
	// add 3D text
	front = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	side = new THREE.MeshBasicMaterial( { color: 0x000088 } );
	materials = [ front, side ];
	params = {
		size: 15, height: 4, curveSegments: 3,
		font: "helvetiker", weight: "bold", style: "normal",
		bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
		material: 0, extrudeMaterial: 1
	};
	geom = new THREE.TextGeometry( message, params);

	myTextMaterial = new THREE.MeshFaceMaterial(materials);
	myMesh = new THREE.Mesh(geom, myTextMaterial );

	geom.computeBoundingBox();
	width = geom.boundingBox.max.x - geom.boundingBox.min.x;

	//start z-coordinate at -200 if it's being created rather than refreshed
	if (isCreating == true) {
		myMesh.position.set(-50, 75, cameraZPosition - 600);
		textAnyZ = cameraZPosition - 600;
	}
	else {
		myMesh.position.set(-50, 75, textAnyZ);
	}
	myMesh.rotation.x = -Math.PI / 4;
	scene.add(myMesh);

}

function refreshScoreText() {
	scene.remove(textMesh);
	createScoreText();
}

function refreshAnyText(str) {
	scene.remove(myMesh);
	createAnyText(str, false);
}

function addParticles() {

	var particles = new THREE.Geometry();
	var coordinateArray = calculateParticlePoints();
	var particleTexture = THREE.ImageUtils.loadTexture( 'images/spark.png' );

	particleGroup = new THREE.Object3D();
	particleAttributes = { startSize: [], startPosition: [], randomness: [] };

	for (var p = 0; p < coordinateArray.length; p++) {

		var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, useScreenCoordinates: false, color: 0xffffff } );

		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set( 32, 32, 1.0 ); // imageWidth, imageHeight
		sprite.position.set( coordinateArray[p].x, coordinateArray[p].y, coordinateArray[p].z);
		sprite.material.blending = THREE.AdditiveBlending; // add glow to particles

	    particleGroup.add( sprite );

	    // add variable qualities to arrays, if they need to be accessed later
		particleAttributes.startPosition.push( sprite.position.clone() );
		particleAttributes.randomness.push( Math.random() );

	}

	particleGroup.position.x -= 30; //account for fact that origin of face is not in middle of face
	scene.add( particleGroup );

}

function movement(){
	cameraZPosition = cameraZPosition - 5;
	camera.position.setZ(cameraZPosition);
	textZ = cameraZPosition - 600; //to make sure refreshText still works
	textMesh.position.setZ(textZ);
	sun.position.setZ(cameraZPosition - 900);
	skyBox.position.setZ(cameraZPosition - 500);
	back_light.position.setZ(cameraZPosition + 100);
	if (cameraZPosition % 150 == 0){
		updateFaces(cameraZPosition - 950); //950 is 5 * -150 number of rows minus additional 200 as reference to camera position
	}
	if (cameraZPosition % 1200 == 0){
		floor.position.setZ(cameraZPosition - 400);
	}
}

function faceColor(){
	if(typeof dataArray === 'object' && dataArray.length > 0) {
		var last_val = val; //previous value in dataArray, starting value is defined in global variables
		val = dataArray[0];
		if (val > last_val){
			gVal += 0x000019;
		}
		else if(val < last_val){
			gVal -= 0x000019;
		}
		if (targetList[0] != null && targetList[1] != null) {
			targetList[0].material.color.setHex(gVal);
			targetList[1].material.color.setHex(gVal);
		}
	}
}

function onDocumentMouseDown( event )
{
	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera ); //make sure it works in 3D space
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	/*CREATE LASER WHENEVER MOUSE CLICKED*/
	var newLaser = new Laser(randomColor());
	newLaser.spawnLaser();
	newLaser.setID(activeLasers.length); //keep track of position in array so we can remove lasers when necessary
	newLaser.setRaycaster(ray);
	activeLasers.push(newLaser); //add newly created laser to array that keeps track of all visible lasers

	// create an array containing all objects in the scene with which the ray intersects
	intersects = ray.intersectObjects( targetList ); //returns an Array of objects the ray intersects with

	// if there is one (or more) intersections, add 1 to score
	if ( intersects.length > 0 ) {
		score++;
		refreshScoreText();
		checkShowMessageText(); //check whether a message should be shown (messages shown at 5,10,15, and 25 points)
	}

}

/*
	LASER OBJECT DEFINITION

	Custom constructor function used to create Laser objects
	Inspired by:
		http://www.w3schools.com/js/js_object_prototypes.asp
		http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
*/
function Laser(colorHex) {

	//create instance properties; these properties will be unique to every instance of Laser created
	this.laserColor = colorHex;
	//this.laserGeometry = new THREE.CylinderGeometry( 1, 1, 50, 20, 4);
	this.laserGeometry = new THREE.SphereGeometry( 3, 32, 16);

	this.laserMaterial = new THREE.MeshPhongMaterial( { color: this.laserColor } );
	this.laserMesh = new THREE.Mesh( this.laserGeometry, this.laserMaterial );
	this.laserID = 0;
	this.laserXLocation = 10;
	this.laserYLocation = 100;
	this.laserZLocation = cameraZPosition;
	this.raycaster = null;
	this.projector = new THREE.Projector();


	/*
 	  Keeps track of how far along ray path a laser is;
 	  Used to compute laser location as it flies through space
	*/
	this.distanceAlongRay = 0;

	this.setRaycaster = function(inputRay) {
		this.raycaster = inputRay;
	}

	//define methods that will be inherited by all Laser instances
	this.showColor = function() {
		return "Laser color: " + this.laserColor;
	}

	this.setColor = function(newColor) {
		this.laserColor = newColor;
	}

	this.spawnLaser = function() {
		this.laserMesh.position.set(this.laserXLocation, this.laserYLocation, this.laserZLocation);
		this.laserMesh.rotation.x = -Math.PI/-2;
		scene.add(this.laserMesh);
	}

	/*
		GETTER AND SETTER FOR ID
	*/
	this.setID = function(id) {
		this.laserID = id;
	}

	this.getID = function() {
		return this.laserID;
	}

	this.updateZLocation = function() {
		this.laserZLocation -= 5;
		this.laserMesh.position.set(this.laserXLocation, this.laserYLocation, this.laserZLocation);
	}

	//get new laser location based on the distance along the ray created when user clicks
	this.updateLaserLocation = function() {
		this.distanceAlongRay += 5;

		/*
			Raycaster has a ray property of type Ray; we need this to use the at(distance) method,
			which gives us a Vector3 containing the coordinates located distance away from the ray's origin
		*/
		this.laserXLocation = this.raycaster.ray.at(this.distanceAlongRay).x;
		this.laserYLocation = this.raycaster.ray.at(this.distanceAlongRay).y;
		this.laserZLocation = this.raycaster.ray.at(this.distanceAlongRay).z;
		this.laserMesh.position.set(this.laserXLocation, this.laserYLocation, this.laserZLocation);
	}

	this.getXLocation = function() {
		return this.laserXLocation;
	}

	this.getYLocation = function() {
		return this.laserYLocation;
	}

	this.getZLocation = function() {
		return this.laserZLocation;
	}

}

function animate()
{
  requestAnimationFrame( animate );
	if (moving){
		movement()
	}
	if (color){
		faceColor();
	}
	analyser.getByteTimeDomainData(dataArray); //grab the time domain data and copy it into our array
	render();
	update();
}

function update()
{

	if (fadeToWhite == true) {
		elapsed = clock.getElapsedTime();
		//initialize secondsPassed
		if (elapsed > 1 && didExecute == false) {
			secondsPassed = 1;
			didExecute = true;
		}
		//every 0.1 seconds, reduce opacity
		if ((elapsed - secondsPassed) >= 0.1) {
			currOpacity = reduceFaceOpacity();
			secondsPassed += 0.1;
		}
		//once opacity reaches 0, fade faces and add particles
		if (currOpacity <= 0) {
			fadeToWhite = false;
			addParticles();
			particlesOn = true;
			removeFaces();
		}
	}

	if (particlesOn == true) {
		var time = 4 * clock.getElapsedTime();

		for ( var c = 0; c < particleGroup.children.length; c ++ )
		{
			var sprite = particleGroup.children[ c ];

			// pulse away/towards center
			// individual rates of movement
			var a = particleAttributes.randomness[c] + 1;
			var pulseFactor = Math.sin(a * time) * 0.01 + 0.9;
			sprite.position.x = particleAttributes.startPosition[c].x * pulseFactor;
			sprite.position.y = particleAttributes.startPosition[c].y * pulseFactor;
			sprite.position.z = particleAttributes.startPosition[c].z * pulseFactor;
		}

	}

	//update coordinate position for all currently active lasers
	for (var i = 0; i < activeLasers.length; i++) {
		activeLasers[i].updateLaserLocation();

		if ( intersects.length > 0 ) {
			//remove "hit" laser from screen once its z-value becomes less than the face's z-value
			if ( activeLasers[i].getZLocation() <= intersects[0].object.position.z ) {
				scene.remove(activeLasers[i].laserMesh);
				activeLasers.splice(i, 1); //remove laser at index i from array
				//intersects[0].object.scale.set(6,6,6);
			}
		}
		else {
			//remove "misses" once 1000 units away from the camera on the z-axis
			if (activeLasers[i].getZLocation() <= cameraZPosition - 1000) {
				scene.remove(activeLasers[i].laserMesh);
				activeLasers.splice(i, 1); //remove laser at index i from array
			}
		}

	}

	/* These are useful for testing but shouldn't work in the normal game
	if ( keyboard.pressed("m") ){
		moving = (! moving);
	}
	if ( keyboard.pressed("p") ){
		loadFile();
	}
	if ( keyboard.pressed("s") ){
		src.stop();
	}
	if ( keyboard.pressed("c") ){
		color = (! color);
	}
	*/

	if ( keyboard.pressed("up") ) //sun rises, max 1,000
	{
		sun_y +=5;
		light.intensity = 1;
		if (sun_y > 1000){
			sun_y = 1000;
		}
		sun.position.setY(sun_y);
	}
	if (keyboard.pressed("down")){ //sun lowers, min -15
		sun_y -=5;
		light.intensity = 1;
		if (sun_y < -15){
			sun_y = -15;
			light.intensity = 0;
		}
		sun.position.setY(sun_y);
	}
	if (showMessage == true) {
		messageIsShowing = true;
		if (myMesh != undefined) {
			myMesh.position.setZ(textAnyZ); //update z position
			textAnyZ += 10;
		}
		if (myMesh.position.z >= (cameraZPosition + 20)) {
			showMessage = false;
		}
		refreshAnyText(message);
	}
	//this can't be an else because we need to check even if above code executes
	if (showMessage == false) {
		//the 3DText can only be removed if it has been added in the first place
		if (messageIsShowing == true) {
			scene.remove(myMesh);
			messageIsShowing = false;
			//textAnyZ = cameraZPosition - 600;
			//this is to make sure movement does not start until "engines: engaged" message is off the screen, thus prevent lag
			if (startMovement == true) {
				startMovement = false; //we only want this to trigger once
				moving = ! moving; //start moving
			}
		}
	}
	stats.update();
}

function checkShowMessageText() {
	switch(score) {
		case 5:
			message = "queue the music";
			showAndFade(message);
			loadFile();
			break;
		case 35:
			message = "a world of color";
			showAndFade(message);
			color = true;
			break;
		case 65:
			message = "engines: engaged";
			showAndFade(message);
			startMovement = true;
			break;
		case 100:
			moving = false;
			message = "good night.";
			showAndFade(message);
			fadeToWhite = true;
			src.stop();
			break;
		default:
			break;
	}
	if (score >= 1000000 && showedDoLess == false) {
		message = "do less.";
		showedDoLess = true;
		showAndFade(message);
	}

}

function showAndFade(str) {

	createAnyText(str, true);

 	/*this triggers the if-statement in update() to continuously change z-coordinate value for the 3D Text until it's off the screen, at which point it is removed from the scene*/
	showMessage = true;

}

/*
	returns a random color among RED, YELLOW, and BLUE
*/
function randomColor() {
 	var ranInt = Math.floor((Math.random() * 3) + 1);
 	switch (ranInt) {
 		case 1:
 			return 0xff0000; //RED
 			break;
 		case 2:
 			return 0xffff00; //YELLOW
 			break;
 		case 3:
 			return 0x0000ff; //BLUE
 			break;
 		default:
 			return 0xff0000; //RED (default shouldn't ever execute)
 			break;
 	}
}

/*
	The locations of particles are calculated in relation to each face location
	RETURNS: Array of Vector3 objects, which represent where particles should go for all faces
*/
function calculateParticlePoints() {
	var particleLocations = [];
	//for each face, calculate where particles should go
	for (var a = 0; a < targetList.length; a++) {
		for (var b = 0; b < differenceArray.length; b++) {
			particleLocations.push( new THREE.Vector3(targetList[a].position.x + differenceArray[b].x, targetList[a].position.y + differenceArray[b].y, targetList[a].position.z + differenceArray[b].z) );
		}
	}
	return particleLocations;
}

/*
	Calculates where particle coordinates should go for a single face, using a reference face
	to calculate relative particle locations for all other faces
*/
function initDifferenceArray() {
	var particleArray = [];
	var refOrigin = new THREE.Vector3(-100, 45, 200);

	var refPoints = [
		new THREE.Vector3(-87.67076939125482, 76.89012354256533, 232.82660309908994),
		new THREE.Vector3(-86.3266780526229, 94.74379526191868, 234.26006335335987),
		new THREE.Vector3(-82.20235973232512, 107.4134908654349, 228.90391314419006),
		new THREE.Vector3(-71.15268230564126, 110.4832607792873, 218.02621849929423),
		new THREE.Vector3(-67.43947424516968, 92.35801819178822, 207.74962039341438),
		new THREE.Vector3(-66.02527188769162, 76.74006516191312, 213.60885036484947),
		new THREE.Vector3(-66.57465125455278, 65.3068738420894, 221.4813231793779),
		new THREE.Vector3(-78.79394769571655, 50.719308995964084, 209.59500301504272),
		new THREE.Vector3(-85.54517589328219, 49.40603848992242, 219.70584184013515),
		new THREE.Vector3(-69.6121281810403, 78.14526339432288, 232.80182763408692),
		new THREE.Vector3(-72.78060272248622, 95.8912118190533, 224.94577582695547),
		new THREE.Vector3(-71.74138818329281, 64.58371754020179, 230.85821255988736),
		new THREE.Vector3(-77.02436916290922, 100.13491785845335, 232.8297354264714),
		new THREE.Vector3(-75.72124106589814, 89.4803813534724, 229.96941042959764),
		new THREE.Vector3( -68.2247894668391, 82.41223075617806, 217.88341480326721),
		new THREE.Vector3( -66.76322539532832, 71.01479122132079, 219.682472682461),
		new THREE.Vector3(-77.19374001742095, 71.66612123907646, 233.19283043673926),
		new THREE.Vector3(-76.29991608852579, 64.2190222891632, 232.81366809822765),
		new THREE.Vector3(-78.66828048110892, 87.51262439603208, 228.92403152697085),
		new THREE.Vector3(-66.79699788648875, 76.78068974470881, 216.93153246858309),
		new THREE.Vector3(-75.07897894420108, 86.36253587787778, 227.88281251200907),
		new THREE.Vector3(-72.8675118734806, 66.32196526953577, 132.23925676792817),
		new THREE.Vector3(-69.56829406950114, 79.55311270854696, 131.67329855063659),
		new THREE.Vector3(-84.12689293301356, 106.58601280725743, 132.24187581472393),
		new THREE.Vector3(-71.64162680175252, 60.812397329357005, 131.15496232167182),
		new THREE.Vector3(-85.37968150608451, 50.9418272407617, 220.05573900330255),
		new THREE.Vector3(-78.12833604518006, 51.05139290707531, 207.315803488046555)
	];

	for (var idx = 0; idx < refPoints.length; idx++) {
		differenceArray.push( new THREE.Vector3(refPoints[idx].x - refOrigin.x, refPoints[idx].y - refOrigin.y, refPoints[idx].z - refOrigin.z) );
	}

}

function reduceFaceOpacity() {
	targetList[0].material.transparent = true;
	targetList[1].material.transparent = true;
	targetList[0].material.opacity -= 0.025;
	targetList[1].material.opacity -= 0.025;
	console.log("reduceface");
	return targetList[0].material.opacity;

}

function render()
{
	renderer.render( scene, camera );
}
