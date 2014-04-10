function setText() {		
	varsPanel.innerHTML = "Offset: "+Math.round(physobjs[0].refpos.x*100)/100
						  +"<br/>Angle: "+Math.round(angle*100)/100;
}

function setMenu(x,y,z) {
	menu.innerHTML = "x="+Math.round(100*x)/100+
					 ", y="+Math.round(100*y)/100+
					 ", z="+Math.round(100*z)/100;
}

function mouseUp(event) 
{
	isMouseDown = false;
	lastX = physobjs[0].refpos.x;
	
}	

function mouseDown(event) 
{
	isMouseDown = true;
	var x = (event.clientX /  window.innerWidth)*2-1,
		y = -(event.clientY /  window.innerHeight)*2+1,
		z = 0.5;
		
	var vector = new THREE.Vector3(x,y,z);
	lastX = event.clientX;
	projector.unprojectVector( vector, camera1);
	
	//console.log("Klick: "+event.clientX+","+event.clientY+", CANVAS: "+x+","+y);
	
	var ray = new THREE.Raycaster(camera1.position, vector.sub( camera1.position ).normalize());
	var	collision = ray.intersectObjects([physobjs[0]]);
	if (collision.length > 0){
		isBallSelected = true;
		} else 
			isBallSelected = false;
}

var arrowAngle;

function mouseMove(event) 
{	
	if(thrown)return;
	
	if (event.shiftKey && !isMouseDown)		// Arrow for angle
	{
		scene.remove( arrowAngle);
		var x = (event.clientX /  window.innerWidth)*2-1,
		y = -(event.clientY /  window.innerHeight)*2+1;
		
		var vector = new THREE.Vector3(x,y,0.5);
	 
		vector.sub( camera1.position );
		
		var dirVec = new THREE.Vector3(vector.getComponent(0),0,-0.5); 	
		// x-component of vector betw. -0.5, 0.5; y = 0 b/c arrow in x-z plane, z is -0.5 b/c of direction and x range => max angle 
		// mouse range is whole canvas for more precise angle settings
		dirVec.normalize();
		
		arrowAngle = new THREE.ArrowHelper( dirVec, physobjs[0].refpos, 2, 0x00cc00 ,0.5,0.1); 
		scene.add( arrowAngle );
		angle = 90-dirVec.angleTo(new THREE.Vector3(1,0,0))/Math.PI*180;
		
		setText();
	}

	if (!isMouseDown || !isBallSelected) return;

	var d = Math.min(window.innerWidth,window.innerHeight);
	var dX =  2.0*3.3*(event.clientX-lastX)/window.innerWidth;		// 3.3 Skalierungsfaktor
	lastX = event.clientX;
	if (Math.abs(physobjs[0].refpos.x) < laneWidth/2 + gutterWidth)
		physobjs[0].refpos.x+= dX;
	else 
		if (physobjs[0].refpos.x < 0) {
			if (dX > 0)
				physobjs[0].refpos.x+= dX;
		} else if (physobjs[0].refpos.x > 0) {
			if (dX < 0)
				physobjs[0].refpos.x+= dX;
		}
	setText();
   }	

function keyDown(event) {
	switch(event.keyCode) {
		case 65: //Key A
			
			//putPins(slices);
			break;
		case 68: //Key D
			thrown=false;
			camera1.position.set( 0, 1, 14 );
			drawBall([ballOffset,0.3,10]);
			break;
		case 87: //Key W
			
			scene.remove( arrowAngle );
			//getValue('slider');
			V0=velocity;
			physobjs[0].velocity.x=V0*Math.sin(Math.PI/180.0*angle);
			physobjs[0].velocity.y=0;
			physobjs[0].velocity.z=-V0*Math.cos(Math.PI/180.0*angle);
			if(angularVelocity[0]!=0)physobjs[0].anglvel.x=-angularVelocity[0]*30;
			else physobjs[0].anglvel.x=0;
			if(angularVelocity[1]!=0)physobjs[0].anglvel.y=-angularVelocity[1]*30;
			else physobjs[0].anglvel.y=0;
			if(angularVelocity[2]!=0)physobjs[0].anglvel.z=-angularVelocity[2]*30;
			else physobjs[0].anglvel.z=0;
			physobjs[0].updateObject3D();
			thrown=true;
			break;
		case 83: //Key S
			break;
		case 79: //Key O
			if (pressedO == false)
				pressedO = true;
				
			else 
				pressedO = false;
			break;
		case 80: //Key P
			if (pressedP == false)
				pressedP = true;
			else 
				pressedP = false;
			break;
		case 37: // Pfeil links  
			break;
		case 39: // Pfeil rechts 
			break;
		default:
			break;
	}
}