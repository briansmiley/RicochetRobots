//EXAMPLE CREATION

blueStar = new Sprite(squareSize, drawStar, blue)

blueStar.render()
class Sprite {
  constructor(size,drawFunc,color) {
    this.x = -1;
    this.y = -1;
    this.size = size;
    this.drawFunc = drawFunc;
    this.colr = color;
    this.icon;
    this.draw();
  }

  //Creates a new graphics object and draws the draw function there with all current parameters
  draw() {
    let icon = createGraphics(this.size, this.size);
    this.drawFunc(icon, this.colr);
    this.icon = icon;
  }
  //Assigns x, y coords on the main canvas
  position(x, y) {
    this.x = x;
    this.y = y;
  }
  //Draws the sprite to its coordinates on the main canvas
  render() {
    if (this.x < 0 || this.y < 0) throw new Error(`Sprite ${this.drawFunc.name} is not positioned`);
    else image(this.icon, this.x, this.y);
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