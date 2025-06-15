import { GameObject } from "./GameObject";

export enum GameStatus {
  READY = 'READY',
  PLAYING = 'PLAYING', 
  BONUS = 'BONUS',
  END = 'END'
}

export class GameManager {
  static gameStatus: GameStatus = GameStatus.READY;
  static gameArea: HTMLElement | null = null;
  static gameAreaRect: DOMRect | null = null;
  static exitCreated = false;
  static currentStage = 1;
  static score = 0;
  static startTime = 0;
  static gameTime = 0;
  static ballsToCollect = 3;
  static ballsCollected = 0;
  static bonusLetters = ['B', 'O', 'N', 'U', 'S'];
  static bonusCollected: string[] = [];
  static isInBonusStage = false;
  static bonusStageTimer = 0;
  static hasAttackItem = false;
  static lastBonusSpawnTime = 0;
  static bonusSpawnInterval = 5000; // 5초마다 스폰
  static obstacleTotalCount = 0;
  static ballSpawnTimer = 0;
  static baseSpawnInterval = 500; // 기본 생성 간격 (밀리초)
  static baseBallLifeTime = 8000; // 기본 공 수명 (밀리초)
  static maxInfiniteBalls = 50; // 성능 보호용 최대 개수
  static infiniteBallId = 0; // 무한 생성 공 ID 카운터
  static portalTotalCount = 0;

  static setGameArea(gameArea: HTMLElement) {
    this.gameArea = gameArea;
    this.gameAreaRect = gameArea.getBoundingClientRect();
  }

  static reset() {
    this.gameStatus = GameStatus.READY;
    this.currentStage = 1;
    this.score = 0;
    this.startTime = Date.now();
    this.gameTime = 0;
    this.ballsCollected = 0;
    this.bonusCollected = [];
    this.isInBonusStage = false;
    this.bonusStageTimer = 0;
    this.hasAttackItem = false;
    this.lastBonusSpawnTime = 0;
    this.exitCreated = false;
    this.ballSpawnTimer = 0;
    this.infiniteBallId = 0;
  }
}