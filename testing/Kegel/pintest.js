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
function velobj(vel0) {
	this.x = vel0[0];
	this.y = vel0[1];
	this.z = vel0[2];

}
velobj.prototype = {
		x: 0,
		y: 0,
		z: 0
}


/* Constructor for the BowlPin type, which is inherited from THREE.Mesh */

function BowlPin(pos0,vel0,slices,color) {
	
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

	this.position.x = pos0[0];
	this.position.y = pos0[1];
	this.position.z = pos0[2];
	this.velocity = new velobj(vel0);
	this.mass = 1.5875733;
	this.intens = [[0.0134109, 0, 0],
	               [0, 0.0019401, 0],
	               [0, 0, 0.0134109]];


	//alert('BowlPin instantiated');
	console.log(this.id);
}

BowlPin.inherits(THREE.Mesh);

BowlPin.method('velarr', function () {
	return [this.velocity.x,this.velocity.y,this.velocity.z];
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


var pins = []
for (var i = 0; i < 10; i++) 
{
	pins.push(new BowlPin([1,2,3],[-1,0,1],10,"blue"));
}

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