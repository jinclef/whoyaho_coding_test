import { GameObject } from "./GameObject";
import { GameManager } from "./GameManager";

export class MyBall extends GameObject {
  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number) {
    super(elem, width, height, x, y);
    elem.id = "my-ball"; // id 설정
    elem.style.width = `${width}px`;
    elem.style.height = `${height}px`;
    elem.style.zIndex = '100';
  }

  lastTeleportedTime = 0;

  update(dt: number) {
    const radian = GameObject.getRadianDegree(this.degree);
    const dx = Math.cos(radian) * this.speed * dt * 0.5; // 속도 낮춤
    const dy = Math.sin(radian) * this.speed * dt * 0.5;

    this.leftTopX += dx;
    this.leftTopY += dy;

    // super.checkBounds();
    super.detectAreaCollision();
    this.checkWallCollisions();
    this.checkPortalCollisions();
    this.render();
  }


  checkWallCollisions() { // TODO: refactor
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
      const ballLeft = this.leftTopX - radius;
      const ballRight = this.leftTopX + radius;
      const ballTop = this.leftTopY - radius;
      const ballBottom = this.leftTopY + radius;
      
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
          this.leftTopX = wallLeft - radius;
        } else if (minOverlap === overlapRight) {
          this.leftTopX = wallRight + radius;
        } else if (minOverlap === overlapTop) {
          this.leftTopY = wallTop - radius;
        } else {
          this.leftTopY = wallBottom + radius;
        }
      }
    });
  }

  checkPortalCollisions() {
    if (!GameManager.gameArea) return;
    const now = Date.now();
    if (now - this.lastTeleportedTime < 1000) return; // 1초 쿨타임

    const radius = this.width / 2;
    const portals = Array.from(document.querySelectorAll('.portal'));
    if (portals.length < 2) return;

    const gameAreaRect = GameManager.gameArea.getBoundingClientRect();

    for (let i = 0; i < portals.length; i++) {
      const portal = portals[i];
      const portalRect = portal.getBoundingClientRect();
      const portalX = portalRect.left - gameAreaRect.left + portalRect.width / 2;
      const portalY = portalRect.top - gameAreaRect.top + portalRect.height / 2;

      const distance = Math.sqrt((this.leftTopX - portalX) ** 2 + (this.leftTopY - portalY) ** 2);

      if (distance < radius + 20) {
        // 현재 포탈 제외하고 다른 포탈들 중 하나로 이동
        const otherPortals = portals.filter((_, idx) => idx !== i);
        const targetPortal = otherPortals[Math.floor(Math.random() * otherPortals.length)];
        const targetRect = targetPortal.getBoundingClientRect();
        const targetX = targetRect.left - gameAreaRect.left + targetRect.width / 2;
        const targetY = targetRect.top - gameAreaRect.top + targetRect.height / 2;

        // 이동 후 중심에서 조금 벗어나게
        const dx = this.leftTopX - portalX;
        const dy = this.leftTopY - portalY;
        const moveAngle = Math.atan2(dy, dx);
        const offset = radius + 25;
        this.leftTopX = targetX + Math.cos(moveAngle) * offset;
        this.leftTopY = targetY + Math.sin(moveAngle) * offset;

        this.lastTeleportedTime = now;
        break;
      }
    }
  }
}