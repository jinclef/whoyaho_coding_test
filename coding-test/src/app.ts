import { GameManager, GameStatus } from "./entities/GameManager";
import { MyBall } from "./entities/MyBall";
import { 
  gameObjMap, 
  initializeGame, 
  spawnRandomBonusLetter, 
  createWalls, 
  dropBomb, 
  handleBallCollisions,
  handleObstacleCollisions,
  checkCollisions, 
  updateUI, 
  showGameOver, 
  endBonusStage, 
  nextStage,
  createPortals
} from "./eatingGame";

let raf: number;
let lastFrameTime: null | number = null;
let dt = 0;

// 게임 시작
function startGame() {
  const optionSelection = document.getElementById('option-selection');
  const gameContainer = document.getElementById('game-container');
  
  if (optionSelection) optionSelection.style.display = 'none';
  if (gameContainer) gameContainer.style.display = 'flex';
  
  GameManager.reset();
  const gameArea = document.getElementById('game-area');
  if (gameArea) {
    GameManager.setGameArea(gameArea);
  }
  GameManager.gameStatus = GameStatus.PLAYING;
  GameManager.startTime = Date.now();
  
  initializeGame();
  registerKeyboardEvents();
  runGameLoop();
}

// 키보드 이벤트 등록
function registerKeyboardEvents() {
  const myBall = gameObjMap.get('myBall') as MyBall;
  let isRightKeyDown = false;
  let isLeftKeyDown = false;
  let isUpKeyDown = false;
  let isDownKeyDown = false;
  
  if (!myBall) return;
  
  window.addEventListener('keydown', (e) => {
    if (GameManager.gameStatus !== GameStatus.PLAYING && !GameManager.isInBonusStage) return;
    
    myBall.speed = 1;
    if (e.key === 'ArrowRight') {
      myBall.degree = 0;
      isRightKeyDown = true;
    } else if (e.key === 'ArrowLeft') {
      myBall.degree = 180;
      isLeftKeyDown = true;
    } else if (e.key === 'ArrowUp') {
      myBall.degree = 270;
      isUpKeyDown = true;
    } else if (e.key === 'ArrowDown') {
      myBall.degree = 90;
      isDownKeyDown = true;
    }
  });
  
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') {
      isRightKeyDown = false;
    } else if (e.key === 'ArrowLeft') {
      isLeftKeyDown = false;
    } else if (e.key === 'ArrowUp') {
      isUpKeyDown = false;
    } else if (e.key === 'ArrowDown') {
      isDownKeyDown = false;
    }
    if (!isLeftKeyDown && !isRightKeyDown && !isUpKeyDown && !isDownKeyDown) {
      myBall.speed = 0;
    }
  });
}

// 게임 루프
function runGameLoop() {
  const currentTime = Date.now();
  if (lastFrameTime === null) {
    lastFrameTime = currentTime;
  }
  dt = currentTime - lastFrameTime;
  
  if (GameManager.gameStatus === GameStatus.PLAYING || GameManager.isInBonusStage) {
    // 보너스 스테이지가 아닐 때만 시간 증가
    if (!GameManager.isInBonusStage) {    
      GameManager.gameTime = currentTime - GameManager.startTime;
    }
      
    // 보너스 글자 랜덤 스폰 (목표 달성 모드에서만)
    if (currentTime - GameManager.lastBonusSpawnTime > GameManager.bonusSpawnInterval) {
      spawnRandomBonusLetter();
      GameManager.lastBonusSpawnTime = currentTime;
      GameManager.bonusSpawnInterval = 3000 + Math.random() * 4000; // 3-7초 간격
    }
  }
    
  // 보너스 스테이지 타이머
  if (GameManager.isInBonusStage) {
    GameManager.bonusStageTimer -= dt;
    
    // 보너스 스테이지 끝나기 3초 전부터 깜빡임
    const myBall = gameObjMap.get('myBall');
    if (GameManager.bonusStageTimer <= 3000 && myBall) {
      const blinkInterval = 300; // 0.3초마다 깜빡임
      const shouldBlink = Math.floor(GameManager.bonusStageTimer / blinkInterval) % 2 === 0;
      myBall.elem!.style.opacity = shouldBlink ? '0.3' : '1';
    }
    
    if (GameManager.bonusStageTimer <= 0) {
      endBonusStage();
    }
  }
  
  // 게임 오브젝트 업데이트
  gameObjMap.forEach(obj => {
    obj.update(dt);
  });
  
  // 보너스 공 수명 관리 (gameObjMap에서 제거된 것들 정리)
  const keysToDelete: string[] = [];
  gameObjMap.forEach((obj, key) => {
    if (key.startsWith('bonus_') && obj.elem && !obj.elem.parentNode) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => gameObjMap.delete(key));
  
  // 공들끼리 충돌 처리
  handleBallCollisions();
  handleObstacleCollisions();
  
  // 충돌 검사
  checkCollisions();
  
  // 진행 중에 벽 생성 (5-10초마다) - 보너스 스테이지가 아닐 때만
  if (Math.random() < 0.0002 && !GameManager.isInBonusStage) {
    createWalls();
  }
  
  // 랜덤 이벤트들 - 보너스 스테이지가 아닐 때만
  if (Math.random() < 0.001 && !GameManager.isInBonusStage) {
    dropBomb();
  }
  
  // 포탈 생성
  // if (Math.random() < 0.001 && !GameManager.isInBonusStage) {
  //   createPortals();
  // }

  // UI 업데이트
  updateUI();
  lastFrameTime = currentTime;

  if (GameManager.gameStatus === GameStatus.END) {
    showGameOver();
    return;
  }
  
  raf = requestAnimationFrame(runGameLoop);
}

function restartGame() {
  if (raf) {
    cancelAnimationFrame(raf);
  }
  
  GameManager.reset();
  GameManager.gameStatus = GameStatus.PLAYING;
  GameManager.startTime = Date.now();
  
  const gameOverPanel = document.getElementById('game-over-panel');
  const gameContainer = document.getElementById('game-container');
  
  if (gameOverPanel) gameOverPanel.style.display = 'none';
  if (gameContainer) gameContainer.style.display = 'none';

  startGame();
}

// 홈으로 가기
function goHome() {
  if (raf) {
    cancelAnimationFrame(raf);
  }
  
  const gameOverPanel = document.getElementById('game-over-panel');
  const gameContainer = document.getElementById('game-container');
  
  if (gameOverPanel) gameOverPanel.style.display = 'none';
  if (gameContainer) gameContainer.style.display = 'none';
  
  document.querySelectorAll('.initial-ui').forEach(ui => {
    (ui as HTMLElement).style.display = 'block';
  });
  
  // 게임 영역 초기화
  const gameArea = document.getElementById('game-area');
  if (gameArea) {
    gameArea.innerHTML = '';
  }
  
  gameObjMap.clear();
  lastFrameTime = null;
  dt = 0;
}

// 전역 함수로 등록 (HTML에서 호출하기 위해)
(window as any).startGame = startGame;
(window as any).restartGame = restartGame;
(window as any).goHome = goHome;

// DOM 로드 완료 후 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
  const showOptionsBtn = document.getElementById('show-options');
  if (showOptionsBtn) {
    showOptionsBtn.addEventListener('click', () => {
      document.querySelectorAll('.initial-ui').forEach(ui => {
        (ui as HTMLElement).style.display = 'none';
      });
    });
  }
});