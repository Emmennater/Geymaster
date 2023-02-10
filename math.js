
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function rnd(n, d = 2) {
  let e = 10 ** d;
  return Math.round(n * e) / e;
}

function wholeNumberBetween(a, b) {
  return Math.round(Math.max(Math.floor(a), Math.floor(b)));
}

function angleDifference(targetA, sourceA) {
  let a = targetA - sourceA;
  a += (a>180) ? -360 : (a<-180) ? 360 : 0;
  return a;
}

function multiLerp() {
  let colors = arguments.length - 2;
  let ratio0 = arguments[arguments.length-1];
  ratio0 = constrain(ratio0, 0, 1);
  
  let ratio1 = colors * ratio0 - floor(colors * ratio0);
  let col0 = arguments[floor(colors * ratio0)];
  let col1 = arguments[ceil(colors * ratio0)];
  
  return lerpColor(col0, col1, ratio1);
}

function ratioBetween(end, start, ratio) {
  let fit = 1 - Math.abs(start - ratio) / Math.abs(end - start);
  return constrain(fit, 0, 1);
}

function multiLerp2() {
  let ratio = arguments[arguments.length - 1];
  let res = {r:0, g:0, b:0};
  
  for (let i=0; i<arguments.length-1; i++) {
    let arg = arguments[i];
    let col = arg[0];
    let start = arg[1] ?? -1;
    let end = arg[2] ?? 2;
    let fit = ratioBetween(end, start, ratio);
    res.r = Math.max(res.r, red(col) * fit);
    res.g = Math.max(res.g, green(col) * fit);
    res.b = Math.max(res.b, blue(col) * fit);
  }
  
  return {col: color(res.r, res.g, res.b), rgb: res};
}

function bresenhamFloat3D(gx0, gy0, gz0, gx1, gy1, gz1, grid) {
  let plots = [];

  // Floored position values
  let gx0idx = Math.floor(gx0);
  let gy0idx = Math.floor(gy0);
  let gx1idx = Math.floor(gx1);
  let gy1idx = Math.floor(gy1);

  // Direction sign
  let sx = gx1idx > gx0idx ? 1 : gx1idx < gx0idx ? -1 : 0;
  let sy = gy1idx > gy0idx ? 1 : gy1idx < gy0idx ? -1 : 0;

  let gx = gx0idx;
  let gy = gy0idx;

  //Planes for each axis that we will next cross
  let gxp = gx0idx + (gx1idx > gx0idx ? 1 : 0);
  let gyp = gy0idx + (gy1idx > gy0idx ? 1 : 0);

  //Only used for multiplying up the error margins
  let vx = gx1 === gx0 ? 1 : gx1 - gx0;
  let vy = gy1 === gy0 ? 1 : gy1 - gy0;
  let vz = 1;
  let mg = Math.sqrt(vx ** 2 + vy ** 2);
  vx /= mg;
  vy /= mg;
  
  //Error from the next plane accumulators, scaled up by vx*vy*vz
  let errx = (gxp - gx0) * vy;
  let erry = (gyp - gy0) * vx;

  // Distance moved in the opposite direction
  let derrx = sx * vy;
  let derry = sy * vx;

  let testEscape = 100;
  let hit = false;
  let outside = true;
  let xr, yr, dx, dy, px = gx0, py = gy0;
  let ratiox;
  do {
    plots.push([gx, gy]);

    if (gx === gx1idx && gy === gy1idx) break;

    //Which plane do we cross first?
    xr = Math.abs(errx);
    yr = Math.abs(erry);

    if (sx !== 0 && (sy === 0 || xr < yr)) {
      // X plane comes first
      gx += sx;
      px += sx;
      errx += derrx;
      if (grid[gy] && grid[gy][gx])
      if (grid[gy][gx].type == WALL) {
        // Subtract overshoot
        let ovrx = wholeNumberBetween(px-sx, px);
        dx = Math.abs(ovrx - gx0);
        dy = dx / Math.abs(vx) * Math.abs(vy);
        hit = true;
        ratiox = ((gy0+dy*sy) % 1 + 1) % 1;
        if (sx >= 0) ratiox = 1 - ratiox;
        break;
      }
    } else if (sy !== 0) {
      // Y plane comes first
      gy += sy;
      py += sy;
      erry += derry;
      if (grid[gy] && grid[gy][gx])
      if (grid[gy][gx].type == WALL) {
        // Subtract overshoot
        let ovry = wholeNumberBetween(py-sy, py);
        dy = Math.abs(ovry - gy0);
        dx = dy / Math.abs(vy) * Math.abs(vx);
        hit = true;
        ratiox = ((gx0+dx*sx) % 1 + 1) % 1;
        if (sy < 0) ratiox = 1 - ratiox;
        break;
      }
    }
  } while (testEscape-- > 0);
  if (!hit) return { plots, pt: false };
  
  let pt = { x: dx * sx, y: dy * sy, rx: ratiox };
  return { plots, pt };
}

function intersectingRayFloor(initialPosition, verticalAngle, horizontalAngle) {
  // Convert vertical and horizontal angles to radians
  const va = (verticalAngle * Math.PI) / 180;
  const ha = (horizontalAngle * Math.PI) / 180;
  const h = initialPosition.z;

  let t = h / Math.cos(va);
  let d = va == 0 ? 0 : h * Math.tan(va);
  let x = Math.cos(ha) * d + initialPosition.x;
  let y = Math.sin(ha) * d + initialPosition.y;
  
  return { x, y, t };
}

function testIntersectingRay() {
  const initialPosition = { x: 0, y: 0, z: 10 };

  // Test case 1: vertical angle = 0, horizontal angle = 0
  let verticalAngle = 0.01;
  let horizontalAngle = 0;
  const expectedOutput1 = { x: 0, y: 0 };
  const result1 = intersectingRayFloor(initialPosition, verticalAngle, horizontalAngle);
  console.assert(result1.x == expectedOutput1.x && result1.y == expectedOutput1.y, `Test case 1 failed: expected ${expectedOutput1.x} ${expectedOutput1.y}, but got ${result1.x} ${result1.y}`);

  // Test case 2: vertical angle = 45, horizontal angle = 45
  verticalAngle = 45;
  horizontalAngle = 45;
  const expectedOutput2 = { x: 7.0710678118654755, y: 7.0710678118654755 };
  const result2 = intersectingRayFloor(initialPosition, verticalAngle, horizontalAngle);
  console.assert(result2.x == expectedOutput2.x && result2.y == expectedOutput2.y, `Test case 1 failed: expected ${expectedOutput2.x} ${expectedOutput2.y}, but got ${result2.x} ${result2.y}`);

  // Add more test cases as necessary to cover different scenarios and edge cases

  console.log("All test cases passed");
}

/*






















*/
