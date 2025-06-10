import { GameManager, GameStatus } from "./entities/GameManager";
import { GameObject } from "./entities/GameObject";
import { MyBall } from "./entities/MyBall";
import { spawnBall, BallType } from "./entities/BallSpawner";
import { registerKeyboardEvent, updateTimerDisplay, checkCollision } from "./utils/gameUtils";
import { Item, ItemType } from "./entities/Item";
import { EffectDisplay } from "./utils/effectUI";

// 게임 상태 관리
class GameState {
	baseScore: number = 0; // 시간/폭탄 기반 점수
  bonusScore: number = 0; // 아이템으로 얻은 보너스 점수
  lives: number = 1;
  slowMotionEndTime: number = 0;
  invincibleEndTime: number = 0;

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
}
// 전역 변수들
let raf: number;
let lastFrameTime: null | number = null;
let dt = 0;
const gameObjMap: Map<string, GameObject> = new Map();
let elapsedTime = 0;
let lastBombSpawnTime = 0;
let lastItemSpawnTime = 0;
const bombSpawnInterval = 3000;
const itemSpawnInterval = 8000; // 8초마다 아이템 스폰
const gameState = new GameState();
let effectDisplay: EffectDisplay;

// CSS 애니메이션 추가
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes itemFloat {
    0% { transform: translateY(0px) scale(1); }
    100% { transform: translateY(-10px) scale(1.1); }
  }
  
  @keyframes effectBlink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }

	@keyframes explode {
    0% { 
      transform: scale(0) rotate(0deg);
      opacity: 1;
    }
    50% { 
      transform: scale(1.5) rotate(180deg);
      opacity: 0.8;
    }
    100% { 
      transform: scale(3) rotate(360deg);
      opacity: 0;
    }
  }
  
  @keyframes particle {
    0% { 
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translate(var(--dx), var(--dy)) scale(0);
      opacity: 0;
    }
  }
`;
document.head.appendChild(styleSheet);

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
    spawnRandomItem(gameArea, currentTime);
  }

  // 충돌 검사 (무적 상태가 아닐 때만)
  const myBall = gameObjMap.get("myBall");
  if (!gameState.isInvincibleActive(currentTime)) {
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

function spawnRandomItem(gameArea: HTMLElement, currentTime: number) {
  const boundingRect = gameArea.getBoundingClientRect();
  const itemTypes = Object.values(ItemType);
  const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
  
  // spawnBall과 동일한 패딩 로직 사용
  const padding = 50;
  const x = padding + Math.random() * (boundingRect.width - 30 - padding * 2);
  const y = padding + Math.random() * (boundingRect.height - 30 - padding * 2);
  
  const item = new Item(randomType, x, y, currentTime);
  const itemKey = `Item_${currentTime}_${Math.floor(Math.random() * 10000)}`;
  
  gameObjMap.set(itemKey, item);
  gameArea.appendChild(item.elem!);
  
  item.render();
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
        applyItemEffect(item.type, currentTime);
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


function applyItemEffect(itemType: ItemType, currentTime: number) {
  switch (itemType) {
    case ItemType.SlowMotion:
      gameState.slowMotionEndTime = currentTime + 5000; // 5초간 슬로우 모션
      effectDisplay.showEffect("슬로우 모션 활성화! (5초)", "#00ffff");
      break;
      
    case ItemType.Points1000:
			gameState.addBonusScore(1000);
      effectDisplay.showEffect("+1000점!", "#ffff00");
      break;
      
    case ItemType.Points10000:
			gameState.addBonusScore(10000);
      effectDisplay.showEffect("+10000점!", "#ff00ff");
      break;
      
    case ItemType.RemoveBomb:
      removeBomb();
      effectDisplay.showEffect("폭탄 제거!", "#00ff00");
      break;
      
    case ItemType.ExtraLife:
      gameState.lives++;
      effectDisplay.showEffect(`생명 +1 (총 ${gameState.lives}개)`, "#ff4080");
      break;
      
    case ItemType.Invincible:
      gameState.invincibleEndTime = currentTime + 5000; // 5초간 무적
      effectDisplay.showEffect("5초간 무적!", "#ffffff");
      break;
  }
}

function removeBomb() {
  const bombKeys = Array.from(gameObjMap.keys()).filter(key => key.startsWith("Bomb"));
  if (bombKeys.length > 0) {
    const randomBombKey = bombKeys[Math.floor(Math.random() * bombKeys.length)];
    const bomb = gameObjMap.get(randomBombKey);
    if (bomb && bomb.elem && bomb.elem.parentNode) {
			createExplosionEffect(bomb.x + bomb.width / 2, bomb.y + bomb.height / 2, bomb.elem.parentNode as HTMLElement);
      bomb.elem.parentNode.removeChild(bomb.elem);
    }
    gameObjMap.delete(randomBombKey);
  }
}


function createExplosionEffect(x: number, y: number, container: HTMLElement) {
  // 메인 폭발 효과
  const explosion = document.createElement("div");
  explosion.style.cssText = `
    position: absolute;
    left: ${x - 25}px;
    top: ${y - 25}px;
    width: 50px;
    height: 50px;
    background: radial-gradient(circle, #ff6b00 0%, #ff0000 30%, #ffff00 60%, transparent 100%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 1000;
    animation: explode 0.6s ease-out forwards;
  `;
  
  // 폭발 파티클들
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("div");
    const angle = (i / 8) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    const size = 4 + Math.random() * 6;
    
    particle.style.cssText = `
      position: absolute;
      left: ${x - size/2}px;
      top: ${y - size/2}px;
      width: ${size}px;
      height: ${size}px;
      background: ${['#ff6b00', '#ff0000', '#ffff00', '#ff3300'][Math.floor(Math.random() * 4)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 999;
      animation: particle 0.8s ease-out forwards;
      --dx: ${Math.cos(angle) * distance}px;
      --dy: ${Math.sin(angle) * distance}px;
    `;
    
    container.appendChild(particle);
    
    // 파티클 자동 제거
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 800);
  }
  
  container.appendChild(explosion);
  
  // 폭발 효과 자동 제거
  setTimeout(() => {
    if (explosion.parentNode) {
      explosion.parentNode.removeChild(explosion);
    }
  }, 600);
}

function updateDisplays() {
  updateTimerDisplay(elapsedTime);
  
  const scoreDisplay = document.getElementById("score-display");
  if (scoreDisplay) {
    scoreDisplay.innerHTML = `
      점수: ${gameState.getScore().toLocaleString()}<br>
      생명: ${gameState.lives}<br>
			폭탄수: ${Array.from(gameObjMap.keys()).filter(key => key.startsWith("Bomb")).length}<br>
      ${gameState.isSlowMotionActive(Date.now()) ? "🐌 슬로우" : ""}
      ${gameState.isInvincibleActive(Date.now()) ? "✨ 무적" : ""}
    `;
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