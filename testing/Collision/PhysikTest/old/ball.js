"use strict";

/*  	Allows .x/.y/.z access to velocity coordinates, such that 
	usage is equivalent to that of the position coordinates of THREE.Mesh */


/* Constructor for the BowlPin type, which is inherited from THREE.Mesh */

function BowlBall(pos0, vel0, angl0, anglvel0) {

	/* Preparation for THREE.Mesh */

	this.radius = 0.1085;

	/* Initialize THREE.MESH */

	this.geometry = new THREE.SphereGeometry(this.radius, 5, 5)	
	/* Was ist mit Faces und Normalen bei der Kugel?
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
	 */

	this.material = new THREE.MeshNormalMaterial();
	THREE.Mesh.call(this,this.geometry,this.material);

	/* Initialize extensions to THREE.Mesh */

	this.objtype = "ball";

	this.composoff = new THREE.Vector3(0., 0., 0.001);

	this.position.x = pos0[0];
	this.position.y = pos0[1];
	this.position.z = pos0[2];
	//console.log(this.position.x,this.position.y,this.position.z)
	this.velocity = new THREE.Vector3(vel0[0],vel0[1],vel0[2]);

	this.angl = new THREE.Vector3(angl0[0],angl0[1],angl0[2]);
	this.anglvel = new THREE.Vector3(anglvel0[0],anglvel0[1],anglvel0[2]);

	this.mass = 7.0;
	this.intens0 = new THREE.Matrix3(0.031, 0, 0, 0, 0.033, 0, 0, 0, 0.035);

	//this.ormat = new THREE.Matrix3(1., 0., 0., 0., 1., 0., 0., 0., 1.);
	//this.orquat = new THREE.Quaternion(0., 0., 0., 1.);
	this.quaternion.set(0., 0., 0., 1.);
	//this.setRotationFromQuaternion(this.orquat);
}

BowlBall.inherits(THREE.Mesh);

BowlBall.method('anglvquat', function() {
	return new THREE.Quaternion(this.anglvel.x, this.anglvel.y, this.anglvel.z, 0.);
});

BowlBall.method('compos', function() {
	return new THREE.Vector3(this.position.x + this.composoff.x, this.position.y + this.composoff.y, this.position.z + this.composoff.z);
});

BowlBall.method('comvel', function() {
	var velhelp = new THREE.Vector3(0.,0.,0.);
	velhelp.crossVectors(this.anglvel, this.composoff);
	
	return new THREE.Vector3(this.velocity.x + velhelp.x, this.velocity.y + velhelp.y, this.velocity.z + velhelp.z);
});

/*
var ball = new BowlBall([0,1,2],[3,4,5])
ball.receiveShadow = true;
ball.castShadow = true;

console.log(ball.id);
console.log(ball.mass);
console.log(ball.position.x);
console.log(ball.velocity.x);
 */

/*pins[0].translateX(0);
pins[0].translateZ(-18.29/2);
pins[0].receiveShadow = true;
pins[0].castShadow = true;
 */