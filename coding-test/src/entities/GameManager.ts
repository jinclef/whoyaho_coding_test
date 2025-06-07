import { GameObject } from "./GameObject";

export enum GameStatus {
  READY,
  GO,
  END,
}

export class GameManager {
  static GameStatus: GameStatus = GameStatus.READY;
  static GameArea: HTMLElement | null = null;
  static GameAreaRect: DOMRect | null = null;
  static GameObjMap: Map<string, GameObject> | null;

  static setGameArea(gameArea: HTMLElement) {
    this.GameArea = gameArea;
    this.GameAreaRect = gameArea.getBoundingClientRect();
  }

  static setGameObjMap(gameObj: Map<string, GameObject>) {
    this.GameObjMap = gameObj;
  }

  static setGameStatus(gameStatus: GameStatus) {
    this.GameStatus = gameStatus;
  }
}
