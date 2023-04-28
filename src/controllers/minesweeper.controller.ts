import { MineSweeperView } from "../views/minesweeper.view";
import { MineSweeperService } from "../services/minesweeper.service";
import { TimerService } from "../services/timer.service";
import { GameStatus } from "../models/game-status.enum";

export class MineSweeperController {
  private timerService: TimerService;
  private isFirstClick: boolean;
  
  constructor(
    private msView: MineSweeperView,
    private msService: MineSweeperService
  ) {
    this.timerService = new TimerService(this.updateTime);
    this.isFirstClick = true;
    this.msView.updateTimer(0);
    const gameLevel = this.msService.initGame();
    this.msView.renderBoard(gameLevel);
    this.msView.bindGameLevelSelect(this.changeGameLevel);
    this.msView.bindRestartButton(this.restartGame);
    this.gameClickBindings(gameLevel);
  }

  changeGameLevel = (level: string) => {
    const gameLevel = this.msService.selectGameLevel(level);
    this.msView.renderBoard(gameLevel);
    this.gameClickBindings(gameLevel);
    //this.resetTime();
  }

  restartGame = () => {
    const gameLevel = this.msService.restartGame();
    this.msView.renderBoard(gameLevel);
    this.gameClickBindings(gameLevel);
    //this.resetTime();
  }

  gameClickBindings = gameLevel => {
    this.msView.removeBoardListeners();
    this.msView.bindGameBoxLeftClick(this.cellLeftClicked);
    this.msView.bindGameBoxRightClick(this.cellRightClicked);
    this.msView.updateFlagsCount(gameLevel.numMines);
  }

  cellLeftClicked = (x: string, y: string) => {
    //this.setFirstClick();
    const leftClick = this.msService.leftClick(x, y);
    
    // if (!leftClick) {
    //   return;
    // }

    const { cells, gameStatus, cell } = leftClick;

    // if (this.isEndGame(gameStatus)) {
    //   this.timerService.stopTime();
    // }

    this.msView.refreshCells(cells, cell.type);
    this.msView.refreshGameStatus(gameStatus);
  }

  cellRightClicked = (x: string, y: string): void =>{
    //this.setFirstClick();
    const { cell, remainingFlags, gameStatus } = this.msService.rightClick(x,y);

    // if (cell.isRevealed) {
    //   return;
    // }
    // if (this.isEndGame(gameStatus)) {
    //   this.timerService.stopTime();
    // }

    this.msView.flaggeCell(cell);
    this.msView.updateFlagsCount(remainingFlags);
    this.msView.refreshGameStatus(gameStatus);
  }

  private setFirstClick() {
    if (!this.isFirstClick) {
      return;
    }
    this.isFirstClick = false;
    this.timerService.startTime();
  }

  private isEndGame(gameStatus): boolean {
    return gameStatus === GameStatus.lost || gameStatus === GameStatus.won;
  }

  private resetTime() {
    this.timerService.stopTime();
    this.timerService = new TimerService(this.updateTime);
    this.isFirstClick = true;
    this.updateTime(0);
  }

  private updateTime =  (time: number) => this.msView.updateTimer(time);
}