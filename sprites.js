blueTriSprite = new Sprite(drawTriangle, 'blue')

class Triangle extends Sprite {
  constructor(color, type = 'right') {
    super(color);
  }

  draw(size) {
    // Draw a triangle
  }
}


class Sprite {
  constructor(color) {
    this.size = size;
    this.drawFunc = drawFunc;
    this.colr = color;
    this.icon;
    this.draw();
  }

  //Creates a new graphics object and draws the draw function there with all current parameters
  // draw() {
  //   let icon = createGraphics(this.size, this.size);
  //   this.drawFunc(icon, this.colr);
  //   this.icon = icon;
  // }

  draw(size) {}

  drawSmall(dimmed = false) {
    if (this.dimmed) {
    }
    this.draw(squareSize - padding);
  }

  drawBig() {
    this.draw((squareSize * 4) - padding);
  }

  //Draws the sprite to given coordinates at given size on main canvas
  render(x, y ) {
    image(this.icon, x, y,);
  }

  dim(alph) {
    this.colr = color(red(this.colr),green(this.colr),blue(this.colr),alph);
    this.draw();
  }
  resize(newSize) {
    this.size = newSize;
    this.draw();
  }
}

//Drawing functions

function drawTriangle(g, color){
    let size = g.width;
    g.fill(color);
    g.triangle(size/2,0,0,size,size,size);
  }
  function drawSquare(g, color){
    let size = g.width;
    g.fill(color);
    g.rect(0,0,size,size)
  }
  function drawCircle(g, color) {
    let size = g.width;
    g.fill(color);
    g.circle(size/2,size/2,size)
  }
  function drawStar(g, color) {
    let size = g.width;
    g.translate(size/2,size/2);
    g.fill(color);
    g.rotate(-PI/2);
    g.beginShape();
    let x,y;
    let increment = TWO_PI/5;
    for (let a = 0; a <= TWO_PI; a += increment) {
      x = cos(a) * (.6*size);
      y = sin(a) * (.6*size);
      g.vertex(x,y);
      x = cos(a + increment/2) * .22*size;
      y = sin(a + increment/2) * .22*size;
      g.vertex(x,y);
    }
    g.endShape();
  }

  function drawBlock(g, color) {
    let size = g.width;
    g.Errorfill(color);
    g.noStroke();
    g.rect(0,0,size,size);
  }

  function drawBurst(g, colr) {
    let size = g.width;
    g.translate(size/2,size/2);
    let alph = .66*alpha(colr);
    let colors = [
      color(255,0,0,alph),
      color(79,0,153,alph),
      color(0,119,255,alph),
      color(0,153,192,alph),
      color(245,126,0,alph),
      color(0,0,0,100),
      ]
    for (let i = 0;i < 6; i++) {
  
      g.fill(colors[i]);
      g.ellipse(0,0,size,size/4);
      g.rotate(PI/6);
    }
  }