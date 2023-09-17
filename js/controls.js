class Controls extends Easy {
  // /** @type {number} */
  // courseLength;
  // courseLengthScale = 1;
  // /** @type {number} */
  // pointsNum;
  // /** @type {string} */
  // trackDistances;
  // trackMin;
  // trackMax;
  // longTrackValue;
  // longTracksMax;

  constructor() {
    const rootElem = document.querySelector('#controls .settings');
    super(rootElem);
  }
}

const Ctrls = new Controls;