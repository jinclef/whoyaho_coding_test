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

    super.detectAreaCollision();
    this.checkPortalCollisions();
    this.render();
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