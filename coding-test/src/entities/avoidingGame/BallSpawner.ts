// BallSpawner.ts
import { BombBall } from "./BombBall";
import { GameObject } from "../GameObject";

let ballIdCounter = 0;

export enum BallType {
  Bomb
}

export function spawnBall(
 type: BallType,
 gameArea: HTMLElement,
 map: Map<string, GameObject>
): void {
 const rect = gameArea.getBoundingClientRect();
 const size = rect.height * 0.05;
 const padding = size + 10;
 
 const myBall = map.get("myBall");
 let x, y;
 let attempts = 0;
 
 // myBall 위치 피해서 생성
 do {
   x = padding + Math.random() * (rect.width - padding * 2);
   y = padding + Math.random() * (rect.height - padding * 2);
   attempts++;
 } while (myBall && attempts < 10 && 
          Math.sqrt((x - myBall.leftTopX) * (x - myBall.leftTopX) + (y - myBall.leftTopY) * (y - myBall.leftTopY)) < 100);
 
 const elem = document.createElement("div");

 let ball: GameObject;

 switch (type) {
   case BallType.Bomb:
     ball = new BombBall(elem, size, size, x, y);
     break;
   default:
     return;
 }

 const key = `${BallType[type]}-${ballIdCounter++}`;
 map.set(key, ball);
 gameArea.appendChild(ball.elem!);
 ball.render();
}