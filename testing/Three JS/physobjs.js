"use strict";

function SvSteiner(intens0, mass, avec, dest) {
	var me = intens0.elements;
	dest.set(me[0] + mass*(avec.y*avec.y + avec.z*avec.z), me[3] - mass*avec.x*avec.y, me[6] - mass*avec.x*avec.z, me[1] - mass*avec.x*avec.y, me[4] + mass*(avec.x*avec.x + avec.z*avec.z), me[7] - mass*avec.y*avec.z, me[2] - mass*avec.x*avec.z, me[5] - mass*avec.y*avec.z, me[8] + mass*(avec.x*avec.x + avec.y*avec.y) );
	return dest;
}

/* 	------------		PhysObj		-----------------*/

function PhysObj(pos0, vel0, eulrot0, anglvel0, refposG0, fixdirs0, composG, intensC, geometry, material) {


//	We have to look at three different coordinate systems, which should all have axis parallel to 
//	the principal axis of inertia: The given system of the geometry, which is used by THREE.Object3D,
//	The reference system with the origin in the center of rotation (for forced axis/center of rotation 
//	not equal to COM), and the center of mass system. Labels are G, R, C, respectively. 
//	The chosen reference system (by refposG) has to be the center of rotation.

//	velocity, anglvel and orquat describe the current rotation system (R) (given by refposG)

	//	refpos		- 	position coordinates of reference point
	// 	velocity 	-	velocity coordinates of reference point
	//  eulrot0		- 	Initial orientation given by euler angles (very optional)
	//	orquat		-	Orientation quaternion of reference system
	//  anglvel		-	Angular velocity of reference system
	//	refposG		-	Position of reference point in coordinate system of geometry (e.g. bottom for pin)
	//  composG		-	Center Of Mass position in coordinate system of geometry
	//  intensC		-	Inertia Tensor in Center of Mass system

	THREE.Mesh.call(this, geometry, material);

	this.velocity = new THREE.Vector3();
	if (typeof vel0 != 'undefined') {this.velocity.copy(vel0)};

//	this.orquat = new THREE.Quaternion(0., 0., 0., 1.);
//	this.orquat.setFromEuler(new THREE.Euler(eulrot0[0], eulrot0[1], eulrot0[2]);
	this.eulrot0 = new THREE.Euler();
	if (typeof eulrot0 != 'undefined') {this.eulrot0.copy(eulrot0)};
	this.orquat = new THREE.Quaternion();
	this.orquat.setFromEuler(this.eulrot0);

	this.anglvel = new THREE.Vector3();
	if (typeof anglvel0 != 'undefined') {
		this.anglvel.copy(anglvel0);
	};

	this.refposG = new THREE.Vector3();
	if (typeof refposG0 != 'undefined') {this.refposG.copy(refposG0)};

	this.refpos = new THREE.Vector3();
	if (typeof pos0 != 'undefined') { this.refpos.copy(pos0)};

	this.updateObject3D();

	this.composG = new THREE.Vector3();
	if (typeof composG != 'undefined') {this.composG.copy(composG)};

	this.composR = new THREE.Vector3(this.composG.x - this.refposG.x, this.composG.y - this.refposG.y, this.composG.z - this.refposG.z);
	this.refposC = new THREE.Vector3(-this.composR.x,-this.composR.y,-this.composR.z);

	this.intensC = new THREE.Matrix3();
	if (typeof intensC != 'undefined') {this.intensC.copy(intensC)};

	this.intensR = new THREE.Matrix3(0.,0.,0.,0.,0.,0.,0.,0.,0.);
	SvSteiner(this.intensC, this.mass, this.refposC, this.intensR);
	
	this.fixdirs = [false, false, false];
	if (typeof fixdirs0 != 'undefined') {this.fixdirs = [fixdirs0[0], fixdirs0[1], fixdirs0[2]]};
	this.fixforce = new THREE.Vector3(0., 0., 0.);
	
//	this.quaternion.copy(this.orquat);

//	this.setRotationFromQuaternion(this.orquat);
}

PhysObj.inherits(THREE.Mesh, PhysObj);

PhysObj.method('anglvquat', function() {
	return new THREE.Quaternion(this.anglvel.x, this.anglvel.y, this.anglvel.z, 0.);
});

/*PhysObj.method('refpos', function() {
	var poshelp = new THREE.Vector3(this.refposG.x, this.refposG.y, this.refposG.z);
	poshelp.applyQuaternion(this.quaternion);
	return new THREE.Vector3(this.position.x + poshelp.x , this.position.y + poshelp.y, this.position.z + poshelp.z);
});*/

PhysObj.method('compos', function() {
	var poshelp = new THREE.Vector3(this.composR.x, this.composR.y, this.composR.z);
	poshelp.applyQuaternion(this.orquat);
	return new THREE.Vector3(this.refpos.x + poshelp.x , this.refpos.y + poshelp.y, this.refpos.z + poshelp.z);
});

PhysObj.method('comvel', function() {
	var velhelp = new THREE.Vector3(0.,0.,0.);
	var comphelp = new THREE.Vector3(this.composR.x,this.composR.y,this.composR.z);
	comphelp.applyQuaternion(this.orquat);
	velhelp.crossVectors(this.anglvel, comphelp);

	return new THREE.Vector3(this.velocity.x + velhelp.x, this.velocity.y + velhelp.y, this.velocity.z + velhelp.z);
});

PhysObj.method('updateObject3D', function() {
	var poshelp = new THREE.Vector3(-this.refposG.x, -this.refposG.y, -this.refposG.z);
	poshelp.applyQuaternion(this.orquat);
	this.position.x = this.refpos.x +  poshelp.x;	//position is from THREE.Object3D and is not necessarily
	this.position.y = this.refpos.y +  poshelp.y;  // either the reference nor center of mass position !!
	this.position.z = this.refpos.z +  poshelp.z;

	this.quaternion.copy(this.orquat);
});


PhysObj.method('newRefPos', function(newrefposG) {
	var rpdiff = new THREE.Vector3(newrefposG.x - this.refposG.x, newrefposG.y - this.refposG.y, newrefposG.z - this.refposG.z);
	var veldiff = new THREE.Vector3();
	var newpos = new THREE.Vector3();
	var newvel = new THREE.Vector3();
	var neweulrot = new THREE.Euler();
	
	neweulrot.setFromQuaternion(this.orquat, 'XYZ')
	
	rpdiff.applyQuaternion(this.orquat);
	veldiff.crossVectors(this.anglvel, rpdiff);
	
	newpos.addVectors(this.refpos, rpdiff);
	newvel.addVectors(this.velocity, veldiff);
	
	PhysObj.call(this, newpos, newvel, neweulrot, this.anglvel, newrefposG, this.fixdirs, this.composG, this.intensC, this.geometry, this.material);
	
	return this;
});

PhysObj.method('changeTexture', function(count) {
	var material1 =[new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("textures/smiley.png") }),
					new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("textures/smiley.jpg") }),
					new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("textures/smiley2.jpg") })];
	count=Math.abs(count)%material1.length;
	PhysObj.call(this, this.refpos, this.velocity, this.eulrot0, this.anglvel, this.refposG, this.fixdirs, this.composG, this.intensC, this.geometry, material1[count]);
	
	return this;
});

PhysObj.method('getAnglMom', function() {
	var intensarr = this.getRotIntensArr();
	return new THREE.Vector3(intensarr[0]*this.anglvel.x , intensarr[4]*this.anglvel.y , intensarr[8]*this.anglvel.z);
});

PhysObj.method('getRotIntensArr', function() {
	var me = this.intensR.toArray();
	var rotintens1 = new THREE.Matrix4(me[0], me[3], me[6], 0., me[1], me[4], me[7], 0., me[2], me[5], me[8], 0., 0., 0., 0., 1.);
	if (debug==1) {
		console.log('rotintens1',me[0], me[3], me[6], 0., me[1], me[4], me[7], 0., me[2], me[5], me[8], 0., 0., 0., 0., 1.);
	}
	var rotintens2 = new THREE.Matrix4();
	var rotmat = new THREE.Matrix4();
	var rotmati = new THREE.Matrix4();

	rotmat.makeRotationFromQuaternion(this.orquat);
	rotmati.getInverse(rotmat);
	rotintens1.multiply(rotmat);
	rotintens2.multiplyMatrices(rotmati, rotintens1);

	me = rotintens2.toArray();

	return [me[0], me[1], me[2], me[4], me[5], me[6], me[8], me[9], me[10]]; 
});

PhysObj.method('getRotCPos', function() {
	var rotcpos = new THREE.Vector3(this.composR.x, this.composR.y, this.composR.z);
	rotcpos.applyQuaternion(this.orquat);

	return rotcpos;

});

PhysObj.method('makefixed', function() {
	var veldiff = new THREE.Vector3();
	
	if (this.fixdirs[0]) {
		veldiff.x = -this.velocity.x;
		this.velocity.x = 0.0;
		//this.fixforce.x = this.mass * (-acc.x + veldiff.x / dt);
		this.fixforce.x = 2. * this.mass * veldiff.x / dt;
	}
	if (this.fixdirs[1]) {
		veldiff.y = -this.velocity.y;
		this.velocity.y = 0.0;
		//this.fixforce.y = this.mass * (-acc.y + veldiff.y / dt);
		this.fixforce.y = 2. * this.mass * veldiff.y / dt;
	}
	if (this.fixdirs[2]) {
		veldiff.z = -this.velocity.z;
		this.velocity.z = 0.0;
		//this.fixforce.z = this.mass * (-acc.z + veldiff.z / dt);
		this.fixforce.z = 2. * this.mass * veldiff.z / dt;
	}
	
	if (debug==1) {
		console.log('fixforce',this.fixforce.x,this.fixforce.y,this.fixforce.z);
	}
	
	return this;
});

PhysObj.method('allEnergy', function() {
			   var Energ=[0,0];
			   var transEn;
			   var rotEn;
			   var invQuat = new THREE.Quaternion();
			   var angularV= new THREE.Vector3();
			   
			   angularV.copy(this.anglvel);
			   invQuat.copy(this.orquat);
			   invQuat.inverse();
			   angularV.applyQuaternion(invQuat);
			   transEn=0.5*this.mass*(this.velocity.x*this.velocity.x+this.velocity.y*this.velocity.y+this.velocity.z*this.velocity.z);
			   rotEn=0.5*(angularV.x*this.intensR.elements[0]*angularV.x+angularV.y*this.intensR.elements[4]*angularV.y+angularV.z*this.intensR.elements[8]*angularV.z);
			   
			   Energ[0]=rotEn;
			   Energ[1]=transEn;
			   
			   return Energ;
});


/*PhysObj.method('updateRefPosG', function(newRefPosG) {
	var poshelp = new THREE.Vector3(-this.refposG.x, -this.refposG.y, -this.refposG.z);
	poshelp.applyQuaternion(this.quaternion);
	this.position.x = newPosR.x + poshelp.x;	//position is from THREE.Object3D and is not necessarily
	this.position.y = newPosR.y + poshelp.y;  // either the reference nor center of mass position !!
	this.position.z = newPosR.z + poshelp.z;

	return this;
});*/

/*
PhysObj.method('newRefSys', function(newRefPos) {
	return this;
});*/


/* ------- 				BowlPin 			---------- */
function BowlPin(pos0, vel0, eulrot0, anglvel0, refposG0, fixdirs0, slices,color) {
	
	/* Preparation for THREE.Mesh */

	this.slices = slices;
	this.shapeline = [[0.0257937, 0., 0],
	                  [0.0359156, 0.01905, 0],
	                  [0.0496062, 0.05715, 0],
	                  [0.057277, 0.085725, 0],
	                  [0.0605282, 0.1143, 0],
	                  [0.0579501, 0.149225, 0],
	                  [0.0470281, 0.18415, 0],
	                  [0.0313944, 0.219075, 0],
	                  [0.0249555, 0.238125, 0],
	                  [0.0228219, 0.254, 0],
	                  [0.023749, 0.276225, 0],
	                  [0.0265938, 0.29845, 0],
	                  [0.0305562, 0.320675, 0],
	                  [0.0323469, 0.3429, 0],
	                  [0.0323342, 0.348666, 0],
	                  [0.0298704, 0.361036, 0],
	                  [0.02286, 0.371526, 0],
	                  [0.0123698, 0.378536, 0],
	                  [0.00127, 0.380975, 0]];

	this.vertices = [];
	this.genVertices();

	/* Initialize THREE.MESH */

	var geometry = new THREE.Geometry();
	var count = 0;
	for (var i = 0; i < this.vertices.length; i = i + 3) {
		geometry.vertices.push(new THREE.Vector3(this.vertices[i],this.vertices[i+1],this.vertices[i+2]));
		count++;
	}

	for (var i = 0; i < count-3; i = i +2) 
	{
		var a = i;
		var b = i+1;
		var c = i+2;
		var d = i+3;
		geometry.faces.push(new THREE.Face3(a,b,c));
		geometry.faces.push(new THREE.Face3(b,d,c));
	}
	geometry.computeFaceNormals();

	var material = new THREE.MeshPhongMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});

	generatePinColor(geometry, slices, 7);

	/* Initialize extensions to THREE.Mesh */

	this.mass = 1.5875733;
	var composG = new THREE.Vector3(0., 0.14755784154951435, 0.);	// with respect to the origin of geometry (bottom center for pin, center for ball)
	this.radius = 0.14755784154951435;
	//var intensC = new THREE.Matrix3(0.0134109, 0, 0, 0, 0.0019401, 0, 0, 0, 0.0134109);
	var intensC = new THREE.Matrix3(0.0134109103558499, 0, 0, 0, 0.0019401759369374264, 0, 0, 0, 0.0134109103558499);

	PhysObj.call(this, pos0, vel0, eulrot0, anglvel0, refposG0, fixdirs0, composG, intensC, geometry, material);
}

BowlPin.inherits(PhysObj, BowlPin);
//BowlPin.inherits(THREE.Mesh);

BowlPin.method('genVertices', function () {
	for (var i = 0; i < this.shapeline.length-1; i++)
	{
		var a = this.shapeline[i];
		var b = this.shapeline[i+1];
		this.vertices = this.vertices.concat(generatePinSegment(a, b, this.slices));
	}
	return this;
});

/* Helper for calculating vertex coordinates */
function generatePinSegment(a, b, slices){

	var pinVertices = new Array();

	var dphi = 2*Math.PI/slices;
	var circa = [0,a[1],0]; // point on circ from a
	var circb = [0,b[1],0];

	var r1 =  Math.sqrt(a[0]*a[0]+a[2]*a[2]); 
	var r2 =  Math.sqrt(b[0]*b[0]+b[2]*b[2]);

	for (var phi,i=0; i <= slices;i++){
		phi = i * dphi;
		circa[0] = r1 * Math.cos(phi);
		circa[2] = r1 * Math.sin(phi);
		circb[0] = r2 * Math.cos(phi);
		circb[2] = r2 * Math.sin(phi);

		pinVertices = pinVertices.concat(circa);
		pinVertices = pinVertices.concat(circb);
	}

	return pinVertices;
}					

function createPins()
{
	var pins = [];
	for (var i = 0; i < 10; i++) 
	{
		pins.push(new BowlPin(new THREE.Vector3(0., 0.147558, 0.), new THREE.Vector3(0,0,0), new THREE.Euler(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0., 0.147558, 0.), [false, false, false], 10,"blue"));
	}
	return pins;
}
function generatePinColor(pin_geometry, slices, ring)
{
	for ( var i = 0; i < pin_geometry.faces.length; i++) {
		var face = pin_geometry.faces[i];
		var lowerbot = 2*slices + (ring-1) * (2*slices + 2);
		var upperbot = 2*slices + ring * (2*slices + 2)-1;
		var lowertop = 2*slices + (ring+1) * (2*slices + 2);
		var uppertop = 2*slices + (ring+2) * (2*slices + 2)-1;
		if ((i >=lowerbot && i <=upperbot)||(i >=lowertop && i <=uppertop))
			face.color.setRGB(1,0,0); 
		else
			face.color.setRGB(0.8,0.8,0.8);
	}
}


function putPins(pins,posarr)
{
	if (pins.length != 10) {
		alert('putPins:  Array of pins has invalid length!');
	} else {
		for (var i = 0; i < 10; i++) 
		{
			scene.remove(pins[i])
			pins[i].refpos.copy(posarr[i]);
			pins[i].receiveShadow = true;
			pins[i].castShadow = true;
			scene.add(pins[i]);
		}
		return pins;
	}
}


/* ------- 			BowlBall 			---------- */
function BowlBall(pos0, vel0, eulrot0, anglvel0, refposG0, fixdirs0) {

	/* Preparation for THREE.Mesh */

	this.radius = 0.1085;

	/* Initialize THREE.MESH */

	var geometry = new THREE.SphereGeometry(this.radius, 20, 20)	
	/* Was ist mit Faces und Normalen bei der Kugel?
	for (var i = 0; i < count-3; i = i +2) 
	{
		var a = i;
		var b = i+1;
		var c = i+2;
		var d = i+3;
		geometry.faces.push(new THREE.Face3(a,b,c));
		geometry.faces.push(new THREE.Face3(b,d,c));
	}
	geometry.computeFaceNormals();
	 */

	var material = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("textures/smiley.jpg") });


	/* Initialize extensions to THREE.Mesh */

	this.mass = 7.0;
	var composG = new THREE.Vector3(-0.001, 0., 0.0);
	var intensC = new THREE.Matrix3(0.031, 0., 0., 0., 0.033, 0., 0., 0., 0.033);

	PhysObj.call(this, pos0, vel0, eulrot0, anglvel0, refposG0, fixdirs0, composG, intensC, geometry, material);

}

BowlBall.inherits(PhysObj, BowlBall);
//BowlBall.inherits(THREE.Mesh);
