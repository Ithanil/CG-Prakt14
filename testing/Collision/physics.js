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

	if (debug==1) {
		console.log('acc[0]',acc[0].x,acc[0].y,acc[0].z);
		console.log('acc[1]',acc[1].x,acc[1].y,acc[1].z);
	}
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

	if (debug==1) {
		console.log('avorquat',avorquat.x, avorquat.y, avorquat.z, avorquat.w);
	}

}

function integrate(physobjs, dt, oldaccs)
{
	var nobj = physobjs.length;
	var hdt = 0.5 * dt;

	var veldt = new THREE.Vector3(), accdt1 = new THREE.Vector3(), accdt2 = new THREE.Vector3();
	var avorquat = new THREE.Quaternion();

	//accs = [[ [0., 0., 0. ], [0., 0., 0.]], ...]

	oldaccs = getAccs(physobjs); 
	for (var i = 0; i < nobj; i++) 
	{	

		/* 	Update of Coordinates 	*/

		calcVelHelpers(physobjs[i], oldaccs[i], hdt, accdt1,accdt2);

		physobjs[i].velocity.add(accdt1);
		physobjs[i].makefixed();

		physobjs[i].anglvel.add(accdt2);

		calcPosHelpers(physobjs[i], dt, veldt, avorquat);

		physobjs[i].refpos.add(veldt);

		physobjs[i].orquat.copy(avorquat);
	}	

	oldaccs = getAccs(physobjs);
	if (debug==1) {
		console.log('oldaccs 0', oldaccs[0][0].x,oldaccs[0][0].y,oldaccs[0][0].z, oldaccs[0][1].x, oldaccs[0][1].y, oldaccs[0][1].z)
		console.log('oldaccs 1', oldaccs[1][0].x,oldaccs[1][0].y,oldaccs[1][0].z, oldaccs[1][1].x, oldaccs[1][1].y, oldaccs[1][1].z)
	}

	for (var i = 0; i < nobj; i++) {
		calcVelHelpers(physobjs[i], oldaccs[i], hdt, accdt1,accdt2);

		physobjs[i].velocity.add(accdt1);
		physobjs[i].makefixed();

		physobjs[i].anglvel.add(accdt2);

	}
	return physobjs;
}

function getAccs(physobjs)
{
	var nobj = physobjs.length;
	var accs = new Array(nobj);
	var friccoeff;

	for (var i = 0; i < nobj; i++) 
	{
		if (physobjs[i].refpos.z < -2.0) {
			friccoeff = 0.2;
		} else {
			friccoeff = 0.04;
		}
		var force  = new THREE.Vector3();
		var torque = new THREE.Vector3();

		var velmin = 10.*dt;

		var gutterradius = 2;

		if (physobjs[i].velocity.y < 0.0) {
			if (physobjs[i] instanceof BowlPin) {
				if (physobjs[i].refpos.y < physobjs[i].refposG.y) {
					physobjs[i].velocity.y = -0.25*physobjs[i].velocity.y;
					physobjs[i].refpos.y = physobjs[i].refposG.y;
					if (physobjs[i].velocity.y < velmin) {
						physobjs[i].fixdirs[1] = true;
						physobjs[i].makefixed();
						//physobjs[i].newRefPos(new THREE.Vector3(0.,0.,0.))
					}
				}
			}
			if (physobjs[i] instanceof BowlBall) {
				if ((physobjs[i].refpos.y-1)*(physobjs[i].refpos.y-1)+(physobjs[i].refpos.x)*(physobjs[i].refpos.x)>(1-physobjs[i].radius)*(1-physobjs[i].radius)) {
					physobjs[i].velocity.y = -0.1*physobjs[i].velocity.y;
//					physobjs[i].refpos.y = physobjs[i].radius;
					if (physobjs[i].velocity.y < velmin) {

						physobjs[i].fixdirs[1] = true;
						physobjs[i].makefixed();
						physobjs[i].newRefPos(new THREE.Vector3(0., 0., 0.));
					}
				}
			}
		}		
		
		
/*		if (physobjs[i].velocity.y < 0.0) {
			if (physobjs[i] instanceof BowlPin) {
				if (physobjs[i].refpos.y < physobjs[i].refposG.y) {
					physobjs[i].velocity.y = -0.25*physobjs[i].velocity.y;
					physobjs[i].refpos.y = physobjs[i].refposG.y;
					if (physobjs[i].velocity.y < velmin) {
						physobjs[i].fixdirs[1] = true;
						physobjs[i].makefixed();
						//physobjs[i].newRefPos(new THREE.Vector3(0.,0.,0.))
					}
				}
			}
			if (physobjs[i] instanceof BowlBall) {
				if (physobjs[i].refpos.y < physobjs[i].radius) {
					physobjs[i].velocity.y = -0.1*physobjs[i].velocity.y;
					physobjs[i].refpos.y = physobjs[i].radius;
					if (physobjs[i].velocity.y < velmin) {

						physobjs[i].fixdirs[1] = true;
						physobjs[i].makefixed();
						physobjs[i].newRefPos(new THREE.Vector3(0., 0., 0.));
					}
				}
			}
		}*/

		var intensarr = physobjs[i].getRotIntensArr();
		var comvec = physobjs[i].getRotCPos();

		if (debug==1){
			console.log('--- intensarr ---');
			for (var it = 0; it < 3; it++) {
				console.log(intensarr[it],intensarr[it+3],intensarr[it+6]);
			}
			console.log('-----------------');
			console.log('comvec',comvec.x, comvec.y, comvec.z)
		}


//		-physobjs[i].mass * 9.81

		//scene.remove( arrowHelper );

		//arrowHelper = new THREE.ArrowHelper( rotforcenorm, physobjs[i].refpos, 1.0, 0xffff00 ); 

		//scene.add( arrowHelper );

		force.add(new THREE.Vector3(0., -physobjs[i].mass * 9.81, 0.));
		torque.crossVectors(comvec, force);

		var velhelp1 = new THREE.Vector3(physobjs[i].velocity.x, 0.0, physobjs[i].velocity.z);
		var velhelp2 = new THREE.Vector3(physobjs[i].anglvel.z*physobjs[i].radius, 0.0, -physobjs[i].anglvel.x*physobjs[i].radius);
		velhelp1.add(velhelp2);
		if (velhelp1.length() > 0){
			velhelp1.multiplyScalar(- friccoeff * physobjs[i].fixforce.y / velhelp1.length())
			var frictorq = new THREE.Vector3(-physobjs[i].radius*velhelp1.z, 0.0, velhelp1.x*physobjs[i].radius);

			force.add(velhelp1);	
			torque.add(frictorq);
		}

		if (debug==1) {
			console.log('frictorq',frictorq.x, frictorq.y, frictorq.z)
		}

		torque.add(new THREE.Vector3(0., 0., 0.));

		if (debug==1) {
			console.log('torque',torque.x, torque.y, torque.z);
		}

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

		if (debug==1) {
			console.log('vechelp1',vechelp1.x, vechelp1.y, vechelp1.z)
		}

		vechelp1.crossVectors(physobjs[i].anglvel, comvec);
		vechelp2.crossVectors(vechelp1, physobjs[i].anglvel);		
		linacc.add(vechelp2);
		linacc.multiplyScalar(massi);

		if (debug==1) {
			console.log('vechelp2',vechelp2.x, vechelp2.y, vechelp2.z)
			console.log('linacc',linacc.x, linacc.y, linacc.z)
			console.log('anglacc',anglacc.x, anglacc.y, anglacc.z)
		}

		accs[i] = [linacc, anglacc];
	}


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
