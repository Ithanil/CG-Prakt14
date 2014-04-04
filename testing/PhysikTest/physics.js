"use strict";

function integrate(physobjs, nobj, dt)
{
	accs = getAccs(physobjs, nobj)

	//accs = [[ [0., 0., 0. ], [0., 0., 0.]], ...]

	for (var i = 0; i < nobj; i++) 
	{
		physobjs[i].position = vec3.add(physobjs[i].position,physobjs[i].velocity)
	}
	return physobjs;
}

function getAccs(physobjs, nobj)
{
	return accs;
}