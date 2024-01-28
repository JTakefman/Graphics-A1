#version 300 es
// ==========================================================================
// $Id: tetrahedron_skel.vs,v 1.1 2019/02/14 04:21:52 jlang Exp $
// Basic colored tetrahedron rendering
// ===================================================================
// (C)opyright:
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
// $Log: tetrahedron_skel.vs,v $
// Revision 1.1  2019/02/14 04:21:52  jlang
// Replaced cuon_matrix with glMatrix.
// Created starter code.
//
// Revision 1.1  2019/02/14 02:43:09  jlang
// Solution to lab 4.
//
// ==========================================================================


uniform mat4 mvp_matrix;


layout (location=0) in vec4 a_vertex;
layout (location=1) in vec3 a_color;
out vec3 v_color;

void main() {
  // map the vertex position into normalized device coordinates
  gl_Position = mvp_matrix * a_vertex;

  // Pass on the color to the fragment shader
  v_color = a_color;
}
