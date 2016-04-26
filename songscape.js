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
var steve_mode = false; //steve mode boolean flag

//lighting
var sun, sun_y;
var light, back_light;

var materialFront, materialSide, materialArray;
var textMesh, textGeom, textParams, textMaterial, textWidth;
var textZ = -200;
var score = 0;

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

var logCount = 0;

var cube;

var moving = false;

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
	//camera.position.set(10,150,400);
	camera.position.set(10,100,cameraZPosition);
	camera.lookAt(scene.position);
	//camera.lookAt(new THREE.Vector3(10,150,4000));
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

function refreshText() {
	scene.remove(textMesh);
	createScoreText();
}

function movement(){
	cameraZPosition = cameraZPosition - 5;
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
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();

	console.log("Click.");

	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// find intersections

	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects( targetList );

	// if there is one (or more) intersections
	if ( intersects.length > 0 )
	{
		score++;
		refreshText();

		// change the color of the closest face.
		// intersects[ 0 ].face.color.setRGB( 0.8 * Math.random() + 0.2, 0, 0 );
		// intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
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
	if ( keyboard.pressed("p") )
	{
		score++;
		refreshText(); //add 1 to 3D Score Text
	}
	//s toggles movement
	if (keyboard.pressed("S")){
		console.log("pressed s");
		moving = ! moving;
	}
	if(typeof dataArray === 'object' && dataArray.length > 0) {
		var k = 0;
		var scale = dataArray[k] / 45;
		var hex = rgbToHex(rVal, bVal, gVal);
		if (targetList[0] != null && targetList[1] != null) {

			targetList[0].material.color.setHex( hex );
			targetList[1].material.color.setHex( hex );
			// for (var w = 0; w < targetList.length; w++) {
			// 	targetList[w].scale.y = (scale < 1 ? 1 : scale);
			// }
		}

		if (gVal >= 255) gUp = false;
		if (gVal == 0) gUp = true;
		if (gUp) gVal += 5;
		else gVal -= 5;

		k += (k < dataArray.length ? 1 : 0);
	}

	stats.update();
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
