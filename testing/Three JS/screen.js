function viewScreen( containerId ) {

	var container;

	var camera, renderer;
	
	var lineMaterial, lineGeometry, line;	

	init();

	function init() {
		scene = new THREE.Scene();
		projector = new THREE.Projector();
		container = document.getElementById( containerId );
		
		var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
		var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;

		container.onmousedown = mouseDown;
		container.onmousemove = mouseMove;
		container.onmouseup = mouseUp;
		document.addEventListener("keydown", keyDown, false);

		camera1 = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		camera1.position.set( 0, 1, 14 );
		camera1.lookAt( scene.position );

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor( 0xffffff );
		renderer.setSize( container.clientWidth, container.clientHeight );
		
		container.appendChild( renderer.domElement );
		
		// Display of the offset, angle and energies
		varsPanel = document.createElement('div');
		varsPanel.style.position = 'absolute';
		varsPanel.style.width = 250+'px';
		varsPanel.style.backgroundColor = "rgba( 1, 0, 0, 0.25 )";
		setText();
		varsPanel.style.top = 5 + 'px';
		varsPanel.style.left = 5 + 'px';
		document.body.appendChild(varsPanel);
		
		// BUILDING THE SCENE
		// Variables
		var laneTexture, laneMaterial, lane,
			apprGeometry, apprTexture, apprMaterial,
			apprLine,
			grass, plattformMaterial, plattform;
			
		var gutterGeometry, gutterVertices, gutterL, gutterR, 
			skyGeometry, skyMaterialArray = [], skyMaterial, skybox,
			light, directionalLight;
		
		var boxTexture, boxTextureVert, pandaTexture, 
			boxMaterial, boxUpMaterial, 
			boxBack, boxLR, boxL, boxR, boxUp;
			
		
		
		// Lane geometry, texture and mesh
		laneTexture = new THREE.ImageUtils.loadTexture("textures/wood.jpg");
		laneTexture.wrapS = laneTexture.wrapT = THREE.RepeatWrapping;
		laneTexture.repeat.set( 3,25 );
		laneMaterial = new THREE.MeshPhongMaterial( {  map:laneTexture, side:THREE.DoubleSide } ); 
		lane = new THREE.Mesh( new THREE.CubeGeometry(laneWidth,laneLevel,laneLength+apprLength), laneMaterial ); 
		lane.translateY(-laneLevel/2);
		lane.translateZ(-1);
		lane.receiveShadow = true;
		scene.add( lane );  
		
		// Approach
		apprGeometry = new THREE.CubeGeometry(laneWidth+2*gutterWidth,laneLevel,apprLength); 
		apprTexture = new THREE.ImageUtils.loadTexture("textures/wood.jpg");
		apprTexture.wrapS = apprTexture.wrapT = THREE.RepeatWrapping;
		apprTexture.repeat.set( 5,3 );
		apprMaterial = new THREE.MeshPhongMaterial( {  map:apprTexture, side:THREE.DoubleSide } ); 
		approach = new THREE.Mesh( apprGeometry, apprMaterial ); 
		approach.translateZ((laneLength+apprLength)/2+apprLineLength);
		approach.translateY(-laneLevel/2);
		approach.receiveShadow = true;
		scene.add( approach ); 
		
		// Small grey line to mark the beginning of the lane
		apprLine = new THREE.Mesh(
			new THREE.CubeGeometry(laneWidth+2*gutterWidth,laneLevel,apprLineLength),
			new THREE.MeshPhongMaterial( { color: 0x999999 } )
			);
		apprLine.translateY(-laneLevel/2);
		apprLine.translateZ((laneLength + apprLineLength)/2);
		apprLine.receiveShadow = true;
		scene.add(apprLine);
		
		// Plattform
		grass = new THREE.ImageUtils.loadTexture("textures/grass.jpg");
		grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
		grass.repeat.set( 15,10 );
		plattformMaterial = new THREE.MeshPhongMaterial( { 
			map: grass,
			color: 0x339933 } ); 
		plattform = new THREE.Mesh( new THREE.CubeGeometry( 30,1,30), plattformMaterial ); 
		plattform.translateY(-0.5-laneLevel);
		plattform.receiveShadow=true;
		scene.add( plattform ); 
		
		// Build the box at the end of the line
		boxTexture = new THREE.ImageUtils.loadTexture("textures/box.jpg");
		boxTextureVert = new THREE.ImageUtils.loadTexture("textures/boxVert.jpg");
		pandaTexture = new THREE.ImageUtils.loadTexture("textures/panda.jpg");
		boxMaterial = new THREE.MeshPhongMaterial( {  map:boxTexture, side:THREE.DoubleSide } ); 
		boxUpMaterial = [
			
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
			new THREE.MeshPhongMaterial({  map:pandaTexture }),
			new THREE.MeshPhongMaterial({  map:boxTextureVert }),
		]
		
		boxBack = new THREE.Mesh(
			new THREE.CubeGeometry(laneWidth+2*gutterWidth+boxLRWidth*2,boxHeight,boxBackLength),
			new THREE.MeshPhongMaterial({  map:boxTextureVert })
		);
		boxBack.translateY(boxHeight/2-laneLevel);
		boxBack.translateZ(-laneLength/2-distFromPins-boxBackLength-0.5);
		boxBack.castShadow = true;
		boxBack.receiveShadow = true;
		scene.add(boxBack);
		boxLR = new THREE.CubeGeometry(boxLRWidth,boxHeight,boxLRLength);
		boxL = new THREE.Mesh(boxLR, boxMaterial);
		boxL.translateX(laneWidth/2+gutterWidth+boxLRWidth/2);
		boxL.translateY(boxHeight/2-laneLevel);
		boxL.translateZ(-laneLength/2-distFromPins);
		scene.add(boxL);
		boxR = new THREE.Mesh(boxLR, boxMaterial);
		boxR.translateX(-laneWidth/2-gutterWidth-boxLRWidth/2);
		boxR.translateY(boxHeight/2-laneLevel);
		boxR.translateZ(-laneLength/2-distFromPins);
		scene.add(boxR);
		boxUp = new THREE.Mesh(
			new THREE.CubeGeometry(laneWidth+2*gutterWidth,boxUpHeight,boxLRLength,1,1,1),
			new THREE.MeshFaceMaterial(boxUpMaterial)
		);
		boxUp.translateY(-laneLevel+boxHeight-boxUpHeight/2);
		boxUp.translateZ(-laneLength/2-distFromPins);
		scene.add(boxUp);
		
		// Gutters

		gutterGeometry = new THREE.Geometry();
		gutterVertices = new Array();
		var radius = 0.25;
		var offsetY = 0.1-Math.sin(360*50/80*Math.PI/180)*radius;
		
		gutterVertices = gutterVertices.concat(
			[-gutterWidth/2,0,0],[-gutterWidth/2,0,laneLength+apprLength],
			[-gutterWidth/2,laneLevel,0],[-gutterWidth/2,laneLevel,laneLength+apprLength]
		);
		
		for (var i = 50; i < 71; i++)
		{
			var newVertex = [];
			newVertex[0] = -Math.cos(360*i/80*Math.PI/180)/Math.cos(360*50/80*Math.PI/180)*0.11; 	 
			newVertex[1] = Math.sin(360*i/80*Math.PI/180)*radius+offsetY;
			newVertex[2] = 0;
			gutterVertices = gutterVertices.concat(newVertex);
			newVertex[2] = laneLength+apprLength;
			gutterVertices = gutterVertices.concat(newVertex);
		}
		gutterVertices = gutterVertices.concat(
			[gutterWidth/2,laneLevel,0],[gutterWidth/2,laneLevel,laneLength+apprLength],
			[gutterWidth/2,0,0],[gutterWidth/2,0,laneLength+apprLength]
			[-gutterWidth/2,0,0],[-gutterWidth/2,0,laneLength+apprLength]
		);
		
		var countr = 0;
		for (var i = 0; i < gutterVertices.length; i = i + 3) {
				gutterGeometry.vertices.push(new THREE.Vector3(gutterVertices[i],gutterVertices[i+1],gutterVertices[i+2]));
				countr++;
		}
		
		for (var i = 0; i < countr-3; i = i +2) 
		{
			var a = i;
			var b = i+1;
			var c = i+2;
			var d = i+3;
			gutterGeometry.faces.push(new THREE.Face3(a,b,c));
			gutterGeometry.faces.push(new THREE.Face3(b,d,c));
		}
		
		gutterGeometry.computeFaceNormals();
		
		gutterL = new THREE.Mesh(gutterGeometry, new THREE.MeshPhongMaterial({color: 0x999999})); 
		gutterL.translateX(-laneWidth/2-gutterWidth/2);
		gutterL.translateY(-laneLevel);
		gutterL.translateZ(-laneLength/2-apprLength);
		gutterL.receiveShadow = true;
		scene.add(gutterL);
		
		gutterR = new THREE.Mesh(gutterGeometry, new THREE.MeshPhongMaterial({color: 0x999999})); 
		gutterR.translateX(laneWidth/2+gutterWidth/2);
		gutterR.translateY(-laneLevel);
		gutterR.translateZ(-laneLength/2-apprLength);
		gutterR.receiveShadow = true;
		scene.add(gutterR);
		
		// SKYBOX
		skyGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );    
		var images = ["skybox/right.jpg", "skybox/left.jpg", 
			"skybox/up.jpg", "skybox/down.jpg", 
			"skybox/front.jpg", "skybox/back.jpg"];
		for (var i = 0; i < 6; i++)
			skyMaterialArray.push( new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture( images[i] ),
				side: THREE.BackSide
			}));
		skyMaterial = new THREE.MeshFaceMaterial( skyMaterialArray );
		skybox = new THREE.Mesh(skyGeometry, skyMaterial);
		skybox.rotation.y -=2.35;
		scene.add(skybox);

		light = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(0,1,0);
		scene.add(light);
		
		// direction
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
		
		// Line
		
		
 
			
		thrown = false;
		camera1.position.set( 0, 1, 14 );
		drawBall([ballOffset,0.3,10.5]);
	}
	
	this.removeLine = function() 
	{
		scene.remove(line);
		lineGeometry = new THREE.Geometry();
	}
	
	this.drawLine = function(trajectory) {
		lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff }); 
		lineGeometry = new THREE.Geometry(); 
		line = new THREE.Line( lineGeometry, lineMaterial );
		
		for (var i = 0; i < trajectory.length; i++)
		{
			lineGeometry.vertices.push(trajectory[i]); 
		}
		scene.add( line );
	}

	this.animate = function() {
		if(thrown)
		{
			integrate(physobjs,dt, oldaccs);
			moveCamera();
		}
		if (physobjs[0].refpos.x*physobjs[0].refpos.x>1.05/2.0*1.05/2.0 && thrown && physobjs[0].refpos.z >-18.3/2.0) 
			gutter();
		physobjs[0].receiveShadow = true;
		physobjs[0].castShadow = true;
		
		setText();
		comEnergy=physobjs[0].allEnergy();
		
		for (var it=0; it<physobjs.length; it++) 
			physobjs[it].updateObject3D();

		render();
	}

	function render() {
		renderer.shadowMapEnabled = true;
		renderer.shadowMapBias = 0.0039;
		renderer.shadowMapDarkness = 0.5;
		renderer.shadowMapWidth = 1024;
		renderer.shadowMapHeight = 1024; 
		renderer.render( scene, camera1 );
	}
}
