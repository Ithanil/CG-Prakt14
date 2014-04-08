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


function calcVelHelpers(physobj, acc, dt, accdt1, accdt2) {

	accdt1.x = acc[0].x;
	accdt1.y = acc[0].y;
	accdt1.z = acc[0].z;
	accdt1.multiplyScalar(dt);

	accdt2.x = acc[1].x;
	accdt2.y = acc[1].y;
	accdt2.z = acc[1].z;
	accdt2.multiplyScalar(dt);

}

function calcPosHelpers(physobj, dt, veldt, avorquat) {
	var hdt = 0.5 * dt;

	veldt.x = physobj.velocity.x;
	veldt.y = physobj.velocity.y;
	veldt.z = physobj.velocity.z;
	veldt.multiplyScalar(dt);

	avorquat.multiplyQuaternions(physobj.anglvquat(), physobj.orquat);
	avorquat.x = physobj.orquat.x + hdt * avorquat.x;
	avorquat.y = physobj.orquat.y + hdt * avorquat.y;
	avorquat.z = physobj.orquat.z + hdt * avorquat.z;
	avorquat.w = physobj.orquat.w + hdt * avorquat.w;
	avorquat.normalize();

}

function integrate(physobjs, dt, oldaccs)
{
	var nobj = physobjs.length;
	var hdt = 0.5 * dt;

	var veldt = new THREE.Vector3(), accdt1 = new THREE.Vector3(), accdt2 = new THREE.Vector3();
	var avorquat = new THREE.Quaternion();

	//accs = [[ [0., 0., 0. ], [0., 0., 0.]], ...]

	for (var i = 0; i < nobj; i++) 
	{	
		/*
		console.log("before");
		console.log(physobjs[i].refpos.x, physobjs[i].refpos.y, physobjs[i].refpos.z);
		console.log(physobjs[i].orquat.x,physobjs[i].orquat.y,physobjs[i].orquat.z,physobjs[i].orquat.w);
		console.log(physobjs[i].velocity.x, physobjs[i].velocity.y, physobjs[i].velocity.z);
		console.log(physobjs[i].anglvel.x, physobjs[i].anglvel.y, physobjs[i].anglvel.z);
		console.log("---");
		 */


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

		calcVelHelpers(physobjs[i], oldaccs[i], hdt, accdt1,accdt2);

		physobjs[i].velocity.add(accdt1);

		physobjs[i].anglvel.add(accdt2);

		calcPosHelpers(physobjs[i], dt, veldt, avorquat);

		physobjs[i].refpos.add(veldt);

		physobjs[i].orquat.copy(avorquat);
	}	

	oldaccs = getAccs(physobjs);
	for (var i = 0; i < nobj; i++) {
		calcVelHelpers(physobjs[i], oldaccs[i], hdt, accdt1,accdt2);

		physobjs[i].velocity.add(accdt1);

		physobjs[i].anglvel.add(accdt2);



		var fixdirs = [1,1,1];
		if (fixdirs[0]==1) {
			physobjs[i].velocity.x = 0.0;
		}
		if (fixdirs[1]==1) {
			physobjs[i].velocity.y = 0.0;
		}
		if (fixdirs[2]==1) {
			physobjs[i].velocity.z = 0.0;
		}


		/* 							*/

		//console.log(physobjs[i].orquat.x,physobjs[i].orquat.y,physobjs[i].orquat.z,physobjs[i].orquat.w);

		/*
		console.log("after");
		console.log(physobjs[i].refpos.x, physobjs[i].refpos.y, physobjs[i].refpos.z);
		console.log(physobjs[i].orquat.x,physobjs[i].orquat.y,physobjs[i].orquat.z,physobjs[i].orquat.w);
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

		if (physobjs[i].velocity.y < 0.0) {
			if (physobjs[i] instanceof BowlPin) {
				if (physobjs[i].refpos.y < physobjs[i].refposG.y) {
					physobjs[i].velocity.y = -0.5*physobjs[i].velocity.y;
					physobjs[i].refpos.y = physobjs[i].refposG.y;
				}
			}
			if (physobjs[i] instanceof BowlBall) {
				if (physobjs[i].refpos.y < physobjs[i].radius) {
					physobjs[i].velocity.y = -0.5*physobjs[i].velocity.y;
					physobjs[i].refpos.y = physobjs[i].radius;
				}
			}
		}
		var intensarr = physobjs[i].intensR.toArray();

		var force  = new THREE.Vector3(0., -physobjs[i].mass * 9.81, 0.);
		var torque = new THREE.Vector3();
		var rotforce = new THREE.Vector3();
		var frotquat = new THREE.Quaternion(-physobjs[i].orquat.x, -physobjs[i].orquat.y, -physobjs[i].orquat.z, physobjs[i].orquat.w);

		rotforce.copy(force);
		rotforce.applyQuaternion(frotquat);

		//var arrowHelper = new THREE.ArrowHelper( frotquat, physobjs[i].refpos, physobjs[i].mass * 9.81, 0xffff00 ); 
		//scene.remove( arrowHelper );
		//scene.add( arrowHelper );
		
		torque.crossVectors(physobjs[i].composR, rotforce);
		torque.add(new THREE.Vector3(0., 0., 0.));

		var massi = 1./physobjs[i].mass;
		var anglacc = new THREE.Vector3(
				(torque.x - (intensarr[8]-intensarr[4]) * physobjs[i].anglvel.y * physobjs[i].anglvel.z)/intensarr[0],
				(torque.y - (intensarr[0]-intensarr[8]) * physobjs[i].anglvel.x * physobjs[i].anglvel.z)/intensarr[4], 
				(torque.z - (intensarr[4]-intensarr[0]) * physobjs[i].anglvel.y * physobjs[i].anglvel.x)/intensarr[8]);

		var linacc = new THREE.Vector3(force.x, force.y, force.z);
		var vechelp1 = new THREE.Vector3();
		var vechelp2 = new THREE.Vector3();


		vechelp1.crossVectors(physobjs[i].composR, anglacc);
		linacc.add(vechelp1);
		//console.log(vechelp1.x, vechelp1.y, vechelp1.z)


		vechelp1.crossVectors(physobjs[i].anglvel, physobjs[i].composR);
		vechelp2.crossVectors(vechelp1, physobjs[i].anglvel);		
		linacc.add(vechelp2);
		//console.log(vechelp2.x, vechelp2.y, vechelp2.z)
		linacc.multiplyScalar(massi);
		//console.log(linacc.x, linacc.y, linacc.z)

		accs.push([linacc, anglacc]);
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
