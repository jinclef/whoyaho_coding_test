import { gameOver } from '../../eatingGame';
import { GameManager } from '../GameManager';
import { GameObject } from '../GameObject';

export function explodeRedZone(gameObjMap: Map<string, GameObject>) {
    const gameArea = GameManager.gameArea;
    if (!gameArea) return;
    
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;
    
    const redZone = document.createElement('div');
    redZone.classList.add('red-zone');
    
    const size = 80 + Math.random() * 120;
    redZone.style.width = size + 'px';
    redZone.style.height = size + 'px';
    redZone.style.left = Math.random() * (areaWidth - size) + 'px';
    redZone.style.top = Math.random() * (areaHeight - size) + 'px';
    
    gameArea.appendChild(redZone);
    
    // 폭발
    redZone.addEventListener('animationend', () => {
        const myBall = gameObjMap.get('myBall');
        const zoneRect = redZone.getBoundingClientRect();
        const gameAreaRect = GameManager.gameArea!.getBoundingClientRect();

        const ballX = myBall!.leftTopX + gameAreaRect.left;
        const ballY = myBall!.leftTopY + gameAreaRect.top;

        const isHit = (
            ballX >= zoneRect.left &&
            ballX <= zoneRect.right &&
            ballY >= zoneRect.top &&
            ballY <= zoneRect.bottom
        );

        if (isHit) {
            gameOver();
        }

        triggerExplosion(zoneRect.left + zoneRect.width / 2, zoneRect.top + zoneRect.height / 2);

        redZone.remove();
    });
}



// 폭탄 투하
function triggerExplosion(x: number, y: number) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x - 50}px`;  // 중심 정렬
    explosion.style.top = `${y - 50}px`;

    document.body.appendChild(explosion);

    setTimeout(() => {
        explosion.remove();
    }, 500);
}
