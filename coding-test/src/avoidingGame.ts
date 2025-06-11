import { GameManager, GameStatus } from "./entities/GameManager";
import { GameObject } from "./entities/GameObject";
import { MyBall } from "./entities/MyBall";
import { spawnBall, BallType } from "./entities/BallSpawner";
import { registerKeyboardEvent, updateTimerDisplay, checkCollision } from "./utils/gameUtils";
import { Item, ItemType } from "./entities/Item";
import { EffectDisplay } from "./utils/effectUI";
import { spawnRandomItem } from "./entities/ItemSpawner";
import { applyItemEffect } from "./entities/applyItemEffect";

// 게임 상태 관리
class GameState {
	baseScore: number = 0; // 시간/폭탄 기반 점수
  bonusScore: number = 0; // 아이템으로 얻은 보너스 점수
  lives: number = 1;
  slowMotionEndTime: number = 0;
  invincibleEndTime: number = 0;
  itemInvincibleEndTime: number = 0;

	getScore(): number {
		return this.baseScore + this.bonusScore;
	}
  
  // 기본 점수 업데이트 (시간 + 폭탄 개수 기반)
  updateBaseScore(elapsedTime: number, bombCount: number) {
    const timeBonus = Math.floor(elapsedTime / 1000) * 10; // 1초당 10점
    const bombBonus = bombCount * 5; // 공 1개당 5점
    this.baseScore = timeBonus + bombBonus;
  }
  
  // 보너스 점수 추가
  addBonusScore(points: number) {
    this.bonusScore += points;
    console.log(`Bonus added: +${points}, Total bonus: ${this.bonusScore}, Total score: ${this.getScore()}`);
  }

  isSlowMotionActive(currentTime: number): boolean {
    return currentTime < this.slowMotionEndTime;
  }

  isInvincibleActive(currentTime: number): boolean {
    return currentTime < this.invincibleEndTime;
  }

  isItemInvincibleActive(currentTime: number): boolean {
    return currentTime < this.itemInvincibleEndTime;
  }
}
// 전역 변수들
let raf: number;
let lastFrameTime: null | number = null;
let dt = 0;
const gameObjMap: Map<string, GameObject> = new Map();
let elapsedTime = 0;
let lastBombSpawnTime = 0;
let lastItemSpawnTime = 0;
const bombSpawnInterval = 3000; // TODO: 시간이 지날수록 빠르게 스폰.
const itemSpawnInterval = 8000; // 8초마다 아이템 스폰 // TODO: random
const gameState = new GameState();
let effectDisplay: EffectDisplay;

export function startAvoidingGame() {
  const intialUis = document.querySelectorAll(".initial-ui");
  const gameArea = document.getElementById("game-area")!;

  intialUis.forEach((ui) => {
    (ui as HTMLElement).style.display = "none";
  });
  gameArea.style.display = "flex";

  // 효과 표시 UI 초기화
  effectDisplay = new EffectDisplay();

  // 점수 표시 UI 추가
  const scoreDisplay = document.createElement("div");
  scoreDisplay.id = "score-display";
  scoreDisplay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    color: white;
    font-size: 18px;
    font-weight: bold;
    z-index: 1000;
    background: rgba(0,0,0,0.7);
    padding: 10px;
    border-radius: 5px;
  `;
  document.body.appendChild(scoreDisplay);

  GameManager.setGameArea(gameArea);
  const boundingRect = gameArea.getBoundingClientRect();

  const myBallObj = new MyBall(
    document.createElement("div"),
    boundingRect.height * 0.05,
    boundingRect.height * 0.05,
    boundingRect.width / 2,
    boundingRect.height / 2
  );
  gameObjMap.set("myBall", myBallObj);

  // initial BombBalls
  const initialBombCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < initialBombCount; i++) {
    spawnBall(BallType.Bomb, gameArea, gameObjMap);
  }

  for (const gameObj of gameObjMap.values()) {
    gameArea.appendChild(gameObj.elem!);
  }

  registerKeyboardEvent(myBallObj);
  runGameLoop(gameArea);
}

function runGameLoop(gameArea: HTMLElement) {
  const currentTime = new Date().getTime();
  if (lastFrameTime === null) lastFrameTime = currentTime;
  dt = currentTime - lastFrameTime;
  elapsedTime += dt;

  // 슬로우 모션 효과 적용
  const effectiveDt = gameState.isSlowMotionActive(currentTime) ? dt * 0.3 : dt;

  // 게임 오브젝트 업데이트
  for (const [key, gameObj] of gameObjMap.entries()) {
    if (key === "myBall") {
      gameObj.update(dt); // 플레이어는 정상 속도
    } else if (key.startsWith("Bomb")) {
      gameObj.update(effectiveDt); // 폭탄은 슬로우 모션 적용
    } else {
      gameObj.update(dt); // 아이템은 정상 속도
    }
  }

  handleBombBallCollisions(effectiveDt);
  handleItemLogic(gameArea, currentTime);

  // 새 폭탄 스폰
  if (elapsedTime - lastBombSpawnTime >= bombSpawnInterval) {
    lastBombSpawnTime = elapsedTime;
    spawnBall(BallType.Bomb, gameArea, gameObjMap);
  }

  // 새 아이템 스폰
  if (elapsedTime - lastItemSpawnTime >= itemSpawnInterval) {
    lastItemSpawnTime = elapsedTime;
    spawnRandomItem(gameArea, currentTime, gameObjMap);
  }

  // 충돌 검사 (무적 상태가 아닐 때만)
  const myBall = gameObjMap.get("myBall");
  if (!gameState.isInvincibleActive(currentTime) || !gameState.isItemInvincibleActive(currentTime)) {
    for (const [key, obj] of gameObjMap.entries()) {
      if (key.startsWith("Bomb") && myBall && checkCollision(myBall, obj)) {
        gameState.lives--;
        if (gameState.lives <= 0) {
          GameManager.GameStatus = GameStatus.END;
        } else {
          effectDisplay.showEffect(`생명 -1 (남은 생명: ${gameState.lives})`, "#ff4040");
          // 잠시 무적 상태로 만들기
          gameState.invincibleEndTime = currentTime + 2000;
          // effectDisplay.showEffect("2초간 무적!", "#ffffff");
        }
        break;
      }
    }
  }

  // 점수 업데이트
  const bombCount = Array.from(gameObjMap.keys()).filter(key => key.startsWith("Bomb")).length;
  gameState.updateBaseScore(elapsedTime, bombCount);

  updateDisplays();
  lastFrameTime = currentTime;

  if (GameManager.GameStatus === GameStatus.END) {
    alert(`Game Over! 최종 점수: ${gameState.getScore().toLocaleString()}`);
    cleanup();
    setTimeout(() => location.reload(), 1000);
    return;
  }

  raf = requestAnimationFrame(() => runGameLoop(gameArea));
}


function handleItemLogic(_gameArea: HTMLElement, currentTime: number) {
  const myBall = gameObjMap.get("myBall");
  const itemsToRemove: string[] = [];

  for (const [key, obj] of gameObjMap.entries()) {
    if (key.startsWith("Item") || key.startsWith("item")) {
      const item = obj as Item;
      
      // 아이템이 만료되었는지 확인
      if (item.isExpired(currentTime)) {
        itemsToRemove.push(key);
        continue;
      }

      // 플레이어와 아이템 충돌 확인
      if (myBall && checkCollision(myBall, item)) {
        applyItemEffect(item.type, currentTime, gameState, effectDisplay, gameObjMap);
        itemsToRemove.push(key);
      }
    }
  }

  // 만료되거나 획득된 아이템 제거
  itemsToRemove.forEach(key => {
    const item = gameObjMap.get(key);
    if (item && item.elem && item.elem.parentNode) {
      item.elem.parentNode.removeChild(item.elem);
    }
    gameObjMap.delete(key);
  });
}

function updateDisplays() {
  updateTimerDisplay(elapsedTime);
  
  const scoreDisplay = document.getElementById("score-display");
  if (scoreDisplay) {
    scoreDisplay.innerHTML = `
      점수: ${gameState.getScore().toLocaleString()}<br>
      생명: ${gameState.lives}<br>
			폭탄수: ${Array.from(gameObjMap.keys()).filter(key => key.startsWith("Bomb")).length}<br>
    `;
  }

	// 무적 상태에 따라 myBall 색상 변경
  const myBall = gameObjMap.get("myBall");
  if (myBall && myBall.elem) {
    if (gameState.isItemInvincibleActive(Date.now())) {
      myBall.elem.classList.add("invincible");
    }
    else {
      myBall.elem.classList.remove("invincible");
    }
  }
}

function cleanup() {
  if (effectDisplay) {
    effectDisplay.destroy();
  }
  const scoreDisplay = document.getElementById("score-display");
  if (scoreDisplay && scoreDisplay.parentNode) {
    scoreDisplay.parentNode.removeChild(scoreDisplay);
  }
}

// 공들끼리도 충돌 처리
function handleBombBallCollisions(_effectiveDt: number) {
  const balls: GameObject[] = [];
  const handled = new Set<string>();

  for (const [key, obj] of gameObjMap.entries()) {
    if (key.startsWith("Bomb")) {
      balls.push(obj);
    }
  }

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      
      const pairKey = `${i}-${j}`;
      
      if (handled.has(pairKey)) {
        continue;
      }

      if (checkCollision(a, b)) {
        handled.add(pairKey);
        
        const temp = a.degree;
        a.degree = b.degree;
        b.degree = temp;

        separateBalls(a, b);
      }
    }
  }
}

function separateBalls(a: GameObject, b: GameObject) {
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