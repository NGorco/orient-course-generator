// @ts-check
class CoursePoint extends GlobalPoint {
  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {HTMLElement} courseEl 
   * @param {CourseLine} courseObject 
   */
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
  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {string} text 
   * @param {HTMLElement} courseEl 
   */
  constructor(x, y, text, courseEl) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", "text");
    super(elem);
    this.element = elem;
    elem.innerHTML = text;
    elem.classList.add('course-number');
    this.setCoords(x - 20, y - 10);
    movable(courseEl, elem, (x, y) => {
      this.setCoords(x, y);
    });
    courseEl.appendChild(elem);
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   */
  setCoords(x, y) {
    this.x = x;
    this.y = y;
    this.element.setAttribute("x", x.toString());
    this.element.setAttribute("y", y.toString());
  }
}

class CourseLine extends Line {
  /**
   * @type {CoursePoint[]}
   */
  points;
  /**
   * 
   * @param {HTMLElement} courseEl 
   */
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
      if (GlobalFlags.drawingCourse) {
        this.addPath(ev.clientX, ev.clientY);
        this.points.push(new CoursePoint(ev.offsetX, ev.offsetY, courseEl, this));
      }
    });
  }

  redrawMask() {
    const bbox = this.element.getBBox();
    this.maskVisible.setAttribute("x", bbox.x.toString());
    this.maskVisible.setAttribute("y", bbox.y.toString());
    this.maskVisible.setAttribute("width", bbox.width.toString());
    this.maskVisible.setAttribute("height", bbox.height.toString());
  }

  generateCourse() {
    const fp = this.points.shift();
    if (!fp) {
      alert('No first point set!');
      return;
    }
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

    // Render course length
    const courseElem = document.querySelector("#course-length");
    if (courseElem) {
      courseElem.innerHTML = this.getLineLength().toFixed(2);
    }
  }

  generateNumbers() {
    this.numbers.forEach(n => n.delete());
    this.numbers = this.points.map((p, i) => {
      return new SvgNumber(p.x, p.y, (i + 1).toString(), this.courseEl);
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

    if (parseInt(Ctrls.courseLengthScale.toString(), 10) > 0) {
      return len * parseInt(Ctrls.courseLengthScale.toString(), 10);
    }
    return len;
  }
}