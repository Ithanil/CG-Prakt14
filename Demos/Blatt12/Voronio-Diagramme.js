"use strict";

	var gl, canvas, zoom, phi = 0,
		theta = 0,
		aspectratio,
		PMat, MVMat, PMatLoc, MVMatLoc, NMatLoc,
		vertexAttribLoc, normalAttribLoc, shaderProgram,
		lastX, lastY, isMouseDown = false,
		trackballOn = true;

	var nToggle = false; // Toggle for n Button
	var VertexArray = new Array(); // All Vertices in one array

	var minX, minY, minZ, maxX, maxY, maxZ;
	var qNow = quat4.create([0, 0, 0, 1]);

	//List of all the Points to consider in x/y plane
	var S = ([
		0,0,0,
		1,1,0,
		-1,-1,0,
		0,1,0,
		1,0,0,
		0.5,0.5,0,
		0.2,0.1,0,
		0.3,0.6,0,
		0.9,0.9,0
	]); 
	
	// Size of the Cone in the x/y-plane Just make it big enough
	var Size = (
		[1, 1, -10]
	);

	var vertices = new Array(),
		vertexPosBufferObject, normalBufferObject, indexBufferObject;


	function webGLStart()
	{
		var vShader, fShader;

		canvas = window.document.getElementById("WebGLCanvas");
		canvas.onmousedown = mouseDown;
		canvas.onmousemove = mouseMove;
		canvas.onmouseup = mouseUp;
		canvas.addEventListener('DOMMouseScroll', mouseWheelDOM, false);
		canvas.addEventListener('mousewheel', mouseWheel, false);
		document.addEventListener('keydown', keyDown, false);

		try
		{
			gl = canvas.getContext("experimental-webgl");
		}
		catch (e)
		{}
		if (!gl)
		{
			window.alert("No webGL-Context");
		}

		shaderProgram = gl.createProgram();

		vShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vShader, document.getElementById('vshader').textContent);
		gl.compileShader(vShader);
		gl.attachShader(shaderProgram, vShader);
		fShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fShader, document.getElementById('fshader').textContent);
		gl.compileShader(fShader);
		gl.attachShader(shaderProgram, fShader);
		gl.linkProgram(shaderProgram);
		gl.useProgram(shaderProgram);

		gl.clearColor(0.9, 0.9, 0.9, 1.0);

		gl.enable(gl.DEPTH_TEST);

		/// Hier initialisieren wir unseren Vertex Buffer.
		/// NEU: Die Vertex-Daten laden wir beim Malen jedes mal neu!
		vertexPosBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBufferObject);

		/// Verbinde mit dem Shader
		vertexAttribLoc = gl.getAttribLocation(shaderProgram, "aPosCoord");
		gl.vertexAttribPointer(vertexAttribLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vertexAttribLoc);

		/// Das gleiche mit dem Index-Array!
		indexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);

		/// Und mit den Normalen
		normalBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);

		/// Verbinde mit dem Shader
		normalAttribLoc = gl.getAttribLocation(shaderProgram, "aNormal");
		gl.vertexAttribPointer(normalAttribLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(normalAttribLoc);

		PMatLoc = gl.getUniformLocation(shaderProgram, "uPMat");
		MVMatLoc = gl.getUniformLocation(shaderProgram, "uMVMat");
		NMatLoc = gl.getUniformLocation(shaderProgram, "uNMat");

		zoom = 1.0;

		resizeCanvas();

		drawScene();

	}


	/**********************************
	Neuer Mechanismus: Wir erzeugen die Geometrie immer neu
	und laden Sie in das ARRAY_BUFFER / ELEMENT_ARRAY_BUFFER, wenn wir sie zeichnen wollen.
	Um dies der Grafikkarte zu erleichtern, verwenden wir den Modul 'gl.DYNAMIC_DRAW'
	**********************************/
	
	function computeNormals(vertices) {
	var l = vertices.length/3;
	var normals = new Array();

	for(var i=0;i<l;i++) {
        var pos1 = 3*(i%l), pos2 = 3*((i+1)%l), pos3 = 3*((i+2)%l);

		var a = vec3.create([vertices[pos1+0],vertices[pos1+1],vertices[pos1+2]]);
		var b = vec3.create([vertices[pos2+0],vertices[pos2+1],vertices[pos2+2]]);
		var c = vec3.create([vertices[pos3+0],vertices[pos3+1],vertices[pos3+2]]);

		var ba = vec3.subtract(b,a);
		var ca = vec3.subtract(c,a);
		var n = vec3.cross(ba,ca);
		vec3.negate(n);
		vec3.normalize(n);
		if (i%2==1) vec3.negate(n)
		//normals = normals.concat(n);

		for(var j=0;j<3;j++) {
			normals.push(n[j]);
		}
	}

	return normals;
	}

	function computeNormals1(vertices) {
    var l = vertices.length/3;
    var normals = new Array();

    for(var i=0;i<l;i++) {
        var pos1 = 3*(i%l), pos2 = 3*((i+1)%l), pos3 = 3*((i+2)%l);

        var a = vec3.create([vertices[pos1+0],vertices[pos1+1],vertices[pos1+2]]);
        var b = vec3.create([vertices[pos2+0],vertices[pos2+1],vertices[pos2+2]]);
        var c = vec3.create([vertices[pos3+0],vertices[pos3+1],vertices[pos3+2]]);

        var ba = vec3.subtract(b,a);
        var ca = vec3.subtract(c,a);
        var n = vec3.cross(ba,ca);
        vec3.negate(n);
        vec3.normalize(n);
        if (i%2==0) vec3.negate(n)
        //normals = normals.concat(n);

        for(var j=0;j<3;j++) {
            normals.push(n[j]);
        }
    }

    return normals;
    }

	function draw_cone(p, b, slices) // p is position of cone peak
	{
		var VB = new Array(); /// Hier k"onnen die Vertices stehen
		var NB = new Array(); /// Und hier die Normalen

		///ADD YOUR CODE HERE!
		var dphi = 2*Math.PI/slices;
		var circb = [0,0,b[2]];
		var nv  = [0, 0, 0]; // nomral vector
 		var v   = [0, 0 ,0]; // velocity
		var r2 =  Math.sqrt(b[0]*b[0]+b[1]*b[1]);
		
		VB = VB.concat([0,0,0]);
		for (var phi,i=0; i <= slices;i++){
		    phi = i * dphi;
		    circb[0] = r2 * Math.cos(phi);
		    circb[1] = r2 * Math.sin(phi);

		    
		    VB = VB.concat(circb);
		}

		if (nToggle){
		    NB = computeNormals1(VB);
		}
		else{
		    NB = computeNormals(VB);
		}


        //for(var i = 0; i<VB.length; i++ ){
        //    VertexArray.push(VB[i]);
        //}
        VertexArray = VertexArray.concat(VB); // At the end it contains all vertices, for slices = 10 every 66 elements a new ring starts

		var vb = new Float32Array(VB.length); ///Oder wie auch immer ihr konvertiert!
		for (var i=0;i<VB.length;i = i+3){
			//var v=VB[i];
			vb[i]=VB[i]+p[0];
			vb[i+1]=VB[i+1]+p[1];
			vb[i+2]=VB[i+2]+p[2];
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, vb, gl.DYNAMIC_DRAW);

		gl.enableVertexAttribArray(normalAttribLoc); ///Wichtig, wenn wir Normalen verwenden!
		var nb = new Float32Array(NB); ///Oder wie auch immer ihr konvertiert!
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, nb, gl.DYNAMIC_DRAW);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, vb.length/3);
	}

	function draw_line()
	{

		///Konvertiere in lesbares Array!
		var vb = new Float32Array(L.length*3);
		for (var i=0;i<L.length;i++)
			{
				var v = L[i];
				vb[3*i  ] = v[0];
				vb[3*i+1] = v[1];
				vb[3*i+2] = v[2];
			}

		gl.lineWidth(3.0);
		gl.disableVertexAttribArray(normalAttribLoc); ///Wichtig, wenn wir auf Normalen verzichten!
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, vb, gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.LINE_STRIP, 0, vb.length / 3);
	}
	
	function draw_points() 
	{
		var vb = new Float32Array(S.length);
		for (var i=0;i<S.length;i=i+3 ){
			vb[i] = S[i];
			vb[i+1] = S[i+1];
			vb[i+2] = S[i+2];
			
		}
		gl.disableVertexAttribArray(normalAttribLoc); ///Wichtig, wenn wir auf Normalen verzichten!
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, vb, gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.POINTS, 0, vb.length / 3);
	}

	function drawScene() //This is the Line you can allwaysF see
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		PMat = new mat4.create();
		mat4.identity(PMat);
		if (aspectratio > 1.0) mat4.ortho(-aspectratio, aspectratio, -1, 1, -10, 10, PMat);
		else mat4.ortho(-1, 1, -aspectratio, aspectratio, -10, 10, PMat);
		gl.uniformMatrix4fv(PMatLoc, false, PMat);

		MVMat = new mat4.create();
		mat4.identity(MVMat);
		/*if (trackballOn)
		{
			var R = new mat4.create();
			quat4.toMat4(qNow, R);
			mat4.multiply(MVMat, R);
		}
		else
		{*/
			mat4.rotateX(MVMat, theta * Math.PI / 180);
			mat4.rotateY(MVMat, phi * Math.PI / 180);
		//}
		mat4.scale(MVMat, [zoom, zoom, zoom]);

		var NMat = new mat3.create();
		mat4.toInverseMat3(MVMat, NMat);
		mat3.transpose(NMat, NMat);

		gl.uniformMatrix4fv(PMatLoc, false, PMat);
		gl.uniformMatrix4fv(MVMatLoc, false, MVMat);
		gl.uniformMatrix3fv(NMatLoc, false, NMat);

		
		//draw_cone(L1[1], L[1], 50); //Change number of Triangles per cone here
		//draw_line();
		var P = new Array(3)
		for (var i=0; i<S.length; i=i+3){
			P[0] = S[i];
			P[1] = S[i+1];
			P[2] = S[i+2];
			draw_cone(P,Size,50);
		}
		draw_points();
	}

	function trackball(u, v)
	{
		var uxv = vec3.create();
		vec3.cross(u, v, uxv);
		var d = vec3.dot(u, v);
		return quat4.create([uxv[0], uxv[1], uxv[2], 1.0 + d]);
	}

	function mouseToTrackball(x, y)
	{
		var v = new MatrixArray(3);

		if (canvas.width > canvas.height)
		{
			v[0] = (2.0 * x - canvas.width) / canvas.height;
			v[1] = 1.0 - y * 2.0 / canvas.height;
		}
		else
		{
			v[0] = (2.0 * x - canvas.width) / canvas.width;
			v[1] = (canvas.height - 2.0 * y) / canvas.width;
		}
		var d = v[0] * v[0] + v[1] * v[1];
		if (d > 1.0)
		{
			v[2] = 0.0;
			v[0] /= Math.sqrt(d);
			v[1] /= Math.sqrt(d);
		}
		else v[2] = Math.sqrt(1.0 - d * d);

		return v;
	}

	function mouseWheelDOM(event)
	{
		if (event.detail > 0) zoom *= 1.05;
		else zoom /= 1.05;
		drawScene();
	}

	function mouseWheel(event)
	{
		if (event.wheelDelta < 0) zoom *= 1.05;
		else zoom /= 1.05;
		drawScene();
	}

	function mouseDown(event)
	{
		isMouseDown = true;
		lastX = event.clientX;
		lastY = event.clientY;
	}

	function mouseUp(event)
	{
		isMouseDown = false;
	}

	function mouseMove(event)
	{
		if (!isMouseDown) return;

		var p1 = mouseToTrackball(lastX, lastY);
		var p2 = mouseToTrackball(event.clientX, event.clientY);

		/*if (trackballOn)
		{
			var q = trackball(p1, p2);
			quat4.multiply(q, qNow, qNow);
			quat4.normalize(qNow);
		}
		else
		{*/
			phi += (event.clientX - lastX) / 5;
			theta += (event.clientY - lastY) / 5;
		//}

		lastX = event.clientX;
		lastY = event.clientY;

		drawScene();
	}


	function keyDown(event) {
		switch(event.keyCode) {
			case 78: nToggle = !nToggle; //Taste N
		}
		drawScene();
	}

	function resizeCanvas()
	{
		if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight)
		{
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
		}
		aspectratio = canvas.width / canvas.height;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		drawScene();
	}

window.addEventListener('load', webGLStart);
window.addEventListener('resize', resizeCanvas);
