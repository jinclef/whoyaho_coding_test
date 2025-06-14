import { GameObject } from "./GameObject";

export class MyBall extends GameObject {
  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number) {
    super(elem, width, height, x, y);
    elem.id = "my-ball"; // id 설정
    elem.style.width = `${width}px`;
    elem.style.height = `${height}px`;
  }

  update(dt: number) {
    const radian = (this.degree * Math.PI) / 180;
    const dx = Math.cos(radian) * this.speed * dt * 0.5;
    const dy = Math.sin(radian) * this.speed * dt * 0.5;

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

  // 좌우 벽
  if (this.x <= 0) {
    this.x = 0;
    this.degree = 180 - this.degree;

  } else if (this.x + ballSize >= areaWidth) {
    this.x = areaWidth - ballSize;
    this.degree = 180 - this.degree;
  }

  // 상하 벽
  if (this.y <= 0) {
    this.y = 0;
    this.degree = -this.degree;
  } else if (this.y + ballSize >= areaHeight) {
    this.y = areaHeight - ballSize;
    this.degree = -this.degree;
  }

  // 각도는 0~360 사이로 보정
  this.degree = (this.degree + 360) % 360;
}

  render() {
    this.elem!.style.left = `${this.x}px`;
    this.elem!.style.top = `${this.y}px`;
  }
}
