import { GAME_LEVELS, GameLevel } from "../models/game-level.type";
import { GameStatus } from "../models/game-status.enum";
import { Gameboard } from "../models/gameboard.model";

export class MineSweeperService {
  public selectedLevel: GameLevel = GAME_LEVELS.easy;
  public gameBoard: Gameboard = new Gameboard();

  constructor() {}

  initGame(): GameLevel {
    return this.buildGame(GAME_LEVELS.easy);
  }

  selectGameLevel(level: string): GameLevel {
    return this.buildGame(GAME_LEVELS[level]); 
  }

  restartGame(): GameLevel {
    return this.buildGame();
  }

  rightClick(x: string, y: string): any {
    return this.gameBoard.flaggedCell(x, y);
  }

  leftClick(x: string, y: string): any {
    return this.gameBoard.revealCell(x, y);
  }

  private buildGame(level = this.selectedLevel): GameLevel {
    this.selectedLevel = level;
    this.gameBoard = new Gameboard(this.selectedLevel);
    return this.selectedLevel;
  }
}