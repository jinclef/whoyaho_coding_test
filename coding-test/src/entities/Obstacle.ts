import { GameObject } from "./GameObject";
import { GameManager } from "./GameManager";

export class Obstacle extends GameObject {
  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number) {
    super(elem, width, height, x, y);
    elem.classList.add('obstacle');
    this.degree = Math.random() * 360;
    this.speed = 0.05 + Math.random() * 0.08;
  }

  update(dt: number) {
    super.update(dt);
    super.checkBounds();
    this.checkWallCollisions();
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