function pushWrap(fn) {
  return (...args) => {
    push();
    const res = fn(...args);
    pop();
    return res;
  };
}

const colorToBrightness = pushWrap((oldColor, newBrightness) => {
  colorMode(HSB);
  let newColor = color(oldColor);
  return color([hue(newColor), saturation(newColor), newBrightness]);
});

function spiralBoard(startFrame = 0) {
  let t = frameCount - startFrame;
  if (t < 0) return;
  let xCenter = board.origX + (board.w * squareSize) / 2;
  let yCenter = board.origY + (board.h * squareSize) / 2;
  translate(xCenter, yCenter);
  rotate(t ** 1.5 / 250);
  scale(0.997 ** t);
  translate(-xCenter, -yCenter);
}
