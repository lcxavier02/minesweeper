import { LeftClick } from "../interfaces/click.interface";
import { Cell, CellType, Coords } from "./cell.model";
import { GAME_LEVELS } from "./game-level.type";
import { GameStatus } from "./game-status.enum";

export class Gameboard {
  public cells: Cell[][]
  public remainingFlags: number;

  private mines: Cell[] = [];

  constructor(private selectedLevel = GAME_LEVELS.easy) {
    this.reset();
  }

  public reset() {
    this.remainingFlags = this.selectedLevel.numMines;
    this.fillBoardWithSpacesMines();
    this.generateNumbers();
  }

  public flaggedCell(x: string, y: string) {
    const cell = this.cells[x][y];
    if (!cell.isRevealed) {
      this.remainingFlags += cell.isFlagged ? 1 : -1;
      cell.isFlagged = !cell.isFlagged;
    }

    const gameStatus = this.isWin() ? GameStatus.won : GameStatus.alive;

    return { cell, remainingFlags: this.remainingFlags, gameStatus };
  }

  public revealCell(x: string, y: string) {
    const actions = {
      [CellType.space]: this.spaceFound,
      [CellType.mine]: this.mineFound,
      [CellType.number]: this.numberFound
    }

    const cell = this.cells[x][y];

    if (cell.isFlagged) {
      return;
    }
    cell.isRevealed = true;
    return actions[cell.type](cell);
  }

  private spaceFound = (cell: Cell): LeftClick => {
    const cells =  this.searchOpenArea(cell);
    return { cells, gameStatus: GameStatus.alive, cell }
  }

  private mineFound = (cell: Cell): LeftClick => {
    return { cells: this.mines, gameStatus: GameStatus.lost, cell }
  }

  private numberFound = (cell: Cell): LeftClick => {
    const gameStatus =  this.isWin() ? GameStatus.won : GameStatus.alive;
    return { cells: [cell], gameStatus, cell }
  }

  private searchOpenArea(cell: Cell, area: Cell[] = []): Cell[] {
    if (!cell.isSpace()) {
      return area;
    }

    area.push(cell);
    for (const cellNeighbour of this.getNearestNeighbours(cell)) {
      cellNeighbour.isRevealed = true;
      area.push(cellNeighbour);
      area.concat(this.searchOpenArea(cellNeighbour, area));
    }
    return area;
  }

  private getNearestNeighbours(cell: Cell) {
    return this.generateNearestNeighbours(cell).filter(cell => !cell.isRevealed)
  }

  private isWin() {
    return (
      this.remainingFlags === 0 &&
      this.cells.every(row =>
        row.every(({ isRevealed, isFlagged }) => isRevealed || isFlagged)
        )
    );
  }

  private generateNumbers() {
    this.cells.forEach(row =>
      row.filter(cell => !cell.isMine())
      .forEach(cell => this.assignNumberToCell(cell)));
  }

  private assignNumberToCell(cell: Cell) {
    const { length: numberMinesAroud } = this.getMinesAround(cell);

    if (numberMinesAroud > 0) {
      Object.assign(cell, {
        type: CellType.number,
        number: numberMinesAroud,
      })
    }

  }

  private getMinesAround(cell: Cell) {
    return this.generateNearestNeighbours(cell).filter(cell => cell.isMine());
  }

  private generateNearestNeighbours({coords}: Cell): Cell[] {
    const {x, y} = coords;
    return [
      this.cells[x - 1]?.[y -1],
      this.cells[x]?.[y - 1],
      this.cells[x + 1]?.[y - 1],
      this.cells[x + 1]?.[y],
      this.cells[x + 1]?.[y + 1],
      this.cells[x]?.[ y + 1],
      this.cells[x - 1]?.[y + 1],
      this.cells[x - 1]?.[y]
    ].filter(Boolean);
  }

  private fillBoardWithSpacesMines() {
    this.generateBoard();
    this.generateMines();
  }

  private generateBoard(): void {
    const { columns } = this.selectedLevel;
    this.cells = Array.from(Array(columns), () => new Array(columns));

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < columns; y++){
        this.cells[x][y] = new Cell({
          type: CellType.space,
          coords: { x, y },
        });
      }
    }
  }

  private generateMines(): void {
    const { numMines, columns } = this.selectedLevel;
    this.mines = [];
    
    while (numMines > this.mines.length) {
      const coords: Coords = {
        x: Math.floor(Math.random() * columns),
        y: Math.floor(Math.random() * columns),
      };

      if (!this.alreadyMine(coords)) {
        const cell = new Cell({
          type: CellType.mine,
          coords,
        });
        this.mines.push(cell);
        this.cells[coords.x][coords.y] = cell;
      }

    }
  }

  private alreadyMine({x, y}: Coords) {
    return this.mines.find(({coords}) => coords.x === x && coords.y === y)
  }

}