
// See actions for controls
// WASD and arrow keys
// Press M to toggle map

function preload() {
  // Maze wall texture
  txr = loadImage("Assets/geyy.jpg");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  noSmooth();
  
  player = new Player();
  maze = new Maze(51, 51);
  renderer = new Renderer(player, maze);
  renderer.loadTexture(txr);
}

function draw() {
  runActions();
  clear();
  
  player.actions();
  renderer.render();
  if (maze.on) maze.draw(300, 300);
  
  resetActions();
}

/*






















*/
