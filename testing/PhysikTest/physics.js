"use strict";

/*
quat4.add = function (quat, quat2, dest) {
	if (!dest) { dest = quat; }

	var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3],
	qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];

	dest[0] = qax + qbx;
	dest[1] = qay + qby;
	dest[2] = qaz + qbz;
	dest[3] = qaw + qbw;

	return dest;
};*/

function integrate(physobjs, dt)
{
	var nobj = physobjs.length;
	var hdt = 0.5 * dt;
	var accs = getAccs(physobjs, nobj);
	var veldt = new THREE.Vector3(), accsdt1 = new THREE.Vector3(), accsdt2 = new THREE.Vector3();
	var avorquat = new THREE.Quaternion();

	//accs = [[ [0., 0., 0. ], [0., 0., 0.]], ...]

	for (var i = 0; i < nobj; i++) 
	{	
		/*
		console.log("before");
		console.log(physobjs[i].position.x, physobjs[i].position.y, physobjs[i].position.z);
		console.log(physobjs[i].quaternion.x,physobjs[i].quaternion.y,physobjs[i].quaternion.z,physobjs[i].quaternion.w);
		console.log(physobjs[i].velocity.x, physobjs[i].velocity.y, physobjs[i].velocity.z);
		console.log(physobjs[i].anglvel.x, physobjs[i].anglvel.y, physobjs[i].anglvel.z);
		console.log("---");
		*/
		
		veldt.x = physobjs[i].velocity.x;
		veldt.y = physobjs[i].velocity.y;
		veldt.z = physobjs[i].velocity.z;
		veldt.multiplyScalar(dt);
		
		accsdt1.x = accs[i][0].x;
		accsdt1.y = accs[i][0].y;
		accsdt1.z = accs[i][0].z;
		accsdt1.multiplyScalar(dt);
		
		accsdt2.x = accs[i][1].x;
		accsdt2.y = accs[i][1].y;
		accsdt2.z = accs[i][1].z;
		accsdt2.multiplyScalar(dt);
		
		//console.log(physobjs[i].quaternion.x,physobjs[i].quaternion.y,physobjs[i].quaternion.z,physobjs[i].quaternion.w);
		avorquat.multiplyQuaternions(physobjs[i].quaternion,physobjs[i].anglvquat());
		avorquat.x = physobjs[i].quaternion.x + hdt * avorquat.x;
		avorquat.y = physobjs[i].quaternion.y + hdt * avorquat.y;
		avorquat.z = physobjs[i].quaternion.z + hdt * avorquat.z;
		avorquat.w = physobjs[i].quaternion.w + hdt * avorquat.w;
		avorquat.normalize();
		//console.log(physobjs[i].anglvquat().x,physobjs[i].anglvquat().y,physobjs[i].anglvquat().z,physobjs[i].anglvquat().w);
		
		/*
		console.log("middle")
		console.log(veldt.x,veldt.y,veldt.z);
		console.log(accsdt1.x,accsdt1.y,accsdt1.z);
		console.log(accsdt2.x,accsdt2.y,accsdt2.z);
		console.log(avorquat.x,avorquat.y,avorquat.z,avorquat.w);
		console.log(avorquatdt.x,avorquatdt.y,avorquatdt.z,avorquatdt.w);
		console.log("---")
		*/
		
		/* 	Update of Coordinates 	*/
		
		physobjs[i].position.add(veldt);
		
		physobjs[i].quaternion.copy(avorquat);
		//physobjs[i].setRotationFromQuaternion(physobjs[i].orquat);	//updates this.quaternion
	
		physobjs[i].velocity.add(accsdt1);
		
		physobjs[i].anglvel.add(accsdt2);
		
		/* 							*/
				
		//console.log(physobjs[i].quaternion.x,physobjs[i].quaternion.y,physobjs[i].quaternion.z,physobjs[i].quaternion.w);
	
		/*
		console.log("after");
		console.log(physobjs[i].position.x, physobjs[i].position.y, physobjs[i].position.z);
		console.log(physobjs[i].quaternion.x,physobjs[i].quaternion.y,physobjs[i].quaternion.z,physobjs[i].quaternion.w);
		console.log(physobjs[i].velocity.x, physobjs[i].velocity.y, physobjs[i].velocity.z);
		console.log(physobjs[i].anglvel.x, physobjs[i].anglvel.y, physobjs[i].anglvel.z);
		console.log("---");
		*/
	}
	return physobjs;
}

function getAccs(physobjs)
{
	var nobj = physobjs.length;
	var accs = [];
	
	for (var i = 0; i < nobj; i++) 
	{
		//accs.push([new THREE.Vector3(0.0, -9.81, 0.), new THREE.Vector3(0., 0., 0.)]);
		//accs.push([new THREE.Vector3(1.0, 1.0, 1.0), new THREE.Vector3(45.0, 60.0, 75.0)]);
		accs.push([new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0)]);
	}
	/*
	console.log("accs")
	console.log(accs[0][0].x, accs[0][0].y, accs[0][0].z);
	console.log(accs[0][1].x, accs[0][1].y, accs[0][1].z);
	console.log("---")
	*/

	return accs;
}

/*
for (var vertexIndex = 0; vertexIndex < MovingCube.geometry.vertices.length; vertexIndex++)
{		
	var localVertex = MovingCube.geometry.vertices[vertexIndex].clone();
	var globalVertex = localVertex.applyMatrix4( MovingCube.matrix );
	var directionVector = globalVertex.sub( MovingCube.position );
	
	var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
	var collisionResults = ray.intersectObjects( collidableMeshList );
	if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
		appendText(" Hit ");
}	*/
