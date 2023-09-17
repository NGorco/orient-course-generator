class AreaDrawer extends Easy {
  constructor(arenaAreaEl, courseAreaEl) {
    super(document.querySelector('#controls .actions'));
    this.courseAreaEl = courseAreaEl;
    this.drawPoints = [];
    this.arenaAreaEl = arenaAreaEl;
  }

  loadArenaArea() {
    let mapAreas = localStorage.getItem('mapAreas');

    if (mapAreas) {
      mapAreas = JSON.parse(mapAreas);

      if (mapAreas['bales']) {
        this.arenaArea = new ArenaArea(this.arenaAreaEl, mapAreas['bales']);
        arenaArea = this.arenaArea;
      }
    }
  }

  uploadMap() {
    let file = document.querySelector('#mapFile').files[0];

    var reader = new FileReader();
    reader.onloadend = function () {
      const bg = document.querySelector('#bg');
      bg.style.backgroundImage = "url(" + reader.result + ")";
      document.querySelector('#mapFile').value = '';
    }
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  toggleArena() {
    this.arenaAreaEl.classList.toggle('invisible');
  }

  generateCourse() {
    this.courseLine.generateCourse();
  }

  drawCourse(ev, $this) {
    if (GlobalFlags.drawingCourse) {
      this.finishDrawingCourse();
      GlobalFlags.drawingCourse = false;
      this.courseAreaEl.classList.remove("active");
      $this.classList.remove("active");
    } else {
      this.courseLine?.deleteCourse();
      this.startDrawingCourse();
      this.courseAreaEl.classList.add("active");
      GlobalFlags.drawingCourse = true;
      $this.classList.add("active");
    }
  }

  editArenaArea(ev, $this) {
    if (GlobalFlags.editingDraftArena) {
      GlobalFlags.editingDraftArena = false;
      this.arenaAreaEl.classList.remove("active");
      $this.classList.remove("active");
    } else {
      this.arenaAreaEl.classList.add("active");
      GlobalFlags.editingDraftArena = true;
      $this.classList.add("active");
    }
  }

  drawArenaArea(ev, $this) {
    if (GlobalFlags.drawingDraftArena) {
      this.finishDrawingArena();
      GlobalFlags.drawingDraftArena = false;
      this.arenaAreaEl.classList.remove("active");
      $this.classList.remove("active");
    } else {
      this.arenaAreaEl.classList.add("active");
      this.arenaArea?.deleteArena();
      this.startDrawingArena();
      GlobalFlags.drawingDraftArena = true;
      $this.classList.add("active");
    }
  }

  finishDrawingCourse() { }

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
  document.querySelector("#course"),
);
