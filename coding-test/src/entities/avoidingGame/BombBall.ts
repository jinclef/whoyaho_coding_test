import { GameObject } from "../GameObject";

export class BombBall extends GameObject {
  constructor(
    elem: HTMLElement,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    super(elem, width, height, x, y);
    elem.style.backgroundColor = "black";
    elem.style.borderRadius = "999px";
    elem.style.position = "absolute";
    elem.style.width = `${width}px`;
    elem.style.height = `${height}px`;

    // ✅ 초기 속도와 방향 랜덤 설정
    this.speed = 2 + Math.random(); // 2 ~ 3
    this.degree = Math.random() * 360; // 0 ~ 360도
  }

  update(dt: number) {
    const radian = (this.degree * Math.PI) / 180;
    const dx = Math.cos(radian) * this.speed * dt * 0.1;
    const dy = Math.sin(radian) * this.speed * dt * 0.1;

    this.leftTopX += dx;
    this.leftTopY += dy;
    
    this.render();
  }
}
