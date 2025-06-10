import { GameManager, GameStatus } from "./entities/GameManager";
import { GameObject } from "./entities/GameObject";
import { MyBall } from "./entities/MyBall";

const startButton = document.getElementById("start-button");
const startButton2 = document.getElementById("start-button-2");
const intialUis = document.querySelectorAll(".initial-ui");
const gameArea = document.getElementById("game-area");

let raf: number;
let lastFrameTime: null | number = null;
let dt = 0;
const gameObjMap: Map<string, GameObject> = new Map();

function runGameLoop() {
  const currentTime = new Date().getTime();
  if (lastFrameTime === null) {
    lastFrameTime = currentTime;
  }
  dt = currentTime - lastFrameTime;
  for (const gameObj of gameObjMap.values()) {
    gameObj.update(dt);
  }
  lastFrameTime = currentTime;
  if (GameManager.GameStatus === GameStatus.END) {
    alert("Game Over!");
    setTimeout(() => {
      location.reload();
    }, 1000);
    return;
  }
  raf = requestAnimationFrame(runGameLoop);
}

startButton?.addEventListener("click", () => {
  intialUis.forEach((ui) => {
    (ui as HTMLElement).style.display = "none";
  });
  if (!gameArea) {
    return;
  }
  gameArea.style.display = "flex";

  GameManager.setGameArea(gameArea);
  const boundingRect = gameArea.getBoundingClientRect();

  //   make my ball
  const myBallObj = new MyBall(
    document.createElement("div"),
    boundingRect.height * 0.05,
    boundingRect.height * 0.05,
    boundingRect.width / 2,
    boundingRect.height / 2
  );

  gameObjMap.set("myBall", myBallObj);

  for (const gameObj of gameObjMap.values()) {
    gameArea!.appendChild(gameObj.elem!);
  }

  function registerKeyboardEvent() {
    const myBall = gameObjMap.get("myBall") as MyBall;
    let isRightKeyDown = false;
    let isLeftKeyDown = false;
    let isUpKeyDown = false;
    let isDownKeyDown = false;
    if (!myBall) return;
    window.addEventListener("keydown", (e) => {
      myBall.speed = 1;
      if (e.key === "ArrowRight") {
        myBall.degree = 0;
        isRightKeyDown = true;
      } else if (e.key === "ArrowLeft") {
        myBall.degree = 180;
        isLeftKeyDown = true;
      } else if (e.key === "ArrowUp") {
        myBall.degree = 270;
        isUpKeyDown = true;
      } else if (e.key === "ArrowDown") {
        myBall.degree = 90;
        isDownKeyDown = true;
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowRight") {
        isRightKeyDown = false;
      } else if (e.key === "ArrowLeft") {
        isLeftKeyDown = false;
      } else if (e.key === "ArrowUp") {
        isUpKeyDown = false;
      } else if (e.key === "ArrowDown") {
        isDownKeyDown = false;
      }
      if (!isLeftKeyDown && !isRightKeyDown && !isUpKeyDown && !isDownKeyDown) {
        myBall.speed = 0;
      }
    });
  }
  registerKeyboardEvent();
  runGameLoop();
});

startButton2?.addEventListener("click", () => {
  intialUis.forEach((ui) => {
    (ui as HTMLElement).style.display = "none";
  });
  if (!gameArea) {
    return;
  }
  gameArea.style.display = "flex";

  GameManager.setGameArea(gameArea);
  const boundingRect = gameArea.getBoundingClientRect();

  //   make my ball
  const myBallObj = new MyBall(
    document.createElement("div"),
    boundingRect.height * 0.05,
    boundingRect.height * 0.05,
    boundingRect.width / 2,
    boundingRect.height / 2
  );

  gameObjMap.set("myBall", myBallObj);

  for (const gameObj of gameObjMap.values()) {
    gameArea!.appendChild(gameObj.elem!);
  }

  function registerKeyboardEvent() {
    const myBall = gameObjMap.get("myBall") as MyBall;
    let isRightKeyDown = false;
    let isLeftKeyDown = false;
    let isUpKeyDown = false;
    let isDownKeyDown = false;
    if (!myBall) return;
    window.addEventListener("keydown", (e) => {
      myBall.speed = 1;
      if (e.key === "ArrowRight") {
        myBall.degree = 0;
        isRightKeyDown = true;
      } else if (e.key === "ArrowLeft") {
        myBall.degree = 180;
        isLeftKeyDown = true;
      } else if (e.key === "ArrowUp") {
        myBall.degree = 270;
        isUpKeyDown = true;
      } else if (e.key === "ArrowDown") {
        myBall.degree = 90;
        isDownKeyDown = true;
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowRight") {
        isRightKeyDown = false;
      } else if (e.key === "ArrowLeft") {
        isLeftKeyDown = false;
      } else if (e.key === "ArrowUp") {
        isUpKeyDown = false;
      } else if (e.key === "ArrowDown") {
        isDownKeyDown = false;
      }
      if (!isLeftKeyDown && !isRightKeyDown && !isUpKeyDown && !isDownKeyDown) {
        myBall.speed = 0;
      }
    });
  }
  registerKeyboardEvent();
  runGameLoop();
});
