import { GameManager } from "./GameManager";

export abstract class GameObject {
  width = 0;
  height = 0;
  x = 0;
  y = 0;
  speed = 0;
  degree = 0;
  elem: null | HTMLElement = null;

  static getRadianDegree(degree: number) {
    return (degree * Math.PI) / 180;
  }

  constructor(
    elem: HTMLElement,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    this.elem = elem;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.elem.style.position = 'absolute';
  }

  update(dt: number) {
    const dx = this.speed * dt * Math.cos(GameObject.getRadianDegree(this.degree));
    const dy = this.speed * dt * Math.sin(GameObject.getRadianDegree(this.degree));
    this.x += dx;
    this.y += dy;
    this.render();
  }

  render() {
    if (!this.elem) return;
    this.elem.style.width = `${this.width}px`;
    this.elem.style.height = `${this.height}px`;
    this.elem.style.top = `${this.y - this.height / 2}px`;
    this.elem.style.left = `${this.x - this.width / 2}px`;
  }

  checkBounds() {
      if (!GameManager.gameArea) return;
      
      const area = GameManager.gameArea;
      const areaWidth = area.clientWidth;
      const areaHeight = area.clientHeight;
      const radius = this.width / 2;
  
      if (this.x - radius <= 0 || this.x + radius >= areaWidth) {
        this.degree = 180 - this.degree;
        this.x = Math.max(radius, Math.min(areaWidth - radius, this.x));
      }
      if (this.y - radius <= 0 || this.y + radius >= areaHeight) {
        this.degree = -this.degree;
        this.y = Math.max(radius, Math.min(areaHeight - radius, this.y));
      }
    }

  checkCollision(other: GameObject): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.width + other.width) / 2;
  }
}