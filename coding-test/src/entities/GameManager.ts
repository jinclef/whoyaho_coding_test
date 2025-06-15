import { GameObject } from "./GameObject";

export enum GameStatus {
  READY = 'READY',
  PLAYING = 'PLAYING', 
  BONUS = 'BONUS',
  END = 'END'
}

export enum GameMode {
  AVOIDING = 'AVOIDING',
  EATING = 'EATING',
}

export class GameManager {
  static gameStatus: GameStatus = GameStatus.READY;
  static gameArea: HTMLElement | null = null;
  static gameAreaRect: DOMRect | null = null;
  static gameMode: GameMode | null = null;

  static setGameArea(gameArea: HTMLElement) {
    this.gameArea = gameArea;
    this.gameAreaRect = gameArea.getBoundingClientRect();
  }

  static reset() {
    this.gameStatus = GameStatus.READY;
  }
}