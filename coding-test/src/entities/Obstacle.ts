import { GameObject } from "./GameObject";
import { GameManager } from "./GameManager";

export class Obstacle extends GameObject {
  moveTimer = 0;
  moveDirection: number;

  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number) {
    super(elem, width, height, x, y);
    elem.classList.add('obstacle');
    this.moveDirection = Math.random() * 360;
    this.speed = 0.05 + Math.random() * 0.08; // 속도 증가
  }

  update(dt: number) {
    this.moveTimer += dt;
    if (this.moveTimer > 2000) { // 더 자주 방향 변경
      this.moveDirection = Math.random() * 360;
      this.moveTimer = 0;
    }
    this.degree = this.moveDirection;
    
    super.update(dt);
    this.checkBounds();
    this.checkWallCollisions();
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

  checkWallCollisions() {
    if (!GameManager.gameArea) return;
    
    const radius = this.width / 2;
    const walls = document.querySelectorAll('.wall');
    
    walls.forEach(wall => {
      if (!wall.parentNode) return;
      
      const wallRect = wall.getBoundingClientRect();
      const gameAreaRect = GameManager.gameArea!.getBoundingClientRect();
      
      const wallLeft = wallRect.left - gameAreaRect.left;
      const wallTop = wallRect.top - gameAreaRect.top;
      const wallRight = wallLeft + wallRect.width;
      const wallBottom = wallTop + wallRect.height;
      
      const ballLeft = this.x - radius;
      const ballRight = this.x + radius;
      const ballTop = this.y - radius;
      const ballBottom = this.y + radius;
      
      if (ballRight > wallLeft && ballLeft < wallRight &&
          ballBottom > wallTop && ballTop < wallBottom) {
        
        const overlapLeft = ballRight - wallLeft;
        const overlapRight = wallRight - ballLeft;
        const overlapTop = ballBottom - wallTop;
        const overlapBottom = wallBottom - ballTop;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapLeft) {
          this.x = wallLeft - radius;
          this.degree = 180 - this.degree;
        } else if (minOverlap === overlapRight) {
          this.x = wallRight + radius;
          this.degree = 180 - this.degree;
        } else if (minOverlap === overlapTop) {
          this.y = wallTop - radius;
          this.degree = -this.degree;
        } else {
          this.y = wallBottom + radius;
          this.degree = -this.degree;
        }
      }
    });
  }
}