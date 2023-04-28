export type GameLevels = {
  [key: string]: GameLevel;
};

export type GameLevel = {
  level: string;
  columns: number;
  numMines: number;
}

export const GAME_LEVELS: GameLevels = {
  easy: { level: "easy", columns: 9, numMines: 10 },
  normal: { level: "normal", columns: 16, numMines: 40 },
  pro: { level: "pro", columns: 30, numMines: 160 }
}