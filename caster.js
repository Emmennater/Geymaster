
WALL_HEIGHT = 300;

class Player {
  constructor() {
    this.x = 1.5;
    this.y = 0.5;
    this.a = PI / 2;
    this.fov = 90;
    this.far = 100;
    this.h = 100;
  }
  
  isColliding(px, py) {
    let br = floor(this.y);
    let bc = floor(this.x);
    
    if (!maze.grid[br]) return false;
    if (!maze.grid[br][bc]) return false;
    if (maze.grid[br][bc].type == WALL) {
      let pbr = floor(py);
      let pbc = floor(px);
      let rw = maze.grid[pbr][bc].type == WALL;
      let cw = maze.grid[br][pbc].type == WALL;
      if (rw && cw) return true;
      return rw ? 'y' : 'x';
    }
    
    return false;
  }
  
  isAction(action) {
    for (let name of action) {
      if (keys[name]) return true;
    }
    return false;
  }
  
  actions() {
    const ROT_SPEED = 0.05 * deltaTime / 16;
    const MOV_SPEED = 0.05 * deltaTime / 16;
    const px = this.x;
    const py = this.y;
    
    // Look
    if (this.isAction(movement.turnLeft)) this.a -= ROT_SPEED;
    if (this.isAction(movement.turnRight)) this.a += ROT_SPEED;
    
    // Move
    if (this.isAction(movement.forward)) {
      this.x += cos(this.a) * MOV_SPEED;
      this.y += sin(this.a) * MOV_SPEED;
    }
    if (this.isAction(movement.backward)) {
      this.x -= cos(this.a) * MOV_SPEED;
      this.y -= sin(this.a) * MOV_SPEED;
    }
    
    // Check for collision
    let direction;
    if (direction = this.isColliding(px, py)) {
      if (direction != 'x') this.x = px;
      if (direction != 'y') this.y = py;
    }
  }
  
  draw(x, y, s) {
    fill(255, 0, 0);
    noStroke();
    ellipse(x, y, s*2);
    
    // let dst = 10 * s;
    // stroke(255, 0, 0);
    // strokeWeight(2);
    // fill(255, 0, 0, 50);
    // arc(x, y, dst, dst, this.a-this.fov/2, this.a+this.fov/2);
    // line(x, y, x + cos(this.a-this.fov/2) * dst / 2, y + sin(this.a-this.fov/2) * dst / 2);
    // line(x, y, x + cos(this.a+this.fov/2) * dst / 2, y + sin(this.a+this.fov/2) * dst / 2);
  }
}

class Renderer {
  constructor(entity, world) {
    this.entity = entity;
    this.world = world;
    this.scl = 1;
    this.detail = 0.1;
    // this.size = this.entity.fov / this.detail;
    this.size = 200;
    this.graphic = createGraphics(this.size, this.size);
    this.resize();
    this.txr = null;
  }
  
  resize() {
    // this.size = Math.round(width * this.detail);
    this.graphic.width = this.size;
    this.graphic.height = this.size;
  }
  
  castRay(x, y, a) {
    const len = this.entity.far;
    let { plots, pt } = bresenhamFloat3D(x, y, 0, x + cos(a)*len, y + sin(a)*len, 0, maze.grid);
    return pt;
  }
  
  render2d(x, y, scl) {
    this.scl = scl;
    
    let ray = {
      x1: this.entity.x,
      y1: this.entity.y,
      x2: 4.5,
      y2: 4.5
    };
    
    push();
    translate(x, y);
    scale(scl);
    strokeWeight(2 / scl);
    this.castRay(this.entity.x, this.entity.y, this.entity.a);
    pop();
  }
  
  render() {
    
    const ANG = this.entity.a;
    const FOV = lerp(this.entity.fov, this.entity.fov * width / height, 0.2);
    const HEIGHT = lerp(WALL_HEIGHT, WALL_HEIGHT * width / height, 0.8) * this.size / 200;
    
    this.graphic.clear();
    this.graphic.fill(10);
    this.graphic.noStroke();
    // this.graphic.rect(0, this.graphic.height/2, this.graphic.width, this.graphic.height/2);
    this.graphic.loadPixels();
    
    // Casting rays
    for (let c=0; c<this.size; c++) {
      let a = c / this.size * FOV;
      let ang = ANG + (a)*(PI/180) - FOV / 2 * (PI/180);
      
      // Cast ray
      let pt = this.castRay(this.entity.x, this.entity.y, ang);
      if (pt === false) continue;
      
      // Correct fish-eye
      let DIST = Math.sqrt(pt.x ** 2 + pt.y ** 2);
      let adiff = angleDifference(ANG, ang);
      DIST = DIST * Math.cos(adiff);
      
      // Calculate column
      let H = HEIGHT / DIST;
      let B = map(255 / (DIST ** 2 + 1), 255, 0, 255, 50);
      let BC = constrain(B, 0, 255);
      let BR = BC / 255;
      let C1 = color(min(BR, 0.5) * 150);
      let C2 = color(87 * BR, 64 * BR, 43 * BR);
      let C3 = color(194 * BR, 252 * BR, 247 * BR);
      let C4 = color(0);
      let { col, rgb } = multiLerp2(
        [color(200, 0, 0), 1, 0.2],
        [color(200, 100, 40), 1, 0.35],
        [color(200, 160, 50), 1, 0.5],
        [C1, 1, 0],
        BR
      );
      
      // Draw column
      const GW = this.graphic.width;
      const GH = this.graphic.height;
      let entityHeightRatio = (this.entity.h / WALL_HEIGHT);
      let bottom = GH/2 + H/2 * (entityHeightRatio);
      let top = GH/2 - H/2 * (1 - entityHeightRatio);
      let slice = 1 / (bottom - top);
      let cuttTop = 0;
      top = Math.round(top);
      bottom = Math.round(Math.min(bottom, GH-1));
      if (top < 0) {
        cuttTop = -top;
        top = 0;
      }
      
      for (let r=top; r<bottom; r++) {
        let pi = (r * GW + c) * 4;
        let dim = 1;
        let ratioy = (r - top + cuttTop) * slice;
        let ratiox = pt.rx;
        
        // Stretch image
        let txrcol = this.txr[
          Math.round((this.txr.length - 1) * ratiox)][
          Math.round((this.txr[0].length - 1) * ratioy)
        ];
        
        // if (ratiox % 0.5 > 0.25 ^ ratioy % 0.5 > 0.25) dim = 0.8;
        
        this.graphic.pixels[pi+0] = (txrcol[0] / 255) * (rgb.r / 255) * dim * 255;
        this.graphic.pixels[pi+1] = (txrcol[1] / 255) * (rgb.g / 255) * dim * 255;
        this.graphic.pixels[pi+2] = (txrcol[2] / 255) * (rgb.b / 255) * dim * 255;
        this.graphic.pixels[pi+3] = 255;
      }
      
      // this.graphic.fill(rgb.r, rgb.g, rgb.b);
      // this.graphic.rect(c, (this.graphic.height - H) / 2, 1, H);
    }
    
    this.graphic.updatePixels();
    
    image(this.graphic, 0, 0, width, height);
  }

  loadTexture(txr) {
    const SCL = 100;
    const graphic = createGraphics(SCL, SCL);
    graphic.image(txr.get(0, 0, txr.width, txr.height), 0, 0, SCL, SCL);
    graphic.loadPixels();
    let i;
    this.txr = Array(graphic.width);
    for (let c=0; c<graphic.width; c++) {
      this.txr[graphic.width-1-c] = Array(graphic.height);
      for (let r=0; r<graphic.height; r++) {
        let i = (r * graphic.width + c) * 4;
        this.txr[graphic.width-1-c][r] = [
          graphic.pixels[i+0],
          graphic.pixels[i+1],
          graphic.pixels[i+2]
        ];
      }
    }
    
  }
}

/*






















*/
