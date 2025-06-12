import { GameObject } from "./GameObject";
import { GameManager } from "./GameManager";

export class CollectibleBall extends GameObject {
  type: string;
  value: string | number;
  lifeTime = 0; // 0이면 무제한
  timer = 0;
  
  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number, type = 'normal', value: string | number = 1) {
    super(elem, width, height, x, y);
    this.type = type;
    this.value = value;
    if(type === 'normal') {
      this.degree = Math.random() * 360;
      this.speed = 0.05 + Math.random() * 0.08;
    } else {
      this.degree = 0; // 보너스 공은 고정된 위치에 생성
      this.speed = 0; // 보너스 공은 이동하지 않음
      if (type === 'bonus') {
        this.lifeTime = 10000; // 보너스 공은 10초 후에 사라짐
      } else if (type === 'score') {
        this.lifeTime = 5000; // 점수 공은 5초 후에 사라짐
      }
    }
    
    elem.classList.add('collectible');
    if (type === 'normal') {
      elem.classList.add('normal-ball');
    } else if (type === 'bonus') {
      elem.classList.add('bonus-ball');
      elem.textContent = value.toString();
    } else if (type === 'score') {
      elem.classList.add('score-ball');
      elem.textContent = value.toString();
      const numValue = typeof value === 'number' ? value : parseInt(value.toString());
      elem.style.backgroundColor = numValue >= 100 ? '#e74c3c' : numValue >= 50 ? '#f39c12' : '#2ecc71';
    }
  }

  update(dt: number) {
    // 보너스 공 수명 관리
    if (this.lifeTime > 0) {
      this.timer += dt;
      if (this.timer >= this.lifeTime) {
        this.destroy();
        return;
      }
    }
    
    super.update(dt);
    this.checkBounds();
    this.checkWallCollisions();
  }

  destroy() {
    if (this.elem && this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem);
    }
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