export enum CellType {
  space,
  mine,
  number,
};

export type Coords = {
  x: number,
  y: number,
};

export class Cell {
  public type: CellType;
  public coords: Coords;
  public number?: number;
  public isRevealed?: boolean;
  public isFlagged?: boolean;

  constructor({ type, coords, number = null, isRevealed = false, isFlagged = false }) {
    this.type = type;
    this.coords = coords;
    this.number = number;
    this.isRevealed = isRevealed;
  }

  isMine(): boolean {
    return this.type === CellType.mine;
  }

  isSpace(): boolean {
    return this.type === CellType.space;
  }

  isNumber(): boolean {
    return this.type === CellType.number;
  }

}