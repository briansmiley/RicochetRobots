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
let collectedTokens = [];
let moveCounter, hitTarget, turnBest;
let playerList = [];
let gameOver;
let roboSounds, victorySound;
let turnTimer;
const noBloops = true; //stop robots from speaking

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
  render = pushWrap((x = width / 2, y = width + squareSize) => {
    fill(0);
    textSize(24);
    textAlign(CENTER, BOTTOM);
    text(`Moves: ${this.count > 0 ? this.count : `-`}`, x, y);
  });
}
class Robot {
  constructor(x, y, colr, sound = null) {
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    this.lastStopX = -1;
    this.lastStopY = -1;
    this.color = color(colr);
    this.colorName = colr;
    this.vel = [0, 0];
    this.selected = false;
    this.sound = sound;
  }
  speak() {
    if (!this.sound || noBloops) return;
    this.sound.play();
  }
  select() {
    this.speak();
    this.selected = true;
    currentRobot = this;
  }
  place(x, y) {
    this.x = x;
    this.y = y;
  }
  render = pushWrap((size) => {
    fill(this.color);

    circle(0, -size / 4, size / 6);
    circle(0, -size / 20, size / 4);
    circle(0, size / 4, size / 3);
  });
  renderPlaceholder = pushWrap(() => {
    fill(setAlpha(this.color, 100));
    strokeWeight(1);
    this.colorName == "yellow" ? stroke(`#AA0`) : stroke(this.color);
    circle(
      (this.lastX + 0.5) * squareSize,
      (this.lastY + 0.5) * squareSize,
      0.9 * squareSize
    );
  });

  stop() {
    this.vel = [0, 0];
    if (inMotion) {
      board.history.push({
        colorName: this.colorName,
        x: this.lastStopX,
        y: this.lastStopY,
      });
      this.lastStopX = this.x;
      this.lastStopY = this.y;
      click.play();
      moveCounter.increment();
    }
    inMotion = false;
  }
  move() {
    if (noMove) this.vel = [0, 0];
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
      if (this.x == board.spaces[this.y].length - 1 || currentSquare.eastWall) {
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
      if (this.x == 0 || currentSquare.westWall) {
        this.stop();
        return;
      } else {
        this.x--;
        inMotion = true;
      }
    }
    //If moving down
    if (this.vel[1] == 1) {
      //Stop if on last row or wall below
      if (this.y == board.spaceslength - 1 || currentSquare.southWall) {
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
      if (this.y == 0 || currentSquare.northWall) {
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
  constructor(spacesArray) {
    this.origX = 0;
    this.origY = 0;
    this.w = spacesArray[0].length;
    this.h = spacesArray.length;
    this.wallThickness = wallThickness;
    this.squareSize = squareSize;
    this.spaces = spacesArray;
    this.history = [];
    this.endSpots = {};
  }
  locate(x, y) {
    this.origX = x;
    this.origY = y;
  }
  update() {
    currentRobot.move();
    if (this.checkGoal()) {
      if (!hitTarget) {
        victorySound.play();
        if (moveCounter.count < turnBest || turnBest == 0) this.saveEndSpots();
      }
      hitTarget = true;
      updateTurnBest(moveCounter.count + 1);
      noMove = true;
    } else hitTarget = false;
  }
  saveEndSpots() {
    robots.forEach(
      (robot) => (this.endSpots[robot.colorName] = [robot.x, robot.y])
    );
  }
  rewind(n) {
    if (this.history.length == 0) {
      robots.forEach((robot) => robot.place(robot.lastX, robot.lastY));
      return;
    }
    for (let i = 0; i < n; i++) {
      let step = this.history.pop();
      let rob = robots.find((robot) => robot.colorName == step.colorName);
      rob.place(step.x, step.y);
      rob.lastStopX = step.x;
      rob.lastStopY = step.y;
      moveCounter.increment(-1);
    }
  }
  resetHistory() {
    this.history = [];
    robots.forEach(
      (robot) => ([robot.lastStopX, robot.lastStopY] = [robot.x, robot.y])
    );
  }
  show = pushWrap(() => {
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
    this.renderTimer();
    updatePlayers();
  });
  renderTimer = pushWrap(() => {
    textAlign(RIGHT, BOTTOM);
    translate(width, height);
    turnTimer.render();
  });
  renderCollected = pushWrap(() => {
    translate(0, width + squareSize / 2);
    drawTokenLine(collectedTokens);
  });
  renderCounter = () => moveCounter.render();
  renderTurnBest = pushWrap(() => {
    textSize(16);
    textAlign(RIGHT, BOTTOM);
    fill("green");
    text(`Best: ${turnBest > 0 ? turnBest : `-`}`, width, (width * 17) / 16);
  });
  renderGrid = pushWrap(() => {
    //Draw the boxes
    for (let i = 0; i < this.h; i++) {
      for (let j = 0; j < this.w; j++) {
        rect(j * this.squareSize, i * this.squareSize, this.squareSize);
      }
    }
    rectMode(CENTER);
    //Draw center gray square
    push();
    fill(200);
    translate((this.squareSize * this.w) / 2, (this.squareSize * this.h) / 2);
    rect(0, 0, squareSize * 2);
    pop();
    //Highlight current robot
    push();
    fill(220);
    translate(
      this.squareSize * (0.5 + currentRobot.x),
      this.squareSize * (0.5 + currentRobot.y)
    );
    rect(0, 0, this.squareSize);
    pop();
  });
  renderWalls() {
    this.spaces.forEach((row) =>
      row.forEach((space) =>
        space.renderWalls(this.squareSize, this.wallThickness)
      )
    );
  }
  renderSprites() {
    sprites.forEach(
      pushWrap((currentSprite) => {
        translate(
          this.squareSize * (0.5 + currentSprite.x),
          this.squareSize * (0.5 + currentSprite.y)
        );
        //Dim sprite if a robot is on top of it
        robots.forEach((robot) => {
          if (currentSprite.x == robot.x && currentSprite.y == robot.y)
            currentSprite.dim(75);
        });
        currentSprite.renderBoard();
        currentSprite.undim();
        // currentSprite.undim();
      })
    );
  }
  renderCurrentToken = pushWrap(() => {
    translate((squareSize * this.w) / 2, (squareSize * this.h) / 2);
    if (currentToken) currentToken.drawLarge();
    else {
      push();
      fill(0);
      circle(0, 0, squareSize * 1.8);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(36);
      text(totalMoves(sprites), 0, 0);
      pop();
    }
  });
  renderBots() {
    robots.forEach(
      pushWrap((robot) => {
        translate(
          this.squareSize * (0.5 + robot.x),
          this.squareSize * (0.5 + robot.y)
        );
        robot.render(squareSize);
      })
    );
  }
  renderPlaceholders() {
    robots.forEach((robot) => robot.renderPlaceholder());
  }

  //returns true if a valid robot is sitting on the target sprite
  checkGoal() {
    if (!currentToken) return false;
    const onTarget = (robot) =>
      robot.x == currentToken.x && robot.y == currentToken.y;
    //If we are aiming for free square, check if ANY bot is touching
    if (currentToken.colorName == "white") {
      return robots.some((robot) => onTarget(robot));
    }
    return onTarget(
      robots.find((robot) => robot.colorName == currentToken.colorName)
    );
  }
}

function fetchSprites(board) {
  let sprites = [];
  board.spaces.forEach((row) => {
    row.forEach((space) => {
      if (space.sprite) sprites.push(space.sprite);
    });
  });
  return sprites;
}

function mousePressed() {
  let x = floor(mouseX / squareSize);
  let y = floor(mouseY / squareSize);
  // console.log(`Clicked at ${int(mouseX)} ${int(mouseY)} which we take as ${x} ${y}`)

  robots.forEach((robot) => {
    if (robot.x == x && robot.y == y) {
      robot.select();
    }
  });
  if (x >= 7 && x <= 8 && y >= 7 && y <= 8) {
    if (gameOver) startGame();
    currentToken =
      sprites.filter((s) => !s.collected).length == 1
        ? currentToken
        : getNextToken();
    if (!currentToken) gameOver = true;
    turnBest = 0;
    resetTurn();
    startTurn();
  }
}
function keyPressed() {
  if (document.activeElement.tagName == "INPUT") return; //ignore keyboard inputs if we are editing a player name
  if (inMotion) return;
  switch (keyCode) {
    case UP_ARROW:
      currentRobot.vel = [0, -1];
      break;
    case DOWN_ARROW:
      currentRobot.vel = [0, 1];
      break;
    case LEFT_ARROW:
      currentRobot.vel = [-1, 0];
      break;
    case RIGHT_ARROW:
      currentRobot.vel = [1, 0];
      break;
    case BACKSPACE:
      board.rewind(1);
      break;
    default:
      switch (key) {
        case " ":
          resetTurn();
          break;
        case "w":
          currentRobot.vel = [0, -1];
          break;
        case "s":
          currentRobot.vel = [0, 1];
          break;
        case "a":
          currentRobot.vel = [-1, 0];
          break;
        case "d":
          currentRobot.vel = [1, 0];
          break;
        case "r":
        case "g":
        case "b":
        case "y":
          currentRobot = robots.find((robot) => robot.colorName[0] == key);
          break;
      }
  }
}
function placeBots() {
  robots.forEach((robot) => {
    let spotX, spotY;
    let tries = 0;
    while (true) {
      let collision = false;
      if (tries > 1000) {
        throw new Error("Bot placement error");
      }
      spotX = int(random(0, 16));
      spotY = int(random(0, 16));
      centerSquares = [
        [7, 7],
        [7, 8],
        [8, 7],
        [8, 8],
      ];
      collision =
        sprites.some((sprite) => sprite.x == spotX && sprite.y == spotY) ||
        robots.some((robo) => robo.x == spotX && robo.y == spotY) ||
        centerSquares.some(
          (coords) => coords[0] == spotX && coords[1] == spotY
        );
      if (!collision) {
        robot.place(spotX, spotY);
        break;
      }
    }
  });
}

//Hard coded but later might populate this using modular board configs
// spriteData = [
//   {x: 1, y: 2, ShapeClass: Triangle, color: 'green'},
//   {x: 6, y: 1, ShapeClass: Square, color: 'yellow'},
//   {x: 6, y: 5, ShapeClass: Square, color: 'blue'},
//   {x: 3, y: 6, ShapeClass: Circle, color: 'red'},
//   {x: 7, y: 12, ShapeClass: Burst, color: 'white'},
//   {x: 9, y: 1, ShapeClass: Square, color: 'green'},
//   {x: 4, y: 9, ShapeClass: Triangle, color: 'yellow'},
//   {x: 6, y: 10, ShapeClass: Circle, color: 'blue'},
//   {x: 8, y: 10, ShapeClass: Circle, color: 'yellow'},
//   {x: 10, y: 4, ShapeClass: Square, color: 'red'},
//   {x: 14, y: 2, ShapeClass: Star, color: 'yellow'},
//   {x: 12, y: 6, ShapeClass: Triangle, color: 'blue'},
//   {x: 3, y: 14, ShapeClass: Star, color: 'green'},
//   {x: 1, y: 13, ShapeClass: Star, color: 'red'},
//   {x: 9, y: 13, ShapeClass: Circle, color: 'green'},
//   {x: 13, y: 11, ShapeClass: Star, color: 'blue'},
//   {x: 14, y: 14, ShapeClass: Triangle, color: 'red'},
// ]

//returns an uncollected sprite or returns false if there are none
function getNextToken() {
  if (sprites.every((sprite) => sprite.collected)) return false;
  while (true) {
    let s = sprites[int(random(sprites.length))];
    if (!s.collected && s != currentToken) return s;
  }
}

function preload() {
  click = loadSound("sound/click.mp3");
  roboSounds = Array.from({ length: 4 }, (_, i) =>
    loadSound(`./sound/interface/question_00${i + 1}.ogg`)
  );
  roboSounds.forEach((sound) => sound.setVolume(0.1));
  click.setVolume(0.5);
  victorySound = loadSound("./sound/interface/confirmation_004.ogg");
  victorySound.setVolume(0.2);
}
function setup() {
  let w = min(windowWidth, (windowHeight - 100) / 1.2);
  let canvas = createCanvas(w, w * 1.17);
  canvas.parent("canvas-here");
  background(255);
  frameRate(60);
  setupTimer();
  window.addEventListener("keydown", (event) => {
    if (event.key == " ") event.preventDefault();
  });
  const p1 = new Player("Player 1", 1);
  addPlayer(p1);
  // p1.elt.replaceChild(p1.input, p1.nameSpan);
  setupAddPlayer();

  moveCounter = new Counter();
  squareSize = width / 16;
  wallThickness = squareSize / 9;
  board = new Board(initBoard());
  ["red", "yellow", "green", "blue"].forEach((color, i) =>
    robots.push(new Robot(-1, -1, color, roboSounds[i]))
  );
  sprites = fetchSprites(board);
  currentRobot = robots[1];
  noMove = true;
  startGame();
}
function setupTimer() {
  turnTimer = new Timer();
  let timerButton = document.getElementById("timer-button");
  timerButton.addEventListener("click", () => {
    if (!turnTimer.running) {
      turnTimer.start();
      return;
    } else {
      turnTimer.reset();
    }
  });
  turnTimer.button = timerButton;
}
function draw() {
  clear();
  background(220);
  board.update();
  board.show();
}
class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.tokens = [];
    this.elt;
    this.nameSpan;
    this.scoreSpan;
    this.nameInput;
    this.scoreButton;
  }
  collectToken() {
    if (sprites.every((s) => s.collected)) return;
    // if (turnBest < 1 && !confirm(`Collect with move count of ${turnBest}?`)) return;
    currentToken.collected = true;
    currentToken.collectedIn = turnBest;
    this.tokens.push(currentToken);
    collectedTokens.push(currentToken);
    currentToken = getNextToken();
    robots.forEach((robot) => {
      const endPos = board.endSpots[robot.colorName];
      robot.place(endPos[0], endPos[1]);
    });
    startTurn();
  }
  reset() {
    this.tokens = [];
  }
}

function setupAddPlayer() {
  let button = document.getElementById("add-player-button");
  button.onclick = () => {
    const id = playerList[playerList.length - 1].id + 1;
    const newPlayer = new Player(`Player ${id}`, id);
    addPlayer(newPlayer);
  };
}
function selectPlayerName(player) {
  //For selecting the name div in the contenteditable implementation
  let range = document.createRange();
  let selection = window.getSelection();
  selection.removeAllRanges();
  range.selectNodeContents(player.input);
  selection.addRange(range);
}
function addPlayer(player) {
  playerList.push(player);
  const container = document.getElementById("players");

  const playerDiv = document.createElement("div");
  playerDiv.id = `player-${player.id}`;
  playerDiv.className = `player`;

  const playerText = document.createElement("div");
  playerText.id = `player-${player.id}-text`;
  playerText.classname = `player-text`;

  //create player name field
  const playerName = document.createElement("div");
  playerName.textContent = `${player.name}`;
  playerName.className = "player-name";
  playerName.id = `player-${player.id}-name`;

  const playerInput = document.createElement("input");
  playerInput.type = "text";
  playerInput.className = "player-name-input";
  playerInput.value = player.name;
  const updateName = () => {
    player.name = playerInput.value || player.name;
    playerName.textContent = player.name; //set playerName text to input text
    playerDiv.replaceChild(playerName, playerInput); // Replace the input with the text
  };
  playerInput.addEventListener("blur", updateName);
  playerInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Enter") {
      playerInput.blur();
    }
  });
  const editName = () => {
    playerDiv.replaceChild(playerInput, playerName); // Replace name with editable input
    player.nameInput.focus(); //Select the input
    player.nameInput.select();
  };
  playerName.addEventListener("click", editName);

  const playerScore = document.createElement("div");
  playerScore.className = "player-score";
  playerScore.textContent = "0";

  const scoreButton = document.createElement("button");
  scoreButton.className = "score-button";
  scoreButton.id = `score-player-${player.id}`;
  scoreButton.textContent = "Collect";
  scoreButton.onclick = () => player.collectToken();

  player.elt = playerDiv;
  player.scoreSpan = playerScore;
  player.scoreButton = scoreButton;
  player.nameSpan = playerName;
  player.nameInput = playerInput;
  playerDiv.appendChild(scoreButton);
  playerDiv.appendChild(playerInput);
  playerDiv.appendChild(document.createTextNode(": "));
  playerDiv.appendChild(playerScore);
  container.insertBefore(playerDiv, container.lastElementChild);

  if (player.id != 1) {
    player.nameInput.focus();
    player.nameInput.select();
  }
  if (playerList.length > 17)
    //we have to stop somewhere
    document.getElementById("add-player-button").classList.add("hidden");
}

function updatePlayers() {
  if (playerList.length == 0) return;
  playerList.forEach((player) => {
    player.scoreSpan.textContent = `${player.tokens.length}`;
    //If the goal hasnt been reached yet, hide the Collect buttons
    turnBest == 0
      ? player.scoreButton.classList.add("hidden")
      : player.scoreButton.classList.remove("hidden");
  });
}

function startTurn() {
  robots.forEach((robot) => {
    robot.lastX = robot.x;
    robot.lastY = robot.y;
  });
  board.resetHistory();
  board.saveEndSpots();
  turnTimer.reset();
  moveCounter.reset();
  turnBest = 0;
  noMove = false;
}
function resetTurn() {
  robots.forEach((robot) => {
    robot.x = robot.lastX;
    robot.y = robot.lastY;
  });
  board.resetHistory();
  moveCounter.reset();
  noMove = false;
}

function updateTurnBest(n) {
  if (turnBest == 0) turnBest = n;
  else turnBest = min(turnBest, n);
}

drawTokenLine = pushWrap((tokens) => {
  textSize(16);
  fill(0);
  textAlign(CENTER, BOTTOM);
  tokens.forEach((token, i) => {
    if (i == 8) translate(-8 * 0.75 * squareSize, squareSize * 1.2);
    translate(0.75 * squareSize, 0);
    token.drawSmall();
    text(token.collectedIn, 0, 0.75 * squareSize);
  });
  translate(0.75 * squareSize, 0);
  textAlign(CENTER, CENTER);
  if (tokens.length) text(totalMoves(tokens), 0, 0);
});
function totalMoves(tokens) {
  return tokens.reduce((s, t) => s + t.collectedIn, 0);
}
function setAlpha(colr, alph) {
  return color(red(colr), green(colr), blue(colr), alph);
}

function startGame() {
  gameOver = false;
  noMove = false;
  moveCounter.reset();
  sprites.forEach((sprite) => sprite.reset());
  hitTarget = false;
  currentRobot = robots[1];
  currentToken = getNextToken();
  playerList.forEach((player) => player.reset());
  placeBots();
  startTurn();
}

class Timer {
  constructor(duration = 60) {
    this.running = false;
    this.duration = duration * 1000;
    this.banked = 0;
    this.lastStart;
    this.button;
  }
  remaining() {
    return max(0, this.duration - this.elapsed());
  }
  elapsed() {
    return min(
      this.duration,
      this.banked + (this.running ? millis() - this.lastStart : 0)
    );
  }
  start() {
    if (!this.running) {
      this.running = true;
      this.button.innerText = "Reset";
      this.lastStart = millis();
    }
  }
  stop() {
    if (this.running) {
      this.banked = this.elapsed();
      this.running = false;
      this.button.innerText = "Start";
    }
  }
  reset(duration = this.duration) {
    this.duration = duration;
    this.banked = 0;
    this.running = false;
    this.lastStart = null;
    this.button.innerText = "Start";
  }
  render = pushWrap(() => {
    textSize(32);
    fill(this.remaining() == 0 ? "red" : 0);
    text(`${parseInt(this.remaining() / 1000)}`, 0, 0);
  });
}
