import { Cell } from "../models/cell.model";
import { GameStatus } from "../models/game-status.enum";

export interface LeftClick {
  cells: Cell[];
  gameStatus: GameStatus;
  cell: Cell;
}

export interface RightClick {
  remainingFlags: number;
  gameStatus: GameStatus;
  cell: Cell;
}