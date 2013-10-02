// Brandon Forster
// CAP 4720- Practice Assignment 4
// 1 October 2013

var buttonState = 0;
var fov= 32;
var npd= .1;
var fpd= 3;

function onPress()
{	
	buttonState++;
	if (buttonState > 2)
	{
		buttonState = 0;
	}
}

function updateFOV(value)
{
	this.fov= value;
}

function updateNPD(value)
{
	this.npd= value;
	//camera.setNear(value);
}

function updateFPD(value)
{
	this.fpd= value;
	//camera.setFar(value);
}

function main(){
	// Globals
	var canvas = null;
	var gl = null;
	var messageField = null;
	function addMessage(message){
		console.log(message);
	}
	canvas = document.getElementById("webgl");
	addMessage(((canvas)?"Canvas acquired":"Error: Can not acquire canvas"));
	gl = getWebGLContext(canvas);
	
	function RenderableModel(model){
		function Drawable(vArrays, nVertices, drawMode, indexArray){
		  // Create a buffer object
		  var vertexBuffers=[];
		  var attributesEnabled=[];
		  var nElements=[];
		  var nAttributes = vArrays.length;
		  for (var i=0; i<nAttributes; i++){
			  if (vArrays[i]){
				  vertexBuffers[i] = gl.createBuffer();
				  if (!vertexBuffers[i]) {
					addMessage('Failed to create the buffer object');
					return null;
				  }
				  // Bind the buffer object to an ARRAY_BUFFER target
				  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
				  // Write date into the buffer object
				  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vArrays[i]), gl.STATIC_DRAW);
				  nElements[i] = vArrays[i].length/nVertices;
			  }
			  else{
				vertexBuffers[i]=null;
				attributesEnabled[i]=true;
			  }
		  }
		  var indexBuffer=null;
		  if (indexArray){
			indexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
		  }
		  
		  this.draw = function (attribLocations){
			for (var i=0; i<nAttributes; i++){
			  if (vertexBuffers[i]){
				  if (!attributesEnabled[i]){
					gl.enableVertexAttribArray(attribLocations[i]);
					attributesEnabled[i]=true;
				  }
				  // Bind the buffer object to target
				  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
				  // Assign the buffer object to a_Position variable
				  gl.vertexAttribPointer(attribLocations[i], nElements[i], gl.FLOAT, false, 0, 0);
			  }
			  else{
				  if (attributesEnabled[i]){
				    gl.disableVertexAttribArray(attribLocations[i]); 
					attributesEnabled[i]=false;
				  }
			  }
			}
			if (indexBuffer){
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
				gl.drawElements(drawMode, indexArray.length, gl.UNSIGNED_SHORT, 0);
			}
			else gl.drawArrays(drawMode, 0, nVertices);
		  }
		}
		var VSHADER_SOURCE =
		  'attribute vec3 position;\n' +
		  'attribute vec3 color;\n' +
		  'uniform mat4 modelT, viewT, projT;'+
		  'varying vec3 fcolor;'+
		  'void main() {\n' +
		  '  gl_Position = projT*viewT*modelT*vec4(position,1.0);\n' +
		  '  fcolor = color;'+
		  '}\n';

		// Fragment shader program
		var FSHADER_SOURCE =
		  'varying lowp vec3 fcolor;'+
		  'void main() {\n' +
		  '  gl_FragColor = vec4(gl_FragCoord.z,gl_FragCoord.z,gl_FragCoord.z,1.0);\n' +
		  '}\n';
		var program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
		if (!program) {
			addMessage('Failed to create program');
			return false;
		}
		else addMessage('Shader Program was successfully created.');
		var a_Position = gl.getAttribLocation(program, 'position');		  
		var a_Color = gl.getAttribLocation(program, 'color');
		var a_Locations = [a_Position,a_Color];
		
		// Get the location/address of the uniform variable inside the shader program.
		var mmLoc = gl.getUniformLocation(program,"modelT");
		var vmLoc = gl.getUniformLocation(program,"viewT");
		var pmLoc = gl.getUniformLocation(program,"projT");
		
		var drawables=[];
		var modelTransformations=[];
		var nDrawables=0;
		var nNodes = (model.nodes)?model.nodes.length:1;
		for (var i= 0; i<nNodes; i++){
			var nMeshes = (model.nodes)?(model.nodes[i].meshIndices.length):(model.meshes.length);
			for (var j=0; j<nMeshes;j++){
				var index = (model.nodes)?model.nodes[i].meshIndices[j]:j;
				var mesh = model.meshes[index];
				drawables[nDrawables] = new Drawable(
					[mesh.vertexPositions, mesh.vertexColors],
					mesh.vertexPositions.length/3, gl.TRIANGLES,
					mesh.indices
				);
				var m = new Matrix4();
				if (model.nodes)m.elements=new Float32Array(model.nodes[i].modelMatrix);
				modelTransformations[nDrawables] = m;
				nDrawables++;
			}
		}
		// Get the location/address of the vertex attribute inside the shader program.
		this.draw = function (pMatrix,vMatrix)
		{
			gl.useProgram(program);
			gl.uniformMatrix4fv(pmLoc, false, pMatrix.elements);
			gl.uniformMatrix4fv(vmLoc, false, vMatrix.elements);
			for (var i= 0; i<nDrawables; i++){
				var mMatrix=modelTransformations[i];
				gl.uniformMatrix4fv(mmLoc, false, mMatrix.elements);
				drawables[i].draw(a_Locations);
			}
		}
		this.getBounds=function() // Computes Model bounding box
		{		
			var xmin, xmax, ymin, ymax, zmin, zmax;
			var firstvertex = true;
			var nNodes = (model.nodes)?model.nodes.length:1;
			for (var k=0; k<nNodes; k++){
				var m = new Matrix4();
				if (model.nodes)m.elements=new Float32Array(model.nodes[k].modelMatrix);
				var nMeshes = (model.nodes)?model.nodes[k].meshIndices.length:model.meshes.length;
				for (var n = 0; n < nMeshes; n++){
					var index = (model.nodes)?model.nodes[k].meshIndices[n]:n;
					var mesh = model.meshes[index];
					for(var i=0;i<mesh.vertexPositions.length; i+=3){
						var vertex = m.multiplyVector4(new Vector4([mesh.vertexPositions[i],mesh.vertexPositions[i+1],mesh.vertexPositions[i+2],1])).elements;
						if (firstvertex){
							xmin = xmax = vertex[0];
							ymin = ymax = vertex[1];
							zmin = zmax = vertex[2];
							firstvertex = false;
						}
						else{
							if (vertex[0] < xmin) xmin = vertex[0];
							else if (vertex[0] > xmax) xmax = vertex[0];
							if (vertex[1] < ymin) ymin = vertex[1];
							else if (vertex[1] > ymax) ymax = vertex[1];
							if (vertex[2] < zmin) zmin = vertex[2];
							else if (vertex[2] > zmax) zmax = vertex[2];
						}
					}
				}
			}
			var dim= {};
			dim.min = [xmin,ymin,zmin];
			dim.max = [xmax,ymax,zmax];
			return dim;
		}
	}

	function Camera(d,modelUp) // Compute a camera from model's bounding box dimensions
	{
		var center = [(d.min[0]+d.max[0])/2,(d.min[1]+d.max[1])/2,(d.min[2]+d.max[2])/2];
		var diagonal = Math.sqrt(Math.pow((d.max[0]-d.min[0]),2)+Math.pow((d.max[1]-d.min[1]),2)+Math.pow((d.max[2]-d.min[2]),2));
		
		var name = "auto";
		var at = center;
		var eye = [center[0], center[1]+diagonal*0.5, center[2]+diagonal*1.5];
		var up = [modelUp[0],modelUp[1],modelUp[2]];
		//@TODO is this what I need to change?
		var near = diagonal*npd;
		var far = diagonal*fpd;
		var FOV = fov;

		this.getRotatedCameraPosition= function(angle){
			var m = new Matrix4().setTranslate(at[0],at[1],at[2]).rotate(angle,up[0],up[1],up[2]).translate(-at[0],-at[1],-at[2]);
			var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
			return [e[0],e[1],e[2]];
		};
		this.getViewMatrix=function(e){
			if (e==undefined) e = eye;
			return new Matrix4().setLookAt(e[0],e[1],e[2],at[0],at[1],at[2],up[0],up[1],up[2]);
		}
		this.getRotatedViewMatrix=function(angle){
			return this.getViewMatrix(this.getRotatedCameraPosition(angle));
		}
		this.getNear=function(){
			return near;
		}
		this.setNear=function(value){
			near= diagonal*value;
		}
		this.getFar=function(){
			return far;
		}
		this.setFar=function(value){
			far= diagonal*value;
		}
		this.getFOV=function(){
			return fov;
		}
		this.getProjMatrix=function(){
			return new Matrix4().setPerspective(FOV, gl.canvas.width / gl.canvas.height, near , far);
		};
	}
	
	var angle=0;
		
	function draw(){
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		
		switch (buttonState)
		{
		case 0:
			camera 	= skullCamera;
			model 	= skullModel;
			break;
		case 1:
			camera 	= teapotCamera;
			model 	= teapotModel;
			break;
		case 2:
			camera 	= cubeCamera;
			model 	= cubeModel;
			break;
		}
		
		camera.setNear(npd);
		camera.setFar(fpd);
		
		var projMatrix = new Matrix4().setPerspective(camera.getFOV(), gl.canvas.width / gl.canvas.height, camera.getNear() , camera.getFar());
		var viewMatrix = camera.getRotatedViewMatrix(angle);
		
		model.draw(projMatrix, viewMatrix);
		
		angle++; if (angle > 360) angle -= 360;
		
		var wireCube = new Drawable(
		[[// front face
		  0.5, 0.5, 0.5,   	-0.5, 0.5, 0.5,		// v0, v1
		  -0.5, 0.5, 0.5,	-0.5,-0.5, 0.5,		// v1, v2
		  -0.5,-0.5, 0.5,	0.5,-0.5, 0.5,		// v2, v3
		  0.5,-0.5, 0.5,	0.5, 0.5, 0.5,		// v3, v0
		  // right face
		  0.5, 0.5, 0.5,    0.5, 0.5,-0.5,		// v0, v5
		  0.5, 0.5,-0.5,	0.5,-0.5,-0.5,		// v5, v4
		  0.5,-0.5,-0.5,	0.5,-0.5, 0.5,		// v4, v3
		  //back face
		  0.5,-0.5,-0.5,	-0.5,-0.5,-0.5,		// v4, v7
		  -0.5,-0.5,-0.5,	-0.5, 0.5,-0.5,		// v7, v6
		  -0.5, 0.5,-0.5,	0.5, 0.5,-0.5,		// v6, v5
		  //left face
		  -0.5, 0.5,-0.5,	-0.5, 0.5, 0.5,		// v6, v1
		  -0.5,-0.5, 0.5,	-0.5,-0.5,-0.5,		// v2, v7
		 ],
		[// Front face
		  1.0, 0.0, 0.0, 1.0,	1.0, 0.0, 0.0, 1.0,
		  1.0, 0.0, 0.0, 1.0,	1.0, 0.0, 0.0, 1.0,	
		  // right face
          1.0, 1.0, 0.0, 1.0,	1.0, 1.0, 0.0, 1.0,	
		  1.0, 1.0, 0.0, 1.0,	1.0, 1.0, 0.0, 1.0,	
		  // back face
          0.0, 1.0, 0.0, 1.0,	0.0, 1.0, 0.0, 1.0,	
		  0.0, 1.0, 0.0, 1.0,	0.0, 1.0, 0.0, 1.0,		
		  // left face
          1.0, 0.5, 0.5, 1.0,	1.0, 0.5, 0.5, 1.0,	 
		  1.0, 0.5, 0.5, 1.0,	1.0, 0.5, 0.5, 1.0,		
		  // top face
          1.0, 0.0, 1.0, 1.0,	1.0, 0.0, 1.0, 1.0,	     
		  1.0, 0.0, 1.0, 1.0,	1.0, 0.0, 1.0, 1.0,		 
		  // bottom face
          0.0, 0.0, 1.0, 1.0,   0.0, 0.0, 1.0, 1.0,		
		  0.0, 0.0, 1.0, 1.0,   0.0, 0.0, 1.0, 1.0,		
		]],
		24, graphgl.LINES);
		
		// Get the location/address of the vertex attribute inside the shader program.
		var a_Position = graphgl.getAttribLocation(program, 'position');		  
		graphgl.enableVertexAttribArray(a_Position); 
		var a_Color = graphgl.getAttribLocation(program, 'color');
		var aLocations = [a_Position, a_Color];

		// Get the location/address of the uniform variable inside the shader program.
		var mLoc = graphgl.getUniformLocation(program,"modelT");
		
		graphgl.clear(graphgl.COLOR_BUFFER_BIT | graphgl.DEPTH_BUFFER_BIT);
		
		var m = new Matrix4() // Default matrix is an identity matrix.
					
		graphgl.disableVertexAttribArray(a_Color); // Color attribute location is disabled for array input for next drawing
		graphgl.vertexAttrib3f(a_Color,1,1,1); // the shader will get a constant white color for all the vertices now.
		graphgl.uniformMatrix4fv(mLoc, false, m.elements);
		graphgl.enableVertexAttribArray(a_Color); // Color attribute location is enabled for all subsequent drawing.
		
		m.setRotate(angle, 10,10,1);	
		graphgl.uniformMatrix4fv(mLoc, false, m.elements);
		
		wireCube.draw(aLocations);
		
		window.requestAnimationFrame(draw);
	}
	
	var VSHADER_SOURCE =
	  'attribute vec3 position;\n' +
	  'attribute vec3 color;\n' +
	  'uniform mat4 modelT;'+
	  'varying vec3 fcolor;'+
	  'void main() {\n' +
	  '  gl_Position = modelT*vec4(position,1.0);\n' +
	  '  fcolor = color;'+
	  '}\n';

	// Fragment shader program
	var gFSHADER_SOURCE =
	  'varying lowp vec3 fcolor;'+
	  'void main() {\n' +
	  '  gl_FragColor = vec4(fcolor,1.0);\n' +
	  '}\n';

	  // Retrieve the canvas
	var graph = document.getElementById('graph');

	// Get the rendering context
	var graphgl= getWebGLContext(graph);
	if (!graphgl)
	{
		console.log('Failed to initialize WebGL');
		return;
	}
	
	// 1. Create vertex shader , attach the source and compile
	var vertexShader = graphgl.createShader(graphgl.VERTEX_SHADER);
	graphgl.shaderSource(vertexShader, VSHADER_SOURCE);
	graphgl.compileShader(vertexShader);
	
	// 2. Create fragment shader, attach the source and compile
	var fragmentShader = graphgl.createShader(graphgl.FRAGMENT_SHADER);
	graphgl.shaderSource(fragmentShader, gFSHADER_SOURCE);
	graphgl.compileShader(fragmentShader);
	
	// 3. Create shader program, attach the shaders and link
	var program= graphgl.createProgram();
	graphgl.attachShader(program, vertexShader);
	graphgl.attachShader(program, fragmentShader);
	graphgl.linkProgram(program);
	
	function Drawable(vArrays, nVertices, drawMode)
	{
	  // Create a buffer object
	  var vertexBuffers=[];
	  var nElements=[];
	  var nAttributes = vArrays.length;
	  for (var i=0; i<nAttributes; i++){
		  if (vArrays[i]){
			  vertexBuffers[i] = graphgl.createBuffer();
			  if (!vertexBuffers[i]) {
				addMessage('Failed to create the buffer object');
				return null;
			  }
			  // Bind the buffer object to an ARRAY_BUFFER target
			  graphgl.bindBuffer(graphgl.ARRAY_BUFFER, vertexBuffers[i]);
			  // Write date into the buffer object
			  graphgl.bufferData(graphgl.ARRAY_BUFFER, new Float32Array(vArrays[i]), graphgl.STATIC_DRAW);
			  nElements[i] = vArrays[i].length/nVertices;
		  }
		  else vertexBuffers[i]=null;
	  }
	  this.draw = function (attribLocations){
		for (var i=0; i<nAttributes; i++){
		  if (vertexBuffers[i]){
			  // Bind the buffer object to target
			  graphgl.bindBuffer(graphgl.ARRAY_BUFFER, vertexBuffers[i]);
			  // Assign the buffer object to a_Position variable
			  graphgl.vertexAttribPointer(attribLocations[i], nElements[i], graphgl.FLOAT, false, 0, 0);
		  }
		}
		graphgl.drawArrays(drawMode, 0, nVertices);
	  }
	}

	graphgl.enable(graphgl.DEPTH_TEST);
	
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	
		// Get the location/address of the vertex attribute inside the shader program.
	var a_Position = graphgl.getAttribLocation(program, 'position');		  
	graphgl.enableVertexAttribArray(a_Position); 
	var a_Color = graphgl.getAttribLocation(program, 'color');
	var aLocations = [a_Position, a_Color];

	// Get the location/address of the uniform variable inside the shader program.
	var mLoc = graphgl.getUniformLocation(program,"modelT");
	var angle = 0;

	graphgl.clearColor(0,0,0,1);
	graphgl.useProgram(program);
	
	var skullModel = 	new RenderableModel(skullObject);
	var skullCamera =	new Camera(skullModel.getBounds(),[0,1,0]);
	
	var teapotModel = 	new RenderableModel(teapotObject);
	var teapotCamera = 	new Camera(teapotModel.getBounds(),[0,1,0]);
	
	var cubeModel = 	new RenderableModel(cubeObject);
	var cubeCamera = 	new Camera(cubeModel.getBounds(),[0,1,0]);

	draw();
	return 1;
}
