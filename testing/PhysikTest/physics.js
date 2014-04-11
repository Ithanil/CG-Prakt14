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


function calcVelHelpers(physobj, acc, timestep, accdt1, accdt2) {

	accdt1.x = acc[0].x;
	accdt1.y = acc[0].y;
	accdt1.z = acc[0].z;
	accdt1.multiplyScalar(timestep);

	accdt2.x = acc[1].x;
	accdt2.y = acc[1].y;
	accdt2.z = acc[1].z;
	accdt2.multiplyScalar(timestep);

	if (debug==1) {
		console.log('acc[0]',acc[0].x,acc[0].y,acc[0].z);
		console.log('acc[1]',acc[1].x,acc[1].y,acc[1].z);
	}
}

function calcPosHelpers(physobj, timestep, veldt, avorquat) {
	var htimestep = 0.5 * timestep;

	veldt.x = physobj.velocity.x;
	veldt.y = physobj.velocity.y;
	veldt.z = physobj.velocity.z;
	veldt.multiplyScalar(timestep);

	/*var dtrotquat = new THREE.Quaternion();
	var dtrotax = new THREE.Vector3(physobj.anglvel.x, physobj.anglvel.y, physobj.anglvel.z);
	var dtrotval = dtrotax.length();
	dtrotax.applyQuaternion(physobj.orquat);
	dtrotax.normalize();
	dtrotquat.setFromAxisAngle(dtrotax, dt*dtrotval);
	avorquat.multiplyQuaternions(dtrotquat, physobj.orquat);*/

	avorquat.multiplyQuaternions(physobj.anglvquat(), physobj.orquat);
	avorquat.x = physobj.orquat.x + htimestep * avorquat.x;
	avorquat.y = physobj.orquat.y + htimestep * avorquat.y;
	avorquat.z = physobj.orquat.z + htimestep * avorquat.z;
	avorquat.w = physobj.orquat.w + htimestep * avorquat.w;
	avorquat.normalize();

	if (debug==1) {
		console.log('avorquat',avorquat.x, avorquat.y, avorquat.z, avorquat.w);
	}

}

function integrate()
{
	var nobj = physobjs.length;
	var hdt = 0.5 * dt;

	var veldt = new THREE.Vector3(), accdt1 = new THREE.Vector3(), accdt2 = new THREE.Vector3();
	var avorquat = new THREE.Quaternion();

	var velmin = 0.1;
	//accs = [[ [0., 0., 0. ], [0., 0., 0.]], ...]

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
	for (var i = 0; i < nobj; i++) 
	{
		if (physobjs[i] instanceof BowlBall) {
			if (physobjs[i].gpos().y < physobjs[i].radius) {
				if (physobjs[i].velocity.y < velmin) {
					if (!physobjs[i].fixdirs[1]) {
						physobjs[i].fixdirs[1] = true;
						physobjs[i].makefixed();
						physobjs[i].newRefPos(new THREE.Vector3(0.,0.,0.))
					}
				}

			}
		}
		if (physobjs[i] instanceof BowlPin) {
			if (physobjs[i].refpos.y < physobjs[i].radius) {		
				if (physobjs[i].velocity.y < velmin) {
					physobjs[i].velocity.y = 0.0;
					physobjs[i].refpos.y = physobjs[i].radius;
				}
			}

		}
	}
	oldaccs = getAccs();
	if (debug==1) {
		console.log('oldaccs 0', oldaccs[0][0].x,oldaccs[0][0].y,oldaccs[0][0].z, oldaccs[0][1].x, oldaccs[0][1].y, oldaccs[0][1].z)
		console.log('oldaccs 1', oldaccs[1][0].x,oldaccs[1][0].y,oldaccs[1][0].z, oldaccs[1][1].x, oldaccs[1][1].y, oldaccs[1][1].z)
	}

	for (var i = 0; i < nobj; i++) {
		calcVelHelpers(physobjs[i], oldaccs[i], hdt, accdt1,accdt2);

		physobjs[i].velocity.add(accdt1);

		physobjs[i].anglvel.add(accdt2);

	}
}

function getAccs(){
	var nobj = physobjs.length;
	var accs = new Array(nobj);
	var friccoeff;

	var collforqtorq = getCollisionForcTorq();

	for (var i = 0; i < nobj; i++) 
	{
		if (physobjs[i].refpos.z < -2.0) {
			friccoeff = 0.2;
		} else {
			friccoeff = 0.04;
		}
		var force  = new THREE.Vector3(collforqtorq[i][0].x, collforqtorq[i][0].y, collforqtorq[i][0].z);
		var torque = new THREE.Vector3(collforqtorq[i][1].x, collforqtorq[i][1].y, collforqtorq[i][1].z);

		//var intensarr = physobjs[i].getRotIntensArr();
		var comvec = physobjs[i].getRotCPos();

		if (debug==1){
			/*console.log('--- intensarr ---');
			for (var it = 0; it < 3; it++) {
				console.log(intensarr[it],intensarr[it+3],intensarr[it+6]);
			}
			console.log('-----------------');*/
			console.log('comvec',comvec.x, comvec.y, comvec.z)
		}

		force.add(new THREE.Vector3(0., -physobjs[i].mass * 9.81, 0.));
		var torqh = new THREE.Vector3();
		torqh.crossVectors(comvec, force);
		torque.add(torqh);

		if (physobjs[i] instanceof BowlBall) {
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
		}

		if (debug==1) {
			console.log('torque',torque.x, torque.y, torque.z);
		}

		var massi = 1./physobjs[i].mass;
		var intensarr = physobjs[i].intensR.toArray();
		var orquati = new THREE.Quaternion(-physobjs[i].orquat.x, -physobjs[i].orquat.y, -physobjs[i].orquat.z, physobjs[i].orquat.w);
		var rottorq = new THREE.Vector3(torque.x, torque.y, torque.z);
		var rotanglvel = new THREE.Vector3(physobjs[i].anglvel.x, physobjs[i].anglvel.y, physobjs[i].anglvel.z);
		rottorq.applyQuaternion(orquati);
		rotanglvel.applyQuaternion(orquati);

		var anglacc = new THREE.Vector3(
				(rottorq.x - (intensarr[8]-intensarr[4]) * rotanglvel.y * rotanglvel.z)/intensarr[0],
				(rottorq.y - (intensarr[0]-intensarr[8]) * rotanglvel.x * rotanglvel.z)/intensarr[4], 
				(rottorq.z - (intensarr[4]-intensarr[0]) * rotanglvel.y * rotanglvel.x)/intensarr[8]);
		anglacc.applyQuaternion(physobjs[i].orquat);

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

function getCollisionForcTorq() {

	var originPoint, globalVertex, localVertex, directionVector = new THREE.Vector3();
	var collidableMeshList, ray, collisionResults, vertexIndex;
	var it1,it2;
	var collforqtorq = new Array(physobjs.length);
	var collforqtorqh, collres;

	var rvec1 = new THREE.Vector3(), rvec2 = new THREE.Vector3();
	var intens1 = new THREE.Matrix3(), intens2 = new THREE.Matrix3();
	var normvec = new THREE.Vector3();

	var relvel1, relvel2;
	var reldispl = new THREE.Vector3();

	var hvec1 = new THREE.Vector3(), hvec2 = new THREE.Vector3();

	for (it1 = 0; it1 < physobjs.length; it1++) {
		physobjs[it1].arrid = it1;
		collforqtorq[it1] = [new THREE.Vector3(), new THREE.Vector3()];
	}

	var maxdistn, thisdistn, didhit, findhit;
	var maxdistvec = new THREE.Vector3(), thisdistvec = new THREE.Vector3();
	var refDistVec = new THREE.Vector3();

	var collResultList = [];
	for (it1 = 0; it1 < physobjs.length; it1++) {
		var nomove1 = false;
		if (physobjs[it1].velocity.x == 0 && physobjs[it1].velocity.y == 0 && physobjs[it1].velocity.z == 0 && physobjs[it1].anglvel.x == 0 && physobjs[it1].anglvel.y == 0 && physobjs[it1].anglvel.z == 0) {
			nomove1 = true;
		}

		collResultList = []
		collidableMeshList = [];
		for (it2 = it1 + 1; it2 < physobjs.length; it2++) {
			var nomove2 = false;
			refDistVec.subVectors(physobjs[it2].refpos, physobjs[it1].refpos);
			if (refDistVec.length()<(physobjs[it1].collrad + physobjs[it2].collrad)) {
				if (physobjs[it2].velocity.x == 0 && physobjs[it2].velocity.y == 0 && physobjs[it2].velocity.z == 0 && physobjs[it2].anglvel.x == 0 && physobjs[it2].anglvel.y == 0 && physobjs[it2].anglvel.z == 0) {
					nomove2 = true;
				}
				if (!(nomove1 && nomove2)) {
					collidableMeshList.push(physobjs[it2]);
				}
			}
		}
		for (it2 = 0; it2 < sceneobjs.length; it2++) {
			collidableMeshList.push(sceneobjs[it2]);
		}

		originPoint = physobjs[it1].refpos.clone();

		//var collResultList = [];

		maxdistn = 1000.0;
		didhit = false;
		findhit = false;
		for (vertexIndex = 0; vertexIndex < physobjs[it1].geometry.vertices.length; vertexIndex++)
		{	
			localVertex = physobjs[it1].geometry.vertices[vertexIndex].clone();
			//console.log('hitvertex',hitVertex.x, hitVertex.y, hitVertex.z)
			directionVector.subVectors( localVertex, physobjs[it1].refposG );
			directionVector.applyQuaternion(physobjs[it1].orquat);

			ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
			collisionResults = ray.intersectObjects( collidableMeshList );

			globalVertex = localVertex.clone()
			globalVertex.applyQuaternion(physobjs[it1].orquat);
			globalVertex.add(physobjs[it1].refpos);

			//console.log(collisionResults.length);
			//console.log(directionVector.length());
			if ( collisionResults.length > 0) {
				//console.log(collisionResults[0].distance);
				if (collisionResults[0].distance < directionVector.length()) {

					//console.log(" Hit ");
					didhit = true;
					normvec.copy(collisionResults[0].face.normal);
					thisdistvec.subVectors(collisionResults[0].point, globalVertex);
					thisdistn = thisdistvec.dot(normvec);
					//console.log('thisdistn', thisdistn);

					if (maxdistn > thisdistn) {

						//console.log(" Better Hit ");
						maxdistn = thisdistn;
						maxdistvec.copy(normvec);	
						maxdistvec.multiplyScalar(-maxdistn);

						collResultList.push(collisionResults[0])
						//collres = collisionResults.slice(0,1)[0];								
					}

				}
			}
		}

		if ( didhit ) {
			var ithelp = collResultList.length - 1;
			collres = collResultList[ithelp];

			do {
				//Order by penetration length in normal direction
				collres = collResultList[ithelp];
				//collres = collResultList[collResultList.length-1];
				normvec.copy(collres.face.normal);

				if (collres.object instanceof BowlBall || collres.object instanceof BowlPin) {

					rvec1.subVectors(collres.point, physobjs[it1].refpos);
					rvec2.subVectors(collres.point, collres.object.refpos);

					/*hvec1.crossVectors(physobjs[it1].anglvel, rvec1);
				hvec2.crossVectors(collres.object.anglvel, rvec2);
				hvec1.add(physobjs[it1].velocity);
				hvec2.add(collres.object.velocity)
				relvel1 = normvec.dot(hvec1);
				relvel2 = normvec.dot(hvec2);*/

					//if ((relvel1-relvel2) < 0.) {


					intens1.fromArray(physobjs[it1].getRotIntensArr());
					intens2.fromArray(collres.object.getRotIntensArr());


					collforqtorqh = newtonCollision(rvec1, physobjs[it1].velocity, physobjs[it1].anglvel, physobjs[it1].mass, intens1, rvec2, collres.object.velocity, collres.object.anglvel, collres.object.mass, intens2, normvec, 0.7);  
					if (!(collforqtorqh === false)) {
						findhit = true;

						collforqtorq[it1][0].add(collforqtorqh[0][0]);
						collforqtorq[it1][1].add(collforqtorqh[0][1]);
						collforqtorq[collres.object.arrid][0].add(collforqtorqh[1][0]);
						collforqtorq[collres.object.arrid][1].add(collforqtorqh[1][1]);
					} else {
						findhit = false;

						ithelp-=1;
					}
					//}

				} else {

					rvec1.subVectors(collres.point, physobjs[it1].refpos);

					/*hvec1.crossVectors(physobjs[it1].anglvel, rvec1);

				hvec1.add(physobjs[it1].velocity);

				relvel1 = normvec.dot(hvec1);*/

					//if (relvel1 < 0.) {

					intens1.fromArray(physobjs[it1].getRotIntensArr());

					collforqtorqh = newtonCollision(rvec1, physobjs[it1].velocity, physobjs[it1].anglvel, physobjs[it1].mass, intens1, new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), 0.0, new THREE.Matrix3(), normvec, 0.25);  
					if (!(collforqtorqh === false)) {
						findhit = true;
						collforqtorq[it1][0].add(collforqtorqh[0][0]);
						collforqtorq[it1][1].add(collforqtorqh[0][1]);
					} else {
						findhit = false;

						ithelp-=1;}
				}

			} while (!findhit && (ithelp >= 0));
			if (!findhit) {
				/*if (collres.object instanceof BowlBall || collres.object instanceof BowlPin) {
					reldispl.copy(maxdistvec);
					reldispl.multiplyScalar(0.5);
					//physobjs[it1].refpos.add(reldispl);
					reldispl.multiplyScalar(-1.);
					//collres.object.refpos.add(reldispl);
				}  else {
					reldispl.copy(maxdistvec);
					//physobjs[it1].refpos.add(reldispl);	
				}*/
				//console.log('Did not find the hit!');
			} else {
				//console.log('Found the hit!');
			}
		} else {
			//console.log('Did not intersect!');
		}
	}
	return collforqtorq;
}

function newtonCollision(rad1, vel1, anglvel1, mass1, intens1, rad2, vel2, anglvel2, mass2, intens2, normvec, ecoeff) {
	var massi1, massi2;
	var intensi1 = new THREE.Matrix3(), intensi2 = new THREE.Matrix3();
	var hvec1 = new THREE.Vector3(), hvec2 = new THREE.Vector3(), hvec3 = new THREE.Vector3(), hvec4 = new THREE.Vector3();
	var normcopy1 = new THREE.Vector3(normvec.x, normvec.y, normvec.z), normcopy2 = new THREE.Vector3(normvec.x, normvec.y, normvec.z);;

	var numerator, denominator;
	var pdiff;

	if (mass2 != 0) {

		massi1 = 1./mass1;
		massi2 = 1./mass2;

		// numerator calculation
		hvec1.crossVectors(anglvel1, rad1);
		hvec1.add(vel1);

		hvec2.crossVectors(anglvel2, rad2);
		hvec2.add(vel2);

		hvec1.sub(hvec2);
		numerator = (1+ecoeff)*hvec1.dot(normvec);


		// numerator finished

		// denominator calculation
		var me = intens1.toArray();
		var intens4 = new THREE.Matrix4(me[0], me[3], me[6], 0., me[1], me[4], me[7], 0., me[2], me[5], me[8], 0., 0., 0., 0., 1.);
		intensi1.getInverse(intens4, true);
		me = intens2.toArray();
		var intens4 = new THREE.Matrix4(me[0], me[3], me[6], 0., me[1], me[4], me[7], 0., me[2], me[5], me[8], 0., 0., 0., 0., 1.);
		intensi2.getInverse(intens4, true);

		hvec1.crossVectors(rad1,normvec);
		hvec2.copy(hvec1);
		hvec2.applyMatrix3(intensi1);

		hvec3.crossVectors(rad2,normvec);
		hvec4.copy(hvec3);
		hvec4.applyMatrix3(intensi2);

		denominator = massi1 + massi2 + hvec1.dot(hvec2) + hvec3.dot(hvec4);
		//denominator finished

	} else {
		massi1 = 1./mass1;
		var me = intens1.toArray();
		var intens4 = new THREE.Matrix4(me[0], me[3], me[6], 0., me[1], me[4], me[7], 0., me[2], me[5], me[8], 0., 0., 0., 0., 1.);
		intensi1.getInverse(intens4, true);

		hvec1.crossVectors(anglvel1, rad1);
		hvec1.add(vel1);
		numerator = (1+ecoeff)*hvec1.dot(normvec);

		hvec1.crossVectors(rad1,normvec);
		hvec2.copy(hvec1);
		hvec2.applyMatrix3(intensi1);

		denominator = massi1 + hvec1.dot(hvec2);


	}

	// momentum transfer
	pdiff = numerator / denominator;
	if (pdiff > 0) {
		pdiff = 0.0;
		return false;
	}

	// convert to force / torque
	hvec1.multiplyScalar(-pdiff/dt);
	hvec3.multiplyScalar(pdiff/dt);
	normcopy1.multiplyScalar(-pdiff/dt);
	normcopy2.multiplyScalar(pdiff/dt);

	return [[normcopy1, hvec1], [normcopy2, hvec3]];

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
