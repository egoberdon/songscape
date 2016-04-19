// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var parameters;
var gui;
var loader = new THREE.JSONLoader(); // init the loader util
var faces = []; //array to store all active face objects
var cube;
var cameraZPosition = 400;

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
	camera.position.set(10,150,cameraZPosition);
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
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	//controls = new THREE.TrackballControls(camera);
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	// FLOOR
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	
	// ROWS OF SPHERES
	var sphereGeom =  new THREE.SphereGeometry( 30, 32, 16 );
	var hex = 0xffff00;
	var darkMaterialP = new THREE.MeshPhongMaterial( { color: hex } );
	var sphereLeft;	
	var sphereRight;
	var zSpherePosition = 200; // starting z-coordinate for spheres
	for (var i = 0; i < 5; i++) {
		// left row
		sphereLeft = new THREE.Mesh( sphereGeom.clone(), darkMaterialP );
		sphereLeft.position.set(-100, 50, zSpherePosition);
		scene.add( sphereLeft );

		// right row
		sphereRight = new THREE.Mesh( sphereGeom.clone(), darkMaterialP );
		sphereRight.position.set(100, 50, zSpherePosition);
		scene.add( sphereRight );

		zSpherePosition -= 150; // go deeper
	}

	var cubeGeom = new THREE.CubeGeometry(30,30,30);
	cube = new THREE.Mesh( cubeGeom.clone(), darkMaterialP);
	cube.position.set(0,50,50);
	scene.add(cube);

    // LIGHT
  var light = new THREE.PointLight(0xffffff);
  light.position.set(-100,100,100);
  scene.add(light);

    // Using phongMaterial
  var shapeMaterial = new THREE.MeshPhongMaterial( { color:0xff0000, transparent:true, opacity:1 } );

    // create a small sphere to show position of light
  var lamp = new THREE.Mesh(
    new THREE.SphereGeometry( 10, 16, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
  );
  lamp.position = light.position;
  scene.add(lamp);

	// loader.load('obj/face.json', function (geometry) {
	// 	var face = new THREE.Mesh(geometry,shapeMaterial); // create a mesh with models geometry and material
	// });
	//faces[0].position.set(0,100,100);
	//faces[0].scale.set(30,30,30);
	//scene.add(faces[0]);
}
function animate()
{
  requestAnimationFrame( animate );
	render();
	update();
}

function update()
{
	controls.update();
	stats.update();

	if ( keyboard.pressed("A") )
		cameraZPosition = cameraZPosition - 5;

	if ( keyboard.pressed("D") )
		cameraZPosition = cameraZPosition + 5;

	if (cameraZPosition == -380)
		cameraZPosition = 380;

	camera.position.set(10,30,cameraZPosition);

	camera.lookAt(new THREE.Vector3(0,150,-4000));



}

function render()
{		
	renderer.render( scene, camera );
}
