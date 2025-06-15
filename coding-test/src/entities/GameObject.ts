import { BallType } from "./BallSpawner";

export abstract class GameObject {
  width = 0;
  height = 0;
  leftTopX = 0;
  leftTopY = 0;
  speed = 0;
  degree = 0;
  elem: null | HTMLElement = null;

  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number) {
    this.elem = elem;
    this.width = width;
    this.height = height;
    this.leftTopX = x;
    this.leftTopY = y;
    this.elem.style.position = 'absolute';
  }

  update(dt: number) {
    const dx = this.speed * dt * Math.cos((this.degree * Math.PI) / 180);
    const dy = this.speed * dt * Math.sin((this.degree * Math.PI) / 180);
    this.leftTopX += dx;
    this.leftTopY += dy;
    this.detectAreaCollision();
    this.render();
  }

  render() {
    if (!this.elem) return;
    this.elem.style.width = `${this.width}px`; 
    this.elem.style.height = `${this.height}px`;
    this.elem.style.top = `${this.leftTopY}px`;
    this.elem.style.left = `${this.leftTopX}px`;
  }

  detectAreaCollision() {
    const ballSize = this.width;
    const area = this.elem!.parentElement as HTMLElement;
    const areaWidth = area.clientWidth;
    const areaHeight = area.clientHeight;
    
    const randomAngle = () => (Math.random() - 0.5) * 10; // -5도 ~ +5도 흔들림

    if (!this.elem) return;

    // 좌우
    if (this.leftTopX <= 0) {
      if (this.elem?.classList.contains("my-ball")) this.leftTopX = 0;
      else {
        this.leftTopX = 1;
        this.degree = 180 - this.degree + randomAngle();
      }
    } else if (this.leftTopX + ballSize >= areaWidth) {
      if (this.elem?.classList.contains("my-ball")) this.leftTopX = areaWidth - ballSize;
      else{
        this.leftTopX = areaWidth - ballSize - 1;
        this.degree = 180 - this.degree + randomAngle();
      }
    }
    
    // 상하
    if (this.leftTopY <= 0) {
      if (this.elem?.classList.contains("my-ball")) this.leftTopY = 0;
      else {
        this.leftTopY = 1;
        this.degree = -this.degree + randomAngle();
      }
    } else if (this.leftTopY + ballSize >= areaHeight) {

      if (this.elem?.classList.contains("my-ball")) this.leftTopY = areaHeight - ballSize;
      else {
        this.leftTopY = areaHeight - ballSize - 1;
        this.degree = -this.degree + randomAngle();
      }
    }
  }
}
