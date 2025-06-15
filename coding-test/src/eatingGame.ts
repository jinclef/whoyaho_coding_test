
import { GameManager, GameStatus } from "./entities/GameManager";
import { MyBall } from "./entities/MyBall";
import { checkCollision, registerKeyboardEvent } from "./utils/gameUtils";
import { GameObject } from "./entities/GameObject";
import { CollectibleBall } from "./entities/eatingGame/CollectibleBall";
import { Obstacle } from "./entities/eatingGame/Obstacle";

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
	createCollectibleBalls();
	
	// 방해물 생성 (더 많이)
	createObstacles();

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

  // 랜덤 이벤트들 - 보너스 스테이지가 아닐 때만
  if (Math.random() < 0.001 && !GameManager.isInBonusStage) {
    dropBomb();
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
			'normal', GameManager.currentStage * 2
		);
		gameObjMap.set(`ball_${i}`, ball);
		gameArea.appendChild(elem);
	}
}

// 보너스 글자 랜덤 스폰
export function spawnRandomBonusLetter() {
	if (GameManager.isInBonusStage || !GameManager.gameArea) return;
	
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
		gameObjMap.set(`obstacle_${i}`, obstacle);
		
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
	GameManager.portalTotalCount += 1;
	
	// 포탈 자동 제거
	setTimeout(() => {
		[portal1, portal2].forEach(portal => {
			if (portal.parentNode) {
				portal.parentNode.removeChild(portal);
				GameManager.portalTotalCount = 0;
			}
		});
	}, 8000);
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

export function dropBomb() {
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
	handleCollisions(['ball_']);
}

// 방해물들끼리 충돌 처리
export function handleObstacleCollisions() {
	handleCollisions(['obstacle_']);
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
	
	// 방해물들을 먹을 수 있는 공으로 변환
	gameObjMap.forEach((obj, key) => {
		if (key.startsWith('obstacle_')) {
			const collectibleBall = obj as CollectibleBall;
			collectibleBall.value = GameManager.currentStage * 5;
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
		if (key.startsWith('bonus_')) {
			if (obj.elem && obj.elem.parentNode) {
				obj.elem.parentNode.removeChild(obj.elem);
			}
			gameObjMap.delete(key);
		}
	});
}

// 보너스 스테이지 업데이트 (app.ts의 runGameLoop에서 호출)
export function updateBonusStage(dt: number) {
	if (!GameManager.isInBonusStage) return;
	
	// 보너스 스테이지 타이머 감소
	GameManager.bonusStageTimer -= dt;
	
	// 끝나기 3초 전부터 깜빡이기
	if (GameManager.bonusStageTimer <= 3000) {
		const timeLeft = GameManager.bonusStageTimer;
		
		const blinkInterval = Math.max(100, (timeLeft / 3000) * 500 + 100);
		const shouldBlink = Math.floor(Date.now() / blinkInterval) % 2 === 0;
		
		// 플레이어 공도 깜빡임
		const myBall = gameObjMap.get('myBall');
		if (myBall) {
			myBall.elem!.style.opacity = shouldBlink ? '0.5' : '1';
		}
	}
	
	if (GameManager.bonusStageTimer <= 0) {
		endBonusStage();
	}
}

// 보너스 스테이지 종료
export function endBonusStage() {
	GameManager.isInBonusStage = false;
	GameManager.bonusCollected = [];
	
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
		if (key.startsWith('obstacle_')) {
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
		if (key.startsWith('ball_')) {
			const collectibleBall = obj as CollectibleBall;
			collectibleBall.value = GameManager.currentStage * 2; // 원래 점수로 복원
			if (obj.elem) {
				obj.elem.style.background = '#2ecc71';
				obj.elem.style.border = '2px solid #27ae60';
				obj.elem.style.animation = 'bonus-pulse 0.8s ease-in-out infinite alternate';
			}
		}
	});
}

// 다음 스테이지로
export function nextStage() {
	GameManager.currentStage++;
	GameManager.ballsCollected = 0;
	GameManager.gameTime = 0;
	
	// 방해물 추가
	createObstacles();

	// 목표 달성 모드: 탈출구 제거
	const exit = document.querySelector('.exit');
	if (exit && exit.parentNode) {
		exit.parentNode.removeChild(exit);
	}
	createCollectibleBalls();
	
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

// 충돌 검사
export function checkCollisions() {
	const myBall = gameObjMap.get('myBall');
	if (!myBall) return;
	
	// 수집 가능한 공들과의 충돌
	gameObjMap.forEach((obj, key) => {
		if (key.startsWith('ball_') || key.startsWith('bonus_') || key.startsWith('score_')) {
			if (checkCollision(myBall, obj)) {
				const collectibleBall = obj as CollectibleBall;
				
				if (collectibleBall.type === 'normal') {
					const value = typeof collectibleBall.value === 'number' ? collectibleBall.value : parseInt(collectibleBall.value.toString());
					GameManager.score += value;
					GameManager.ballsCollected++;
				} else if (collectibleBall.type === 'bonus') {
					const letter = collectibleBall.value.toString();
					if (!GameManager.bonusCollected.includes(letter)) {
						GameManager.bonusCollected.push(letter);
						if (GameManager.bonusCollected.length === GameManager.bonusLetters.length) { // 모든 보너스 글자를 모았을 때
							startBonusStage();
						}
					}
				} else if (collectibleBall.type === 'score') { // bonus 점수 공
					const value = typeof collectibleBall.value === 'number' ? collectibleBall.value : parseInt(collectibleBall.value.toString());
					GameManager.score += value;
				}
				
				if (obj.elem && obj.elem.parentNode) {
					obj.elem.parentNode.removeChild(obj.elem);
				}
				gameObjMap.delete(key);
				
				// 목표 달성 모드에서 모든 공을 먹었을 때
				if (!GameManager.exitCreated && GameManager.ballsCollected >= GameManager.ballsToCollect) {
					createExit();
				}
			}
		}
	});
	
	// 방해물과의 충돌
	gameObjMap.forEach((obj, key) => {
		if (key.startsWith('obstacle_')) {
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
