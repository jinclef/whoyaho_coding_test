import { GameManager, GameStatus } from "./entities/GameManager";
import { GameObject } from "./entities/GameObject";
import { MyBall } from "./entities/MyBall";
import { CollectibleBall } from "./entities/CollectibleBall";
import { Obstacle } from "./entities/Obstacle";
import { AttackItem } from "./entities/AttackItem";

export const gameObjMap: Map<string, GameObject> = new Map();

// 게임 초기화
export function initializeGame() {
  gameObjMap.clear();
  const gameArea = GameManager.gameArea;
  if (!gameArea) return;
  
  gameArea.innerHTML = '';
  
  const boundingRect = gameArea.getBoundingClientRect();
  
  // 플레이어 공 생성 (속도 낮춤)
  const myBallElem = document.createElement('div');
  const myBall = new MyBall(
    myBallElem,
    boundingRect.height * 0.025,
    boundingRect.height * 0.025,
    boundingRect.width / 2,
    boundingRect.height / 2
  );
  gameObjMap.set('myBall', myBall);
  gameArea.appendChild(myBallElem);
  
  // 수집 가능한 공들 생성
  createCollectibleBalls();
  
  // 방해물 생성 (더 많이)
  createObstacles();
  
  // 처음에는 벽 없음 - 진행 중에 생성됨
  
  updateUI();
}

// 수집 가능한 공들 생성
export function createCollectibleBalls() {
  const gameArea = GameManager.gameArea;
  if (!gameArea) return;
  
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  
  // 일반 공들
  for (let i = 0; i < GameManager.ballsToCollect; i++) {
    const elem = document.createElement('div');
    const ball = new CollectibleBall(
      elem,
      20, 20,
      Math.random() * (areaWidth - 40) + 20,
      Math.random() * (areaHeight - 40) + 20,
      'normal', 1
    );
    gameObjMap.set(`ball_${i}`, ball);
    gameArea.appendChild(elem);
  }
}

// 보너스 글자 랜덤 스폰
export function spawnRandomBonusLetter() {
  if (GameManager.option2 !== 2 || GameManager.isInBonusStage || !GameManager.gameArea) return;
  
  const gameArea = GameManager.gameArea;
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  
  const randomLetter = GameManager.bonusLetters[Math.floor(Math.random() * GameManager.bonusLetters.length)];
  const elem = document.createElement('div');
  const bonusBall = new CollectibleBall(
    elem,
    25, 25,
    Math.random() * (areaWidth - 50) + 25,
    Math.random() * (areaHeight - 50) + 25,
    'bonus', randomLetter
  );
  bonusBall.timer = 0;
  
  gameObjMap.set(`bonus_${randomLetter}_${Date.now()}`, bonusBall);
  gameArea.appendChild(elem);
}

// 방해물 생성
export function createObstacles() {
  const gameArea = GameManager.gameArea;
  if (!gameArea) return;
  
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  const obstacleCount = 4 + (GameManager.currentStage * 2); // 방해물 더 많이
  
  for (let i = 0; i < obstacleCount; i++) {
    const elem = document.createElement('div');
    const obstacle = new Obstacle(
      elem, 25, 25,
      Math.random() * (areaWidth - 60) + 30,
      Math.random() * (areaHeight - 60) + 30
    );
    gameObjMap.set(`obstacle_${i}`, obstacle);
    gameArea.appendChild(elem);
  }
  
  // 공격 아이템 (Option 2-1에서만)
  if (GameManager.option2 === 1 && Math.random() < 0.3) {
    const elem = document.createElement('div');
    const attackItem = new AttackItem(
      elem,
      20, 20,
      Math.random() * (areaWidth - 40) + 20,
      Math.random() * (areaHeight - 40) + 20
    );
    gameObjMap.set('attack_item', attackItem);
    gameArea.appendChild(elem);
  }
}

// 벽 생성
export function createWalls() {
  const gameArea = GameManager.gameArea;
  if (!gameArea) return;
  
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  
  // 랜덤 벽들
  const wallCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < wallCount; i++) {
    const wall = document.createElement('div');
    wall.classList.add('wall');
    wall.style.width = (50 + Math.random() * 100) + 'px';
    wall.style.height = (20 + Math.random() * 30) + 'px';
    wall.style.left = Math.random() * (areaWidth - 150) + 'px';
    wall.style.top = Math.random() * (areaHeight - 50) + 'px';
    gameArea.appendChild(wall);
    
    // 벽 자동 제거
    setTimeout(() => {
      if (wall.parentNode) {
        wall.parentNode.removeChild(wall);
      }
    }, 5000 + Math.random() * 5000);
  }
  
  // 포탈 생성 (가끔)
  // if (Math.random() < 0.4) {
  //   createPortals();
  // }
}

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
  
  // 포탈 자동 제거
  setTimeout(() => {
    [portal1, portal2].forEach(portal => {
      if (portal.parentNode) {
        portal.parentNode.removeChild(portal);
      }
    });
  }, 8000);
}

// 폭탄 투하
export function dropBomb() {
  const gameArea = GameManager.gameArea;
  if (!gameArea) return;
  
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  
  const redZone = document.createElement('div');
  redZone.classList.add('red-zone');
  
  const size = 80 + Math.random() * 60;
  redZone.style.width = size + 'px';
  redZone.style.height = size + 'px';
  redZone.style.left = Math.random() * (areaWidth - size) + 'px';
  redZone.style.top = Math.random() * (areaHeight - size) + 'px';
  
  gameArea.appendChild(redZone);
  
  // 3초 후 폭발
  setTimeout(() => {
    const myBall = gameObjMap.get('myBall');
    if (myBall && GameManager.gameArea) {
      const zoneRect = redZone.getBoundingClientRect();
      const gameAreaRect = GameManager.gameArea.getBoundingClientRect();
      
      const ballX = myBall.x + gameAreaRect.left;
      const ballY = myBall.y + gameAreaRect.top;
      
      if (ballX >= zoneRect.left && ballX <= zoneRect.right &&
          ballY >= zoneRect.top && ballY <= zoneRect.bottom) {
        gameOver();
      }
    }
    
    if (redZone.parentNode) {
      redZone.parentNode.removeChild(redZone);
    }
  }, 3000);
}

// 객체들끼리 충돌 처리 (범용 함수)
export function handleCollisions(prefixes: string[]) {
  const objects: { key: string, obj: GameObject }[] = [];
  const handled = new Set<string>();

  // 지정된 prefix들로 시작하는 객체들 수집
  for (const [key, obj] of gameObjMap.entries()) {
    if (prefixes.some(prefix => key.startsWith(prefix))) {
      objects.push({ key, obj });
    }
  }

  // 모든 객체 쌍에 대해 충돌 검사
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i].obj;
      const b = objects[j].obj;
      
      const pairKey = `${objects[i].key}-${objects[j].key}`;
      
      if (handled.has(pairKey)) {
        continue;
      }

      if (a.checkCollision(b)) {
        handled.add(pairKey);
        
        // 방향 교환
        const temp = a.degree;
        a.degree = b.degree;
        b.degree = temp;

        separateBalls(a, b);
      }
    }
  }
}

// 공들끼리 충돌 처리
export function handleBallCollisions() {
  handleCollisions(['ball_']);
}

// 방해물들끼리 충돌 처리
export function handleObstacleCollisions() {
  handleCollisions(['obstacle_']);
}

export function separateBalls(a: GameObject, b: GameObject) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.hypot(dx, dy);
  
  const minDistance = (a.width + b.width) / 2;
  const overlap = minDistance - dist;
  
  if (overlap <= 0) return;
  
  const ux = dx / dist;
  const uy = dy / dist;
  
  const moveDistance = overlap / 2;
  
  a.x += ux * moveDistance;
  a.y += uy * moveDistance;
  b.x -= ux * moveDistance;
  b.y -= uy * moveDistance;
}

// 보너스 스테이지 시작
export function startBonusStage() {
  GameManager.isInBonusStage = true;
  GameManager.bonusStageTimer = 15000; // 15초
  
  const bonusIndicator = document.getElementById('bonus-indicator');
  if (bonusIndicator) {
    bonusIndicator.style.display = 'block';
    setTimeout(() => {
      bonusIndicator.style.display = 'none';
    }, 2000);
  }
  
  // 방해물들 제거
  gameObjMap.forEach((obj, key) => {
    if (key.startsWith('obstacle_')) {
      if (obj.elem && obj.elem.parentNode) {
        obj.elem.parentNode.removeChild(obj.elem);
      }
      gameObjMap.delete(key);
    }
  });
  
  // 플레이어 공 스타일 변경 (동전 스타일)
  const myBall = gameObjMap.get('myBall');
  if (myBall) {
    myBall.elem!.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
    myBall.elem!.style.border = '3px solid #ffa500';
    myBall.elem!.style.animation = 'none';
    myBall.elem!.style.animation = 'float 1s ease-in-out infinite';
  }
  
  // 기존 공들 제거하고 점수 공들 생성
  gameObjMap.forEach((obj, key) => {
    if (key.startsWith('ball_') || key.startsWith('bonus_') || key.startsWith('obstacle_')) {
      if (obj.elem && obj.elem.parentNode) {
        obj.elem.parentNode.removeChild(obj.elem);
      }
      gameObjMap.delete(key);
    }
  });
  
  createBonusStageItems();
}

// 보너스 스테이지 아이템 생성
export function createBonusStageItems() {
  const gameArea = GameManager.gameArea;
  if (!gameArea) return;
  
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  
  const scores = [10, 20, 50, 100];
  const counts = [8, 5, 3, 1];
  
  scores.forEach((score, index) => {
    for (let i = 0; i < counts[index]; i++) {
      const elem = document.createElement('div');
      const scoreBall = new CollectibleBall(
        elem,
        25, 25,
        Math.random() * (areaWidth - 50) + 25,
        Math.random() * (areaHeight - 50) + 25,
        'score', score
      );
      gameObjMap.set(`score_${score}_${i}`, scoreBall);
      gameArea.appendChild(elem);
    }
  });
}

// 보너스 스테이지 종료
export function endBonusStage() {
  GameManager.isInBonusStage = false;
  
  // 플레이어 공 스타일 복원
  const myBall = gameObjMap.get('myBall');
  if (myBall) {
    myBall.elem!.style.background = 'red';
    myBall.elem!.style.border = '3px solid darkred';
    myBall.elem!.style.animation = 'none';
    myBall.elem!.style.opacity = '1'; // 깜빡임 효과 제거
  }
  
  // 점수 공들 제거하고 일반 공들 다시 생성
  gameObjMap.forEach((obj, key) => {
    if (key.startsWith('score_')) {
      if (obj.elem && obj.elem.parentNode) {
        obj.elem.parentNode.removeChild(obj.elem);
      }
      gameObjMap.delete(key);
    }
  });
  
  // 방해물들 다시 생성
  createObstacles();
  
  if (GameManager.option2 === 2) {
    createCollectibleBalls();
  }
}

// 다음 스테이지로
export function nextStage() {
  GameManager.currentStage++;
  GameManager.ballsCollected = 0;
  GameManager.bonusCollected = [];
  
  // 방해물 추가
  createObstacles();
  
  // 새로운 벽들 생성
  createWalls();
  
  if (GameManager.option2 === 1) {
    // 시간 제한 모드: 새로운 공들 생성
    createCollectibleBalls();
  } else {
    // 목표 달성 모드: 탈출구 제거
    const exit = document.querySelector('.exit');
    if (exit && exit.parentNode) {
      exit.parentNode.removeChild(exit);
    }
    createCollectibleBalls();
  }
  
  updateUI();
}

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
  
  // 벽의 특정 위치에 생성
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

// 충돌 검사
export function checkCollisions() {
  const myBall = gameObjMap.get('myBall');
  if (!myBall) return;
  
  // 수집 가능한 공들과의 충돌
  gameObjMap.forEach((obj, key) => {
    if (key.startsWith('ball_') || key.startsWith('bonus_') || key.startsWith('score_')) {
      if (myBall.checkCollision(obj)) {
        const collectibleBall = obj as CollectibleBall;
        
        if (collectibleBall.type === 'normal') {
          const value = typeof collectibleBall.value === 'number' ? collectibleBall.value : parseInt(collectibleBall.value.toString());
          GameManager.score += value;
          GameManager.ballsCollected++;
        } else if (collectibleBall.type === 'bonus') {
          const letter = collectibleBall.value.toString();
          if (!GameManager.bonusCollected.includes(letter)) {
            GameManager.bonusCollected.push(letter);
            // 5개 모두 수집하면 보너스 스테이지 시작
            if (GameManager.bonusCollected.length === 5) {
              startBonusStage();
            }
          }
        } else if (collectibleBall.type === 'score') {
          const value = typeof collectibleBall.value === 'number' ? collectibleBall.value : parseInt(collectibleBall.value.toString());
          GameManager.score += value;
        }
        
        if (obj.elem && obj.elem.parentNode) {
          obj.elem.parentNode.removeChild(obj.elem);
        }
        gameObjMap.delete(key);
        
        // 목표 달성 모드에서 모든 공을 먹었을 때
        if (!GameManager.exitCreated && GameManager.option2 === 2 && GameManager.ballsCollected >= GameManager.ballsToCollect) {
          createExit();
        }
      }
    }
  });
  
  // 공격 아이템과의 충돌
  const attackItem = gameObjMap.get('attack_item');
  if (attackItem && myBall.checkCollision(attackItem)) {
    GameManager.hasAttackItem = true;
    if (attackItem.elem && attackItem.elem.parentNode) {
      attackItem.elem.parentNode.removeChild(attackItem.elem);
    }
    gameObjMap.delete('attack_item');
    
    // 플레이어 공에 아이템 표시
    myBall.elem!.style.boxShadow = '0 0 15px #ff6b6b';
  }
  
  // 방해물과의 충돌
  gameObjMap.forEach((obj, key) => {
    if (key.startsWith('obstacle_')) {
      if (myBall.checkCollision(obj)) {
        if (GameManager.hasAttackItem) {
          // 공격 아이템으로 방해물 제거
          GameManager.hasAttackItem = false;
          myBall.elem!.style.boxShadow = 'none';
          if (obj.elem && obj.elem.parentNode) {
            obj.elem.parentNode.removeChild(obj.elem);
          }
          gameObjMap.delete(key);
        } else {
          gameOver();
        }
      }
    }
  });
  
  // 탈출구와의 충돌
  const exit = document.querySelector('.exit');
  if (exit && GameManager.option2 === 2 && GameManager.gameArea) {
    const exitRect = exit.getBoundingClientRect();
    const gameAreaRect = GameManager.gameArea.getBoundingClientRect();
    const ballX = myBall.x + gameAreaRect.left;
    const ballY = myBall.y + gameAreaRect.top;
    
    if (ballX >= exitRect.left && ballX <= exitRect.right &&
        ballY >= exitRect.top && ballY <= exitRect.bottom) {
      GameManager.exitCreated = false;
      nextStage();
    }
  }
}

// UI 업데이트
export function updateUI() {
  const scoreElem = document.getElementById('score');
  const stageElem = document.getElementById('stage');
  const timeElem = document.getElementById('time');
  const ballsCountElem = document.getElementById('balls-count');
  const bonusTimeElem = document.getElementById('bonus-time');
  
  if (scoreElem) scoreElem.textContent = GameManager.score.toString();
  if (stageElem) stageElem.textContent = GameManager.currentStage.toString();
  
  const timeDisplay = document.getElementById('time-display');
  const ballsLeft = document.getElementById('balls-left');
  const bonusTimeDisplay = document.getElementById('bonus-time-display');
  
  if (GameManager.option2 === 1) {
    if (timeDisplay) timeDisplay.style.display = 'block';
    if (ballsLeft) ballsLeft.style.display = 'none';
    if (timeElem) timeElem.textContent = Math.floor(GameManager.gameTime / 1000).toString();
  } else {
    if (timeDisplay) timeDisplay.style.display = 'none';
    if (ballsLeft) ballsLeft.style.display = 'block';
    if (ballsCountElem) ballsCountElem.textContent = (GameManager.ballsToCollect - GameManager.ballsCollected).toString();
  }

  // 보너스 스테이지 시간 표시
  if (GameManager.isInBonusStage) {
    if (bonusTimeDisplay) bonusTimeDisplay.style.display = 'block';
    if (bonusTimeElem) bonusTimeElem.textContent = Math.max(0, Math.floor(GameManager.bonusStageTimer / 1000)).toString();
  } else {
    if (bonusTimeDisplay) bonusTimeDisplay.style.display = 'none';
  }

  // 보너스 글자 UI 업데이트
  GameManager.bonusLetters.forEach(letter => {
    const elem = document.getElementById(`bonus-${letter}`);
    if (elem) {
      elem.classList.toggle('collected', GameManager.bonusCollected.includes(letter));
    }
  });
}

// 게임 오버
export function gameOver() {
  GameManager.gameStatus = GameStatus.END;
}

// 게임 오버 화면 표시
export function showGameOver() {
  const finalScoreElem = document.getElementById('final-score');
  const finalStageElem = document.getElementById('final-stage');
  const gameOverPanel = document.getElementById('game-over-panel');
  
  if (finalScoreElem) finalScoreElem.textContent = GameManager.score.toString();
  if (finalStageElem) finalStageElem.textContent = GameManager.currentStage.toString();
  if (gameOverPanel) gameOverPanel.style.display = 'block';
}