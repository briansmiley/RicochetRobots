function pushWrap(fn) {
    return (...args) => {
      push();
      const res = fn(...args);
      pop();
      return res;
    }
  }