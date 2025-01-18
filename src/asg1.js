// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_chosen_color = [1.0, 1.0, 1.0, 1.0];
let g_chosen_size = 5;
let g_chosen_type = POINT;
let g_chosen_segments = 12;
let stored_color = [0.0, 0.0, 0.0, 0.0];
let rainbow = false;
let hue_step = 1.0007;

var rainbowText = document.getElementById('toggleText');

function addActionsForHtmlUI() {
  // Clear button event
  document.getElementById('clearButton').onclick = function() {clear()};

  // Draw image event
  document.getElementById('imageButton').onclick = function() {drawImage()}

  // Drawing mode events
  document.getElementById('pointButton').onclick = function() {g_chosen_type = POINT};
  document.getElementById('triangleButton').onclick = function() {g_chosen_type = TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_chosen_type = CIRCLE};

  // Color slider events
  document.getElementById('redSlide').addEventListener('mouseup',    function() {g_chosen_color[0] = this.value/100; previewPanel()});
  document.getElementById('greenSlide').addEventListener('mouseup',  function() {g_chosen_color[1] = this.value/100; previewPanel()});
  document.getElementById('blueSlide').addEventListener('mouseup',   function() {g_chosen_color[2] = this.value/100; previewPanel()});

  // Rainbow mode events
  document.getElementById('rainbowButton').onclick = function() {
    rainbow = !rainbow;
    if (rainbow) {
      rainbowText.textContent = "ON";
      stored_color = g_chosen_color;
      rainbowMode();
    }
    else {
      rainbowText.textContent = "OFF";
      g_chosen_color = stored_color;
    }
  };
  document.getElementById('hueStep').addEventListener('mouseup',   function() {hue_step = this.value/1 + 0.0007});

  // Property Slider events
  document.getElementById('sizeSlide').addEventListener('mouseup',   function() {g_chosen_size = this.value});
  document.getElementById('segmentSlide').addEventListener('mouseup',   function() {g_chosen_segments = this.value});
}

function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }}

  // // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
  // Extract event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create a new point
  let point;
  if (g_chosen_type == POINT) {
    point = new Point();
  }
  else if (g_chosen_type == TRIANGLE) {
    point = new Triangle();
  }
  else {
    point = new Circle();
  }
  point.position = [x,y];
  point.color = g_chosen_color.slice();
  point.size = g_chosen_size;
  point.segments = g_chosen_segments;
  g_shapesList.push(point);

  if (rainbow) {
    rainbowMode();
  }

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

async function clear() {
    // Draw
    var d = 10 // delta (size of segments)
    gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0)
    let angleStep = 15;

    for (var angle = 0; angle < 360; angle = angle + angleStep) {
        let centerPt = [0.0,0.0];
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [Math.cos(angle1 * Math.PI/180) * d, Math.sin(angle1*Math.PI/180) * d];
        let vec2 = [Math.cos(angle2 * Math.PI/180) * d, Math.sin(angle2*Math.PI/180) * d];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

        drawTriangle([ 0.0, 0.0, pt1[0], pt1[1], pt2[0], pt2[1]] ); 

        await new Promise(r => setTimeout(r, 10));
    }

  g_shapesList = [];
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

// AWESOME stuff
function previewPanel() {
  const pvw = document.getElementById("preview");
  const ctx = pvw.getContext('2d');

  ctx.fillStyle = `rgba(${g_chosen_color[0]*255}, ${g_chosen_color[1]*255}, ${g_chosen_color[2]*255}, 1.0)`
  ctx.fillRect(0, 0, 100, 100);
}

// handle rainbow mode
let hue = 0;

let red = 60; // max of all colors is going to be 60 to make the math easier
let green = 0;
let blue = 0;

function rainbowMode() {
  hue = (hue + hue_step) % 360; // update hue

  if (0 < hue && hue <= 60) { // red 60, green up, blue 0
    red = 60;
    green = hue % 60;
    blue = 0;
  }
  else if (60 < hue && hue <= 120) { // red down, green 60, blue 0
    red = 60 - (hue % 60);
    green = 60;
    blue = 0;
  }
  else if (120 < hue && hue <= 180) { // red 0, green 60, blue up
    red = 0;
    green = 60;
    blue = hue % 60;
  }
  else if (180 < hue && hue <= 240) { // red 0, green down, blue 60
    red = 0;
    green = 60 - (hue % 60);
    blue = 60;
  }
  else if (240 < hue && hue <= 300) { // red up, green 0, blue 60
    red = hue % 60;
    green = 0;
    blue = 60;
  }
  else { // red 60, green 0, blue down
    red = 60;
    green = 0;
    blue = 60 - (hue % 60);
  }

  g_chosen_color = [red/60, green/60, blue/60, 1.0];
}