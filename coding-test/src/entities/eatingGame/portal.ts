import { GameManager } from '../GameManager';
import { EatingGameState } from '../../eatingGame';

// 포탈 생성
export function createPortals() {
    const gameArea = GameManager.gameArea;
    if (!gameArea) return;
    
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;
    
    const portal1 = document.createElement('div');
    const portal2 = document.createElement('div');
    
    portal1.classList.add('portal');
    portal2.classList.add('portal');
    
    portal1.style.width = '40px';
    portal1.style.height = '40px';
    portal2.style.width = '40px';
    portal2.style.height = '40px';
    
    // 좌우 또는 상하 배치
    if (Math.random() < 0.5) {
        // 좌우
        portal1.style.left = '20px';
        portal1.style.top = Math.random() * (areaHeight - 60) + 20 + 'px';
        portal2.style.right = '20px';
        portal2.style.top = Math.random() * (areaHeight - 60) + 20 + 'px';
    } else {
        // 상하
        portal1.style.top = '20px';
        portal1.style.left = Math.random() * (areaWidth - 60) + 20 + 'px';
        portal2.style.bottom = '20px';
        portal2.style.left = Math.random() * (areaWidth - 60) + 20 + 'px';
    }
    
    gameArea.appendChild(portal1);
    gameArea.appendChild(portal2);
    EatingGameState.portalTotalCount += 1;
    
    // 포탈 자동 제거
    setTimeout(() => {
        [portal1, portal2].forEach(portal => {
            if (portal.parentNode) {
                portal.parentNode.removeChild(portal);
                EatingGameState.portalTotalCount = 0;
            }
        });
    }, 8000);
}
