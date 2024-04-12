var board;
var boardSize = 16;
var squareSize;
var padding = 5;
var robots = [];
var currentRobot;
var click;
var thunk;
var inMotion = false;
class Robot {
  constructor(x,y,color){
    this.x = x;
    this.y = y;
    this.color = color;
    this.vel = [0,0];
    this.selected = false;
  }
  place(x,y) {
    this.x = x;
    this.y = y;
  }
  show(size) {
    fill(this.color);
    
    circle(size/2,size/4,size/6);
    circle(size/2,size/2.2,size/4);
    circle(size/2,size/1.35,size/3);
    
  }
  stop() {
    this.vel=[0,0];
    if(inMotion) click.play();
    inMotion = false;
  }
  move(){
    let currentSquare = board.spaces[this.y][this.x];
    let nextX = this.x + this.vel[0];
    let nextY = this.y + this.vel[1];
    //Stop if there is a robot in the cell we want to move to
    for (let i = 0; i < robots.length; i++) {
      if (robots[i].x == nextX && robots[i].y == nextY) {
        this.stop();
        return;
      }
    }
    
    //If moving right
    if (this.vel[0] == 1) {
      //Stop at edge of board or if there's a wall to your east
      if (this.x == board.spaces[this.y].length - 1|| currentSquare.eastWall || board.spaces[this.y][this.x + 1].westWall) {
        this.stop();
        return;
      } else {
        this.x++;
        inMotion = true;
      }
    }
    //If moving left
    if (this.vel[0] == -1) {
      //Stop if at left edge or there's a western wall
      if (this.x == 0 || currentSquare.westWall || board.spaces[this.y][this.x - 1].eastWall) {
        this.stop();
        return;
      }else {
        this.x--;
        inMotion = true;
      }
    } 
    //If moving down
    if (this.vel[1] == 1) {
      //Stop if on last row or wall below
      if (this.y == board.spaceslength - 1 || currentSquare.southWall || board.spaces[this.y + 1][this.x].northWall) {
        this.stop();
        return;
      } else {
        this.y++;
        inMotion = true;
      }
    }
    //If moving up
    if (this.vel[1] == -1) {
      //Stop if at top
      if (this.y == 0 || currentSquare.northWall || board.spaces[this.y - 1][this.x].southWall) {
        this.stop();
        return;
      } else {
        this.y--;
        inMotion = true;
      }
    }
  }
}
class Board {
  constructor(w, h, squareSize) {
    this.origX = 0;
    this.origY = 0;
    this.w = w;
    this.h = h;
    this.sprites = [];
    this.squareSize = squareSize;
    this.spaces = new Array(h);
    for (let i = 0; i < h; i++) {
      this.spaces[i] = new Array(w);
      for (let j = 0; j < w; j++) {
        this.spaces[i][j] = new Space(j,i);
      }
    }
  }
  locate(x,y) {
    this.origX = x;
    this.origY = y;
  }
  addSprite(sprite){
    this.sprites.push(sprite)
  }
  update(){
    currentRobot.move();
  }
  show() {
    //Draw the grid
    for (let i = 0; i < this.h; i ++) {
      for (let j = 0; j < this.w; j++) {
        rect(this.origX + (j * this.squareSize), this.origY + (i * this.squareSize), this.squareSize);
      }
    }
    push();
    fill(220);
    rect(this.origX + (currentRobot.x * this.squareSize), this.origY + (currentRobot.y * this.squareSize), this.squareSize);
    pop();
    //Draw the barrier walls
    for (let i = 0; i < this.h; i ++) {
      for (let j = 0; j < this.w; j++) {
        this.spaces[i][j].renderWalls(this.squareSize);
      }
    }
    //Draw sprites
    for (let i = 0; i < this.sprites.length; i++) {
      let currentSprite = this.sprites[i];

      push();
      translate(currentSprite.x * this.squareSize, currentSprite.y * this.squareSize);
      //Dim sprite if a robot is on top of it
      for (let j = 0; j < robots.length; j++) {
        if (currentSprite.x == robots[j].x && currentSprite.y == robots[j].y) {
          currentSprite.dim(75);
        }
      }
      currentSprite.render();
      currentSprite.undim();
      pop();
    }
    //Draw Robots
    for (let i = 0; i < robots.length; i++) {
      push();
      translate(robots[i].x*squareSize,robots[i].y*squareSize);
      robots[i].show(squareSize);
      pop();
    }
    //Draw Center thing
    // push();
    // fill(200);
    // rectMode(CENTER);
    // rect(width/2,height/2,squareSize*2);
    // pop();
  }
}
class Space {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.sprites = [];
    this.northWall = false;
    this.eastWall = false;
    this.southWall = false;
    this.westWall = false;
  }
  render(x,y,size) {

    for (let i = 0; i < this.sprites.length; i++) {
      this.sprites[i].render(this.x,this.y);
    } 
  }
  renderWalls(size){
    push();
    translate(this.x * size, this.y * size);
    strokeWeight(5);
    stroke(0);
    if (this.northWall) {
      line(0,0,size,0);
    }
    if (this.southWall) {
      line(0,size,size,size);
    }
    if (this.eastWall) {
      line(size,0,size,size);
    }
    if (this.westWall) {
      line(0,0,0,size);
    }
    pop() 
  }
  addWall(dir) {
    switch (dir) {
      case 'n':
        this.northWall = true;
        break;
      case 'e':
        this.eastWall = true;
        break;
      case 's':
        this.southWall = true;
        break;
      case 'w':
        this.westWall = true;
        break;
    }
  }
  
}
class Sprite {
  constructor(x,y,size,drawFunc,color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.drawFunc = drawFunc;
    this.colr = color;
  }
  render() {
    this.drawFunc(this.size,this.colr);
  }
  dim(alph) {
    this.colr = color(red(this.colr),green(this.colr),blue(this.colr),alph);
  }
  undim() {
    this.colr = color(red(this.colr),green(this.colr),blue(this.colr),255);
  }
}
function genWalls() {
  //Add the edges
  for (let i = 0; i < board.spaces.length; i++) {
    for (let j = 0; j < board.spaces[i].length; j++) {
      if (i == 0) board.spaces[i][j].addWall('n');
      if (j == 0) board.spaces[i][j].addWall('w');
      if (i == board.spaces.length - 1) board.spaces[i][j].addWall('s');
      if (j == board.spaces[i].length - 1) board.spaces[i][j].addWall('e');
    }
  }
  board.spaces[2][1].addWall('n');
  board.spaces[2][1].addWall('w');
  board.spaces[0][4].addWall('e');
  board.spaces[1][6].addWall('e');
  board.spaces[1][6].addWall('s');
  board.spaces[5][6].addWall('n');
  board.spaces[5][6].addWall('e');
  board.spaces[5][0].addWall('s');
  board.spaces[6][3].addWall('s');
  board.spaces[6][3].addWall('w');
  board.spaces[1][9].addWall('w');
  board.spaces[1][9].addWall('s');
  
  board.spaces[7][7].addWall('w');
  board.spaces[7][7].addWall('n');
  board.spaces[8][7].addWall('w');
  board.spaces[8][7].addWall('s');
  board.spaces[8][8].addWall('s');
  board.spaces[8][8].addWall('e');
  board.spaces[7][8].addWall('e');
  board.spaces[7][8].addWall('n');
  
  board.spaces[0][10].addWall('e');
  board.spaces[2][14].addWall('n');
  board.spaces[2][14].addWall('e');
  board.spaces[4][15].addWall('s');
  board.spaces[4][10].addWall('e');
  board.spaces[4][10].addWall('s');
  
  board.spaces[6][12].addWall('w');
  board.spaces[6][12].addWall('n');
  
  board.spaces[9][4].addWall('s');
  board.spaces[9][4].addWall('w');
  
  board.spaces[10][6].addWall('n');
  board.spaces[10][6].addWall('w');
  
  board.spaces[10][8].addWall('s');
  board.spaces[10][8].addWall('e');
  
  board.spaces[13][1].addWall('n');
  board.spaces[13][1].addWall('e');
  
  board.spaces[10][0].addWall('s');
  
  board.spaces[12][7].addWall('e');
  board.spaces[12][7].addWall('n');
  
  board.spaces[14][3].addWall('s');
  board.spaces[14][3].addWall('e');
  
  board.spaces[13][9].addWall('s');
  board.spaces[13][9].addWall('w');
  
  board.spaces[11][13].addWall('n');
  board.spaces[11][13].addWall('w');
  
  board.spaces[10][15].addWall('n');
  
  board.spaces[14][14].addWall('n');
  board.spaces[14][14].addWall('e');
  
  board.spaces[15][4].addWall('e');
  board.spaces[15][11].addWall('e');
  
}
function drawTriangle(size,color){
  fill(color);
  triangle(size/2,padding,padding,size-padding,size-padding,size-padding);
}
function drawSquare(size,color){
  fill(color);
  rect(padding,padding,size-(2*padding),size-(2*padding))
}
function drawCircle(size,color) {
  fill(color);
  circle(size/2,size/2,size-1.5*padding)
}
function drawStar(size, color) {
  translate(size/2,size/2);
  fill(color);
  rotate(-PI/2);
  beginShape();
  let x,y;
  let increment = TWO_PI/5;
  for (let a = 0; a <= TWO_PI; a += increment) {
    x = cos(a) * (.6*size-padding);
    y = sin(a) * (.6*size-padding);
    vertex(x,y);
    x = cos(a + increment/2) * .22*(size-padding);
    y = sin(a + increment/2) * .22*(size-padding);
    vertex(x,y);
  }
  endShape();
}
function drawBlock(size,color) {
  fill(color);
  noStroke();
  rect(0,0,size,size);
}
function drawBurst(size,_) {
  translate(size/2,size/2);
  let alph = 170
  let colors = [
    color(255,0,0,alph),
    color(79,0,153,alph),
    color(0,119,255,alph),
    color(0,153,192,alph),
    color(245,126,0,alph),
    color(0,0,0,100),
    ]
  for (let i = 0;i < 6; i++) {

    fill(colors[i]);
    ellipse(0,0,size-(2*padding),size/4);
    rotate(PI/6);
  }

}
function genSprites() {
  var sprites = [
    new Sprite(1,2,squareSize,drawTriangle,'green'),
    new Sprite(6,1,squareSize,drawSquare,'yellow'),
    new Sprite(6,5,squareSize,drawSquare,'blue'),
    new Sprite(3,6,squareSize,drawCircle,'red'),
    new Sprite(7,12,squareSize,drawBurst,'red'),
    new Sprite(9,1,squareSize,drawSquare,'green'),
    new Sprite(4,9,squareSize,drawTriangle,'yellow'),
    new Sprite(6,10,squareSize,drawCircle,'blue'),
    new Sprite(8,10,squareSize,drawCircle,'yellow'),
    new Sprite(10,4,squareSize,drawSquare,'red'),
    new Sprite(14,2,squareSize,drawStar,'yellow'),
    new Sprite(12,6,squareSize,drawTriangle,'blue'),
    new Sprite(3,14,squareSize,drawStar,'green'),
    new Sprite(1,13,squareSize,drawStar,'red'),
    new Sprite(9,13,squareSize,drawCircle,'green'),
    new Sprite(13,11,squareSize,drawStar,'blue'),
    new Sprite(14,14,squareSize,drawTriangle,'red'),
    new Sprite(7,7,squareSize,drawBlock,200),
    new Sprite(7,8,squareSize,drawBlock,200),
    new Sprite(8,7,squareSize,drawBlock,200),
    new Sprite(8,8,squareSize,drawBlock,200)
  ]
  for (let i = 0; i < sprites.length;i++){
    board.addSprite(sprites[i]);
  }
}
function mousePressed(){
  let x = floor(mouseX / squareSize);
  let y = floor(mouseY / squareSize);
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].x == x && robots[i].y == y) {
      currentRobot = robots[i];
      currentRobot.selected = true;
    }
  }
}
function keyPressed(){
  if (inMotion) return;
  switch (keyCode) {
    case UP_ARROW:
      currentRobot.vel = [0,-1];
      break;
    case DOWN_ARROW:
      currentRobot.vel = [0,1];
      break;
    case LEFT_ARROW:
      currentRobot.vel = [-1,0];
      break;
    case RIGHT_ARROW:
      currentRobot.vel = [1,0];
      break; 
    
  }
  
}
function placeBots(){
  for (let i = 0; i < robots.length; i++) {
    let spotX,spotY;
    let tries = 0;
    while (true) {
      let collision = false;
      if (tries > 1000) {
        console.log('Bot placement error');
        break;
      }
      spotX = int(random(0,16));
      spotY = int(random(0,16));
      for (let j = 0; j < board.sprites.length; j++) {
        if (board.sprites[j].x == spotX && board.sprites[j].y == spotY) {
          collision = true;
          break;
        }
      }
      for (let j = 0; j < robots.length; j++) {
        if (robots[j].x == spotX && robots[j].y == spotY) {
          collision = true;
          break;
        }
      }
      if (!collision) {
        robots[i].place(spotX,spotY);
        break;
      }
    }
  }
}
function setup() {
  createCanvas(700, 700);
  click = loadSound('click.mp3');
  background(255);
  frameRate(45);
  squareSize = width/16;
  board = new Board(boardSize,boardSize,squareSize);
  robots.push(new Robot(-1,-1,'red'));
  robots.push(new Robot(-1,-1,'blue'));
  robots.push(new Robot(-1,-1,'green'));
  robots.push(new Robot(-1,-1,'yellow'));
  placeBots();
  genWalls();
  currentRobot = robots[1];
  genSprites();
}
function draw() {
  clear();
  background(220);
  // if (frameCount % 15 == 0)console.log(inMotion);

  board.update();
  board.show();
  
}
