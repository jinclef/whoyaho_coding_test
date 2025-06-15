import { GameObject } from "../GameObject";
import { GameManager } from "../GameManager";

export class Obstacle extends GameObject {
  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number) {
    super(elem, width, height, x, y);
    elem.classList.add('obstacle');
    this.degree = Math.random() * 360;
    this.speed = 0.05 + Math.random() * 0.08;
  }

  update(dt: number) {
    super.update(dt);
    super.detectAreaCollision();
  }
}