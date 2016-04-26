// standard global variables
var container, scene, camera, renderer, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// controls
var parameters;
var gui;

//face models
var loader = new THREE.JSONLoader(); // init the loader util
var face = eli = 'obj/finalFace.json'; //normal eli face
var steve = 'obj/steve.json'; //alternate face for steve mode
var steve_mode = true; //steve mode boolean flag

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

var targetList = [];
var floor;
var skyBox;
var projector, mouse = { x: 0, y: 0 };
var cameraZPosition = 400;
var cameraYPosition = 150;

var rVal = 255;
var gVal = 0;
var bVal = 255;

var rUp = true;
var gUp = true;
var bUp = true;

var moving = false;

var intersects; //holds all face objects that the Raycaster intersects with

var sphereGeom, sphere, redMaterial;

var activeLasers = [];

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
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	light = new THREE.DirectionalLight(0xffffff);
	light.intensity = 10;

	back_light = new THREE.DirectionalLight(0xffffff); //add a little light behind camera to fake ambient effect
	back_light.intensity = .25;
	back_light.position.set(200,100,500);
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

	// when the mouse moves, call the given function
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );

	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();

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
	loader.load(face, function (geometry) {
		// ROWS OF FACES
		var faceLeft;
		var faceRight;
		var leftShapeMaterial = new THREE.MeshPhongMaterial( { color:0xff0000, transparent:true, opacity:1, ambient:0xff0000 } );
		var rightShapeMaterial = new THREE.MeshPhongMaterial( { color:0xfff000, transparent:true, opacity:1, ambient:0xfff000 } );
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

function updateFaces(zFacePosition){ //the first shall become the last
		var leftFace = targetList.shift();
		var rightFace = targetList.shift();
		leftFace.position.setZ(zFacePosition);
		rightFace.position.setZ(zFacePosition);
		targetList.push(leftFace);
		targetList.push(rightFace);
}

function createFloor(){
		var floorTexture = new THREE.ImageUtils.loadTexture( 'images/mars.jpg' );
		var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
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

function movement(){
	cameraZPosition = cameraZPosition - 1;
	camera.position.setZ(cameraZPosition);
	textZ = cameraZPosition - 600; //to make sure refreshText still works
	textMesh.position.setZ(textZ);
	sun.position.setZ(cameraZPosition - 900);
	if (cameraZPosition % 150 == 0){
		updateFaces(cameraZPosition - 950); //950 is 5 * -150 number of rows minus additional 200 as reference to camera position
	}
	if (cameraZPosition % 1000 == 0){
		skyBox.position.setZ(cameraZPosition - 500);
		floor.position.setZ(cameraZPosition - 400);
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
		//this.laserMesh.position.set(10, 50, 300);
		this.laserMesh.position.set(this.laserXLocation, this.laserYLocation, this.laserZLocation);
console.log("starting ZLocation: " + this.laserZLocation);
console.log("current cameraZLocation " + cameraZPosition);
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
	render();
	update();
}

function update()
{

	//update coordinate position for all currently active lasers
	for (var i = 0; i < activeLasers.length; i++) {
		activeLasers[i].updateLaserLocation();

		if ( intersects.length > 0 ) {
			//remove laser from screen once its z-value becomes less than the face's z-value
			if ( activeLasers[i].getZLocation() <= intersects[0].object.position.z ) {
				console.log("activeLasers[i].getXLocation: " + activeLasers[i].getYLocation());
				console.log("intersects[0].object.position.x: " + intersects[0].point.y);
				//intersects[0].object.scale.set(7,7,7); //scale faces once "hit" by laser
				scene.remove(activeLasers[i].laserMesh);
				activeLasers.splice(i, 1); //remove laser at index i from array
				console.log("explode, removing hit laser");
			}
		}
		else {
			//remove "misses" once 1000 units away from the camera on the z-axis
			if (activeLasers[i].getZLocation() <= cameraZPosition - 1000) {
				console.log("removing miss laser");
				scene.remove(activeLasers[i].laserMesh);
				activeLasers.splice(i, 1); //remove laser at index i from array
			}
		}

	}

	if ( keyboard.pressed("up") ) //sun rises, max 1,000
	{
		if (sun_y > 1000){
			sun_y = 1000;
		}
		sun_y +=5;
		sun.position.setY(sun_y);
	}
	if (keyboard.pressed("down")){ //sun lowers, min -15
		sun_y -=5;
		if (sun_y < -15){
			sun_y = -15;
			light.intensity = 0;
		}
		else{
			light.intensity = 10;
			sun.position.setY(sun_y);
		}
	}
	//s toggles movement
	if (keyboard.pressed("S")){
		moving = ! moving;
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
		}
	}
	if(typeof dataArray === 'object' && dataArray.length > 0) {
		var k = 0;
		var scale = dataArray[k] / 45;
		var hex = rgbToHex(rVal, bVal, gVal);
		if (targetList[0] != null && targetList[1] != null) {

			targetList[0].material.color.setHex( hex );
			targetList[1].material.color.setHex( hex );
		}

		if (gVal >= 255) gUp = false;
		if (gVal == 0) gUp = true;
		if (gUp) gVal += 5;
		else gVal -= 5;

		k += (k < dataArray.length ? 1 : 0);
	}

	stats.update();
}

function checkShowMessageText() {
	switch(score) {
		case 5:
			message = "queue the music";
			showAndFade(message);
			break;
		case 15:
			message = "a world of color";	
			showAndFade(message);
			break;
		case 25:
			message = "engines: engaged";
			showAndFade(message);
			break;
		case 35:
			message = "BOOM!";
			showAndFade(message);
			break;
		default:
			break;
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
 	//console.log("ranInt: " + ranInt);
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

function frequencySum() {
	var freqSum = 0;
	for (var q = 0; q < dataArray.length; q++) {
		freqSum += dataArray[q];
	}
	return freqSum;
}

function averageFrequency() {
	return frequencySum() / dataArray.length;
}

function componentToHex(c) {
    var hexa = c.toString(16);
    return hexa.length == 1 ? "0" + hexa : hexa;
}

function rgbToHex(r, g, b) {
    return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function render()
{
	renderer.render( scene, camera );
}
