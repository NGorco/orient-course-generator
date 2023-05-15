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
    if (this.redrawMask) {
      this.redrawMask();
    }
  }

  addPath(x, y) {
    const oldPoints = (this.element.getAttribute("points") || "").split(",").filter((i) => !!i);
    oldPoints.push(`${x} ${y}`);
    this.element.setAttribute("points", oldPoints.join(","));
    if (this.redrawMask) {
      this.redrawMask();
    }
  }

  getLinePoints() {
    return this.element.getAttribute("points");
  }
}

class Easy {
  constructor(rootElem) {
    rootElem.querySelectorAll(`[e-change]`).forEach(el => {
      try {
        const model = el.getAttribute(`e-change`);

        el.addEventListener('change', () => {
          try {
            if (el.type === 'number') {
              this[model] = parseInt(el.value);
            } else {
              this[model] = el.value;
            }
          } catch (error) {
            throw new Error(`Error listener e-change: ${model}`);
          }

        });
        if (el.type === 'number') {
          this[model] = parseInt(el.value);
        } else {
          this[model] = el.value;
        }
      } catch (error) {
        console.error(`Error setting e-change: ${model}`);
        throw new Error(error);
      }
    });

    rootElem.querySelectorAll(`[e-click]`).forEach(el => {
      const methodName = el.getAttribute(`e-click`);

      el.addEventListener('click', (e) => {
        try {
          this[methodName](e, el);
        } catch (e) {
          console.error(`Error listening e-click: ${methodName}`);
          throw new Error(e);
        }
      });
    });
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