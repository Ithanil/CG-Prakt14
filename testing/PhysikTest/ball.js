"use strict";

/*  	Allows .x/.y/.z access to velocity coordinates, such that 
	usage is equivalent to that of the position coordinates of THREE.Mesh */
function velobj(vel0) {
	this[0] = vel0[0];
	this[1] = vel0[1];
	this[2] = vel0[2];
	this.x = vel0[0];
	this.y = vel0[1];
	this.z = vel0[2];
}
velobj.inherits(Array);

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
	
	this.compos = [0., 0., 0.001];
	this.refpos = [0., 0., 0.];
	this.posoff = [this.compos[0] - this. refpos[0], 
	               this.compos[1] - this. refpos[1], 
	               this.compos[2] - this. refpos[2]]; 
	this.position.x = pos0[0];
	this.position.y = pos0[1];
	this.position.z = pos0[2];
	this.velocity = new velobj(vel0);
	
	this.angl = new velobj(angl0);
	this.anglvel = new velobj(anglvel0);
	
	this.mass = 7.0;
	this.intens = [[0.031, 0, 0],
	               [0, 0.033, 0],
	               [0, 0, 0.035]];
	
	this.ormat = [[1., 0., 0.],
	              [0., 1., 0.],
	              [0., 0., 1.]];
	this.orquat = [1.0, 0., 0., 0.];

}

BowlBall.inherits(THREE.Mesh);

BowlBall.method('velarr', function () {
	return [this.velocity.x,this.velocity.y,this.velocity.z];
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