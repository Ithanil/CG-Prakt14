
var renderer, camera, controls, moreLight, directionalLight;
var time;
var scene = new THREE.Scene();
//var physobjs = [new BowlBall([1., 1., -6.], [0., 0., 0.], [0., 0., 0.], [0., 0., 0.], [0.,0.,0.001]), new BowlPin([0., 0., -6.], [0., 0., 0.], [0., 0., 0.], [0., 0., 0.],[0., 0.14755784154951435, 0.],10,"blue")];
//var physobjs = [new BowlPin([0., 0., -6.], [0., 0., 0.], [0., 0., 0.], [0., 0., 0.],[0., 0.14755784154951435, 0.],10,"blue")];

var physobjs = [new BowlBall(new THREE.Vector3(1., 2., -6.), new THREE.Vector3(0., 0.0, 0), new THREE.Euler(0.3, 0., 0.), new THREE.Vector3(0*0.2*62.83185307179586, 0., 0*0.1*62.83185307179586), new THREE.Vector3(0.,0.,0.0)),
                new BowlPin(new THREE.Vector3(0., 2., -6.), new THREE.Vector3(0., 0.0, 0), new THREE.Euler(1.5707963267948966, 0., 0.0*1.5707963267948966), new THREE.Vector3(0*0.2*62.83185307179586, 0., 0*0.1*62.83185307179586), new THREE.Vector3(0., 0., 0.),10,"blue")];
var ifocus = 0; //Index of object which is manipulated by keys (changed by +/-)
var keyPosAdd = 0.05, keyVelAdd = 0.05, keyQuAddS = 0.99875, keyQuAddV = 0.0499792;
var oldanglmom = new THREE.Vector3();
var oldanglvel = new THREE.Vector3();
var oldaccs = getAccs(physobjs);
var dt = 0.005;

/*
console.log(physobjs[0].position.x);
console.log(physobjs[0].position.y);
console.log(physobjs[0].position.z);
 */

init();
animate();


function init(){
	document.addEventListener("keydown", keyDown, false);
	scene = new THREE.Scene(); 
	time = new Date();
	// PerspectiveCamera(fovy, aspect, near, far)
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	controls.target.z=-6;
	camera.position.z=15;
	camera.position.y=0;
	camera.position.x=0;

	renderer = new THREE.WebGLRenderer(); 
	renderer.setSize( window.innerWidth, window.innerHeight ); 
	renderer.setClearColor( 0xffffff, 1 );	// Canvas Background Color
	document.body.appendChild( renderer.domElement );

	for (var it=0; it<physobjs.length; it++) {scene.add(physobjs[it]);}
	oldanglmom = physobjs[1].getAnglMom();
	oldanglvel.copy(physobjs[1].anglvel);

	/*// Plattform
	var plattform_material = new THREE.MeshPhongMaterial( { color: 0x339933 } ); 
	var plattform = new THREE.Mesh( new THREE.CylinderGeometry( 15,15,1, 5), plattform_material ); 
	plattform.translateY(-0.5-0.1);
	scene.add( plattform ); */

	// Position oder Kamera
	//camera.position.set( 4, 4, 21 );
	//camera.lookAt( scene.position );
	//KAMERA auf die Pins

	//Schattenwurf
	//moreLight = new THREE.DirectionalLight(0xffffff, 0.5);
	//moreLight.position.set(0,1,0);
	//scene.add(moreLight);

	// Ambient Directional light Test
	directionalLight = new THREE.DirectionalLight(0xffffff);
	//directionalLight.position.set(1,1.5,1).normalize();
	directionalLight.target.position.set(0,0,-18.29/2);
	directionalLight.shadowCameraNear = 2;
	directionalLight.shadowCameraFar = 15;
	directionalLight.shadowCameraLeft = -0.5;
	directionalLight.shadowCameraRight = 0.5;
	directionalLight.shadowCameraTop = 0.5;
	directionalLight.shadowCameraBottom = -0.5;
	directionalLight.shadowCameraVisible = false;
	directionalLight.castShadow = true;
	scene.add(directionalLight);

	// SKYBOX
	var sky_geometry = new THREE.CubeGeometry( 10000, 10000, 10000 );    
	var images = ["skybox/right.jpg", "skybox/left.jpg", 
	              "skybox/up.jpg", "skybox/down.jpg", 
	              "skybox/front.jpg", "skybox/back.jpg"];
	var sky_material_array = [];
	for (var i = 0; i < 6; i++)
		sky_material_array.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( images[i] ),
			side: THREE.BackSide
		}));
	var sky_material = new THREE.MeshFaceMaterial( sky_material_array );
	var skybox = new THREE.Mesh(sky_geometry, sky_material);
	skybox.rotation.y -=2.35;
	scene.add(skybox);
	// SKYBOX ENDE*/
}

function animate() {

	/*var oldtime = time.getTime();
	time = new Date();
	var dt = (time.getTime() - oldtime) / 1000.;*/

	//requestAnimationFrame( animate );
	//var dt = 0.001;

	integrate(physobjs, dt, oldaccs);
	for (var it=0; it<physobjs.length; it++) {physobjs[it].updateObject3D()}

	for (var it=0; it<physobjs.length; it++) {console.log('refpos', physobjs[it].refpos.x, physobjs[it].refpos.y, physobjs[it].refpos.z);
		console.log('orquat', physobjs[it].orquat.x, physobjs[it].orquat.y, physobjs[it].orquat.z, physobjs[it].orquat.w);
		console.log('quaternion', physobjs[it].quaternion.x, physobjs[it].quaternion.y, physobjs[it].quaternion.z, physobjs[it].quaternion.w);
		console.log('velocity', physobjs[it].velocity.x, physobjs[it].velocity.y, physobjs[it].velocity.z);
	console.log('anglvel', physobjs[it].anglvel.x, physobjs[it].anglvel.y, physobjs[it].anglvel.z);}


	for (var it=0; it<physobjs.length; it++) {
		if (it==1) {

			var anglmom = physobjs[it].getAnglMom();
			var anglmdiff = new THREE.Vector3(anglmom.x - oldanglmom.x, anglmom.y - oldanglmom.y, anglmom.z - oldanglmom.z );

			//var alltorq = new THREE.Vector3();
			//alltorq.crossVectors(oldanglmom, oldanglvel);
			//var torque = new THREE.Vector3(0.0, 0.0, 0.0);
			//alltorq.add(torque);

			/*console.log(physobjs[it].anglvel.x);
			console.log(physobjs[it].anglvel.y);
			console.log(physobjs[it].anglvel.z);
			console.log(anglmdiff.x/dt);
			console.log(anglmdiff.y/dt);
			console.log(anglmdiff.z/dt);*/
			//console.log(alltorq.x);
			//console.log(alltorq.y);
			//console.log(alltorq.z);
			//console.log(anglmom.x*anglmom.x + anglmom.y*anglmom.y + anglmom.y*anglmom.y);

			oldanglmom.copy(anglmom);		
			oldanglvel.copy(physobjs[it].anglvel);
		}
	}

	render();
	controls.update();
}

//Renderer
function render() { 
	renderer.shadowMapEnabled = true;

	renderer.shadowMapBias = 0.0039;
	renderer.shadowMapDarkness = 0.5;
	renderer.shadowMapWidth = 1024;
	renderer.shadowMapHeight = 1024; 
	renderer.render(scene, camera); 
} 


function keyDown(event) {

	if (event.shiftKey) {
		switch(event.keyCode) {

		case 65: ///Key A
			break;
		case 68: ///Key D
			break;
		case 87: ///Key W
			break;
		case 83: ///Key S
			break;

		case 81: ///Key Q
			break;
		case 69: ///Key E
			break;
		case 82: ///Key R
			break;
		case 89: ///Key Y
			break;
		case 88: ///Key X
			break;
		case 67: ///Key C
			break;
		default:
			break;
		}

	} else {

		switch(event.keyCode) {

		case 65: ///Key a
			physobjs[ifocus].refpos.x -= keyPosAdd;
			break;
		case 68: ///Key d
			physobjs[ifocus].refpos.x += keyPosAdd;
			break;
		case 78: ///Key n
			physobjs[ifocus].refpos.y -= keyPosAdd;
			break;
		case 77: ///Key m
			physobjs[ifocus].refpos.y += keyPosAdd;
			break;
		case 87: ///Key w
			physobjs[ifocus].refpos.z -= keyPosAdd;
			break;
		case 83: ///Key s
			physobjs[ifocus].refpos.z += keyPosAdd;
			break;
		case 81: ///Key q
			physobjs[ifocus].orquat.multiply(new THREE.Quaternion(keyQuAddV,0.,0.,keyQuAddS));
			break;
		case 69: ///Key e
			physobjs[ifocus].orquat.multiply(new THREE.Quaternion(0.,keyQuAddV,0.,keyQuAddS));
			break;
		case 82: ///Key r
			physobjs[ifocus].orquat.multiply(new THREE.Quaternion(0.,0.,keyQuAddV,keyQuAddS));
			break;
		case 89: ///Key y
			physobjs[ifocus].orquat.multiply(new THREE.Quaternion(-keyQuAddV,0.,0.,keyQuAddS));
			break;
		case 88: ///Key x
			physobjs[ifocus].orquat.multiply(new THREE.Quaternion(0.,-keyQuAddV,0.,keyQuAddS));
			break;
		case 67: ///Key c
			physobjs[ifocus].orquat.multiply(new THREE.Quaternion(0.,0.,-keyQuAddV,keyQuAddS));
			break;
		case 50:///Key 2
			if (physobjs.length > 1) {
				ifocus = (physobjs.length + ifocus + 1) % (physobjs.length);
				console.log(ifocus);
			}
			break;
		case 49:///Key 1
			if (physobjs.length > 1) {
				ifocus = (physobjs.length + ifocus - 1) % (physobjs.length);
				if (ifocus==-0) { ifocus = 0; }
			}
			break;
		case 51:///Key 3
			break;
		default:
			break;
		}
	}
	animate();
}	

/*
	function clearText()
	{   document.getElementById('message').innerHTML = '..........';   }

	function appendText(txt)
	{   document.getElementById('message').innerHTML += txt;   }
 */