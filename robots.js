/*
Ricochet Robots

-WASD/Arrow keys to move
-r to reset current attempt
-click center shape to claim with current best or to shuffle if not yet reached
*/

const boardSize = 16;
let squareSize, wallThickness;
let board;
let padding = 5;
let robots = [];
let spriteData, sprites;
let currentRobot;
let click;
let thunk;
let inMotion = false;
let noMove = false;
let currentToken, tokens;
let moveCounter, hitTarget, turnBest;
let playerList = [];
let gameOver;
let firstFrame = true;
let roboSounds, victorySound;
const noBloops = true;

class Counter {
  constructor(init = 0) {
    this.count = init;
  }
  increment(n = 1) {
    this.count += n;
  }
  set(n) {
    this.count = n;
  }
  reset() {
    this.set(0);
  }
  render = pushWrap( (x = width/2, y = width + squareSize) => {
    fill(0);
    textSize(32);
    textAlign(CENTER, BOTTOM);
    text(this.count, x, y);
  })
}
class Robot {
  constructor(x,y,colr, sound = null){
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    this.color = color(colr);
    this.colorName = colr;
    this.vel = [0,0];
    this.selected = false;
    this.sound = sound;
  }
  speak() {
    if(!this.sound || noBloops) return;
    this.sound.play();
  }
  select() {
    this.speak();
    this.selected = true;
    currentRobot = this;
  }
  place(x,y) {
    this.x = x;
    this.y = y;
  }
  render = pushWrap( (size) => {
    fill(this.color);
    
    circle(0,-size/4,size/6);
    circle(0,-size/20,size/4);
    circle(0,size/4,size/3);
  })
  renderPlaceholder = pushWrap( () => {
    fill(setAlpha(this.color, 100));
    strokeWeight(3);
    circle((this.lastX + .5) * squareSize, (this.lastY + .5) * squareSize, .9*squareSize);
  })

  stop() {
    this.vel=[0,0];
    if(inMotion) {
      click.play();
      moveCounter.increment();
    }
    inMotion = false;
  }
  move(){
    if (noMove)this.vel = [0,0]
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
    this.wallThickness = wallThickness;
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
    if (this.checkGoal()) {
      if (!hitTarget) victorySound.play();
      hitTarget = true;
      updateTurnBest(moveCounter.count + 1);
      noMove = true;
    }
    else hitTarget = false;
  }
  
  show = pushWrap( () => {
      translate(this.origX, this.origY);
      this.renderGrid();
      this.renderWalls();
      this.renderCurrentToken();
      this.renderSprites();
      this.renderPlaceholders();
      this.renderBots();
      this.renderCounter();
      this.renderTurnBest();
      this.renderCollected();
      updatePlayers();
  })
  renderCollected() {
    translate(0,width + squareSize/2)
    drawTokenLine(sprites.filter((sprite) => sprite.collected));
  }
  renderCounter = () => moveCounter.render();
  renderTurnBest = pushWrap( () => {
    textSize(24);
    textAlign(RIGHT, BOTTOM);
    fill('green');
    text(turnBest, width, width * 17/16);
  })
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
      row.forEach( (space) => space.renderWalls(this.squareSize, this.wallThickness))
    );
  }
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
  renderCurrentToken = pushWrap( () => {
    translate(squareSize * this.w/2, squareSize * this.h/2);
    if(currentToken) currentToken.drawLarge();
    else {
      push()
      fill(0);
      circle(0,0,squareSize * 1.8)
      fill(255)
      textAlign(CENTER, CENTER);
      textSize(36)
      text(totalMoves(sprites),0,0)
      pop()
    }
  })
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
  renderPlaceholders() {
    robots.forEach( (robot) => robot.renderPlaceholder());
  }

  //returns true if a valid robot is sitting on the target sprite
  checkGoal() {
    if(!currentToken) return false;
    const onTarget = (robot) =>  robot.x == currentToken.x && robot.y == currentToken.y;
    //If we are aiming for free square, check if ANY bot is touching
    if (currentToken.colorName == 'white'){
      return robots.some( (robot) => onTarget(robot))
    }
    return onTarget(robots.find( (robot) => robot.colorName == currentToken.colorName));
  }
}
class Space {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.northWall = false;
    this.eastWall = false;
    this.southWall = false;
    this.westWall = false;
  }
  renderWalls = pushWrap((size, wallThickness) => {
    translate(this.x * size, this.y * size);
    strokeWeight(wallThickness);
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
  })
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

function genSprites(spriteData) {

  const makeShape = ({x, y, color, ShapeClass}) => new ShapeClass(x, y, color);
  return spriteData.map((sprite) => makeShape(sprite))
}

function mousePressed(){
  let x = floor(mouseX / squareSize);
  let y = floor(mouseY / squareSize);
  // console.log(`Clicked at ${int(mouseX)} ${int(mouseY)} which we take as ${x} ${y}`)

  robots.forEach( (robot) => {
    if (robot.x == x && robot.y == y) {
      robot.select();
    }
  })
  if (x >= 7 && x <= 8 && y >= 7 && y <= 8) {
    if(gameOver) startGame();
    currentToken = getNextToken();
    if (!currentToken) gameOver = true;
    turnBest = 0;
    resetTurn();
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
    default:
      switch (key) {
        case 'r':
          resetTurn();
          break;
        case 'w':
          currentRobot.vel = [0,-1];
          break;
        case 's':
          currentRobot.vel = [0,1];
          break;
        case 'a':
          currentRobot.vel = [-1,0];
          break;
        case 'd':
          currentRobot.vel = [1,0];
          break;
      }
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

//Hard coded but later might populate this using modular board configs
spriteData = [
  {x: 1, y: 2, ShapeClass: Triangle, color: 'green'},
  {x: 6, y: 1, ShapeClass: Square, color: 'yellow'},
  {x: 6, y: 5, ShapeClass: Square, color: 'blue'},
  {x: 3, y: 6, ShapeClass: Circle, color: 'red'},
  {x: 7, y: 12, ShapeClass: Burst, color: 'white'},
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
]

//returns an uncollected sprite or returns false if there are none
function getNextToken() {
  if (sprites.every( (sprite) => sprite.collected)) return false;
  while(true) {
    let s = sprites[int(random(sprites.length))];
    if (!s.collected) return s;
  }
}


function preload() {
  click = loadSound('sound/click.mp3');
  roboSounds = Array.from({length: 4}, (_, i) => loadSound(`./sound/interface/question_00${i + 1}.ogg`))
  roboSounds.forEach( (sound) => sound.setVolume(.1))
  click.setVolume(.5);
  victorySound = loadSound('./sound/interface/confirmation_004.ogg')
  victorySound.setVolume(.2);
}
function setup() {
  let w = min(windowWidth, (windowHeight - 100)/1.2);
  canvas = createCanvas(w, w * 1.17);
  canvas.parent('canvas-box');
  background(255);
  frameRate(60);
  moveCounter  = new Counter;
  squareSize = width/16;
  wallThickness = squareSize / 9;
  board = new Board(boardSize,boardSize,squareSize);
  ['red', 'yellow', 'green', 'blue'].forEach( (color, i) => robots.push(new Robot(-1,-1,color, roboSounds[i])));
  genWalls();
  sprites = genSprites(spriteData);
  currentRobot = robots[1];
  noMove = true;
  startGame();
}
function draw() {
  clear();
  background(220);
  // if (frameCount % 15 == 0)console.log(inMotion);
  if( !firstFrame && playerList.length == 0) {
    initializePlayers();
  }
  firstFrame = false;
  board.update();
  board.show();
}
class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.tokens = [];
    this.elt;
    this.textSpan;
    this.scoreButton;
  }
  collectToken() {
    if (turnBest > 0) {
      currentToken.collected = true;
      currentToken.collectedIn = turnBest;
      this.tokens.push(currentToken)
      currentToken = getNextToken();
      startTurn();
    }
  }
  reset() {
    this.tokens = [];
  }
}
function askForPlayers() {
  let numPlayers = null;
  while (isNaN(numPlayers) || numPlayers === null || numPlayers < 1) {
    numPlayers = parseInt(prompt("How many players?"));
  }
  if (isNaN(numPlayers) || numPlayers < 1) throw new Error("Invalid player number");
  let players = Array.from({ length: numPlayers}, (_, i) => new Player(prompt(`Player ${i + 1}`), i));
  return players;
}

function makePlayerDivs(players) {
  const container = document.getElementById('players');
  container.innerHTML = '';

  players.forEach( (player) => {
    const playerDiv = document.createElement('div');
    playerDiv.id = `player-${player.id}`
    playerDiv.className = `player`
    const playerNameAndScore = document.createElement('span');
    playerNameAndScore.id = `player-${player.id}-text`;
    playerNameAndScore.textContent = `${player.name} ${player.tokens.length}`

    const scoreButton = document.createElement('button');
    scoreButton.className = 'score-button';
    scoreButton.id = `score-player-${player.id}`;
    scoreButton.textContent = 'Collect';
    scoreButton.onclick = ( () => player.collectToken());
    
    player.elt = playerDiv;
    player.textSpan = playerNameAndScore;
    player.scoreButton = scoreButton;
    playerDiv.appendChild(scoreButton);
    playerDiv.appendChild(playerNameAndScore);
    container.appendChild(playerDiv);
  })
}

function updatePlayers() {
  if (playerList.length == 0) return;
  if (turnBest == 0) {

  }
  playerList.forEach( (player) => {
    player.textSpan.textContent = `${player.name} ${player.tokens.length}`
    //If the goal hasnt been reached yet, hide the Collect buttons
    turnBest == 0 ? 
      player.scoreButton.classList.add('hidden') :
      player.scoreButton.classList.remove('hidden')
  })
}
function initializePlayers() {
  playerList = askForPlayers();
  makePlayerDivs(playerList);
}
function pushWrap(fn) {
  return (...args) => {
    push();
    const res = fn(...args);
    pop();
    return res;
  }
}

function startTurn() {
  robots.forEach( (robot) => {
    robot.lastX = robot.x;
    robot.lastY = robot.y;
  });
  moveCounter.reset();
  turnBest = 0;
  noMove = false;
}
function resetTurn() {
  robots.forEach( (robot) => {
    robot.x = robot.lastX;
    robot.y = robot.lastY;
  });
  moveCounter.reset();
  noMove = false;
}

function updateTurnBest(n) {
  if (turnBest == 0) turnBest = n;
  else turnBest = min(turnBest, n);
}

drawTokenLine = pushWrap( (tokens) => {
  textSize(16);
  fill(0);
  textAlign(CENTER, BOTTOM);
  tokens.forEach( (token, i) => {
    if (i == 8) translate( -8 * .75 * squareSize, squareSize * 1.2);
    translate(.75 * squareSize, 0);
    token.drawSmall();
    text(token.collectedIn, 0, .75*squareSize);
  });
  translate(.75 * squareSize,0);
  textAlign(CENTER, CENTER);
  if (tokens.length) text(totalMoves(tokens), 0,0);
})
function totalMoves(tokens) {
  return tokens.reduce((s, t) => s + t.collectedIn,0)
}
function setAlpha(colr, alph) {
  return color(red(colr),green(colr),blue(colr),alph);
}

function startGame() {
  gameOver = false;
  noMove = false;
  moveCounter.reset();
  sprites.forEach( (sprite) => sprite.reset());
  hitTarget = false;
  currentRobot = robots[1];
  currentToken = getNextToken();
  playerList.forEach( (player) => player.reset())
  placeBots();
  startTurn();
}