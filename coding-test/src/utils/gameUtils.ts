// src/utils/gameUtils.ts
import { MyBall } from "../entities/MyBall";
import { GameObject } from "../entities/GameObject";

export function registerKeyboardEvent(myBall: MyBall) {
  let isRightKeyDown = false;
  let isLeftKeyDown = false;
  let isUpKeyDown = false;
  let isDownKeyDown = false;

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
    if (e.key === "ArrowRight") isRightKeyDown = false;
    else if (e.key === "ArrowLeft") isLeftKeyDown = false;
    else if (e.key === "ArrowUp") isUpKeyDown = false;
    else if (e.key === "ArrowDown") isDownKeyDown = false;

    if (!isRightKeyDown && !isLeftKeyDown && !isUpKeyDown && !isDownKeyDown) {
      myBall.speed = 0;
    }
  });
}

export function updateTimerDisplay(ms: number) {
  const sec = Math.floor(ms / 1000);
  const timerElem = document.getElementById("timer");
  if (timerElem) timerElem.innerText = `Time: ${sec}s`;
}

export function checkCollision(a: GameObject, b: GameObject): boolean {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;
  const dx = ax - bx;
  const dy = ay - by;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= a.width / 2 + b.width / 2;
}
