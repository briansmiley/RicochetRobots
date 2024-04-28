class Shape {
    constructor(color) {

    }
    draw(size){}
    drawSmall() {
        draw(.7 * squareSize)
    }
    drawMed() {
        draw(squareSize)
    }
    drawLarge() {
        draw(4 * squareSize)
    }
}

class Triangle extends Shape {
    constructor(color){
        super(color)
    }
    draw = pushWrap( (size) => {
        fill(this.color);
        triangle(0, size/2, -size/2, size/2, size/2, size/2);
    })
}
class Square extends Shape {
    constructor(color){
        super(color)
    }
    draw = pushWrap( (size) => {
        fill(this.color);
        rect(-size/2, -size/2, size/2, size/2);
    })
}
class Circle extends Shape {
    constructor(color){
        super(color)
    }
    draw = pushWrap((size) => {
        fill(this.color);
        circle(0, 0, size)
    })
}

class Star extends Shape {
    constructor(color) {
        super(color)
    }
    draw = pushWrap((size) => {
        fill(this.color);
        rotate(-PI/2);
        beginShape();
        let x,y;
        let increment = TWO_PI/5;
        for (let a = 0; a <= TWO_PI; a += increment) {
        x = cos(a) * .6*size;
        y = sin(a) * .6*size;
        vertex(x,y);
        x = cos(a + increment/2) * .2*size;
        y = sin(a + increment/2) * .2*size;
        vertex(x,y);
        }
        endShape();
    })
}

class Block extends Shape {
    constructor(color) {
        super(color);
    }
    draw = pushWrap((size) => {
        fill(this.color);
        noStroke();
        rect(-size/2, -size/2, size)
    })
}

class Burst extends Shape {
    constructor(color) {
        super(color);
    }

    draw = pushWrap((size) => {
        let alph = .66*alpha(this.color);
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
    })
}