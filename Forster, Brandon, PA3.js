//Brandon Forster
//CAP 4720- Practice Assignment 3
//10 September 2013

// Vertex shader program
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
var FSHADER_SOURCE =
  'varying lowp vec3 fcolor;'+
  'void main() {\n' +
  '  gl_FragColor = vec4(fcolor,1.0);\n' +
  '}\n';
 

function main()
{
	// Retrieve the canvas
	var canvas = document.getElementById('webgl');

	// Get the rendering context
	var gl= getWebGLContext(canvas);
	if (!gl)
	{
		console.log('Failed to initialize WebGL');
		return;
	}
	
	// 1. Create vertex shader , attach the source and compile
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, VSHADER_SOURCE);
	gl.compileShader(vertexShader);
	
	// 2. Create fragment shader, attach the source and compile
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, FSHADER_SOURCE);
	gl.compileShader(fragmentShader);
	
	// 3. Create shader program, attach the shaders and link
	var program= gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	function Drawable(vArrays, nVertices, drawMode)
	{
	  // Create a buffer object
	  var vertexBuffers=[];
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
		  else vertexBuffers[i]=null;
	  }
	  this.draw = function (attribLocations){
		for (var i=0; i<nAttributes; i++){
		  if (vertexBuffers[i]){
			  // Bind the buffer object to target
			  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
			  // Assign the buffer object to a_Position variable
			  gl.vertexAttribPointer(attribLocations[i], nElements[i], gl.FLOAT, false, 0, 0);
		  }
		}
		gl.drawArrays(drawMode, 0, nVertices);
	  }
	}

	gl.enable(gl.DEPTH_TEST);
		
	// Get the location/address of the vertex attribute inside the shader program.
	var a_Position = gl.getAttribLocation(program, 'position');		  
	gl.enableVertexAttribArray(a_Position); 
	var a_Color = gl.getAttribLocation(program, 'color');
	var aLocations = [a_Position, a_Color];

	// Get the location/address of the uniform variable inside the shader program.
	var mLoc = gl.getUniformLocation(program,"modelT");
	var angle = 0;
	function draw()
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		var m = new Matrix4() // Default matrix is an identity matrix.
					
		gl.disableVertexAttribArray(a_Color); // Color attribute location is disabled for array input for next drawing
		gl.vertexAttrib3f(a_Color,1,1,1); // the shader will get a constant white color for all the vertices now.
		gl.uniformMatrix4fv(mLoc, false, m.elements);
		gl.enableVertexAttribArray(a_Color); // Color attribute location is enabled for all subsequent drawing.
		
		m.setRotate(angle, 10,10,1);	
		gl.uniformMatrix4fv(mLoc, false, m.elements);
		
		//TODO what to draw lives here

		angle++;
		
		if (angle > 360) angle -= 360;	
		window.requestAnimationFrame(draw);
	}

	gl.clearColor(0,0,0,1);
	gl.useProgram(program);

	draw();
	
}