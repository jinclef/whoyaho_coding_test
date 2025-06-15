// BallSpawner.ts
import { GameObject } from "./GameObject";
import { CollectibleBall, Obstacle } from "./GameBall";
import { GameManager } from "./GameManager";

let ballIdCounter = 0;

export enum BallType {
  Bomb, // gameMode = avoidingGame
  Obstacle, // gameMode = eatingGame
  Normal,
  Bonus
}

export function spawnBall(type: BallType, gameArea: HTMLElement, map: Map<string, GameObject>): void {
  const rect = gameArea.getBoundingClientRect();
  const size = rect.height * 0.05;
  const padding = size + 10;
 
  // myBall 위치 피해서 생성
  const myBall = map.get("myBall");
  let x, y;
  let attempts = 0;
  const maxAttempts = 50; // 무한루프 방지

  // 탈출구 위치 피해서 생성
  const exit = document.querySelector('.exit');
	let exitX = -1, exitY = -1;
	if (exit && GameManager.gameArea) {
		const exitRect = exit.getBoundingClientRect();
		const gameAreaRect = GameManager.gameArea.getBoundingClientRect();
		exitX = exitRect.left - gameAreaRect.left + exitRect.width / 2;
		exitY = exitRect.top - gameAreaRect.top + exitRect.height / 2;
	}
 
 do {
    x = padding + Math.random() * (rect.width - padding * 2);
    y = padding + Math.random() * (rect.height - padding * 2);
    attempts++;

    if (exit) {
      const distance = Math.sqrt((x - exitX) ** 2 + (y - exitY) ** 2);
      if (distance > 80) break; // 탈출구에서 80px 이상 떨어져야 함
    } else {
      break; // 탈출구가 없으면 바로 배치
    }

 } while (myBall && attempts < maxAttempts && 
          Math.sqrt((x - myBall.leftTopX) * (x - myBall.leftTopX) + (y - myBall.leftTopY) * (y - myBall.leftTopY)) < 100);
  
  if (attempts >= maxAttempts && exit) {
    return;
  }

  const elem = document.createElement("div");

  let ball: GameObject;

  switch (type) {
    case BallType.Bomb:
      ball = new Obstacle(elem, size, size, x, y);
      break;
    case BallType.Normal:
      ball = new CollectibleBall(elem, size/2, size/2, x, y, BallType.Normal, GameManager.currentStage * 2);
      break;
    case BallType.Bonus:
      const randomLetter = GameManager.bonusLetters[Math.floor(Math.random() * GameManager.bonusLetters.length)];
      ball = new CollectibleBall(elem, size/2, size/2, x, y, BallType.Bonus, randomLetter);
      break;
    case BallType.Obstacle:
      ball = new Obstacle(elem, size, size, x, y);
    default:
      return;
  }

  const key = `${BallType[type]}-${ballIdCounter++}`;
  map.set(key, ball);
  gameArea.appendChild(ball.elem!);
  ball.render();
}