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
  static option1 = 0; // 1: 움직이는 공, 2: 멈춰있는 공
  static option2 = 0; // 1: 시간제한, 2: 목표달성
  static ballsToCollect = 2;
  static ballsCollected = 0;
  static bonusLetters = ['B', 'O', 'N', 'U', 'S'];
  static bonusCollected: string[] = [];
  static isInBonusStage = false;
  static bonusStageTimer = 0;
  static hasAttackItem = false;
  static lastBonusSpawnTime = 0;
  static bonusSpawnInterval = 5000; // 5초마다 스폰

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
  }
}