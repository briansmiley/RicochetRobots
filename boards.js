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
    addSprite(ShapeClass, color) {
        this.sprite = new ShapeClass( this.x, this.y, color);
        return this;
    }
    addWall(dir) {
      switch (dir) {
        case 'n':
          this.northWall = true;
          return this;
        case 'e':
          this.eastWall = true;
          return this;
        case 's':
          this.southWall = true;
          return this;
        case 'w':
          this.westWall = true;
          return this;
      }
    }
  }

const newBoard = (boardSize = 8) => Array.from( {length : 2}, () => 
    Array.from( {length : boardSize}, (_, r) => 
        Array.from( {length : boardSize}, (_, c) => new Space(c, r))));

const [board1, board2, board3, board4] = Array.from( {length : 4}, () => newBoard(8) );

const boards = [board1, board2, board3, board4];

boards.forEach( (side) => 
    sides.forEach( (side) =>
        side.forEach( (row, r) => 
            row.forEach( (space, c) => {
                if (r = 0) space.addWall('n');
                if (c = 0) space.addWall('w');
                if (r == 7 && c == 7) {
                    space.addWall('n');
                    space.addWall('w');
                }
            }
                ))))


board1[0][0][3].addWall('e');
board1[0][1][5].addWall('e').addWall('s').addSprite(Star, 'green');
board1[0][2][1].addWall('w').addWall('s').addSprite(Square, 'red');
board1[0][3][0].addWall('s');
board1[0][4][6].addWall('n').addWall('w').addSprite(Circle, 'yellow');
board1[0][6][2].addWall('n').addWall('e').addSprite(Triangle, 'blue');

board1[1][0][4].addWall('e');
board1[1][1][2].addWall('w').addWall('n').addSprite(Circle, 'yellow');
board1[1][3][6].addWall('w').addWall('s').addSprite(Triangle, 'blue');
board1[1][4][0].addWall('s');
board1[1][5][4].addWall('n').addWall('e').addSprite(Square, 'red');
board1[1][6][1].addWall('n').addWall('e').addSprite(Star, 'green');

board2[0][0][3].addWall('e');
board2[0][2][5].addWall('e').addWall('s').addSprite(Star, 'blue');
board2[0][4][0].addWall('s');
board2[0][4][2].addWall('e').addWall('n').addSprite(Circle, 'green');
board2[0][5][7].addWall('w').addWall('s').addSprite(Triangle, 'red');
board2[0][6][1].addWall('n').addWall('w').addSprite(Square, 'yellow');

board2[1][0][3].addWall('e');
board2[1][1][1].addWall('w').addWall('s').addSprite(Triangle, 'red');
board2[1][2][6].addWall('e').addWall('n').addSprite(Circle, 'green');
board2[1][4][2].addWall('s').addWall('e').addSprite(Star,'blue');
board2[1][5][0].addWall('s');
board2[1][5][7].addWall('n').addWall('w').addSprite(Square, 'yellow');

board3[0][0][4].addWall('e');
board3[0][1][6].addWall('e').addWall('s').addSprite(Star, 'yellow');
board3[0][2][1].addWall('w').addWall('n').addSprite(Triangle, 'green');
board3[0][5][0].addWall('s');
board3[0][5][6].addWall('n').addWall('e').addSprite(Square, 'blue');
board3[0][6][3].addWall('w').addWall('s').addSprite(Circle, 'red');

board3[1][0][1].addWall('e');
board3[1][1][4].addWall('w').addWall('n').addSprite(Circle, 'red');
board3[1][2][1].addWall('n').addWall('e').addSprite(Triangle, 'green');
board3[1][3][6].addWall('s').addWall('e').addSprite(Star, 'yellow');
board3[1][5][0].addWall('s');
board3[1][6][3].addWall('w').addWall('s').addSprite(Square, 'blue');

board4[0][0][5].addWall('e');
board4[0][1][w].addWall('e').addWall('s').addSprite(Star, 'red');
board4[0][3][1].addWall('s').addWall('w').addSprite(Square, 'green');
board4[0][4][0].addWall('s');
board4[0][4][6].addWall('w').addWall('n').addSprite(Triangle, 'yellow');
board4[0][6][5].addWall('n').addWall('e').addSprite(Circle, 'blue');
board4[0][7][3].addWall('s').addWall('e').addSprite(Burst, 'white');

board4[1][0][3].addWall('e');
board4[1][1][6].addWall('w').addWall('s').addSprite(Circle, 'blue');
board4[1][3][1].addWall('e').addWall('n').addSprite(Triangle, 'yellow');
board4[1][4][5].addWall('w').addWall('n').addSprite(Square,'green');
board4[1][5][2].addWall('s').addWall('e').addSprite(Star, 'red');
board4[1][5][7].addWall('s').addWall('e').addSprite(Burst, 'white');
board4[1][6][0].addWall('s');