"use strict";

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
/* 												*/

/*  	Allows .x/.y/.z access to velocity coordinates, such that 
	usage is equivalent to that of the position coordinates of THREE.Mesh */
/*function velobj(vel0) {
	this[0] = vel0[0];
	this[1] = vel0[1];
	this[2] = vel0[2];
	this.x = vel0[0];
	this.y = vel0[1];
	this.z = vel0[2];	
}
velobj.inherits(Array);
*/

/* Constructor for the BowlPin type, which is inherited from THREE.Mesh */

function BowlPin(pos0, vel0, angl0, anglvel0, slices,color) {

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

	this.geometry = new THREE.Geometry();
	var count = 0;
	for (var i = 0; i < this.vertices.length; i = i + 3) {
		this.geometry.vertices.push(new THREE.Vector3(this.vertices[i],this.vertices[i+1],this.vertices[i+2]));
		count++;
	}

	for (var i = 0; i < count-3; i = i +2) 
	{
		var a = i;
		var b = i+1;
		var c = i+2;
		var d = i+3;
		this.geometry.faces.push(new THREE.Face3(a,b,c));
		this.geometry.faces.push(new THREE.Face3(b,d,c));
	}
	this.geometry.computeFaceNormals();


	this.material = new THREE.MeshPhongMaterial({color: color });
	THREE.Mesh.call(this,this.geometry,this.material);

	/* Initialize extensions to THREE.Mesh */

	this.objtype = "pin";

	this.composoff = new THREE.Vector3(0., 0.147558, 0.0);
	
	this.position.x = pos0[0];
	this.position.y = pos0[1];
	this.position.z = pos0[2];
	//console.log(this.position.x,this.position.y,this.position.z)
	this.velocity = new THREE.Vector3(vel0[0],vel0[1],vel0[2]);

	this.angl = new THREE.Vector3(angl0[0],angl0[1],angl0[2]);
	this.anglvel = new THREE.Vector3(anglvel0[0],anglvel0[1],anglvel0[2]);

	this.mass = 1.5875733;
	this.intens0 = new THREE.Matrix3(0.0134109, 0, 0, 0, 0.0019401, 0, 0, 0, 0.0134109);

	//this.ormat = new THREE.Matrix3(1., 0., 0., 0., 1., 0., 0., 0., 1.);
	//this.orquat = new THREE.Quaternion(0., 0., 0., 1.);
	this.quaternion.set(0., 0., 0., 1.);
	//this.setRotationFromQuaternion(this.orquat);
}

BowlPin.inherits(THREE.Mesh);

BowlPin.method('anglvquat', function() {
	return new THREE.Quaternion(this.anglvel.x, this.anglvel.y, this.anglvel.z, 0.);
});

BowlPin.method('compos', function() {
	return new THREE.Vector3(this.position.x + this.composoff.x, this.position.y + this.composoff.y, this.position.z + this.composoff.z);
});

BowlPin.method('comvel', function() {
	var velhelp = new THREE.Vector3(0.,0.,0.);
	velhelp.crossVectors(this.anglvel, this.composoff);
	
	return new THREE.Vector3(this.velocity.x + velhelp.x, this.velocity.y + velhelp.y, this.velocity.z + velhelp.z);
});

BowlPin.method('genVertices', function () {
	for (var i = 0; i < this.shapeline.length-1; i++)
	{
		var a = this.shapeline[i];
		var b = this.shapeline[i+1];
		this.vertices = this.vertices.concat(generatePinSegment(a, b, this.slices));
	}
	return this;
});

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


/*
var pins = createPins();

for (var i = 0; i < 10; i++) 
{
	console.log(pins[i].id);
	console.log(pins[i].mass);
	console.log(pins[i].position.x);
	console.log(pins[i].velocity.x);
}

/*pins[0].translateX(0);
pins[0].translateZ(-18.29/2);
pins[0].receiveShadow = true;
pins[0].castShadow = true;
 */