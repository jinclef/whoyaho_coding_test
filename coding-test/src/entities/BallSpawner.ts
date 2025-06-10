// BallSpawner.ts
import { BombBall } from "./BombBall";
import { GameObject } from "./GameObject";

let ballIdCounter = 0;

export enum BallType {
  Bomb,
  Ice,
  Speed,
}

export function spawnBall(
  type: BallType,
  gameArea: HTMLElement,
  map: Map<string, GameObject>
): void {
  const rect = gameArea.getBoundingClientRect();
  const size = rect.height * 0.05;
  const padding = size + 10; // 벽에서 최소 거리 확보
	const x = padding + Math.random() * (rect.width - padding * 2);
	const y = padding + Math.random() * (rect.height - padding * 2);
  const elem = document.createElement("div");

  let ball: GameObject;

  switch (type) {
    case BallType.Bomb:
      ball = new BombBall(elem, size, size, x, y);
      break;
    // case BallType.Ice:
    // case BallType.Speed:
    // ...
    default:
      return;
  }

  const key = `${BallType[type]}-${ballIdCounter++}`;
  map.set(key, ball);
  gameArea.appendChild(ball.elem!);
	ball.render();
}
