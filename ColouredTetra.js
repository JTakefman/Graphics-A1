// ==========================================================================
// $Id: ColouredTetra_skel.js,v 1.1 2019/02/14 04:21:52 jlang Exp $
// Texturing of a tetrahedron example based on OpenGL Programming guide
// by Matsuda and Lea, 2013
// ==========================================================================
// (C)opyright:
//
//   This code is heavily based on the WebGL Programming
//   Guide by Kouichi Matsuda and Rodger Lea and is their copyright.
//   See https://sites.google.com/site/webglbook/
//
//   The code posted is re-used with the generours permission by the authors.
//
//   Jochen Lang
//   EECS, University of Ottawa
//   800 King Edward Ave.
//   Ottawa, On., K1N 6N5
//   Canada.
//   http://www.eecs.uottawa.ca
//
// Creator: jlang (Jochen Lang)
// Email:   jlang@eecs.uottawa.ca
// ==========================================================================
// $Log: ColouredTetra_skel.js,v $
// Revision 1.1  2019/02/14 04:21:52  jlang
// Replaced cuon_matrix with glMatrix.
// Created starter code.
//
// Revision 1.1  2019/02/14 02:43:09  jlang
// Solution to lab 4.
//
// ==========================================================================
// Based on (c) 2012 matsuda
// HelloTriangle.js
// Loadshaderfromfiles.js
// RotateTriangles_withButtons.js
// LookAtTrianglesWithKeys.js
// TexturedQuad.js
// Vertex shader program
var VSHADER_SOURCE = null;
// Fragment shader program
var FSHADER_SOURCE = null;



// Rotation speed (degrees/second)
var SPEED;

// Initialize time of last rotation update
var LAST_FRAME = Date.now();
var VAO;
var VAO2;

var n = 18;
var n2 = 18;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
 setDefault(); // set global variables to default

  // Read shader from file
  readShaderFile(gl, 'shader/tetrahedron_skel.vs', 'v');
  readShaderFile(gl, 'shader/tetrahedron.fs', 'f');
}


// Read shader from file
function readShaderFile(gl, fileName, shader) {
    var request = new XMLHttpRequest();
    request.open('GET', fileName , true);


  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status !== 404) {
	onReadShader(gl, request.responseText, shader);
  }
  }
  // Create a request to acquire the file

  request.send();                      // Send the request
}


// The shader is loaded from file
function onReadShader(gl, fileString, shader) {
  if (shader == 'v') { // Vertex shader
    VSHADER_SOURCE = fileString;
  } else
  if (shader == 'f') { // Fragment shader
    FSHADER_SOURCE = fileString;
  }
  // When both are available, call start().
  if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl);
}


function start(gl) {

  // Initialize shaders - string now available
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  // Must enable depth test for proper 3D display
  gl.enable(gl.DEPTH_TEST);
  // Set clear color - state info	
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Specify the mvp_matrix as a uniform
  // get the storage location of mvp_matrix
  var u_mvp_matrix = gl.getUniformLocation(gl.program, 'mvp_matrix');
  if (!u_mvp_matrix) {
    console.log('Failed to get the storage location of mvp_matrix');
    return;
  }

  // Create the matrix to set the projection matrix
  var projMatrix = glMatrix.mat4.create();
  glMatrix.mat4.ortho(projMatrix,-5, 5, -5, 5, -5, 5.0);

  // Current axis angle
  var axisAngle = 0.0;
  // Current rotation angle
  var currentAngle = 0.0;

  // Register the event handler to be called on key press
  document.onkeydown = function(ev){
    keydown(ev, gl, n, currentAngle, projMatrix, u_mvp_matrix)};

  // Register the animation callback
  var tick = function() {

    var now = Date.now();
    var elapsed = now - LAST_FRAME;
    currentAngle = animate(currentAngle, SPEED, elapsed );  // Update the rotation angle
    axisAngle = animate(axisAngle, SPEED/7.0, elapsed );  // Update the axis angle
    LAST_FRAME = now;
    draw(gl, n, n2, currentAngle, projMatrix, u_mvp_matrix); // Draw the triangle
    requestAnimationFrame(tick);   // Request that the browser calls tick
  };
  tick();
}


function initVertexBuffers(gl, vertices, vertices2) {
  // Store vertices and color cords interleaved
  // 0 -- 2 -- 0
  // |  / |  / |
  // | /  | /  |
  // 1 -- 3 -- 1

  VAO = gl.createVertexArray();
  gl.bindVertexArray(VAO);

  var fsize = vertices.BYTES_PER_ELEMENT;

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_vertex = gl.getAttribLocation(gl.program, 'a_vertex');
  if (a_vertex < 0) {
    console.log('Failed to get the storage location of a_vertex');
    return -1;
  }
  // 6 entries per vertex: x y z r g b
  gl.vertexAttribPointer(a_vertex, 3, gl.FLOAT, false, 6*fsize,  fsize * 0);
  gl.enableVertexAttribArray(a_vertex);

  // Todo: Get the storage location of a_color, assign buffer and enable

  var a_color = gl.getAttribLocation(gl.program, 'a_color');
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 6*fsize,  fsize * 3);
  gl.enableVertexAttribArray(a_color);

  gl.bindVertexArray(null);


  VAO2 = gl.createVertexArray();
  gl.bindVertexArray(VAO2);

  var fsize = vertices.BYTES_PER_ELEMENT;

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices2, gl.STATIC_DRAW);

  var a_vertex = gl.getAttribLocation(gl.program, 'a_vertex');
  if (a_vertex < 0) {
    console.log('Failed to get the storage location of a_vertex');
    return -1;
  }
  // 6 entries per vertex: x y z r g b
  gl.vertexAttribPointer(a_vertex, 3, gl.FLOAT, false, 6*fsize,  fsize * 0);
  gl.enableVertexAttribArray(a_vertex);

  // Todo: Get the storage location of a_color, assign buffer and enable

  var a_color = gl.getAttribLocation(gl.program, 'a_color');
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 6*fsize,  fsize * 3);
  gl.enableVertexAttribArray(a_color);

  return 0;
}


function draw(gl, n, n2, currentAngle, projMatrix, u_mvp_matrix) {
  // Combine model and projection matrix in js -- could also multiply in shader
  // View matrix is still identity
  var mvpMatrix = glMatrix.mat4.clone(projMatrix);
  // Set the rotation matrix
  //glMatrix.mat4.rotateY(mvpMatrix, mvpMatrix, glMatrix.glMatrix.toRadian(axisAngle));
 

  // Pass the mvp matrix to the vertex shader
  gl.uniformMatrix4fv(u_mvp_matrix, false, mvpMatrix );

  // Clear <canvas> - both color and depth
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var vertices = new Float32Array([
    //Build base
    -1,-1,1, 1, 1, 1, // top left
    1,-1,1, 1, 1, 1, // top right
    1,-1,-1, 1, 1, 1, // bottom right
    //
    1,-1,-1, 1, 1, 1, // bottom right
    -1,-1,1, 1, 1, 1, // top left
    -1,-1,-1, 1, 1, 1, // bottomleft
    //Connect high
    -1,-1,-1, 1, 0, 0, // bottomleft
    -1,-1,1, 1, 0, 0, // top left
    0,1,0,1,0,0, //high
    //
    0,1,0,0,1,0, //high
    -1,-1,1, 0, 1, 0, // top left
    1,-1,1, 0, 1, 0, // top right
    //
    0,1,0,0,0,1, //high
    -1,-1,-1, 0, 0, 1, // bottomleft
    1,-1,-1, 0, 0, 1, // bottom right
    //
    0,1,0,1,0,1, //high
    1,-1,-1, 1, 0, 1, // bottom right
    1,-1,1, 1, 0, 1, // top right
  ]);

  //Cat vertices
  var vertices2 = new Float32Array([
    3,3,3, 1, 0.5, 0, //Bottom Face
    2,1,3, 1, 0.5, 0, // 
    4,1,3, 1, 0.5, 0, // 
    //
    3,3,3, 1, 0.5, 0, //Left Face
    2,1,3, 1, 0.5, 0, // 
    1,3,3, 1, 0.5, 0, // 
    //
    3,3,3, 1, 0.5, 0, //Right Face
    5,3,3, 1, 0.5, 0, // 
    4,1,3, 1, 0.5, 0, // 
    //
    2,5, 3, 1, 1, 1, //Left Ear
    1, 3, 3, 1, 1, 1, // 
    3, 3, 3, 1, 1, 1, // 
    //
    2,5, 3, 1, 1, 1, //Right Ear
    1, 3, 3, 1, 1, 1, // 
    3, 3, 3, 1, 1, 1, // 
    4,5, 3, 1, 1, 1, //Left Ear
    3, 3, 3, 1, 1, 1, // 
    5, 3, 3, 1, 1, 1, // 
  ]);


  initVertexBuffers(gl, vertices, vertices2);
   
  var pyramidvec = glMatrix.vec3.fromValues(0,1,0);

  var rotateMatrix = glMatrix.mat4.create();
  var u_rotate_matrix = gl.getUniformLocation(gl.program, 'model_rotate');
  glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, glMatrix.glMatrix.toRadian(currentAngle), pyramidvec);
  gl.uniformMatrix4fv(u_rotate_matrix, false, rotateMatrix);

  gl.bindVertexArray(VAO);
  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n);

  var catvec = glMatrix.vec3.fromValues(1,1,0);
  var rotateMatrix = glMatrix.mat4.create();
  var u_rotate_matrix = gl.getUniformLocation(gl.program, 'model_rotate');
  glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, glMatrix.glMatrix.toRadian(currentAngle), catvec);
  gl.uniformMatrix4fv(u_rotate_matrix, false, rotateMatrix);


  
  gl.bindVertexArray(VAO2);
  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n2);
}


// Make a time based animation to keep things smooth
// Initialize global variable
function animate(angle,speed,elapsed) {
  // Calculate the elapsed time
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (speed * elapsed) / 1000.0;
  return newAngle %= 360;
}

function keydown(ev, n, gl, currentAngle, projMatrix, u_mvp_matrix) {
  switch(ev.keyCode) {
  case 38: // up arrow key
    SPEED += 2.0;
    break;
  case 40: // down arrow key
    SPEED -= 2.0;
    break;
  }
  draw(gl, n, n2, currentAngle, projMatrix, u_mvp_matrix);
}

function setDefault() {
  SPEED = 20.0;
}

function faster() {
  SPEED += 2;
}

function slower() {
  SPEED -= 2;
}
