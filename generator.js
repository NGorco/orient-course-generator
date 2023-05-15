const GlobalGlags = {
  drawingCourse: false,
  drawingDraftArena: false,
};

function movable(element, onmoved) {
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
    document.removeEventListener("mouseup", mouseup, false);
    document.removeEventListener("mousemove", mousemove, false);
  }
}

class AreaElement {
  constructor(element) {
    this.element = element;
  }

  delete() {
    this.element.remove();
  }
}

class Line extends AreaElement {
  constructor(elem) {
    super(elem);
  }

  redrawArea() {
    this.element.setAttribute("points", this.points.map((p) => p.getCoords()).join(","));
  }

  addPath(x, y) {
    const oldPoints = (this.element.getAttribute("points") || "").split(",").filter((i) => !!i);
    oldPoints.push(`${x} ${y}`);
    this.element.setAttribute("points", oldPoints.join(","));
  }

  getLinePoints() {
    return this.element.getAttribute("points");
  }
}

class GlobalPoint extends AreaElement {
  constructor(x, y, arenaEl, arenaObject) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    super(elem);
    this.element = elem;
    this.element.setAttribute("r", 6);
    this.arenaEl = arenaEl;
    arenaEl.appendChild(this.element);
    this.setCoords(x, y);
  }

  getCoords() {
    return `${this.x} ${this.y}`;
  }

  setCoords(x, y) {
    this.x = x;
    this.y = y;
    this.element.setAttribute("cx", x);
    this.element.setAttribute("cy", y);
  }
}

class AreaPoint extends GlobalPoint {
  constructor(x, y, arenaEl, arenaObj) {
    super(x, y, arenaEl, arenaObj);
    movable(this.element, (x, y) => {
      this.setCoords(x, y);
      arenaObj.redrawArea();
    });
    this.element.classList.add("arenaAreaPoint");
  }
}

class ArenaArea extends Line {
  constructor(arenaEl, points) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    super(elem);
    this.element = elem;
    this.arenaEl = arenaEl;
    this.element.classList.add("arenaArea");
    this.element.setAttribute("points", points);
    arenaEl.appendChild(this.element);
    this.points = points.split(",").map((pair) => {
      const p = pair.split(" ");
      return new AreaPoint(p[0], p[1], this.arenaEl, this);
    });
  }

  deleteArena() {
    this.points.forEach((p) => p.delete());
    this.delete();
  }
}

let arenaArea;

class CoursePoint extends GlobalPoint {
  constructor(x, y, courseEl, courseObject) {
    super(x, y, courseEl, courseObject);
    movable(this.element, (x, y) => {
      this.setCoords(x, y);
      courseObject.redrawArea();
      document.querySelector("#course-length").innerHTML = courseObject.getLineLength().toFixed(2);
    });
    this.element.classList.add("coursePoint");
  }
}

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

class CourseLine extends Line {
  constructor(courseEl) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    super(elem);
    this.element = elem;
    this.courseEl = courseEl;
    this.element.classList.add("courseLine");
    courseEl.appendChild(this.element);
    this.points = [];

    courseEl.addEventListener("click", (ev) => {
      if (GlobalGlags.drawingCourse) {
        this.addPath(ev.clientX, ev.clientY);
        this.points.push(new CoursePoint(ev.clientX, ev.clientY, courseEl, this));
      }
    });
  }

  generateCourse() {
    const fp = this.points.shift();
    this.points.forEach((p) => p.delete());
    this.points = [fp];
    const bs = arenaArea.element.getBBox();
    const bb = {
      x_min: bs.x,
      x_max: bs.x + bs.width,
      y_min: bs.y,
      y_max: bs.height + bs.y,
    };

    const length = 1200;

    const sizes = [30, 70, 200];
    let twoh = 0;

    while (length > this.getLineLength()) {
      let x = getRandomArbitrary(bb.x_min + 10, bb.x_max - 10);
      let y = getRandomArbitrary(bb.y_min + 10, bb.y_max - 10);

      const t = arenaArea.arenaEl.createSVGPoint();
      t.x = x;
      t.y = y;

      const size = sizes[getRandomArbitrary(0, 4)];
      const l = this.getTwoPointsDistance(t, this.points[this.points.length - 1]);

      if (l > size * 1.1 || l < size * 0.9) {
        continue;
      }

      if (size == 200 && 200 * 0.9 < l < 200 * 1.1 && twoh == 2) {
        continue;
      } else if (size == 200 && 200 * 0.9 < l < 200 * 1.1 && twoh < 2) {
        twoh++;
      }
      //console.log(x, y);
      if (arenaArea.element.isPointInFill(t)) {
        this.points.push(new CoursePoint(x, y, this.courseEl, this));
      }
    }

    this.redrawArea();
  }

  getTwoPointsDistance(point1, point2) {
    const x = point1.x - point2.x;
    const y = point1.y - point2.y;
    return Math.sqrt(x * x + y * y);
  }

  getLineLength() {
    let part0 = this.points[0];
    let len = 0;

    for (let t = 1; t < this.points.length; t++) {
      const part = this.points[t];

      len += this.getTwoPointsDistance(part0, part);
      part0 = part;
    }

    return len;
  }
}

class DraftLine extends Line {
  constructor(arenaEl) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    super(elem);
    this.element = elem;
    this.arenaEl = arenaEl;
    this.element.setAttribute("stroke", "black");
    this.element.setAttribute("fill", "none");
    arenaEl.appendChild(this.element);

    arenaEl.addEventListener("click", (ev) => {
      if (GlobalGlags.drawingDraftArena) {
        this.addPath(ev.clientX, ev.clientY);
      }
    });
  }
}

class AreaDrawer {
  constructor(arenaAreaEl, drawButtonEl, courseAreaEl, drawCourseButton) {
    this.courseAreaEl = courseAreaEl;
    this.drawPoints = [];
    this.arenaAreaEl = arenaAreaEl;

    drawButtonEl.addEventListener("click", (ev) => {
      if (GlobalGlags.drawingDraftArena) {
        this.finishDrawingArena();
        GlobalGlags.drawingDraftArena = false;
        arenaAreaEl.classList.remove("active");
        drawButtonEl.classList.remove("active");
      } else {
        arenaAreaEl.classList.add("active");
        this.arenaArea?.deleteArena();
        this.startDrawingArena();
        GlobalGlags.drawingDraftArena = true;
        drawButtonEl.classList.add("active");
      }
    });

    drawCourseButton.addEventListener("click", () => {
      if (GlobalGlags.drawingCourse) {
        this.finishDrawingCourse();
        GlobalGlags.drawingCourse = false;
        courseAreaEl.classList.remove("active");
        drawCourseButton.classList.remove("active");
      } else {
        this.courseLine?.deleteCourse();
        this.startDrawingCourse();
        courseAreaEl.classList.add("active");
        GlobalGlags.drawingCourse = true;
        drawCourseButton.classList.add("active");
      }
    });

    document.querySelector("#generateButton").addEventListener("click", () => {
      this.courseLine.generateCourse();
    });
  }

  finishDrawingCourse() {}

  startDrawingCourse() {
    if (!this.courseLine) {
      this.courseLine = new CourseLine(this.courseAreaEl);
    }
  }

  startDrawingArena() {
    if (!this.arenaDraft) {
      this.arenaDraft = new DraftLine(this.arenaAreaEl);
    }
  }

  finishDrawingArena() {
    this.arenaArea = new ArenaArea(this.arenaAreaEl, this.arenaDraft.getLinePoints());
    this.arenaDraft.delete();
    arenaArea = this.arenaArea;
    delete this.arenaDraft;
  }
}

new AreaDrawer(
  document.querySelector("#arena-area"),
  document.querySelector("#draw-arena-area"),
  document.querySelector("#course"),
  document.querySelector("#draw-course")
);
