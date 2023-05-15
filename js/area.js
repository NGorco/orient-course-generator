class AreaPoint extends GlobalPoint {
  constructor(x, y, arenaEl, arenaObj) {
    super(x, y, arenaEl, arenaObj);
    movable(arenaEl, this.element, (x, y) => {
      this.setCoords(x, y);
      arenaObj.redrawArea();
    }, () => {
      arenaObj.saveArea();
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

  saveArea() {
    let mapAreas = localStorage.getItem('mapAreas');
    if (mapAreas) {
      mapAreas = JSON.parse(mapAreas);
    } else {
      mapAreas = {};
    }

    mapAreas.bales = this.element.getAttribute('points');
    localStorage.setItem('mapAreas', JSON.stringify(mapAreas));

  }

  deleteArena() {
    this.points.forEach((p) => p.delete());
    this.delete();
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
        this.addPath(ev.offsetX, ev.offsetY);
      }
    });
  }
}
