
import { GameManager, GameMode, GameStatus } from "./entities/GameManager";
import { MyBall } from "./entities/MyBall";
import { checkCollision, registerKeyboardEvent } from "./utils/gameUtils";
import { GameObject } from "./entities/GameObject";
import { CollectibleBall } from "./entities/GameBall";
import { Obstacle } from "./entities/GameBall";
import { BallType, spawnBall } from "./entities/BallSpawner";
import { endBonusStage, startBonusStage } from "./entities/eatingGame/bonusStage";
import { createExit } from "./entities/eatingGame/exit";
import { explodeRedZone } from "./entities/eatingGame/redZone";
import { createObstacles } from "./entities/eatingGame/obstacles";
import { createPortals } from "./entities/eatingGame/portal";

let raf: number;
let lastFrameTime: null | number = null;
let dt = 0;

const gameObjMap: Map<string, GameObject> = new Map();

// 게임 시작
export function startEatingGame() {
  const intialUis = document.querySelectorAll(".initial-ui");
  const gameContainer = document.getElementById('game-container-eating');
	const gameUi = document.getElementById('game-ui');
  const gameArea = document.getElementById("game-area-eating")!;

  intialUis.forEach((ui) => {
    (ui as HTMLElement).style.display = "none";
  });

  if (gameContainer) gameContainer.style.display = 'flex';
	if (gameUi) gameUi.style.display = 'flex';
  gameArea.style.display = "flex";

  GameManager.reset();
  gameObjMap.clear();
	GameManager.setGameArea(gameArea);
  GameManager.gameMode = GameMode.AVOIDING;
  
	const boundingRect = gameArea.getBoundingClientRect();
  GameManager.gameStatus = GameStatus.PLAYING;
  GameManager.startTime = Date.now();
  
  const myBallElem = document.createElement('div');
	myBallElem.classList.add("my-ball");
	const myBallObj = new MyBall(
    myBallElem,
		boundingRect.height * 0.025,
		boundingRect.height * 0.025,
		boundingRect.width / 2,
		boundingRect.height / 2
	);
	gameObjMap.set("myBall", myBallObj);
	gameArea.appendChild(myBallElem);
		
	// 수집 가능한 공들 생성
	for (let i = 0; i < GameManager.ballsToCollect; i++) spawnBall(BallType.Normal, gameArea, gameObjMap);
	
	// 방해물 생성 (더 많이)
	createObstacles(gameObjMap);

	updateUI();
	registerKeyboardEvent(myBallObj);
	runGameLoop();
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
      // spawnRandomBonusLetter();
			spawnBall(BallType.Bonus, GameManager.gameArea!, gameObjMap);
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
      endBonusStage(gameObjMap);
    }
  }
  
  // 게임 오브젝트 업데이트
  gameObjMap.forEach(obj => {
    obj.update(dt);
  });
  
  // 보너스 공 수명 관리 (gameObjMap에서 제거된 것들 정리)
  const keysToDelete: string[] = [];
  gameObjMap.forEach((obj, key) => {
    if (key.startsWith(`${BallType.Bonus}-`) && obj.elem && !obj.elem.parentNode) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => gameObjMap.delete(key));
  
  // 공들끼리 충돌 처리
  handleBallCollisions();
  handleObstacleCollisions();
  
  // 충돌 검사
  checkCollisions();

  // 랜덤 이벤트들 - 보너스 스테이지가 아닐 때만
  if (Math.random() < 0.001 && !GameManager.isInBonusStage) {
    explodeRedZone(gameObjMap);
  }
  
  // 포탈 생성
  if (Math.random() < 0.001 && !GameManager.isInBonusStage && GameManager.portalTotalCount < 1) {
    createPortals();
  }

  // UI 업데이트
  updateUI();
  lastFrameTime = currentTime;

  if (GameManager.gameStatus === GameStatus.END) {
    showGameOver();
    return;
  }
  
  raf = requestAnimationFrame(runGameLoop);
}

function restartEatingGame() {
  if (raf) {
    cancelAnimationFrame(raf);
  }
  
  GameManager.reset();
  GameManager.gameStatus = GameStatus.PLAYING;
  GameManager.startTime = Date.now();
  
  const gameOverPanel = document.getElementById('game-over-panel');
  const gameContainer = document.getElementById('game-container-eating');
  
  if (gameOverPanel) gameOverPanel.style.display = 'none';
  if (gameContainer) gameContainer.style.display = 'none';

  // 게임 영역 초기화
  const gameArea = document.getElementById('game-area-eating');
  if (gameArea) {
    gameArea.innerHTML = '';
  }
  
  gameObjMap.clear();
  lastFrameTime = null;
  dt = 0;
  
  startEatingGame();
}

// 홈으로 가기
function goHome() {
  if (raf) {
    cancelAnimationFrame(raf);
  }
  
  const gameOverPanel = document.getElementById('game-over-panel');
  
  if (gameOverPanel) gameOverPanel.style.display = 'none';
  document.querySelectorAll('.initial-ui').forEach(ui => {
    (ui as HTMLElement).style.display = 'flex';
  });
  
  // 게임 영역 초기화
  const gameArea = document.getElementById('game-area-eating');
  if (gameArea) gameArea.innerHTML = '';
	const gameContainer = document.getElementById('game-container-eating');
	if (gameContainer) gameContainer.style.display = 'none';
  
  gameObjMap.clear();
  lastFrameTime = null;
  dt = 0;
}

// 전역 함수로 등록 (HTML에서 호출하기 위해)
(window as any).startGame = startEatingGame;
(window as any).restartGame = restartEatingGame;
(window as any).goHome = goHome;

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

			if (checkCollision(a,b)) {
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
	handleCollisions([`${BallType.Normal}-`, `${BallType.Bonus}-`]);
}

// 방해물들끼리 충돌 처리
export function handleObstacleCollisions() {
	handleCollisions([`${BallType.Obstacle}-`]);
}

export function separateBalls(a: GameObject, b: GameObject) {
	const dx = a.leftTopX - b.leftTopX;
	const dy = a.leftTopY - b.leftTopY;
	const dist = Math.hypot(dx, dy);
	
	const minDistance = (a.width + b.width) / 2;
	const overlap = minDistance - dist;
	
	if (overlap <= 0) return;
	
	const ux = dx / dist;
	const uy = dy / dist;
	
	const moveDistance = overlap / 2;
	
	a.leftTopX += ux * moveDistance;
	a.leftTopY += uy * moveDistance;
	b.leftTopX -= ux * moveDistance;
	b.leftTopY -= uy * moveDistance;
}


// 다음 스테이지로
export function nextStage() {
	GameManager.currentStage++;
	GameManager.ballsCollected = 0;
	GameManager.gameTime = 0;
	
	// 방해물 추가
	createObstacles(gameObjMap);

	// 목표 달성 모드: 탈출구 제거
	const exit = document.querySelector('.exit');
	if (exit && exit.parentNode) {
		exit.parentNode.removeChild(exit);
	}
	for (let i = 0; i < GameManager.ballsToCollect; i++) spawnBall(BallType.Normal, GameManager.gameArea!, gameObjMap);
	
	updateUI();
}

// 충돌 검사
export function checkCollisions() {
	const myBall = gameObjMap.get('myBall');
	if (!myBall) return;

	// 수집 가능한 공들과의 충돌
	gameObjMap.forEach((obj, key) => {
		if (key.startsWith(`${BallType.Normal}-`) || key.startsWith(`${BallType.Bonus}-`)) {
			if (checkCollision(myBall, obj)) {
				const collectibleBall = obj as CollectibleBall;
				if (collectibleBall.type === BallType.Normal) {
					const value = typeof collectibleBall.value === 'number' ? collectibleBall.value : parseInt(collectibleBall.value.toString());
					GameManager.score += value;
					GameManager.ballsCollected++;
				}
				else if (collectibleBall.type === BallType.Bonus) {
					const letter = collectibleBall.value.toString();
					if (!GameManager.bonusCollected.includes(letter)) {
						GameManager.bonusCollected.push(letter);
						if (GameManager.bonusCollected.length === GameManager.bonusLetters.length) { // 모든 보너스 글자를 모았을 때
							startBonusStage(gameObjMap);
						}
					}
				}
				
				if (obj.elem && obj.elem.parentNode) {
					obj.elem.parentNode.removeChild(obj.elem);
				}
				gameObjMap.delete(key);
				
				if (!GameManager.exitCreated && GameManager.ballsCollected >= GameManager.ballsToCollect) {
					createExit();
				}
			}
		}
	});
	
	// 방해물과의 충돌
	gameObjMap.forEach((obj, key) => {
		if (key.startsWith(`${BallType.Obstacle}-`)) {
			if (checkCollision(myBall, obj)) {
				if (GameManager.isInBonusStage) {
					// 보너스 스테이지에서는 방해물을 먹으면 점수 획득
					GameManager.score += 10; // 방해물 점수
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
	if (exit && GameManager.gameArea) {
		const exitRect = exit.getBoundingClientRect();
		const gameAreaRect = GameManager.gameArea.getBoundingClientRect();
		const ballX = myBall.leftTopX + gameAreaRect.left;
		const ballY = myBall.leftTopY + gameAreaRect.top;
		
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
	const ballsCountElem = document.getElementById('balls-count');
	const bonusTimeElem = document.getElementById('bonus-time');
	
	if (scoreElem) scoreElem.textContent = GameManager.score.toString();
	if (stageElem) stageElem.textContent = GameManager.currentStage.toString();
	
	const timeDisplay = document.getElementById('time-display');
	const ballsLeft = document.getElementById('balls-left');
	const bonusTimeDisplay = document.getElementById('bonus-time-display');
	
	if (timeDisplay) timeDisplay.style.display = 'none';
	if (ballsLeft) ballsLeft.style.display = 'block';
	if (ballsCountElem) ballsCountElem.textContent = (GameManager.ballsToCollect - GameManager.ballsCollected).toString();

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
