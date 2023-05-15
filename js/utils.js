const GlobalGlags = {
  drawingCourse: false,
  drawingDraftArena: false,
  editingDraftArena: false,
};

let arenaArea;

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function movable(element, onmoved, onMouseUp = () => {}) {
  document.addEventListener("mousedown", mousedown, false);
  var mousedown_points;
  function mousedown(e) {
    if (GlobalGlags.drawingCourse || GlobalGlags.drawingDraftArena) {
      return false;
    }

    var target = e.target;
    if (target === element) {
      mousedown_points = {
        x: e.clientX,
        y: e.clientY,
      };
      document.addEventListener("mouseup", mouseup, false);
      document.addEventListener("mousemove", mousemove, false);
    }
  }

  function mousemove(e) {
    onmoved(e.clientX, e.clientY);
  }

  function mouseup(e) {
    onMouseUp();
    document.removeEventListener("mouseup", mouseup, false);
    document.removeEventListener("mousemove", mousemove, false);
  }
}