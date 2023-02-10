
const WALL = 0;
const CORRIDOR = 1;
const START = 2;
const END = 3;
const NONE = 0;
const VISITED = 1;
let T = 0;
let INC = 0.0;

class Maze {
  constructor(cols, rows) {
    this.alpha = 100;
    this.on = true;
    
    this.graphic = createGraphics(cols, rows);
    this.graphic.noSmooth();
    this.setup(cols, rows);
    this.generate();
    this.updateGraphics();
  }
  
  async generate2() {
    // Pick random place to start
    let row = floor(random(this.rows - 2) / 2) * 2 + 1;
    let col = floor(random(this.cols - 2) / 2) * 2 + 1;
    let stack = [{r:row, c:col}];
    let current = stack[0];
    
    do {
      // Set current cell
      let next = stack.shift();
      this.pathTo(current, next);
      current = next;
      
      this.updateGraphics();
      await sleep(1000);
      
      // Get neighbors
      let neighbors = this.getNeighbors(current.r, current.c);
      for (let n of neighbors) {
        this.grid[n.r][n.c].state = VISITED;
        stack.push(n);
      }
      
    } while (stack.length != 0);
    
    
  }
  
  async generate() {
    // Pick random place to start
    let row = floor(random(this.rows - 2) / 2) * 2 + 1;
    let col = floor(random(this.cols - 2) / 2) * 2 + 1;
    let stack = [{r:row, c:col}];
    let current = stack[0];
    
    let rand = (a, b) => {
      return random(-1, +1);
    }
    
    let explore = async (r, c) => {
      this.grid[r][c].state = VISITED;
      
      if ((T += INC) > 1) {
        await sleep(T);
        this.updateGraphics();
        T = 0;
      }
      
      let neighbors = this.getNeighbors(r, c);
      neighbors.sort(rand);
      for (let n of neighbors) {
        if (this.grid[n.r][n.c].state == VISITED) continue;
        this.pathTo({r, c}, {r:n.r, c:n.c});
        await explore(n.r, n.c);
      }
    }
    
    this.grid[row][col].type = CORRIDOR;
    await explore(row, col);
    this.updateGraphics();
  }
  
  pathTo(current, next) {
    this.grid[(next.r + current.r) / 2][(next.c + current.c) / 2].type = CORRIDOR;
    this.grid[next.r][next.c].type = CORRIDOR;
  }
  
  getNeighbors(row, col) {
    // Get neighboring cells
    let neighbors = [];
    if (row - 2 >= 0 && this.grid[row-2][col].state != VISITED) neighbors.push({r:row-2, c:col});
    if (row + 2 < this.rows && this.grid[row+2][col].state != VISITED) neighbors.push({r:row+2, c:col});
    if (col - 2 >= 0 && this.grid[row][col-2].state != VISITED) neighbors.push({r:row, c:col-2});
    if (col + 2 < this.cols && this.grid[row][col+2].state != VISITED) neighbors.push({r:row, c:col+2});
    return neighbors;
  }
  
  setup(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    
    // Create maze grid
    this.grid = Array(rows);
    for (let r=0; r<rows; ++r) {
      this.grid[r] = Array(cols);
      for (let c=0; c<cols; ++c) {
        this.grid[r][c] = {type:WALL, state:NONE};
      }
    }
    
    // Set start and end
    this.grid[0][1].type = END;
    this.grid[rows-1][cols-2].type = START;
    
  }
  
  updateGraphics() {
    this.graphic.loadPixels();
    const pxl = this.graphic.pixels;
    
    let i = 0;
    for (let r=0; r<this.rows; ++r) {
      for (let c=0; c<this.cols; ++c) {
        const square = this.grid[r][c];
        
        // Get color of square
        let col;
        switch (square.type) {
          case 2: case 3:
          case 1: col = {r:0, g:0, b:0}; break;
          case 0: col = {r:255, g:255, b:255}; break;
          // case 2: col = {r:0, g:255, b:0}; break;
          // case 3: col = {r:0, g:0, b:255}; break;
        }
        
        // Graphics (set pixel color)
        pxl[i+0] = col.r;
        pxl[i+1] = col.g;
        pxl[i+2] = col.b;
        pxl[i+3] = this.alpha;
        i += 4;
        
      }
    }
    this.graphic.updatePixels();
  }
  
  draw(w = width, h = height) {
    const X = 6;
    const Y = 6;
    const S = min(w, h) - 12;
    const R = this.rows / this.cols;
    
    image(this.graphic, X, Y, S, S * R);
    
    let ps = S / this.rows;
    player.draw(X + player.x * ps, Y + player.y * ps, ps * 0.5);
    renderer.render2d(X, Y, ps);
    
  }
}

/*






















*/
