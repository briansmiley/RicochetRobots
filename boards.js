class Space {
    constructor(x,y) {
      this.x = x;
      this.y = y;
      this.sprite = null;
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
    addSprite(sprite) {
        this.sprite = sprite;
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

const newBoard = (boardSize = 8) => Array.from( {length : 2}, () => 
    Array.from( {length : boardSize}, () => 
        Array.from( {length : boardSize}, () => new Space())));

let [board1, board2, board3, board4] = Array.from( {length : 4}, () => newBoard(8) );
