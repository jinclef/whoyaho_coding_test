import { GameManager, GameStatus } from "./entities/GameManager";
import { GameObject } from "./entities/GameObject";
import { MyBall } from "./entities/MyBall";
import { spawnBall, BallType } from "./entities/BallSpawner";
import { registerKeyboardEvent, updateTimerDisplay, checkCollision } from "./utils/gameUtils";

let raf: number;
let lastFrameTime: null | number = null;
let dt = 0;
const gameObjMap: Map<string, GameObject> = new Map();
let elapsedTime = 0;
let lastBombSpawnTime = 0;
const bombSpawnInterval = 3000;

export function startAvoidingGame() {
  const intialUis = document.querySelectorAll(".initial-ui");
  const gameArea = document.getElementById("game-area")!;

  intialUis.forEach((ui) => {
    (ui as HTMLElement).style.display = "none";
  });
  gameArea.style.display = "flex";

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

  for (const gameObj of gameObjMap.values()) {
    gameObj.update(dt);
  }

  handleBombBallCollisions();

  if (elapsedTime - lastBombSpawnTime >= bombSpawnInterval) {
    lastBombSpawnTime = elapsedTime;
    spawnBall(BallType.Bomb, gameArea, gameObjMap);
  }

  const myBall = gameObjMap.get("myBall");
  for (const [key, obj] of gameObjMap.entries()) {
    if (key.startsWith("Bomb") && myBall && checkCollision(myBall, obj)) {
      GameManager.GameStatus = GameStatus.END;
      break;
    }
  }

  updateTimerDisplay(elapsedTime);
  lastFrameTime = currentTime;

  if (GameManager.GameStatus === GameStatus.END) {
    alert("Game Over!");
    setTimeout(() => location.reload(), 1000);
    return;
  }

  raf = requestAnimationFrame(() => runGameLoop(gameArea));
}

// 공들끼리도 충돌 처리
function handleBombBallCollisions() {
  const balls: GameObject[] = [];
  const handled = new Set<string>(); // 이미 처리된 공 쌍을 추적

  // 모든 Bomb 객체 수집
  for (const [key, obj] of gameObjMap.entries()) {
    if (key.startsWith("Bomb")) {
      balls.push(obj);
    }
  }

  // 공들 간의 충돌 처리
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      
      // 공 쌍의 고유 키 생성 (작은 인덱스-큰 인덱스 순서)
      const pairKey = `${i}-${j}`;
      
      // 이미 처리된 쌍이면 건너뛰기
      if (handled.has(pairKey)) {
        continue;
      }

      if (checkCollision(a, b)) {
        // 처리된 쌍으로 표시
        handled.add(pairKey);
        
        // 충돌 처리: 방향 교환
        const temp = a.degree;
        a.degree = b.degree;
        b.degree = temp;

        // 위치 보정: 겹친 거리만큼만 분리
        separateBalls(a, b);
      }
    }
  }
}

// 공들을 최소 거리만큼만 분리하는 함수
function separateBalls(a: GameObject, b: GameObject) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.hypot(dx, dy);
  
  // 두 공의 반지름 합 (충돌 기준 거리)
  const minDistance = (a.width + b.width) / 2;
  
  // 겹친 거리 계산
  const overlap = minDistance - dist;
  
  // 겹쳐있지 않으면 분리할 필요 없음
  if (overlap <= 0) return;
  
  // 방향 벡터 정규화
  const ux = dx / dist;
  const uy = dy / dist;
  
  // 각 공을 겹친 거리의 절반씩 떨어뜨리기
  const moveDistance = overlap / 2;
  
  a.x += ux * moveDistance;
  a.y += uy * moveDistance;
  b.x -= ux * moveDistance;
  b.y -= uy * moveDistance;
}