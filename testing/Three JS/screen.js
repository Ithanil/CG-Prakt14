function viewScreen( containerId ) {

	var container;

	var camera, renderer;

	

	var mouseX = 0, mouseY = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	init();

	function init() {
		scene = new THREE.Scene();
		container = document.getElementById( containerId );
		document.addEventListener("keydown", keyDown, false);
		var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
		var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;

		container.onmousedown = mouseDown;
		container.onmousemove = mouseMove;
		container.onmouseup = mouseUp;

		camera1 = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		//camera.setViewOffset( fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight );
		camera1.position.set( 0, 1, 14 );
		camera1.lookAt( scene.position );

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor( 0xffffff );
		renderer.setSize( container.clientWidth, container.clientHeight );
		container.appendChild( renderer.domElement );
		
		projector = new THREE.Projector();
		
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		
				// ANZEIGE

		varsPanel = document.createElement('div');
		varsPanel.style.position = 'absolute';
		varsPanel.style.width = 250+'px';
		varsPanel.style.backgroundColor = "rgba( 1, 0, 0, 0.25 )";
		setText();
		varsPanel.style.top = 5 + 'px';
		varsPanel.style.left = 5 + 'px';
		document.body.appendChild(varsPanel);
		
		// Bahn
		var laneTexture = new THREE.ImageUtils.loadTexture("textures/wood.jpg");
		laneTexture.wrapS = laneTexture.wrapT = THREE.RepeatWrapping;
		laneTexture.repeat.set( 3,25 );
		var lane_material = new THREE.MeshPhongMaterial( {  map:laneTexture, side:THREE.DoubleSide } ); 
		lane = new THREE.Mesh( new THREE.CubeGeometry(laneWidth,laneLevel,laneLength+apprLength), lane_material ); 
		lane.translateY(-laneLevel/2);
		lane.translateZ(-1);
		lane.receiveShadow = true;
		scene.add( lane );  
		
		
		// Approach
		var appr_geometry = new THREE.CubeGeometry(laneWidth+2*gutterWidth,laneLevel,apprLength); 
		var apprTexture = new THREE.ImageUtils.loadTexture("textures/wood.jpg");
		apprTexture.wrapS = apprTexture.wrapT = THREE.RepeatWrapping;
		apprTexture.repeat.set( 5,3 );
		var appr_material = new THREE.MeshPhongMaterial( {  map:apprTexture, side:THREE.DoubleSide } ); 
		approach = new THREE.Mesh( appr_geometry, appr_material ); 
		approach.translateZ((laneLength+apprLength)/2+apprLineLength);
		approach.translateY(-laneLevel/2);
		approach.receiveShadow = true;
		scene.add( approach ); 
		
		var appr_line = new THREE.Mesh(new THREE.CubeGeometry(laneWidth+2*gutterWidth,laneLevel,apprLineLength),new THREE.MeshPhongMaterial( { color: 0x999999 } ));
		appr_line.translateY(-laneLevel/2);
		appr_line.translateZ((laneLength + apprLineLength)/2);
		appr_line.receiveShadow = true;
		scene.add(appr_line);
		
		// Plattform
		var grass = new THREE.ImageUtils.loadTexture("textures/grass.jpg");
		grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
		grass.repeat.set( 15,10 );
		var plattform_material = new THREE.MeshPhongMaterial( { 
			map: grass,
			color: 0x339933 } ); 
		var plattform = new THREE.Mesh( new THREE.CubeGeometry( 30,1,30), plattform_material ); 
		plattform.translateY(-0.5-laneLevel);
		plattform.receiveShadow=true;
		scene.add( plattform ); 
		
		var boxTexture = new THREE.ImageUtils.loadTexture("textures/box.jpg");
		var boxTextureVert = new THREE.ImageUtils.loadTexture("textures/boxVert.jpg");
		var pandaTexture = new THREE.ImageUtils.loadTexture("textures/panda.jpg");
		var box_material = new THREE.MeshPhongMaterial( {  map:boxTexture, side:THREE.DoubleSide } ); 
		var boxUp_material = [
			
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
			new THREE.MeshPhongMaterial({  map:pandaTexture }),
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
		]
		
		
		var boxBack = new THREE.Mesh(
			new THREE.CubeGeometry(laneWidth+2*gutterWidth+boxLRWidth*2,boxHeight,boxBackLength),
			new THREE.MeshPhongMaterial({  map:boxTextureVert })
		);
		boxBack.translateY(boxHeight/2-laneLevel);
		boxBack.translateZ(-laneLength/2-distFromPins-boxBackLength-0.5);
		boxBack.castShadow = true;
		boxBack.receiveShadow = true;
		scene.add(boxBack);
		var boxLR = new THREE.CubeGeometry(boxLRWidth,boxHeight,boxLRLength);
		var boxL = new THREE.Mesh(boxLR, box_material);
		boxL.translateX(laneWidth/2+gutterWidth+boxLRWidth/2);
		boxL.translateY(boxHeight/2-laneLevel);
		boxL.translateZ(-laneLength/2-distFromPins);
		scene.add(boxL);
		var boxR = new THREE.Mesh(boxLR, box_material);
		boxR.translateX(-1.05/2-0.2359-0.5/2);
		boxR.translateY(boxHeight/2-laneLevel);
		boxR.translateZ(-laneLength/2-distFromPins);
		scene.add(boxR);
		var boxUp = new THREE.Mesh(
			new THREE.CubeGeometry(laneWidth+2*gutterWidth,boxUpHeight,boxLRLength,1,1,1),
			new THREE.MeshFaceMaterial(boxUp_material)
		);
		boxUp.translateY(-laneLevel+boxHeight-boxUpHeight/2);
		boxUp.translateZ(-laneLength/2-distFromPins);
		scene.add(boxUp);
		
		// Außen

		var rinneGeometry = new THREE.Geometry();
		var rinneVertices = new Array();
		var radius = 0.25;
		var offsetY = 0.1-Math.sin(360*50/80*Math.PI/180)*radius;
		
		rinneVertices = rinneVertices.concat(
			[-gutterWidth/2,0,0],[-gutterWidth/2,0,laneLength+apprLength],
			[-gutterWidth/2,laneLevel,0],[-gutterWidth/2,laneLevel,laneLength+apprLength]
		);
		
		for (var i = 50; i < 71; i++)
		{
			var newVertex = [];
			newVertex[0] = -Math.cos(360*i/80*Math.PI/180)/Math.cos(360*50/80*Math.PI/180)*0.11; 	 
			newVertex[1] = Math.sin(360*i/80*Math.PI/180)*radius+offsetY;
			newVertex[2] = 0;
			rinneVertices = rinneVertices.concat(newVertex);
			newVertex[2] = laneLength+apprLength;
			rinneVertices = rinneVertices.concat(newVertex);
		}
		rinneVertices = rinneVertices.concat(
			[gutterWidth/2,laneLevel,0],[gutterWidth/2,laneLevel,laneLength+apprLength],
			[gutterWidth/2,0,0],[gutterWidth/2,0,laneLength+apprLength]
			[-gutterWidth/2,0,0],[-gutterWidth/2,0,laneLength+apprLength]
		);
		
		var countr = 0;
		for (var i = 0; i < rinneVertices.length; i = i + 3) {
				rinneGeometry.vertices.push(new THREE.Vector3(rinneVertices[i],rinneVertices[i+1],rinneVertices[i+2]));
				countr++;
		}
		
		for (var i = 0; i < countr-3; i = i +2) 
		{
			var a = i;
			var b = i+1;
			var c = i+2;
			var d = i+3;
			rinneGeometry.faces.push(new THREE.Face3(a,b,c));
			rinneGeometry.faces.push(new THREE.Face3(b,d,c));
		}
		
		rinneGeometry.computeFaceNormals();
		
		var rinneL = new THREE.Mesh(rinneGeometry, new THREE.MeshPhongMaterial({color: 0x999999})); 
		rinneL.translateX(-laneWidth/2-gutterWidth/2);
		rinneL.translateY(-laneLevel);
		rinneL.translateZ(-laneLength/2-apprLength);
		rinneL.receiveShadow = true;
		scene.add(rinneL);
		
		var rinneR = new THREE.Mesh(rinneGeometry, new THREE.MeshPhongMaterial({color: 0x999999})); 
		rinneR.translateX(laneWidth/2+gutterWidth/2);
		rinneR.translateY(-laneLevel);
		rinneR.translateZ(-laneLength/2-apprLength);
		rinneR.receiveShadow = true;
		scene.add(rinneR);
		
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

		var light = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(0,1,0);
		scene.add(light);
		
		// Ambient Directional light Test
		directionalLight = new THREE.DirectionalLight(0xffffff,1 );
		directionalLight.position.set(2,2,12.5);
		directionalLight.target.position.set(0,0,-18.29/2);
		directionalLight.shadowCameraNear = 2;
		directionalLight.shadowCameraFar = 24;
		directionalLight.shadowCameraLeft = -2.5;
		directionalLight.shadowCameraRight = 1.0;
		directionalLight.shadowCameraTop = 2;
		directionalLight.shadowCameraBottom = -2;
		directionalLight.shadowCameraVisible = false;
		directionalLight.castShadow = true;
		scene.add(directionalLight);
			
	thrown=false;
	camera1.position.set( 0, 1, 14 );
	drawBall([ballOffset,0.3,10.5]);
	
	}

	function onDocumentMouseMove( event ) {

		mouseX = ( event.clientX - windowHalfX );
		mouseY = ( event.clientY - windowHalfY );

	}
	
	this.drawLine = function(trajectory) {
		scene.remove(line);
		var material = new THREE.LineBasicMaterial({ color: 0x0000ff }); 
		var geometry = new THREE.Geometry(); 
		for (var i = 0; i < trajectory.length; i++)
		{
			geometry.vertices.push(trajectory[i]); 
		}
		var line = new THREE.Line( geometry, material ); 
		scene.add( line );
	}

	this.animate = function() {
		if(thrown)
		{
			integrate(physobjs,dt, oldaccs);
			moveCamera();
			
		}
		if(physobjs[0].refpos.x*physobjs[0].refpos.x>1.05/2.0*1.05/2.0 && thrown && physobjs[0].refpos.z >-18.3/2.0) 
			gutter();
		physobjs[0].receiveShadow = true;
		physobjs[0].castShadow = true;
		
		setText();
		comEnergy=physobjs[0].allEnergy();
		

		for (var it=0; it<physobjs.length; it++) {physobjs[it].updateObject3D();}

		render();

	};

	function render() {
		renderer.shadowMapEnabled = true;
		renderer.shadowMapBias = 0.0039;
		renderer.shadowMapDarkness = 0.5;
		renderer.shadowMapWidth = 1024;
		renderer.shadowMapHeight = 1024; 
		renderer.render( scene, camera1 );

	}
}
