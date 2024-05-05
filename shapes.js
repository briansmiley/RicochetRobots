class Shape {
  constructor(x, y, colr = null) {
    this.color = color(colr);
    this.colorName = colr;
    this.x = x;
    this.y = y;
    this.collected = false;
    this.collectedIn = 0;
  }
  draw(size) {}
  drawSmall = pushWrap(() => {
    strokeWeight(2.5);
    fill(200);
    circle(0, 0, 0.625 * squareSize);
    strokeWeight(1);
    this.draw(0.4 * squareSize);
  });
  drawMed() {
    this.draw(0.75 * squareSize);
  }
  drawLarge() {
    this.draw(1.5 * squareSize);
  }
  renderBoard() {
    this.drawMed();
  }
  renderMerlin = pushWrap(() => {
    stroke(this.color);
    point(0, 0);
  });

  dim(alph) {
    this.color = setAlpha(this.color, alph);
  }
  undim() {
    this.dim(255);
  }
  reset() {
    this.collected = false;
    this.collectedIn = 0;
  }
}

class Triangle extends Shape {
  constructor(x, y, color) {
    super(x, y, color);
  }
  draw = pushWrap((size) => {
    fill(this.color);
    triangle(
      0,
      -size / 2,
      -(1 / sqrt(3)) * size,
      size / 2,
      (1 / sqrt(3)) * size,
      size / 2
    );
  });
}
class Square extends Shape {
  constructor(x, y, color) {
    super(x, y, color);
  }
  draw = pushWrap((size) => {
    fill(this.color);
    rect(-size / 2, -size / 2, size, size);
  });
}
class Circle extends Shape {
  constructor(x, y, color) {
    super(x, y, color);
  }
  draw = pushWrap((size) => {
    fill(this.color);
    circle(0, 0, size);
  });
}

class Star extends Shape {
  constructor(x, y, color) {
    super(x, y, color);
  }
  draw = pushWrap((size) => {
    fill(this.color);
    rotate(-PI / 2);
    beginShape();
    let x, y;
    let increment = TWO_PI / 5;
    for (let a = 0; a <= TWO_PI; a += increment) {
      x = cos(a) * 0.6 * size;
      y = sin(a) * 0.6 * size;
      vertex(x, y);
      x = cos(a + increment / 2) * 0.2 * size;
      y = sin(a + increment / 2) * 0.2 * size;
      vertex(x, y);
    }
    endShape();
  });
}

class Block extends Shape {
  constructor(x, y, color) {
    super(x, y, color);
  }
  draw = pushWrap((size) => {
    fill(this.color);
    noStroke();
    rect(-size / 2, -size / 2, size);
  });
}

class Burst extends Shape {
  constructor(x, y, color) {
    super(x, y, color);
  }
  draw = pushWrap((size) => {
    let alph = 0.66 * alpha(this.color);
    let colors = [
      color(255, 0, 0, alph),
      color(79, 0, 153, alph),
      color(0, 119, 255, alph),
      color(0, 153, 192, alph),
      color(245, 126, 0, alph),
      color(0, 0, 0, 100),
    ];
    colors.forEach((color) => {
      fill(color);
      ellipse(0, 0, size, size / 4);
      rotate(PI / 6);
    });
  });
}
