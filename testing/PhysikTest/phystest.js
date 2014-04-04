
	var renderer, camera, controls, moreLight, directionalLight;
	
	
	var time=0.0; 
		
	function init(){
		document.addEventListener("keydown", keyDown, false);
		scene = new THREE.Scene(); 
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
		
		
		
		ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 5, 5), new THREE.MeshNormalMaterial());
	
		
	

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

		var V=5;
		var a=-9.81*0.2;
		
	function animate() {
		requestAnimationFrame( animate );
		V=V+time*a;
		if(V<0)V=0;
		ball.translateZ(-time*V);
		
		render();
		controls.update();
	}
	
	// Renderer
	function render() { 
		renderer.shadowMapEnabled = true;

		renderer.shadowMapBias = 0.0039;
		renderer.shadowMapDarkness = 0.5;
		renderer.shadowMapWidth = 1024;
		renderer.shadowMapHeight = 1024; 
		renderer.render(scene, camera); 
	} 

		
	function keyDown(event) {

		switch(event.keyCode) {

      case 65: ///Key A
		 putPins(slices);
         break;
      case 68: ///Key D
		 scene.remove(ball);
         drawBall([0,0.11,10]);
         break;
      case 87: ///Key W
         time=0.01;
		 V=5;
         break;
      case 83: ///Key S
         ;
         break;
      default:
         break;
		}
		animate();
	}			
	
	function drawBall(r){
	//scene.remove(ball);
	  time=0;
	  ball.position.set(r[0],r[1],r[2]); 
	  scene.add(ball);
	  }
	
	
	
	
	init();
	animate();
	
	