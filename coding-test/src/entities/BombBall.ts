import { GameObject } from "./GameObject";

export class BombBall extends GameObject {
  constructor(
    elem: HTMLElement,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    super(elem, width, height, x, y);
    elem.style.backgroundColor = "blue";
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

    this.x += dx;
    this.y += dy;

    this.detectWallCollision();
    this.render();
  }

  detectWallCollision() {
    const ballSize = this.width;
    const area = this.elem!.parentElement as HTMLElement;
    const areaWidth = area.clientWidth;
    const areaHeight = area.clientHeight;

    const randomAngle = () => (Math.random() - 0.5) * 10; // -5도 ~ +5도 흔들림

    if (this.x <= 0) {
      this.x = 1;
      this.degree = 180 - this.degree + randomAngle();
    } else if (this.x + ballSize >= areaWidth) {
      this.x = areaWidth - ballSize - 1;
      this.degree = 180 - this.degree + randomAngle();
    }

    if (this.y <= 0) {
      this.y = 1;
      this.degree = -this.degree + randomAngle();
    } else if (this.y + ballSize >= areaHeight) {
      this.y = areaHeight - ballSize - 1;
      this.degree = -this.degree + randomAngle();
    }

    this.degree = (this.degree + 360) % 360;
  }

  render() {
    this.elem!.style.left = `${this.x}px`;
    this.elem!.style.top = `${this.y}px`;
  }
}
