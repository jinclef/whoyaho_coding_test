import { Obstacle } from '../GameBall';
import { GameManager } from '../GameManager';
import { GameObject } from '../GameObject';

// 방해물 생성
export function createObstacles(gameObjMap: Map<string, GameObject>) {
    const gameArea = GameManager.gameArea;
    if (!gameArea) return;
    
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;
    const obstacleCount = (GameManager.currentStage * 2); // 방해물 더 많이
    const obstacleTotalCount = GameManager.obstacleTotalCount;
    
    // 탈출구 위치 확인 - 근처에 안 생기게 함
    const exit = document.querySelector('.exit');
    let exitX = -1, exitY = -1;
    if (exit && GameManager.gameArea) {
        const exitRect = exit.getBoundingClientRect();
        const gameAreaRect = GameManager.gameArea.getBoundingClientRect();
        exitX = exitRect.left - gameAreaRect.left + exitRect.width / 2;
        exitY = exitRect.top - gameAreaRect.top + exitRect.height / 2;
    }

     for (let i = obstacleTotalCount; i < obstacleTotalCount + obstacleCount; i++) {
        let x, y;
        let attempts = 0;
        const maxAttempts = 50; // 무한루프 방지
        
        do {
            x = Math.random() * (areaWidth - 60) + 30;
            y = Math.random() * (areaHeight - 60) + 30;
            attempts++;
            
            // 탈출구와의 거리 체크 (탈출구가 있을 때만)
            if (exit) {
                const distance = Math.sqrt((x - exitX) ** 2 + (y - exitY) ** 2);
                if (distance > 80) break; // 탈출구에서 80px 이상 떨어져야 함
            } else {
                break; // 탈출구가 없으면 바로 배치
            }
            
        } while (attempts < maxAttempts);
        
        // 적절한 위치를 못 찾았으면 이 방해물은 스킵
        if (attempts >= maxAttempts && exit) {
            continue;
        }
        
        const elem = document.createElement('div');
        const obstacle = new Obstacle(elem, 25, 25, x, y);
        gameObjMap.set(`Obstacle-${i}`, obstacle);
        
        if (GameManager.isInBonusStage) {
            elem.classList.add('bonus-edible');
            elem.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
            elem.style.border = '2px solid #ffa500';
            elem.style.animation = 'bonus-pulse 0.8s ease-in-out infinite alternate';
        }
        
        gameArea.appendChild(elem);
    }
    GameManager.obstacleTotalCount += obstacleCount;
}