// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var lamp;
var shapes;
var parameters;
var gui;

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
	camera.position.set(0,150,400);
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
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(-100,150,100);
	scene.add(light);

	// need to add an ambient light
	//  for ambient colors to be visible
	// make the ambient light darker so that
	//  it doesn't overwhelm (like emmisive light)
	var light2 = new THREE.AmbientLight(0x333333);
	light2.position.set( light.position );
	scene.add(light2);

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

	////////////
	// CUSTOM //
	////////////

	// Using phongMaterial
	var shapeMaterial = new THREE.MeshPhongMaterial( { color:0xff0000, transparent:true, opacity:1 } );

	//tetrahedron
	var tetraGeometry = new THREE.TetrahedronGeometry( 40, 0);
	tetra = new THREE.Mesh(tetraGeometry, shapeMaterial);
	tetra.position.set(0,23,-200); //23 is half height based on tetrahedron geometry
	scene.add(tetra);

	//dome
	var domeGeometry = new THREE.SphereGeometry( 40, 32, 16, 0, 2 * Math.PI, 0, Math.PI / 2 )
	dome = new THREE.Mesh(domeGeometry, shapeMaterial);
	dome.position.set(0, 0, -100); //bottom of object is where it is set so height set to 0
	scene.add( dome );

	//torus - diamond
	var diamondGeometry = new THREE.TorusGeometry( 25, 10, 8, 4 );
	diamond = new THREE.Mesh(diamondGeometry, shapeMaterial);
	diamond.position.set(0, 35, 0); //height is radius of torus plus diameter of tube
	scene.add( diamond );

	//var - cone
	var coneGeometry = new THREE.CylinderGeometry( 10, 30, 100, 20, 4 );
	cone = new THREE.Mesh(coneGeometry, shapeMaterial);
	cone.position.set(0, 50, 100); // height is half height of cone
	scene.add(cone);

	//torus - bagel
	var bagelGeometry = new THREE.TorusGeometry( 30, 20, 16, 40 );
	bagel = new THREE.Mesh(bagelGeometry, shapeMaterial);
	bagel.position.set(0, 50, 200); //height is radius of torus plus diameter of tube
	scene.add( bagel );

	// create a small sphere to show position of light
	lamp = new THREE.Mesh(
		new THREE.SphereGeometry( 10, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
	);
	lamp.position = light.position;
	scene.add( lamp );

}

function animate()
{
    requestAnimationFrame( animate );
	render();
	update();
}

function update()
{
	if ( keyboard.pressed("z") )
	{
		// do something
	}

	controls.update();
	stats.update();
}

function render()
{
	renderer.render( scene, camera );
}
