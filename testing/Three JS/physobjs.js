"use strict";

function SvSteiner(intens0, mass, avec, dest) {
	var me = intens0.elements;
	dest.set(me[0] + mass*(avec.y*avec.y + avec.z*avec.z), me[3] - mass*avec.x*avec.y, me[6] - mass*avec.x*avec.z, me[1] - mass*avec.x*avec.y, me[4] + mass*(avec.x*avec.x + avec.z*avec.z), me[7] - mass*avec.y*avec.z, me[2] - mass*avec.x*avec.z, me[5] - mass*avec.y*avec.z, me[8] + mass*(avec.x*avec.x + avec.y*avec.y) );
	return dest;
}

/* 	------------		PhysObj		-----------------*/

function PhysObj(pos0, vel0, eulrot0, anglvel0, refposG0, composG, intensC, geometry, material) {


//	We have to look at three different coordinate systems, which should all have axis parallel to 
//	the principal axis of inertia: The given system of the geometry, which is used by THREE.Object3D,
//	The reference system with the origin in the center of rotation (for forced axis/center of rotation 
//	not equal to COM), and the center of mass system. Labels are G, R, C, respectively. 
//	The chosen reference system (by refposG) has to be the center of rotation.

//	velocity, anglvel and orquat describe the current rotation system (R) (given by refposG)

	THREE.Mesh.call(this, geometry, material);
	
	this.velocity = new THREE.Vector3();
	if (typeof vel0 != 'undefined') {this.velocity.copy(vel0)};
	
	this.anglvel = new THREE.Vector3();
	if (typeof anglvel0 != 'undefined') {this.anglvel.copy(anglvel0)};
	
//	this.orquat = new THREE.Quaternion(0., 0., 0., 1.);
//	this.orquat.setFromEuler(new THREE.Euler(eulrot0[0], eulrot0[1], eulrot0[2]);
	this.eulrot = new THREE.Euler();
	if (typeof eulrot0 != 'undefined') {this.eulrot.copy(eulrot0)};
	this.orquat = new THREE.Quaternion();
	this.orquat.setFromEuler(this.eulrot);
	
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
	var poshelp = new THREE.Vector3(this.composG.x, this.composG.y, this.composG.z);
	return new THREE.Vector3(this.position.x + poshelp.x , this.position.y + poshelp.y, this.position.z + poshelp.z);
});

PhysObj.method('comvel', function() {
	var velhelp = new THREE.Vector3(0.,0.,0.);
	velhelp.crossVectors(this.anglvel, this.composR);

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

PhysObj.method('updateObjPos', function(newPosR) {
	var poshelp = new THREE.Vector3(-this.refposG.x, -this.refposG.y, -this.refposG.z);
	poshelp.applyQuaternion(this.quaternion);
	this.position.x = newPosR.x + poshelp.x;	//position is from THREE.Object3D and is not necessarily
	this.position.y = newPosR.y + poshelp.y;  // either the reference nor center of mass position !!
	this.position.z = newPosR.z + poshelp.z;

	return this;
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
function BowlPin(pos0, vel0, eulrot0, anglvel0, refposG0, slices,color) {

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

	var material = new THREE.MeshPhongMaterial({color: color });

	/* Initialize extensions to THREE.Mesh */
	
	this.mass = 1.5875733;
	var composG = new THREE.Vector3(0., 0.147558, 0.);	// with respect to the origin of geometry (bottom center for pin, center for ball)
	var intensC = new THREE.Matrix3(0.0134109, 0, 0, 0, 0.0019401, 0, 0, 0, 0.0134109);

	PhysObj.call(this, pos0, vel0, eulrot0, anglvel0, refposG0, composG, intensC, geometry, material);
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
		pins.push(new BowlPin([0,0,0], [0,0,0], [0,0,0], [0,0,0], 10,"blue"));
	}
	return pins;
}

function putPins(pins,posarr)
{
	for (var i = 0; i < 10; i++) 
	{
		scene.remove(pins[i])
		pins[i].position.set(posarr[i]);
		pins[i].receiveShadow = true;
		pins[i].castShadow = true;
		scene.add(pins[i]);
	}

	return pins;
}


/* ------- 			BowlBall 			---------- */
function BowlBall(pos0, vel0, eulrot0, anglvel0, refposG0) {

	/* Preparation for THREE.Mesh */

	this.radius = 0.1085;

	/* Initialize THREE.MESH */

	var geometry = new THREE.SphereGeometry(this.radius, 5, 5)	
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

	var material = new THREE.MeshNormalMaterial();

	/* Initialize extensions to THREE.Mesh */

	this.mass = 7.0;
	var composG = new THREE.Vector3(0., 0., 0.001);
	var intensC = new THREE.Matrix3(0.031, 0, 0, 0, 0.033, 0, 0, 0, 0.035);
	
	PhysObj.call(this, pos0, vel0, eulrot0, anglvel0, refposG0, composG, intensC, geometry, material);

}

BowlBall.inherits(PhysObj, BowlBall);
//BowlBall.inherits(THREE.Mesh);
