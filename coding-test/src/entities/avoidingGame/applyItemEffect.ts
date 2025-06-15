import { ItemType } from "./Item";
import { GameObject } from "../GameObject";

export function applyItemEffect(itemType: ItemType, currentTime: number, gameState: any, effectDisplay: any, gameObjMap: Map<string, GameObject>) {
  switch (itemType) {
    case ItemType.SlowMotion:
      gameState.slowMotionEndTime = currentTime + 5000; // 5초간 슬로우 모션
			const remainingSlow = Math.ceil((gameState.slowMotionEndTime - currentTime) / 1000);
			effectDisplay.showEffect(`🐌 슬로우 모션 ${remainingSlow}초`, "#00ffff");
      break;
      
    case ItemType.PointsSmall:
      const smallBonus = 1000;
			gameState.addBonusScore(smallBonus);
      effectDisplay.showEffect(`+${smallBonus}점!`, "#ffff00");
      break;
      
    case ItemType.PointsBig:
      const bigBonus = 10000;
			gameState.addBonusScore(bigBonus);
      effectDisplay.showEffect(`+${bigBonus}점!`, "#ff00ff");
      break;
      
    case ItemType.RemoveBomb:
      removeNearestBomb(gameObjMap);
      effectDisplay.showEffect("폭탄 제거!", "#00ff00");
      break;
      
    case ItemType.ExtraLife:
      gameState.lives++;
      effectDisplay.showEffect(`라이프 +1 (총 ${gameState.lives}개)`, "#ff4080");
      break;
      
    case ItemType.Invincible:
      gameState.itemInvincibleEndTime = currentTime + 5000; // 5초간 무적
	    const remainingInvincible = Math.ceil((gameState.itemInvincibleEndTime - currentTime) / 1000);
      effectDisplay.showEffect(`✨ 무적 ${remainingInvincible}초`, "#ffffff");
      break;
  }
}

function removeNearestBomb(gameObjMap: Map<string, GameObject>) {
  const bombEntries = Array.from(gameObjMap.entries())
    .filter(([key]) => key.startsWith("Bomb"));

  if (bombEntries.length === 0) return;

  // 가장 가까운 Bomb 찾기
  let nearestBombKey = "";
  let nearestBomb: GameObject | null = null;
  let minDistance = Infinity;

  const myBall = gameObjMap.get("myBall");
  if (!myBall) return;
  if (!myBall.elem) return;

  for (const [key, bomb] of bombEntries) {
    const bombCenterX = bomb.leftTopX + bomb.width / 2;
    const bombCenterY = bomb.leftTopY + bomb.height / 2;
    const myCenterX = myBall.leftTopX + myBall.width / 2;
    const myCenterY = myBall.leftTopY + myBall.height / 2;

    const distance = Math.hypot(myCenterX - bombCenterX, myCenterY - bombCenterY);

    if (distance < minDistance) {
      minDistance = distance;
      nearestBombKey = key;
      nearestBomb = bomb;
    }
  }

  // 제거
  if (nearestBomb && nearestBomb.elem && nearestBomb.elem.parentNode) {
    createExplosionEffect(
      nearestBomb.leftTopX + nearestBomb.width / 2,
      nearestBomb.leftTopY + nearestBomb.height / 2,
      nearestBomb.elem.parentNode as HTMLElement
    );
    nearestBomb.elem.parentNode.removeChild(nearestBomb.elem);
    gameObjMap.delete(nearestBombKey);
  }
}


function createExplosionEffect(x: number, y: number, container: HTMLElement) {
  // 메인 폭발 효과
  const explosion = document.createElement("div");
  explosion.style.cssText = `
    position: absolute;
    left: ${x - 25}px;
    top: ${y - 25}px;
    width: 50px;
    height: 50px;
    background: radial-gradient(circle, #ff6b00 0%, #ff0000 30%, #ffff00 60%, transparent 100%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 1000;
    animation: explode 0.6s ease-out forwards;
  `;
  
  // 폭발 파티클들
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("div");
    const angle = (i / 8) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    const size = 4 + Math.random() * 6;
    
    particle.style.cssText = `
      position: absolute;
      left: ${x - size/2}px;
      top: ${y - size/2}px;
      width: ${size}px;
      height: ${size}px;
      background: ${['#ff6b00', '#ff0000', '#ffff00', '#ff3300'][Math.floor(Math.random() * 4)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 999;
      animation: particle 0.8s ease-out forwards;
      --dx: ${Math.cos(angle) * distance}px;
      --dy: ${Math.sin(angle) * distance}px;
    `;
    
    container.appendChild(particle);
    
    // 파티클 자동 제거
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 800);
  }
  
  container.appendChild(explosion);
  
  // 폭발 효과 자동 제거
  setTimeout(() => {
    if (explosion.parentNode) {
      explosion.parentNode.removeChild(explosion);
    }
  }, 600);
}
