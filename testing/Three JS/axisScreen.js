function axisScreen( containerId) {

	var container;

	var camera, scene, renderer;

	var mouseX = 0, mouseY = 0, canvX = 0, canvY = 0, isMouseDown = false;
	
	var spinMenuTop = 5,
		spinMenuRight = 5;
	
	init();

	function init() {

		container = document.getElementById( containerId );
		container.style.top = spinMenuTop + 'px';
		container.style.right = spinMenuRight + 'px';
		camera = new THREE.PerspectiveCamera( 45, container.clientWidth / container.clientHeight, 0.1, 100 );
		camera.position.z = -5;
		camera.position.y = 1;

		scene = new THREE.Scene();
		
		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(1,10,10),
			new THREE.MeshPhongMaterial({color: 0xff00ff, transparent: true, opacity: 0.75}) 
		);
		scene.add(sphere);
		
		// ANZEIGE

		menu = document.createElement('div');
		menu.style.position = 'absolute';
		menu.style.width = 190+'px';
		menu.style.backgroundColor = "rgba( 1, 0, 0, 0.25 )";
		menu.innerHTML = "Rotation axis";
		menu.style.top = 5 + 'px';
		menu.style.right = 5 + 'px';
		container.appendChild(menu);

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 1,0 ).normalize();
		scene.add( light );
		
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor( 0xdedede );
		renderer.setSize( container.clientWidth, container.clientHeight );

		container.appendChild( renderer.domElement );

		container.addEventListener( 'mousemove', onMouseMove, false ); 
		container.addEventListener( 'mousedown', onMouseDown, false ); 
		container.addEventListener( 'mouseup', onMouseUp, false ); 
	}
	
	var arrowSpinXZ, arrowSpinXY, arrowFromForm; 
	var dirVecXZ, dirVecXY,
		dirVec = new THREE.Vector3(angularVelocity[0],angularVelocity[1],angularVelocity[2]);
	var selectedXZ = false,
		selectedXY = false,
		selectedForm = false;
		
	var winkelX = 0, winkelY = 0;
	
	function removeArrows()
	{
		scene.remove(arrowFromForm);
		scene.remove(arrowSpinXY);
		scene.remove(arrowSpinXZ);
	}
	
	this.updateAxisArrow = function(direction)
	{
		removeArrows()
		dirVec = direction.clone();
		arrowFromForm = new THREE.ArrowHelper(dirVec, new THREE.Vector3(0,0,0), 2,0x29A3cc, 3.5,0.5);
		scene.add(arrowFromForm);
		selectedForm = true;
	}
	
	function onMouseMove( event ) {
		if (isMouseDown)
		{
			var canvasSize = 200;
			
			mouseX = event.clientX-(window.innerWidth-spinMenuRight-canvasSize);
			mouseY = event.clientY-spinMenuTop;
			
			canvX = mouseX/canvasSize*2-1;
			canvY = 1-mouseY/canvasSize*2;
			
			
			if (pressedO) {
				if (!selectedXZ) 
				{
					dirVecXZ = new THREE.Vector(1,0,0);
					winkelX = 0;
				}
				removeArrows();
				if (dirVecXZ.getComponent(0) > 0)
					dirVecXY = new THREE.Vector3(-canvX, canvY,0);
				else
					dirVecXY = new THREE.Vector3(canvX, canvY,0);
				dirVecXY.applyAxisAngle(new THREE.Vector3(0,1,0), winkelX);
				dirVecXY.normalize();
				arrowSpinXY = new THREE.ArrowHelper(dirVecXY, new THREE.Vector3(0,0,0),2, 0x29A3CC,3.5,0.5);
				scene.add(arrowSpinXY);
				selectedXY = true;
				dirVec.set(dirVecXY.getComponent(0),dirVecXY.getComponent(1),dirVecXY.getComponent(2))
			} else {
				removeArrows();
				if (selectedXY){
					var X = -canvX;
					var Y = dirVecXY.getComponent(1);
					var Z;
					if (canvY < 0)
						Z = Math.sqrt(1-X*X-Y*Y);
					else
						Z = -Math.sqrt(1-X*X-Y*Y);
					dirVecXZ = new THREE.Vector3(X, Y, Z);
					}
				else 
					dirVecXZ = new THREE.Vector3(-canvX,0, canvY);
				dirVecXZ.normalize();
				arrowSpinXZ = new THREE.ArrowHelper(dirVecXZ, new THREE.Vector3(0,0,0),2, 0x29A3CC,3.5,0.5);
				
				scene.add(arrowSpinXZ);
				selectedXZ = true;
				dirVec.set(dirVecXZ.getComponent(0),dirVecXZ.getComponent(1),dirVecXZ.getComponent(2));
			}
		}
		if (selectedXY || selectedXZ || selectedForm)
			setMenu(dirVec.getComponent(0),dirVec.getComponent(1),dirVec.getComponent(2));
		angularVelocity[0]=dirVec.x;
		angularVelocity[1]=dirVec.y;
		angularVelocity[2]=dirVec.z;
		//console.log(dirVec.getComponent(0)+","+dirVec.getComponent(1)+","+dirVec.getComponent(2));
	}
	
	function onMouseDown(event) {
		isMouseDown = true;
		
	}
	
	function onMouseUp(event) {
		isMouseDown = false;
		
		if	( selectedXZ&&(dirVecXZ.getComponent(2) < 0))
			winkelX = dirVecXZ.angleTo(new THREE.Vector3(1,0,0));
		else if (selectedXZ)
			winkelX = 2*Math.PI - dirVecXZ.angleTo(new THREE.Vector3(1,0,0));
		if	(selectedXY && (dirVecXY.getComponent(2) > 0 ))
			winkelY = 2*Math.PI - dirVecXY.angleTo(new THREE.Vector3(0,1,0));
		else if (selectedXY)
			winkelY = dirVecXY.angleTo(new THREE.Vector3(0,1,0));
	}

	//

	this.animate = function() {
		//console.log(dirVec.getComponent(0)+","+dirVec.getComponent(0)+","+dirVec.getComponent(0));
		render();

	};

	function render() {


		camera.lookAt( scene.position );

		renderer.render( scene, camera );

	}
}
