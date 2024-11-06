import { Viewer } from "@photo-sphere-viewer/core";
import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter";
import { VisibleRangePlugin } from "@photo-sphere-viewer/visible-range-plugin";

const floorsData = {
  1: [6, 11, 14, 18, 21, 26, 27],
  2: [6, 11, 14, 18, 21, 26, 27],
};

let currentTower = 1;
let currentFloor = floorsData[currentTower][0];
let currentTime = "morning";

const viewer = new Viewer({
  plugins: [
    [
      VisibleRangePlugin,
      {
        // horizontalRange: [-Math.PI / 2, Math.PI / 2],
        verticalRange: [-Math.PI / 5, Math.PI / 5],
      },
    ],
  ],
  navbar: false,
  container: document.querySelector("#viewer"),
  adapter: EquirectangularTilesAdapter,
  panorama: {
    width: 8192,
    cols: 16,
    rows: 8,
    baseUrl: `./assets/low/${currentTower}/${currentFloor}/${currentTime}.webp`,
    tileUrl: (col, row) => {
      return `./assets/tiles/${currentTower}/${currentFloor}/${currentTime}_${col}_${row}.webp`;
    },
  },
  lang: {
    loading: "Загрузка...",
  },
});

const floorsContainer = document.getElementById("floors-container");

function setLoadingState(value) {
  document
    .querySelectorAll("[data-panorama-control]")
    .forEach((control) => (control.disabled = value));
}

function setCurrentTower(tower) {
  currentTower = tower;

  document
    .querySelectorAll("[data-set-tower]")
    .forEach((button) => (button.ariaCurrent = false));

  document.querySelector(`[data-set-tower='${tower}']`).ariaCurrent = true;
}

function setCurrentFloor(floor) {
  currentFloor = floor;

  document
    .querySelectorAll("[data-set-floor]")
    .forEach((button) => (button.ariaCurrent = false));

  document.querySelector(`[data-set-floor='${floor}']`).ariaCurrent = true;
}

function setCurrentTime(time) {
  currentTime = time;

  document
    .querySelectorAll("[data-set-time]")
    .forEach((button) => (button.ariaCurrent = false));

  document.querySelector(`[data-set-time='${time}']`).ariaCurrent = true;
}

function renderFloors(tower) {
  floorsContainer.replaceChildren();

  floorsData[tower]
    .sort((a, b) => a - b)
    .forEach((floor) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.setFloor = floor;
      button.dataset.panoramaControl = "";
      button.textContent = floor + " этаж";

      floorsContainer.append(button);
    });
}

renderFloors(currentTower);
setCurrentTower(currentTower);
setCurrentFloor(currentFloor);
setCurrentTime(currentTime);

function setTowerHandler(tower) {
  const floor = floorsData[tower][0];

  setLoadingState(true);

  setCurrentTower(tower);

  viewer
    .setPanorama({
      width: 8192,
      cols: 16,
      rows: 8,
      baseUrl: `./assets/low/${tower}/${floor}/${currentTime}.webp`,
      tileUrl: (col, row) => {
        return `./assets/tiles/${tower}/${floor}/${currentTime}_${col}_${row}.webp`;
      },
    })
    .then(() => {
      renderFloors(tower);
      setCurrentFloor(floor);
    })
    .finally(() => {
      setLoadingState(false);
    });
}

function setFloorHandler(floor) {
  setLoadingState(true);

  setCurrentFloor(floor);

  viewer
    .setPanorama({
      width: 8192,
      cols: 16,
      rows: 8,
      baseUrl: `./assets/low/${currentTower}/${floor}/${currentTime}.webp`,
      tileUrl: (col, row) => {
        return `./assets/tiles/${currentTower}/${floor}/${currentTime}_${col}_${row}.webp`;
      },
    })
    .finally(() => {
      setLoadingState(false);
    });
}

function setTimeHandler(time) {
  setLoadingState(true);

  setCurrentTime(time);

  viewer
    .setPanorama({
      width: 8192,
      cols: 16,
      rows: 8,
      baseUrl: `./assets/low/${currentTower}/${currentFloor}/${time}.webp`,
      tileUrl: (col, row) => {
        return `./assets/tiles/${currentTower}/${currentFloor}/${time}_${col}_${row}.webp`;
      },
    })
    .finally(() => {
      setLoadingState(false);
    });
}

document.addEventListener("click", (event) => {
  const setTowerButton = event.target.closest("[data-set-tower]");
  const setFloorButton = event.target.closest("[data-set-floor]");
  const setTimeButton = event.target.closest("[data-set-time]");

  if (setTowerButton) setTowerHandler(setTowerButton.dataset.setTower);
  if (setFloorButton) setFloorHandler(setFloorButton.dataset.setFloor);
  if (setTimeButton) setTimeHandler(setTimeButton.dataset.setTime);
});
