import { GameManager, GameStatus } from "./entities/GameManager";
import { GameObject } from "./entities/GameObject";
import { MyBall } from "./entities/MyBall";
import { BombBall } from "./entities/BombBall";
import { spawnBall, BallType } from "./entities/BallSpawner";

const startButton = document.getElementById("start-button");
const startButton2 = document.getElementById("start-button-2");
const intialUis = document.querySelectorAll(".initial-ui");
const gameArea = document.getElementById("game-area");

let raf: number;
let lastFrameTime: null | number = null;
let dt = 0;
const gameObjMap: Map<string, GameObject> = new Map();

let elapsedTime = 0;              // 흐른 총 시간(ms)
let lastBombSpawnTime = 0;        // 마지막 bomb 생성 시점
const bombSpawnInterval = 3000;   // 3초마다 bomb 생성

function runGameLoop() {
  const currentTime = new Date().getTime();
  if (lastFrameTime === null) {
    lastFrameTime = currentTime;
  }
  dt = currentTime - lastFrameTime;
  elapsedTime += dt;

  for (const gameObj of gameObjMap.values()) {
    gameObj.update(dt);
  }

  // BombBall 주기적 생성
  if (elapsedTime - lastBombSpawnTime >= bombSpawnInterval) {
    lastBombSpawnTime = elapsedTime;
    spawnBall(BallType.Bomb, GameManager.GameArea!, gameObjMap);
  }

  // 충돌 검사
  const myBall = gameObjMap.get("myBall");
  for (const [key, obj] of gameObjMap.entries()) {
    if (key.startsWith("Bomb") && myBall && checkCollision(myBall, obj)) {
      GameManager.GameStatus = GameStatus.END;
      break;
    }
  }

  updateTimerDisplay(elapsedTime);

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

// 공 피하기 게임
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

  const initialBombCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
  for (let i = 0; i < initialBombCount; i++) {
    spawnBall(BallType.Bomb, gameArea, gameObjMap);
  }

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

// 공 먹기 게임
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

function checkCollision(a: GameObject, b: GameObject): boolean {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;

  const dx = ax - bx;
  const dy = ay - by;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const radiusA = a.width / 2;
  const radiusB = b.width / 2;

  return distance <= radiusA + radiusB;
}

function updateTimerDisplay(ms: number) {
  const sec = Math.floor(ms / 1000);
  const timerElem = document.getElementById("timer");
  if (timerElem) {
    timerElem.innerText = `Time: ${sec}s`;
  }
}