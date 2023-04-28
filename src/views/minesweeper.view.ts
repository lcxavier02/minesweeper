import { Cell, CellType } from "../models/cell.model";
import { GAME_LEVELS, GameLevel} from "../models/game-level.type";
import { GameStatus } from "../models/game-status.enum";

export class MineSweeperView {
  private app: HTMLElement = document.getElementById('app');
  private board: HTMLElement = document.getElementById('board');
  private gameContainer: HTMLElement = document.getElementById('game-container');
  private gameLevelSelect: HTMLElement = document.getElementById('game-level');
  private restartBtn: HTMLElement = document.getElementById('restart');
  private remainingFlasg: HTMLElement = document.getElementById('flags-remaining');
  private timer: HTMLElement = document.getElementById('time-counter');

  constructor() {
    this.init(GAME_LEVELS.easy);
  }

  init(levelSelected: GameLevel) {
    this.renderBoard(levelSelected);
  }

  renderBoard({level, columns}: GameLevel) {
    this.gameContainer.className = `game-container-${level}`;
    this.board.className = `board-${level}`;
    let cells = '';
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < columns; y++) {
        cells += `<div id="${x}-${y}" class="cell" data-x="${x}" data-y="${y}"></div>`
      }
    }
    this.board.innerHTML = cells;
  }

  refreshGameStatus(gameStatus: GameStatus) {
    if (gameStatus === GameStatus.won) {
      this.playerWon();
    }
    if (gameStatus === GameStatus.lost) {
      this.playerLost();
    }
  }

  refreshCells(cells: Cell[], cellType: CellType) {
    const refresh = {
      [CellType.space]: this.showCells,
      [CellType.mine]: this.showMines,
      [CellType.number]: this.showNumbers
    };
    refresh[cellType](cells);
  }

  updateFlagsCount(flags: number): void { 
    this.remainingFlasg.innerHTML = `${this.lpad(flags, 3)}`
  }

  updateTimer(time: number): void { 
    this.timer.innerHTML = `${this.lpad(time, 3)}`
  }

  private lpad(value, padding) {
    const zeroes = new Array(padding + 1).join('0');
    return (zeroes + value).slice(-padding);
  }

  private showMines = (mines: Cell[]): void => {
    for (const cell of mines) {
      this.showMine(cell);
    }
  }

  private showNumbers = (cells: Cell[]): void => {
    for (const cell of cells) {
      this.showNumber(cell);
    }
  }

  private showCells = (cells: Cell[]): void => {
    for (const cell of cells) {
      cell.isSpace() ? this.showSpace(cell) : this.showNumber(cell);
    }
  }

  private showMine({coords: { x, y } }: Cell): void {
    const cell = document.getElementById(`${x}-${y}`);
    cell.classList.add('mine');
  }

  private showNumber({coords: { x, y }, number }: Cell): void {
    const cell = document.getElementById(`${x}-${y}`);
    cell.innerHTML = `${number}`;
    cell.classList.add('revealed', `number-${number}`);
  }

  private showSpace({coords: { x, y } }: Cell): void {
    const cell = document.getElementById(`${x}-${y}`);
    cell.classList.add('revealed');
  }

  public playerWon(): void {
    alert('You won!');
  }

  public playerLost(): void {
    this.setDeadFace();
    alert('You lost!');
  }

  public setSmileyFace(): void {
    this.restartBtn.classList.remove('dead-face');
    this.restartBtn.classList.add('smiley-face');
  }

  public setDeadFace(): void {
    this.restartBtn.classList.remove('smiley-face');
    this.restartBtn.classList.add('dead-face');
  }

  bindRestartButton(handler: Function): void {
    this.restartBtn.addEventListener('click', () => {
      handler();
      this.setSmileyFace();
    });
  }

  flaggeCell({coords: { x, y }}): void {
    const cell = document.getElementById(`${x}-${y}`);
    cell.classList.toggle('flag');
  }

  bindGameLevelSelect(handler: Function): void {
    this.gameLevelSelect.addEventListener('change', _ => {
      handler((this.gameLevelSelect as HTMLSelectElement).value);
      this.setSmileyFace();
    });
  }

  bindGameBoxLeftClick(handler: Function): void {
    this.board.addEventListener('click', (event: any) => {
      const {x, y} = event.target.dataset;
      handler(x,y);
    });
  }

  bindGameBoxRightClick(handler: Function): void {
    this.board.addEventListener('contextmenu', (event: any) => {
      event.preventDefault();
      const { x, y } = event.target.dataset;
      handler(x,y);
    });
  }

  removeBoardListeners(): void {
    const board = this.board.cloneNode(true);
    this.app.replaceChild(board, this.board);
    this.board = document.getElementById('board');
  }
}