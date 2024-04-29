const boardSize = 16;
let squareSize;
let board;
let padding = 5;
let robots = [];
let spriteData, sprites;
let currentRobot;
let click;
let thunk;
let inMotion = false;
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
  render(size) {
    push();
    fill(this.color);
    
    circle(0,-size/4,size/6);
    circle(0,-size/20,size/4);
    circle(0,size/4,size/3);
    pop();
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
  update(){
    currentRobot.move();
  }
  renderGrid = pushWrap( () => {
    //Draw the boxes
    for (let i = 0; i < this.h; i ++) {
      for (let j = 0; j < this.w; j++) {
        rect((j * this.squareSize), (i * this.squareSize), this.squareSize);
      }
    }
    rectMode(CENTER);
    //Draw center gray square
    push();
      fill(200);
      translate(this.squareSize * this.w/2, this.squareSize * this.h/2)
      rect(0, 0, squareSize * 2);
    pop();
    //Highlight current robot
    push();
      fill(220);
      translate(this.squareSize * (.5 + currentRobot.x),this.squareSize * (.5 + currentRobot.y))
      rect(0, 0, this.squareSize);
    pop();
  })
  renderWalls() {
    this.spaces.forEach( (row) =>
      row.forEach( (space) => space.renderWalls(this.squareSize))
    );
  }
  show = pushWrap( () => {
      translate(this.origX, this.origY);
      this.renderGrid();
      this.renderWalls();
      this.renderSprites();
      this.renderBots();
  })
  renderSprites() {
    sprites.forEach(
      pushWrap(
        (currentSprite) => {
          translate(this.squareSize * (.5 + currentSprite.x), this.squareSize * (.5 + currentSprite.y));
          //Dim sprite if a robot is on top of it
          robots.forEach((robot) => {
            if (currentSprite.x == robot.x && currentSprite.y == robot.y) currentSprite.dim(75);
          });
          currentSprite.renderBoard();
          currentSprite.undim();
        }
      )
    )
  }
  renderBots() {
    robots.forEach(
      pushWrap(
        (robot) => {
          translate(this.squareSize * (.5 + robot.x),this.squareSize * (.5 + robot.y));
          robot.render(squareSize);
        }
      )
    )
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
//Hard coded but later might populate this using modular board configs
spriteData = [
  {x: 1, y: 2, ShapeClass: Triangle, color: 'green'},
  {x: 6, y: 1, ShapeClass: Square, color: 'yellow'},
  {x: 6, y: 5, ShapeClass: Square, color: 'blue'},
  {x: 3, y: 6, ShapeClass: Circle, color: 'red'},
  {x: 7, y: 12, ShapeClass: Burst, color: 'gray'},
  {x: 9, y: 1, ShapeClass: Square, color: 'green'},
  {x: 4, y: 9, ShapeClass: Triangle, color: 'yellow'},
  {x: 6, y: 10, ShapeClass: Circle, color: 'blue'},
  {x: 8, y: 10, ShapeClass: Circle, color: 'yellow'},
  {x: 10, y: 4, ShapeClass: Square, color: 'red'},
  {x: 14, y: 2, ShapeClass: Star, color: 'yellow'},
  {x: 12, y: 6, ShapeClass: Triangle, color: 'blue'},
  {x: 3, y: 14, ShapeClass: Star, color: 'green'},
  {x: 1, y: 13, ShapeClass: Star, color: 'red'},
  {x: 9, y: 13, ShapeClass: Circle, color: 'green'},
  {x: 13, y: 11, ShapeClass: Star, color: 'blue'},
  {x: 14, y: 14, ShapeClass: Triangle, color: 'red'},
  // {x: 7, y: 7, ShapeClass: Block, color: 'green'},
  // {x: 7, y: 8, ShapeClass: Block, color: 'green'},
  // {x: 8, y: 7, ShapeClass: Block, color: 'green'},
  // {x: 8, y: 8, ShapeClass: Block, color: 'green'}
]

function genSprites(spriteData) {

  const makeShape = ({x, y, color, ShapeClass}) => new ShapeClass(x, y, color);
  return spriteData.map((sprite) => makeShape(sprite))
  // var sprites = [
  //   new Sprite(1,2,squareSize,drawTriangle,'green'),
  //   new Sprite(6,1,squareSize,drawSquare,'yellow'),
  //   new Sprite(6,5,squareSize,drawSquare,'blue'),
  //   new Sprite(3,6,squareSize,drawCircle,'red'),
  //   new Sprite(7,12,squareSize,drawBurst,'red'),
  //   new Sprite(9,1,squareSize,drawSquare,'green'),
  //   new Sprite(4,9,squareSize,drawTriangle,'yellow'),
  //   new Sprite(6,10,squareSize,drawCircle,'blue'),
  //   new Sprite(8,10,squareSize,drawCircle,'yellow'),
  //   new Sprite(10,4,squareSize,drawSquare,'red'),
  //   new Sprite(14,2,squareSize,drawStar,'yellow'),
  //   new Sprite(12,6,squareSize,drawTriangle,'blue'),
  //   new Sprite(3,14,squareSize,drawStar,'green'),
  //   new Sprite(1,13,squareSize,drawStar,'red'),
  //   new Sprite(9,13,squareSize,drawCircle,'green'),
  //   new Sprite(13,11,squareSize,drawStar,'blue'),
  //   new Sprite(14,14,squareSize,drawTriangle,'red'),
  //   new Sprite(7,7,squareSize,drawBlock,[200,200,200]),
  //   new Sprite(7,8,squareSize,drawBlock,[200,200,200]),
  //   new Sprite(8,7,squareSize,drawBlock,[200,200,200]),
  //   new Sprite(8,8,squareSize,drawBlock,[200,200,200])
  // ]
  // for (let i = 0; i < sprites.length;i++){
  //   board.addSprite(sprites[i]);
  // }
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
  robots.forEach( (robot) => {
    let spotX,spotY;
    let tries = 0;
    while (true) {
      let collision = false;
      if (tries > 1000) {
        throw new Error('Bot placement error');
      }
      spotX = int(random(0,16));
      spotY = int(random(0,16));
      centerSquares = [
        [7,7],
        [7,8],
        [8,7],
        [8,8]
      ];
      collision = (sprites.some( (sprite) => (sprite.x == spotX && sprite.y == spotY)) ||
          robots.some( (robo) => (robo.x == spotX && robo.y == spotY))) ||
          centerSquares.some ( (coords) => coords[0] == spotX && coords[1] == spotY) 
      if (!collision) {
        robot.place(spotX,spotY);
        break;
      }
    }
  });
}
function preload() {
  click = loadSound('click.mp3');
}
function setup() {
  createCanvas(700, 700);
  background(255);
  frameRate(45);
  squareSize = width/16;
  board = new Board(boardSize,boardSize,squareSize);
  robots.push(new Robot(-1,-1,'red'));
  robots.push(new Robot(-1,-1,'blue'));
  robots.push(new Robot(-1,-1,'green'));
  robots.push(new Robot(-1,-1,'yellow'));
  genWalls();
  currentRobot = robots[1];
  sprites = genSprites(spriteData);
  placeBots();
}
function draw() {
  clear();
  background(220);
  // if (frameCount % 15 == 0)console.log(inMotion);

  board.update();
  board.show();
  
}



function pushWrap(fn) {
  return (...args) => {
    push();
    const res = fn(...args);
    pop();
    return res;
  }
}