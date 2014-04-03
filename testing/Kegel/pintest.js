"use strict";

var pin_material = new THREE.MeshPhongMaterial({color: 'blue' });
function BowlPin(pos0,vel0,id) {
    THREE.Mesh.call(this)
    
    this.position = [pos0[0],pos0[1],pos0[2]]
    this.velocity = [vel0[0],vel0[1],vel0[2]]
    this.mass = 1.5875733
    this.intens = [[0.0134109, 0, 0],[0, 0.0019401, 0],[0, 0, 0.0134109]]
    
    alert('BowlPin instantiated');
}


BowlPin.prototype = {
id: null,
mass: 0,
init: function () {
    this.id = "1";
    this.position = [0,0,0]
    this.velocity = [0,0,0]
    this.intens = [[0, 0, 0],[0, 0, 0],[0, 0, 0]]
},
push: Array.prototype.push
};

//display the person1 gender
alert('person1 is a ' + person1.gender); // person1 is a Male




var pin_material = new THREE.MeshPhongMaterial({color: 'blue' });
function BowlPin(pos0,vel0,id) {
    THREE.Mesh.call(this)
    
    this.position = [pos0[0],pos0[1],pos0[2]]
    this.velocity = [vel0[0],vel0[1],vel0[2]]
    this.mass = 1.5875733
    this.intens = [[0.0134109, 0, 0],[0, 0.0019401, 0],[0, 0, 0.0134109]]
        
    alert('BowlPin instantiated');
}


BowlPin.prototype = {
id: null,
mass: 0,
init: function () {
    this.id = "1";
    this.position = [0,0,0]
    this.velocity = [0,0,0]
    this.intens = [[0, 0, 0],[0, 0, 0],[0, 0, 0]]
},
push: Array.prototype.push
};

//display the person1 gender
alert('person1 is a ' + person1.gender); // person1 is a Male


	function generatePinSegment(a, b, slices){
			
		var pinVertices = new Array();

				var dphi = 2*Math.PI/slices;
				var circa = [0,a[1],0]; // point on circ from a
				var circb = [0,b[1],0];
				var nv  = [0, 0, 0]; // normal vector
				var v   = [0, 0 ,0]; // velocity
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
			
			function generatePin(slices,L) 
			{
				var pinVertices = new Array();
				for (var i = 0; i < L.length-1; i++)
				{
					var a = L[i];
					var b = L[i+1];
					pinVertices = pinVertices.concat(generatePinSegment(a, b, slices));
				}
				return pinVertices;
			}
	
		function putPins(){
			
		 scene.remove(pin1);
		 scene.remove(pin2);
		 scene.remove(pin3);
		 scene.remove(pin4);
		 scene.remove(pin5);
		 scene.remove(pin6);
		 scene.remove(pin7);
		 scene.remove(pin8);
		 scene.remove(pin9);
		 scene.remove(pin10);
		 
		// Die Pins, hier Geometrie
		var pin_geometry = new THREE.Geometry();
		var count = 0;
		for (var i = 0; i < pinVertices.length; i = i + 3) {
				pin_geometry.vertices.push(new THREE.Vector3(pinVertices[i],pinVertices[i+1],pinVertices[i+2]));
				count++;
		}
		
		for (var i = 0; i < count-3; i = i +2) 
		{
			var a = i;
			var b = i+1;
			var c = i+2;
			var d = i+3;
			pin_geometry.faces.push(new THREE.Face3(a,b,c));
			pin_geometry.faces.push(new THREE.Face3(b,d,c));
		}
		pin_geometry.computeFaceNormals();
		var pin_material = new THREE.MeshPhongMaterial({color: 'blue' });
				// Die 10 Pins
		pin1 = new THREE.Mesh(pin_geometry, pin_material); 
		pin1.translateX(0);
		pin1.translateZ(-18.29/2);
		pin1.receiveShadow = true;
		pin1.castShadow = true;
		scene.add(pin1);
		
		pin2 = new THREE.Mesh(pin_geometry, pin_material);
		pin2.translateZ(-18.29/2-0.264);
		pin2.translateX(0.3048/2);
		pin2.castShadow = true;
		pin2.receiveShadow = true;
		scene.add(pin2);
		
		pin3 = new THREE.Mesh(pin_geometry, pin_material);
		pin3.translateZ(-18.29/2-0.264);
		pin3.translateX(-0.3048/2);
		pin3.castShadow = true;
		pin3.receiveShadow = true;
		scene.add(pin3);
		
		pin4 = new THREE.Mesh(pin_geometry, pin_material);
		pin4.translateZ(-18.29/2-0.264*2);
		pin4.translateX(-0.3048);
		pin4.castShadow = true;
		pin4.receiveShadow = true;
		scene.add(pin4);
		
		pin5 = new THREE.Mesh(pin_geometry, pin_material);
		pin5.translateZ(-18.29/2-0.264*2);
		pin5.castShadow = true;
		pin5.receiveShadow = true;
		scene.add(pin5);
		
		pin6 = new THREE.Mesh(pin_geometry, pin_material);
		pin6.translateZ(-18.29/2-0.264*2);
		pin6.translateX(0.3048);
		pin6.castShadow = true;
		pin6.receiveShadow = true;
		scene.add(pin6);
		
		pin7 = new THREE.Mesh(pin_geometry, pin_material);
		pin7.translateZ(-18.29/2-0.264*3);
		pin7.translateX(0.3048*3/2);
		pin7.castShadow = true;
		pin7.receiveShadow = true;
		scene.add(pin7);
		
		pin8 = new THREE.Mesh(pin_geometry, pin_material);
		pin8.translateZ(-18.29/2-0.264*3);
		pin8.translateX(0.3048/2);
		pin8.castShadow = true;
		pin8.receiveShadow = true;
		scene.add(pin8);
		
		pin9 = new THREE.Mesh(pin_geometry, pin_material);
		pin9.translateZ(-18.29/2-0.264*3);
		pin9.translateX(-0.3048/2);
		pin9.castShadow = true;
		pin9.receiveShadow = true;
		scene.add(pin9);
		
		pin10 = new THREE.Mesh(pin_geometry, pin_material);
		pin10.translateZ(-18.29/2-0.264*3);
		pin10.translateX(-0.3048*3/2);
		pin10.castShadow = true;
		pin10.receiveShadow = true;
		scene.add(pin10);
		
		animate();
}	
	