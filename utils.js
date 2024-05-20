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
