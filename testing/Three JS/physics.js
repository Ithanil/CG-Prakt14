"use strict";
var arrowHelper;
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

	/*var dtrotquat = new THREE.Quaternion();
	var dtrotax = new THREE.Vector3(physobj.anglvel.x, physobj.anglvel.y, physobj.anglvel.z);
	var dtrotval = dtrotax.length();
	dtrotax.applyQuaternion(physobj.orquat);
	dtrotax.normalize();
	dtrotquat.setFromAxisAngle(dtrotax, dt*dtrotval);
	avorquat.multiplyQuaternions(dtrotquat, physobj.orquat);*/
	
	avorquat.multiplyQuaternions(physobj.anglvquat(), physobj.orquat);
	avorquat.x = physobj.orquat.x + hdt * avorquat.x;
	avorquat.y = physobj.orquat.y + hdt * avorquat.y;
	avorquat.z = physobj.orquat.z + hdt * avorquat.z;
	avorquat.w = physobj.orquat.w + hdt * avorquat.w;
	avorquat.normalize();
	console.log('avorquat',avorquat.x, avorquat.y, avorquat.z, avorquat.w);

}

function integrate(physobjs, dt, oldaccs)
{
	var nobj = physobjs.length;
	var hdt = 0.5 * dt;

	var veldt = new THREE.Vector3(), accdt1 = new THREE.Vector3(), accdt2 = new THREE.Vector3();
	var avorquat = new THREE.Quaternion();

	var fixdirs = [0, 0, 0];
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
		physobjs[i].fixdirs(fixdirs);

		console.log('accdt2',accdt2.x,accdt2.y,accdt2.z);
		physobjs[i].anglvel.add(accdt2);

		calcPosHelpers(physobjs[i], dt, veldt, avorquat);

		physobjs[i].refpos.add(veldt);

		physobjs[i].orquat.copy(avorquat);
	}	

	oldaccs = getAccs(physobjs);
	console.log('oldaccs 0', oldaccs[0][0], oldaccs[0][1])
	console.log('oldaccs 1', oldaccs[1][0], oldaccs[1][1])
	for (var i = 0; i < nobj; i++) {
		calcVelHelpers(physobjs[i], oldaccs[i], hdt, accdt1,accdt2);

		physobjs[i].velocity.add(accdt1);
		physobjs[i].fixdirs(fixdirs);

		physobjs[i].anglvel.add(accdt2);


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
	var accs = new Array(nobj);

	for (var i = 0; i < nobj; i++) 
	{

		var velmin = 10.*dt;
		if (physobjs[i].velocity.y < 0.0) {
			if (physobjs[i] instanceof BowlPin) {
				if (physobjs[i].refpos.y < physobjs[i].refposG.y) {
					physobjs[i].velocity.y = -0.25*physobjs[i].velocity.y;
					physobjs[i].refpos.y = physobjs[i].refposG.y;
					if (physobjs[i].velocity.y < velmin) {
						physobjs[i].velocity.y = 0.0;
					}
				}
			}
			if (physobjs[i] instanceof BowlBall) {
				if (physobjs[i].refpos.y < physobjs[i].radius) {
					physobjs[i].velocity.y = -0.1*physobjs[i].velocity.y;
					physobjs[i].refpos.y = physobjs[i].radius;
					if (physobjs[i].velocity.y < velmin) {
						physobjs[i].velocity.y = 0.0;
					}
				}
			}
		}
		var intensarr = physobjs[i].getRotIntensArr();
		console.log('--- intensarr ---');
		for (var it = 0; it < 3; it++) {
			console.log(intensarr[it],intensarr[it+3],intensarr[it+6]);
		}
		console.log('-----------------');
		var comvec = physobjs[i].getRotCPos();
		console.log('comvec',comvec.x, comvec.y, comvec.z)
//		-physobjs[i].mass * 9.81
		var force  = new THREE.Vector3(0., -physobjs[i].mass * 9.81, 0.);
		var torque = new THREE.Vector3();
		
		//scene.remove( arrowHelper );

		//arrowHelper = new THREE.ArrowHelper( rotforcenorm, physobjs[i].refpos, 1.0, 0xffff00 ); 

		//scene.add( arrowHelper );

		torque.crossVectors(comvec, force);
		console.log('torque',torque.x, torque.y, torque.z)
		torque.add(new THREE.Vector3(0., 0., 0.));

		var massi = 1./physobjs[i].mass;
		var anglacc = new THREE.Vector3(
				(torque.x - (intensarr[8]-intensarr[4]) * physobjs[i].anglvel.y * physobjs[i].anglvel.z)/intensarr[0],
				(torque.y - (intensarr[0]-intensarr[8]) * physobjs[i].anglvel.x * physobjs[i].anglvel.z)/intensarr[4], 
				(torque.z - (intensarr[4]-intensarr[0]) * physobjs[i].anglvel.y * physobjs[i].anglvel.x)/intensarr[8]);

		var linacc = new THREE.Vector3(force.x, force.y, force.z);
		var vechelp1 = new THREE.Vector3();
		var vechelp2 = new THREE.Vector3();

		
		vechelp1.crossVectors(comvec, anglacc);
		linacc.add(vechelp1);
		console.log('vechelp1',vechelp1.x, vechelp1.y, vechelp1.z)


		vechelp1.crossVectors(physobjs[i].anglvel, comvec);
		vechelp2.crossVectors(vechelp1, physobjs[i].anglvel);		
		linacc.add(vechelp2);
		console.log('vechelp2',vechelp2.x, vechelp2.y, vechelp2.z)
		linacc.multiplyScalar(massi);
		console.log('linacc',linacc.x, linacc.y, linacc.z)
		console.log('anglacc',anglacc.x, anglacc.y, anglacc.z)

		//accs.push([linacc, anglacc]);
		accs[i] = [linacc, anglacc];
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
