import { GameObject } from "./GameObject";
import { GameManager } from "./GameManager";

export class MyBall extends GameObject {
  constructor(
    elem: HTMLElement,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    super(elem, width, height, x, y);
    elem.style.backgroundColor = 'red';
    elem.style.borderRadius = '50%';
    elem.style.border = '3px solid darkred';
    elem.style.zIndex = '100';
  }

  update(dt: number) {
    const radian = GameObject.getRadianDegree(this.degree);
    const dx = Math.cos(radian) * this.speed * dt * 0.3; // 속도 낮춤
    const dy = Math.sin(radian) * this.speed * dt * 0.3;

    this.x += dx;
    this.y += dy;

    super.checkBounds();
    this.detectWallCollision();
    this.checkWallCollisions();
    this.checkPortalCollisions();
    this.render();
  }

  detectWallCollision() {
    if (!GameManager.gameArea) return;
    
    const area = GameManager.gameArea;
    const areaWidth = area.clientWidth;
    const areaHeight = area.clientHeight;
    const radius = this.width / 2;

    if (this.x - radius <= 0) {
      this.x = radius;
    } else if (this.x + radius >= areaWidth) {
      this.x = areaWidth - radius;
    }

    if (this.y - radius <= 0) {
      this.y = radius;
    } else if (this.y + radius >= areaHeight) {
      this.y = areaHeight - radius;
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
      
      // 공의 경계 박스
      const ballLeft = this.x - radius;
      const ballRight = this.x + radius;
      const ballTop = this.y - radius;
      const ballBottom = this.y + radius;
      
      // 충돌 검사 및 위치 보정
      if (ballRight > wallLeft && ballLeft < wallRight &&
          ballBottom > wallTop && ballTop < wallBottom) {
        
        // 가장 가까운 면으로 밀어내기
        const overlapLeft = ballRight - wallLeft;
        const overlapRight = wallRight - ballLeft;
        const overlapTop = ballBottom - wallTop;
        const overlapBottom = wallBottom - ballTop;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapLeft) {
          this.x = wallLeft - radius;
        } else if (minOverlap === overlapRight) {
          this.x = wallRight + radius;
        } else if (minOverlap === overlapTop) {
          this.y = wallTop - radius;
        } else {
          this.y = wallBottom + radius;
        }
      }
    });
  }

  checkPortalCollisions() {
    if (!GameManager.gameArea) return;
    
    const radius = this.width / 2;
    const portals = document.querySelectorAll('.portal');
    
    for (let i = 0; i < portals.length; i += 2) {
      const portal1 = portals[i];
      const portal2 = portals[i + 1];
      
      if (!portal1 || !portal2 || !portal1.parentNode || !portal2.parentNode) continue;
      
      [portal1, portal2].forEach((portal, index) => {
        const portalRect = portal.getBoundingClientRect();
        const gameAreaRect = GameManager.gameArea!.getBoundingClientRect();
        
        const portalX = portalRect.left - gameAreaRect.left + portalRect.width / 2;
        const portalY = portalRect.top - gameAreaRect.top + portalRect.height / 2;
        
        const distance = Math.sqrt((this.x - portalX) ** 2 + (this.y - portalY) ** 2);
        
        if (distance < radius + 20) {
          // 다른 포탈로 이동
          const otherPortal = index === 0 ? portal2 : portal1;
          const otherRect = otherPortal.getBoundingClientRect();
          
          this.x = otherRect.left - gameAreaRect.left + otherRect.width / 2;
          this.y = otherRect.top - gameAreaRect.top + otherRect.height / 2;
        }
      });
    }
  }
}