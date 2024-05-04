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
    addSprite(ShapeClass, colr) {
        this.sprite = new ShapeClass(-1,-1, colr);
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
function initBoard() {
    const newBoard = (boardSize = 8) => Array.from( {length : 2}, () => 
        Array.from( {length : boardSize}, (_, r) => 
            Array.from( {length : boardSize}, (_, c) => new Space(c, r))));
    
    const [board1, board2, board3, board4] = Array.from( {length : 4}, () => newBoard(8) );
    
    const boards = [board1, board2, board3, board4];

    boards.forEach( (twoSidedBoard) => 
        twoSidedBoard.forEach( (side) =>
            side.forEach( (row, r) => 
                row.forEach( (space, c) => {
                        if (r == 0) space.addWall('n');
                        if (c == 0) space.addWall('w');
                        if (r == 7 && c == 7) {
                            space.addWall('n');
                            space.addWall('w');
                        }
                    }
                )
            )
        )
    )
    function completeWalls(spaces) {
        spaces.forEach( (row, r) => {
          row.forEach( (space, c) => {
            if (r > 0 && spaces[r - 1][c].southWall) space.addWall('n');
            if (r < spaces.length - 1 && spaces[r + 1][c].northWall) space.addWall('s');
            if (c > 0 && spaces[r][c - 1].eastWall) space.addWall('w');
            if (c < row.length - 1 && spaces[r][c + 1].westWall) space.addWall('e');
          })
        })
        return spaces;
    }
    function createBigBoard(doubleBoards) {
        let pieces = shuffleBoards(doubleBoards);
        let oriented = pieces.map((board,i) => rotateBoard(board, i));
        return joinBoards(oriented)
    }
    function shuffleBoards(doubleBoards) {
    let boards = doubleBoards.map( (b) => random() > .5 ? b[0] : b[1])
    //Fisher-Yates shuffle the boards
    for (let i = boards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [boards[i], boards[j]] = [boards[j], boards[i]];
    }
    return boards;
    }
    //rotates a board clockwise n * 90 degrees
    function rotateBoard(b, n) {
        if(n == 0) return b;
        const numCols = b[0].length;
        const numRows = b.length;
        let buffBoard = b.map( (row) => row.slice());
        const rotBoard = b.map(row => new Array(row.length));
        
        for (let i = 0; i < n; i++) {
            for (let col = 0; col < numCols; col++) {
                for (let row = 0; row < numRows; row++) {
                    rotBoard[row][col] = buffBoard[numRows - col - 1][row]
                    let space = rotBoard[row][col];
                    let temp = [space.northWall, space.eastWall, space.southWall, space.westWall];
                    [space.northWall, space.eastWall, space.southWall, space.westWall] = [temp[3], temp[0], temp[1], temp[2]]
                }
            }
            buffBoard = rotBoard.map((row) => row.slice());
        }
        return rotBoard;
    }
    function joinBoards ([b1, b2, b3, b4]) {
        const joinH = (a, b) => a.map( (row, r) => row.concat(b[r]));
        const joined = joinH(b1,b2).concat(joinH(b4,b3));
       
        //once joined, we can set x/y values for everything
        joined.forEach( (row, r) => {
            row.forEach( (space, c) => {
                space.x = c;
                space.y = r;
                if (space.sprite) {
                    space.sprite.x = c;
                    space.sprite.y = r;
                }
            })
        });
        return joined;
    }
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
    board4[0][1][2].addWall('e').addWall('s').addSprite(Star, 'red');
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

    return completeWalls(createBigBoard(boards));
}
