
keys = {};
mouse = {};

movement = {
  forward: ["ArrowUp", "w"],
  backward: ["ArrowDown", "s"],
  turnLeft: ["ArrowLeft", "a"],
  turnRight: ["ArrowRight", "d"],
}

function keyPressed() {
  keys[key] = true;
  
  if (key == "m") maze.on = !maze.on;
}

function keyReleased() {
  keys[key] = false;
}

function mousePressed() {
  mouse.pressed = true;
}

function mouseReleased() {
  mouse.released = true;
}

function runActions() {
  mouse.x = mouseX;
  mouse.y = mouseY;
}

function resetActions() {
  mouse.pressed = false;
  mouse.released = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  renderer.resize();
}

/*






















*/
