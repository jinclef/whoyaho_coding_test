import { GameManager } from '../GameManager';

// 탈출구 생성
export function createExit() {
    const gameArea = GameManager.gameArea;
    if (!gameArea) return;
    
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;
    
    const exit = document.createElement('div');
    exit.classList.add('exit');
    exit.style.width = '50px';
    exit.style.height = '50px';
    
    // 영역의 특정 위치에 생성
    const side = Math.floor(Math.random() * 4);
    switch(side) {
        case 0: // 상단
            exit.style.left = Math.random() * (areaWidth - 50) + 'px';
            exit.style.top = '10px';
            break;
        case 1: // 우측
            exit.style.right = '10px';
            exit.style.top = Math.random() * (areaHeight - 50) + 'px';
            break;
        case 2: // 하단
            exit.style.left = Math.random() * (areaWidth - 50) + 'px';
            exit.style.bottom = '10px';
            break;
        case 3: // 좌측
            exit.style.left = '10px';
            exit.style.top = Math.random() * (areaHeight - 50) + 'px';
            break;
    }
    GameManager.exitCreated = true;
    gameArea.appendChild(exit);
}