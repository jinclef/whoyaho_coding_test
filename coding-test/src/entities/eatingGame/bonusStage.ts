import { EatingGameState } from '../../eatingGame';
import { GameManager } from '../GameManager';
import { CollectibleBall } from '../GameBall';
import { GameObject } from '../GameObject';
import { BallType } from '../BallSpawner';

// 보너스 스테이지 시작
export function startBonusStage(gameObjMap: Map<string, GameObject>) {
    EatingGameState.isInBonusStage = true;
    EatingGameState.bonusStageTimer = 15000; // 15초
    
    const bonusIndicator = document.getElementById('bonus-indicator');
    if (bonusIndicator) {
        bonusIndicator.style.display = 'block';
        setTimeout(() => {
            bonusIndicator.style.display = 'none';
        }, 2000);
    }
    
    // 방해물들을 먹을 수 있는 공으로 변환
    gameObjMap.forEach((obj, key) => {
        if (key.startsWith('Obstacle-')) {
            const collectibleBall = obj as CollectibleBall;
            collectibleBall.value = EatingGameState.currentStage * 5;
            if (obj.elem) {
                obj.elem.classList.add('bonus-edible');
                obj.elem.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
                obj.elem.style.border = '2px solid #ffa500';
                obj.elem.style.animation = 'bonus-pulse 0.8s ease-in-out infinite alternate';
            }
        }
    });
    
    // 플레이어 공 스타일 변경 (동전 스타일)
    const myBall = gameObjMap.get('myBall');
    if (myBall) {
        myBall.elem!.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
        myBall.elem!.style.border = '3px solid #ffa500';
        myBall.elem!.style.animation = 'none';
    }
    
    // 기존 공들과 보너스 공들 제거
    gameObjMap.forEach((obj, key) => {
        if (key.startsWith(`${BallType[BallType.Bonus]}-`)) {
            if (obj.elem && obj.elem.parentNode) {
                obj.elem.parentNode.removeChild(obj.elem);
            }
            gameObjMap.delete(key);
        }
    });
}

// 보너스 스테이지 업데이트 (app.ts의 runGameLoop에서 호출)
export function updateBonusStage(dt: number, gameObjMap: Map<string, GameObject>) {
    if (!EatingGameState.isInBonusStage) return;
    
    // 보너스 스테이지 타이머 감소
    EatingGameState.bonusStageTimer -= dt;
    
    // 끝나기 3초 전부터 깜빡이기
    if (EatingGameState.bonusStageTimer <= 3000) {
        const timeLeft = EatingGameState.bonusStageTimer;
        
        const blinkInterval = Math.max(100, (timeLeft / 3000) * 500 + 100);
        const shouldBlink = Math.floor(Date.now() / blinkInterval) % 2 === 0;
        
        // 플레이어 공도 깜빡임
        const myBall = gameObjMap.get('myBall');
        if (myBall) {
            myBall.elem!.style.opacity = shouldBlink ? '0.5' : '1';
        }
    }
    
    if (EatingGameState.bonusStageTimer <= 0) {
        endBonusStage(gameObjMap);
    }
}

// 보너스 스테이지 종료
export function endBonusStage(gameObjMap: Map<string, GameObject>) {
    EatingGameState.isInBonusStage = false;
    EatingGameState.bonusCollected = [];
    
    // 게임 영역 전체 효과 복원
    if (GameManager.gameArea) {
        GameManager.gameArea.style.filter = 'brightness(1)';
    }
    
    // 플레이어 공 스타일 복원
    const myBall = gameObjMap.get('myBall');
    if (myBall) {
        myBall.elem!.style.background = 'red';
        myBall.elem!.style.border = '3px solid darkred';
        myBall.elem!.style.animation = 'none';
        myBall.elem!.style.opacity = '1';
    }
    
    // 방해물들을 원래 상태로 복원
    gameObjMap.forEach((obj, key) => {
        if (key.startsWith(`${BallType[BallType.Obstacle]}-`)) {
            if (obj.elem) {
                obj.elem.classList.remove('bonus-edible');
                obj.elem.style.background = '#444';
                obj.elem.style.border = '';
                obj.elem.style.borderRadius = '50%';
                obj.elem.style.animation = 'none';
                obj.elem.style.opacity = '1';
            }
        }
    });
    
    // 기존 공들의 점수와 스타일 복원
    gameObjMap.forEach((obj, key) => {
        if (key.startsWith(`${BallType[BallType.Normal]}-`)) {
            const collectibleBall = obj as CollectibleBall;
            collectibleBall.value = EatingGameState.currentStage * 2; // 원래 점수로 복원
            if (obj.elem) {
                obj.elem.style.background = '#2ecc71';
                obj.elem.style.border = '2px solid #27ae60';
                obj.elem.style.animation = 'bonus-pulse 0.8s ease-in-out infinite alternate';
            }
        }
    });
}