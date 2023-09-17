const GlobalFlags = {
  drawingCourse: false,
  drawingDraftArena: false,
  editingDraftArena: false,
};

let arenaArea;

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function movable(surface, element, onmoved, onMouseUp = () => { }) {
  surface.addEventListener("mousedown", mousedown, false);
  var mousedown_points;
  function mousedown(e) {
    if (GlobalFlags.drawingCourse || GlobalFlags.drawingDraftArena) {
      return false;
    }

    var target = e.target;
    if (target === element) {
      mousedown_points = {
        x: e.offsetX,
        y: e.offsetY,
      };
      surface.addEventListener("mouseup", mouseup, false);
      surface.addEventListener("mousemove", mousemove, false);
    }
  }

  function mousemove(e) {
    onmoved(e.offsetX, e.offsetY);
  }

  function mouseup(e) {
    onMouseUp();
    surface.removeEventListener("mouseup", mouseup, false);
    surface.removeEventListener("mousemove", mousemove, false);
  }
}