
class CoursePoint extends GlobalPoint {
  constructor(x, y, courseEl, courseObject) {
    super(x, y, courseEl, courseObject);
    this.maskingPoint = new GlobalPoint(x, y, courseObject.mask, courseObject);
    movable(courseEl, this.element, (x, y) => {
      this.setCoords(x, y);
      this.maskingPoint.setCoords(x, y);
      courseObject.redrawArea();
      document.querySelector("#course-length").innerHTML = courseObject.getLineLength().toFixed(2);
    });
    this.element.classList.add("coursePoint");
  }

  fullDelete() {
    this.delete();
    this.maskingPoint.delete();
  }
}

class SvgNumber extends AreaElement {
  constructor(x,y, text, courseEl) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", "text");
    super(elem);
    this.element = elem;
    elem.innerHTML = text;    
    elem.classList.add('course-number');
    this.setCoords(x-20,y-10);
    movable(courseEl, elem, (x, y) => {
      this.setCoords(x,y);
    });
    courseEl.appendChild(elem);
  }

  setCoords(x, y) {
    this.x = x;
    this.y = y;
    this.element.setAttribute("x", x);
    this.element.setAttribute("y", y);
  }

}

class CourseLine extends Line {
  constructor(courseEl) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    super(elem);
    this.mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    this.mask.setAttribute("id", "mask");
    this.element = elem;
    this.courseEl = courseEl;
    this.element.classList.add("courseLine");
    this.element.setAttribute("mask", "url(#mask)");

    this.maskVisible = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this.maskVisible.classList.add("visibleMask");
    courseEl.appendChild(this.element);
    courseEl.appendChild(this.mask);
    this.mask.appendChild(this.maskVisible);

    this.points = [];
    this.numbers = [];

    courseEl.addEventListener("click", (ev) => {
      if (GlobalGlags.drawingCourse) {
        this.addPath(ev.clientX, ev.clientY);
        this.points.push(new CoursePoint(ev.offsetX, ev.offsetY, courseEl, this));
      }
    });
  }

  redrawMask() {
    const bbox = this.element.getBBox();
    this.maskVisible.setAttribute("x", bbox.x);
    this.maskVisible.setAttribute("y", bbox.y);
    this.maskVisible.setAttribute("width", bbox.width);
    this.maskVisible.setAttribute("height", bbox.height);
  }

  generateCourse() {
    const fp = this.points.shift();
    this.points.forEach((p) => p.fullDelete());
    this.points = [fp];
    const bs = arenaArea.element.getBBox();
    const bb = {
      x_min: bs.x,
      x_max: bs.x + bs.width,
      y_min: bs.y,
      y_max: bs.height + bs.y,
    };

    const length = Ctrls.courseLength;

    const sizes = JSON.parse(Ctrls.trackDistances);
    let twoh = 0;

    while (length > this.getLineLength()) {
      let x = getRandomArbitrary(bb.x_min + 10, bb.x_max - 10);
      let y = getRandomArbitrary(bb.y_min + 10, bb.y_max - 10);

      const t = arenaArea.arenaEl.createSVGPoint();
      t.x = x;
      t.y = y;

      const size = sizes[getRandomArbitrary(0, sizes.length - 1)];
      const l = this.getTwoPointsDistance(t, this.points[this.points.length - 1]);

      if (l > size * Ctrls.trackMax || l < size * Ctrls.trackMin) {
        continue;
      }

      if (
        size == Ctrls.longTrackValue && 
        Ctrls.longTrackValue * Ctrls.trackMin < l < Ctrls.longTrackValue * Ctrls.trackMax && 
        twoh == Ctrls.longTracksMax) {
        continue;
      } else if (
        size == Ctrls.longTrackValue && 
        Ctrls.longTrackValue * Ctrls.trackMin < l < Ctrls.longTrackValue * Ctrls.trackMax && 
        twoh < Ctrls.longTracksMax) {
        twoh++;
      }
      //console.log(x, y);
      if (arenaArea.element.isPointInFill(t)) {
        this.points.push(new CoursePoint(x, y, this.courseEl, this));
      }
    }

    this.redrawArea();
    this.generateNumbers();
  }

  generateNumbers() {
    this.numbers.forEach(n => n.delete());
    this.numbers = this.points.map((p, i) => {
      return new SvgNumber(p.x, p.y, i+1, this.courseEl);
    });
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