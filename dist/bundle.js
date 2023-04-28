(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minesweeper_controller_1 = require("./controllers/minesweeper.controller");
const minesweeper_service_1 = require("./services/minesweeper.service");
const minesweeper_view_1 = require("./views/minesweeper.view");
new minesweeper_controller_1.MineSweeperController(new minesweeper_view_1.MineSweeperView(), new minesweeper_service_1.MineSweeperService());

},{"./controllers/minesweeper.controller":4,"./services/minesweeper.service":9,"./views/minesweeper.view":11}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MineSweeperController = void 0;
const timer_service_1 = require("../services/timer.service");
const game_status_enum_1 = require("../models/game-status.enum");
class MineSweeperController {
    constructor(msView, msService) {
        this.msView = msView;
        this.msService = msService;
        this.changeGameLevel = (level) => {
            const gameLevel = this.msService.selectGameLevel(level);
            this.msView.renderBoard(gameLevel);
            this.gameClickBindings(gameLevel);
            //this.resetTime();
        };
        this.restartGame = () => {
            const gameLevel = this.msService.restartGame();
            this.msView.renderBoard(gameLevel);
            this.gameClickBindings(gameLevel);
            //this.resetTime();
        };
        this.gameClickBindings = gameLevel => {
            this.msView.removeBoardListeners();
            this.msView.bindGameBoxLeftClick(this.cellLeftClicked);
            this.msView.bindGameBoxRightClick(this.cellRightClicked);
            this.msView.updateFlagsCount(gameLevel.numMines);
        };
        this.cellLeftClicked = (x, y) => {
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
        };
        this.cellRightClicked = (x, y) => {
            //this.setFirstClick();
            const { cell, remainingFlags, gameStatus } = this.msService.rightClick(x, y);
            // if (cell.isRevealed) {
            //   return;
            // }
            // if (this.isEndGame(gameStatus)) {
            //   this.timerService.stopTime();
            // }
            this.msView.flaggeCell(cell);
            this.msView.updateFlagsCount(remainingFlags);
            this.msView.refreshGameStatus(gameStatus);
        };
        this.updateTime = (time) => this.msView.updateTimer(time);
        this.timerService = new timer_service_1.TimerService(this.updateTime);
        this.isFirstClick = true;
        this.msView.updateTimer(0);
        const gameLevel = this.msService.initGame();
        this.msView.renderBoard(gameLevel);
        this.msView.bindGameLevelSelect(this.changeGameLevel);
        this.msView.bindRestartButton(this.restartGame);
        this.gameClickBindings(gameLevel);
    }
    setFirstClick() {
        if (!this.isFirstClick) {
            return;
        }
        this.isFirstClick = false;
        this.timerService.startTime();
    }
    isEndGame(gameStatus) {
        return gameStatus === game_status_enum_1.GameStatus.lost || gameStatus === game_status_enum_1.GameStatus.won;
    }
    resetTime() {
        this.timerService.stopTime();
        this.timerService = new timer_service_1.TimerService(this.updateTime);
        this.isFirstClick = true;
        this.updateTime(0);
    }
}
exports.MineSweeperController = MineSweeperController;

},{"../models/game-status.enum":7,"../services/timer.service":10}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = exports.CellType = void 0;
var CellType;
(function (CellType) {
    CellType[CellType["space"] = 0] = "space";
    CellType[CellType["mine"] = 1] = "mine";
    CellType[CellType["number"] = 2] = "number";
})(CellType = exports.CellType || (exports.CellType = {}));
;
class Cell {
    constructor({ type, coords, number = null, isRevealed = false, isFlagged = false }) {
        this.type = type;
        this.coords = coords;
        this.number = number;
        this.isRevealed = isRevealed;
    }
    isMine() {
        return this.type === CellType.mine;
    }
    isSpace() {
        return this.type === CellType.space;
    }
    isNumber() {
        return this.type === CellType.number;
    }
}
exports.Cell = Cell;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_LEVELS = void 0;
exports.GAME_LEVELS = {
    easy: { level: "easy", columns: 9, numMines: 10 },
    normal: { level: "normal", columns: 16, numMines: 40 },
    pro: { level: "pro", columns: 30, numMines: 160 }
};

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStatus = void 0;
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["won"] = 0] = "won";
    GameStatus[GameStatus["lost"] = 1] = "lost";
    GameStatus[GameStatus["alive"] = 2] = "alive";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gameboard = void 0;
const cell_model_1 = require("./cell.model");
const game_level_type_1 = require("./game-level.type");
const game_status_enum_1 = require("./game-status.enum");
class Gameboard {
    constructor(selectedLevel = game_level_type_1.GAME_LEVELS.easy) {
        this.selectedLevel = selectedLevel;
        this.mines = [];
        this.spaceFound = (cell) => {
            const cells = this.searchOpenArea(cell);
            return { cells, gameStatus: game_status_enum_1.GameStatus.alive, cell };
        };
        this.mineFound = (cell) => {
            return { cells: this.mines, gameStatus: game_status_enum_1.GameStatus.lost, cell };
        };
        this.numberFound = (cell) => {
            const gameStatus = this.isWin() ? game_status_enum_1.GameStatus.won : game_status_enum_1.GameStatus.alive;
            return { cells: [cell], gameStatus, cell };
        };
        this.reset();
    }
    reset() {
        this.remainingFlags = this.selectedLevel.numMines;
        this.fillBoardWithSpacesMines();
        this.generateNumbers();
    }
    flaggedCell(x, y) {
        const cell = this.cells[x][y];
        if (!cell.isRevealed) {
            this.remainingFlags += cell.isFlagged ? 1 : -1;
            cell.isFlagged = !cell.isFlagged;
        }
        const gameStatus = this.isWin() ? game_status_enum_1.GameStatus.won : game_status_enum_1.GameStatus.alive;
        return { cell, remainingFlags: this.remainingFlags, gameStatus };
    }
    revealCell(x, y) {
        const actions = {
            [cell_model_1.CellType.space]: this.spaceFound,
            [cell_model_1.CellType.mine]: this.mineFound,
            [cell_model_1.CellType.number]: this.numberFound
        };
        const cell = this.cells[x][y];
        if (cell.isFlagged) {
            return;
        }
        cell.isRevealed = true;
        return actions[cell.type](cell);
    }
    searchOpenArea(cell, area = []) {
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
    getNearestNeighbours(cell) {
        return this.generateNearestNeighbours(cell).filter(cell => !cell.isRevealed);
    }
    isWin() {
        return (this.remainingFlags === 0 &&
            this.cells.every(row => row.every(({ isRevealed, isFlagged }) => isRevealed || isFlagged)));
    }
    generateNumbers() {
        this.cells.forEach(row => row.filter(cell => !cell.isMine())
            .forEach(cell => this.assignNumberToCell(cell)));
    }
    assignNumberToCell(cell) {
        const { length: numberMinesAroud } = this.getMinesAround(cell);
        if (numberMinesAroud > 0) {
            Object.assign(cell, {
                type: cell_model_1.CellType.number,
                number: numberMinesAroud,
            });
        }
    }
    getMinesAround(cell) {
        return this.generateNearestNeighbours(cell).filter(cell => cell.isMine());
    }
    generateNearestNeighbours({ coords }) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { x, y } = coords;
        return [
            (_a = this.cells[x - 1]) === null || _a === void 0 ? void 0 : _a[y - 1],
            (_b = this.cells[x]) === null || _b === void 0 ? void 0 : _b[y - 1],
            (_c = this.cells[x + 1]) === null || _c === void 0 ? void 0 : _c[y - 1],
            (_d = this.cells[x + 1]) === null || _d === void 0 ? void 0 : _d[y],
            (_e = this.cells[x + 1]) === null || _e === void 0 ? void 0 : _e[y + 1],
            (_f = this.cells[x]) === null || _f === void 0 ? void 0 : _f[y + 1],
            (_g = this.cells[x - 1]) === null || _g === void 0 ? void 0 : _g[y + 1],
            (_h = this.cells[x - 1]) === null || _h === void 0 ? void 0 : _h[y]
        ].filter(Boolean);
    }
    fillBoardWithSpacesMines() {
        this.generateBoard();
        this.generateMines();
    }
    generateBoard() {
        const { columns } = this.selectedLevel;
        this.cells = Array.from(Array(columns), () => new Array(columns));
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < columns; y++) {
                this.cells[x][y] = new cell_model_1.Cell({
                    type: cell_model_1.CellType.space,
                    coords: { x, y },
                });
            }
        }
    }
    generateMines() {
        const { numMines, columns } = this.selectedLevel;
        this.mines = [];
        while (numMines > this.mines.length) {
            const coords = {
                x: Math.floor(Math.random() * columns),
                y: Math.floor(Math.random() * columns),
            };
            if (!this.alreadyMine(coords)) {
                const cell = new cell_model_1.Cell({
                    type: cell_model_1.CellType.mine,
                    coords,
                });
                this.mines.push(cell);
                this.cells[coords.x][coords.y] = cell;
            }
        }
    }
    alreadyMine({ x, y }) {
        return this.mines.find(({ coords }) => coords.x === x && coords.y === y);
    }
}
exports.Gameboard = Gameboard;

},{"./cell.model":5,"./game-level.type":6,"./game-status.enum":7}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MineSweeperService = void 0;
const game_level_type_1 = require("../models/game-level.type");
const gameboard_model_1 = require("../models/gameboard.model");
class MineSweeperService {
    constructor() {
        this.selectedLevel = game_level_type_1.GAME_LEVELS.easy;
        this.gameBoard = new gameboard_model_1.Gameboard();
    }
    initGame() {
        return this.buildGame(game_level_type_1.GAME_LEVELS.easy);
    }
    selectGameLevel(level) {
        return this.buildGame(game_level_type_1.GAME_LEVELS[level]);
    }
    restartGame() {
        return this.buildGame();
    }
    rightClick(x, y) {
        return this.gameBoard.flaggedCell(x, y);
    }
    leftClick(x, y) {
        return this.gameBoard.revealCell(x, y);
    }
    buildGame(level = this.selectedLevel) {
        this.selectedLevel = level;
        this.gameBoard = new gameboard_model_1.Gameboard(this.selectedLevel);
        return this.selectedLevel;
    }
}
exports.MineSweeperService = MineSweeperService;

},{"../models/game-level.type":6,"../models/gameboard.model":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimerService = void 0;
const timers_1 = require("timers");
class TimerService {
    constructor(onTimeStep) {
        this.onTimeStep = onTimeStep;
    }
    startTime() {
        const startTime = Date.now();
        this.timerID = setInterval(_ => {
            const step = Date.now() - startTime;
            const actualTime = Math.floor(step / 1000);
            this.onTimeStep(actualTime);
        }, 1000);
    }
    stopTime() {
        (0, timers_1.clearInterval)(this.timerID);
    }
}
exports.TimerService = TimerService;

},{"timers":2}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MineSweeperView = void 0;
const cell_model_1 = require("../models/cell.model");
const game_level_type_1 = require("../models/game-level.type");
const game_status_enum_1 = require("../models/game-status.enum");
class MineSweeperView {
    constructor() {
        this.app = document.getElementById('app');
        this.board = document.getElementById('board');
        this.gameContainer = document.getElementById('game-container');
        this.gameLevelSelect = document.getElementById('game-level');
        this.restartBtn = document.getElementById('restart');
        this.remainingFlasg = document.getElementById('flags-remaining');
        this.timer = document.getElementById('time-counter');
        this.showMines = (mines) => {
            for (const cell of mines) {
                this.showMine(cell);
            }
        };
        this.showNumbers = (cells) => {
            for (const cell of cells) {
                this.showNumber(cell);
            }
        };
        this.showCells = (cells) => {
            for (const cell of cells) {
                cell.isSpace() ? this.showSpace(cell) : this.showNumber(cell);
            }
        };
        this.init(game_level_type_1.GAME_LEVELS.easy);
    }
    init(levelSelected) {
        this.renderBoard(levelSelected);
    }
    renderBoard({ level, columns }) {
        this.gameContainer.className = `game-container-${level}`;
        this.board.className = `board-${level}`;
        let cells = '';
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < columns; y++) {
                cells += `<div id="${x}-${y}" class="cell" data-x="${x}" data-y="${y}"></div>`;
            }
        }
        this.board.innerHTML = cells;
    }
    refreshGameStatus(gameStatus) {
        if (gameStatus === game_status_enum_1.GameStatus.won) {
            this.playerWon();
        }
        if (gameStatus === game_status_enum_1.GameStatus.lost) {
            this.playerLost();
        }
    }
    refreshCells(cells, cellType) {
        const refresh = {
            [cell_model_1.CellType.space]: this.showCells,
            [cell_model_1.CellType.mine]: this.showMines,
            [cell_model_1.CellType.number]: this.showNumbers
        };
        refresh[cellType](cells);
    }
    updateFlagsCount(flags) {
        this.remainingFlasg.innerHTML = `${this.lpad(flags, 3)}`;
    }
    updateTimer(time) {
        this.timer.innerHTML = `${this.lpad(time, 3)}`;
    }
    lpad(value, padding) {
        const zeroes = new Array(padding + 1).join('0');
        return (zeroes + value).slice(-padding);
    }
    showMine({ coords: { x, y } }) {
        const cell = document.getElementById(`${x}-${y}`);
        cell.classList.add('mine');
    }
    showNumber({ coords: { x, y }, number }) {
        const cell = document.getElementById(`${x}-${y}`);
        cell.innerHTML = `${number}`;
        cell.classList.add('revealed', `number-${number}`);
    }
    showSpace({ coords: { x, y } }) {
        const cell = document.getElementById(`${x}-${y}`);
        cell.classList.add('revealed');
    }
    playerWon() {
        alert('You won!');
    }
    playerLost() {
        this.setDeadFace();
        alert('You lost!');
    }
    setSmileyFace() {
        this.restartBtn.classList.remove('dead-face');
        this.restartBtn.classList.add('smiley-face');
    }
    setDeadFace() {
        this.restartBtn.classList.remove('smiley-face');
        this.restartBtn.classList.add('dead-face');
    }
    bindRestartButton(handler) {
        this.restartBtn.addEventListener('click', () => {
            handler();
            this.setSmileyFace();
        });
    }
    flaggeCell({ coords: { x, y } }) {
        const cell = document.getElementById(`${x}-${y}`);
        cell.classList.toggle('flag');
    }
    bindGameLevelSelect(handler) {
        this.gameLevelSelect.addEventListener('change', _ => {
            handler(this.gameLevelSelect.value);
            this.setSmileyFace();
        });
    }
    bindGameBoxLeftClick(handler) {
        this.board.addEventListener('click', (event) => {
            const { x, y } = event.target.dataset;
            handler(x, y);
        });
    }
    bindGameBoxRightClick(handler) {
        this.board.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const { x, y } = event.target.dataset;
            handler(x, y);
        });
    }
    removeBoardListeners() {
        const board = this.board.cloneNode(true);
        this.app.replaceChild(board, this.board);
        this.board = document.getElementById('board');
    }
}
exports.MineSweeperView = MineSweeperView;

},{"../models/cell.model":5,"../models/game-level.type":6,"../models/game-status.enum":7}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvYXBwLnRzIiwic3JjL2NvbnRyb2xsZXJzL21pbmVzd2VlcGVyLmNvbnRyb2xsZXIudHMiLCJzcmMvbW9kZWxzL2NlbGwubW9kZWwudHMiLCJzcmMvbW9kZWxzL2dhbWUtbGV2ZWwudHlwZS50cyIsInNyYy9tb2RlbHMvZ2FtZS1zdGF0dXMuZW51bS50cyIsInNyYy9tb2RlbHMvZ2FtZWJvYXJkLm1vZGVsLnRzIiwic3JjL3NlcnZpY2VzL21pbmVzd2VlcGVyLnNlcnZpY2UudHMiLCJzcmMvc2VydmljZXMvdGltZXIuc2VydmljZS50cyIsInNyYy92aWV3cy9taW5lc3dlZXBlci52aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUMzRUEsaUZBQTZFO0FBQzdFLHdFQUFvRTtBQUNwRSwrREFB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QXFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELG9CQUFvQixDQUFDLE9BQWlCO1FBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUU7WUFDbEQsTUFBTSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUNwQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQscUJBQXFCLENBQUMsT0FBaUI7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRTtZQUN4RCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUN0QyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsb0JBQW9CO1FBQ2xCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7Q0FDRjtBQXhKRCwwQ0F3SkMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIG5leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy9icm93c2VyLmpzJykubmV4dFRpY2s7XG52YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaW1tZWRpYXRlSWRzID0ge307XG52YXIgbmV4dEltbWVkaWF0ZUlkID0gMDtcblxuLy8gRE9NIEFQSXMsIGZvciBjb21wbGV0ZW5lc3NcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldFRpbWVvdXQsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFySW50ZXJ2YWwpO1xufTtcbmV4cG9ydHMuY2xlYXJUaW1lb3V0ID1cbmV4cG9ydHMuY2xlYXJJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHsgdGltZW91dC5jbG9zZSgpOyB9O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHdpbmRvdywgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIFRoYXQncyBub3QgaG93IG5vZGUuanMgaW1wbGVtZW50cyBpdCBidXQgdGhlIGV4cG9zZWQgYXBpIGlzIHRoZSBzYW1lLlxuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRJbW1lZGlhdGUgOiBmdW5jdGlvbihmbikge1xuICB2YXIgaWQgPSBuZXh0SW1tZWRpYXRlSWQrKztcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGZhbHNlIDogc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIGltbWVkaWF0ZUlkc1tpZF0gPSB0cnVlO1xuXG4gIG5leHRUaWNrKGZ1bmN0aW9uIG9uTmV4dFRpY2soKSB7XG4gICAgaWYgKGltbWVkaWF0ZUlkc1tpZF0pIHtcbiAgICAgIC8vIGZuLmNhbGwoKSBpcyBmYXN0ZXIgc28gd2Ugb3B0aW1pemUgZm9yIHRoZSBjb21tb24gdXNlLWNhc2VcbiAgICAgIC8vIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vY2FsbC1hcHBseS1zZWd1XG4gICAgICBpZiAoYXJncykge1xuICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBQcmV2ZW50IGlkcyBmcm9tIGxlYWtpbmdcbiAgICAgIGV4cG9ydHMuY2xlYXJJbW1lZGlhdGUoaWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGlkO1xufTtcblxuZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IHR5cGVvZiBjbGVhckltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gY2xlYXJJbW1lZGlhdGUgOiBmdW5jdGlvbihpZCkge1xuICBkZWxldGUgaW1tZWRpYXRlSWRzW2lkXTtcbn07IiwiaW1wb3J0IHsgTWluZVN3ZWVwZXJDb250cm9sbGVyIH0gZnJvbSBcIi4vY29udHJvbGxlcnMvbWluZXN3ZWVwZXIuY29udHJvbGxlclwiO1xyXG5pbXBvcnQgeyBNaW5lU3dlZXBlclNlcnZpY2UgfSBmcm9tIFwiLi9zZXJ2aWNlcy9taW5lc3dlZXBlci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IE1pbmVTd2VlcGVyVmlldyB9IGZyb20gXCIuL3ZpZXdzL21pbmVzd2VlcGVyLnZpZXdcIjtcclxuXHJcbm5ldyBNaW5lU3dlZXBlckNvbnRyb2xsZXIobmV3IE1pbmVTd2VlcGVyVmlldygpLCBuZXcgTWluZVN3ZWVwZXJTZXJ2aWNlKCkpOyIsImltcG9ydCB7IE1pbmVTd2VlcGVyVmlldyB9IGZyb20gXCIuLi92aWV3cy9taW5lc3dlZXBlci52aWV3XCI7XHJcbmltcG9ydCB7IE1pbmVTd2VlcGVyU2VydmljZSB9IGZyb20gXCIuLi9zZXJ2aWNlcy9taW5lc3dlZXBlci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IFRpbWVyU2VydmljZSB9IGZyb20gXCIuLi9zZXJ2aWNlcy90aW1lci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IEdhbWVTdGF0dXMgfSBmcm9tIFwiLi4vbW9kZWxzL2dhbWUtc3RhdHVzLmVudW1cIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBNaW5lU3dlZXBlckNvbnRyb2xsZXIge1xyXG4gIHByaXZhdGUgdGltZXJTZXJ2aWNlOiBUaW1lclNlcnZpY2U7XHJcbiAgcHJpdmF0ZSBpc0ZpcnN0Q2xpY2s6IGJvb2xlYW47XHJcbiAgXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIG1zVmlldzogTWluZVN3ZWVwZXJWaWV3LFxyXG4gICAgcHJpdmF0ZSBtc1NlcnZpY2U6IE1pbmVTd2VlcGVyU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy50aW1lclNlcnZpY2UgPSBuZXcgVGltZXJTZXJ2aWNlKHRoaXMudXBkYXRlVGltZSk7XHJcbiAgICB0aGlzLmlzRmlyc3RDbGljayA9IHRydWU7XHJcbiAgICB0aGlzLm1zVmlldy51cGRhdGVUaW1lcigwKTtcclxuICAgIGNvbnN0IGdhbWVMZXZlbCA9IHRoaXMubXNTZXJ2aWNlLmluaXRHYW1lKCk7XHJcbiAgICB0aGlzLm1zVmlldy5yZW5kZXJCb2FyZChnYW1lTGV2ZWwpO1xyXG4gICAgdGhpcy5tc1ZpZXcuYmluZEdhbWVMZXZlbFNlbGVjdCh0aGlzLmNoYW5nZUdhbWVMZXZlbCk7XHJcbiAgICB0aGlzLm1zVmlldy5iaW5kUmVzdGFydEJ1dHRvbih0aGlzLnJlc3RhcnRHYW1lKTtcclxuICAgIHRoaXMuZ2FtZUNsaWNrQmluZGluZ3MoZ2FtZUxldmVsKTtcclxuICB9XHJcblxyXG4gIGNoYW5nZUdhbWVMZXZlbCA9IChsZXZlbDogc3RyaW5nKSA9PiB7XHJcbiAgICBjb25zdCBnYW1lTGV2ZWwgPSB0aGlzLm1zU2VydmljZS5zZWxlY3RHYW1lTGV2ZWwobGV2ZWwpO1xyXG4gICAgdGhpcy5tc1ZpZXcucmVuZGVyQm9hcmQoZ2FtZUxldmVsKTtcclxuICAgIHRoaXMuZ2FtZUNsaWNrQmluZGluZ3MoZ2FtZUxldmVsKTtcclxuICAgIC8vdGhpcy5yZXNldFRpbWUoKTtcclxuICB9XHJcblxyXG4gIHJlc3RhcnRHYW1lID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZ2FtZUxldmVsID0gdGhpcy5tc1NlcnZpY2UucmVzdGFydEdhbWUoKTtcclxuICAgIHRoaXMubXNWaWV3LnJlbmRlckJvYXJkKGdhbWVMZXZlbCk7XHJcbiAgICB0aGlzLmdhbWVDbGlja0JpbmRpbmdzKGdhbWVMZXZlbCk7XHJcbiAgICAvL3RoaXMucmVzZXRUaW1lKCk7XHJcbiAgfVxyXG5cclxuICBnYW1lQ2xpY2tCaW5kaW5ncyA9IGdhbWVMZXZlbCA9PiB7XHJcbiAgICB0aGlzLm1zVmlldy5yZW1vdmVCb2FyZExpc3RlbmVycygpO1xyXG4gICAgdGhpcy5tc1ZpZXcuYmluZEdhbWVCb3hMZWZ0Q2xpY2sodGhpcy5jZWxsTGVmdENsaWNrZWQpO1xyXG4gICAgdGhpcy5tc1ZpZXcuYmluZEdhbWVCb3hSaWdodENsaWNrKHRoaXMuY2VsbFJpZ2h0Q2xpY2tlZCk7XHJcbiAgICB0aGlzLm1zVmlldy51cGRhdGVGbGFnc0NvdW50KGdhbWVMZXZlbC5udW1NaW5lcyk7XHJcbiAgfVxyXG5cclxuICBjZWxsTGVmdENsaWNrZWQgPSAoeDogc3RyaW5nLCB5OiBzdHJpbmcpID0+IHtcclxuICAgIC8vdGhpcy5zZXRGaXJzdENsaWNrKCk7XHJcbiAgICBjb25zdCBsZWZ0Q2xpY2sgPSB0aGlzLm1zU2VydmljZS5sZWZ0Q2xpY2soeCwgeSk7XHJcbiAgICBcclxuICAgIC8vIGlmICghbGVmdENsaWNrKSB7XHJcbiAgICAvLyAgIHJldHVybjtcclxuICAgIC8vIH1cclxuXHJcbiAgICBjb25zdCB7IGNlbGxzLCBnYW1lU3RhdHVzLCBjZWxsIH0gPSBsZWZ0Q2xpY2s7XHJcblxyXG4gICAgLy8gaWYgKHRoaXMuaXNFbmRHYW1lKGdhbWVTdGF0dXMpKSB7XHJcbiAgICAvLyAgIHRoaXMudGltZXJTZXJ2aWNlLnN0b3BUaW1lKCk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgdGhpcy5tc1ZpZXcucmVmcmVzaENlbGxzKGNlbGxzLCBjZWxsLnR5cGUpO1xyXG4gICAgdGhpcy5tc1ZpZXcucmVmcmVzaEdhbWVTdGF0dXMoZ2FtZVN0YXR1cyk7XHJcbiAgfVxyXG5cclxuICBjZWxsUmlnaHRDbGlja2VkID0gKHg6IHN0cmluZywgeTogc3RyaW5nKTogdm9pZCA9PntcclxuICAgIC8vdGhpcy5zZXRGaXJzdENsaWNrKCk7XHJcbiAgICBjb25zdCB7IGNlbGwsIHJlbWFpbmluZ0ZsYWdzLCBnYW1lU3RhdHVzIH0gPSB0aGlzLm1zU2VydmljZS5yaWdodENsaWNrKHgseSk7XHJcblxyXG4gICAgLy8gaWYgKGNlbGwuaXNSZXZlYWxlZCkge1xyXG4gICAgLy8gICByZXR1cm47XHJcbiAgICAvLyB9XHJcbiAgICAvLyBpZiAodGhpcy5pc0VuZEdhbWUoZ2FtZVN0YXR1cykpIHtcclxuICAgIC8vICAgdGhpcy50aW1lclNlcnZpY2Uuc3RvcFRpbWUoKTtcclxuICAgIC8vIH1cclxuXHJcbiAgICB0aGlzLm1zVmlldy5mbGFnZ2VDZWxsKGNlbGwpO1xyXG4gICAgdGhpcy5tc1ZpZXcudXBkYXRlRmxhZ3NDb3VudChyZW1haW5pbmdGbGFncyk7XHJcbiAgICB0aGlzLm1zVmlldy5yZWZyZXNoR2FtZVN0YXR1cyhnYW1lU3RhdHVzKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0Rmlyc3RDbGljaygpIHtcclxuICAgIGlmICghdGhpcy5pc0ZpcnN0Q2xpY2spIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5pc0ZpcnN0Q2xpY2sgPSBmYWxzZTtcclxuICAgIHRoaXMudGltZXJTZXJ2aWNlLnN0YXJ0VGltZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0VuZEdhbWUoZ2FtZVN0YXR1cyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGdhbWVTdGF0dXMgPT09IEdhbWVTdGF0dXMubG9zdCB8fCBnYW1lU3RhdHVzID09PSBHYW1lU3RhdHVzLndvbjtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRUaW1lKCkge1xyXG4gICAgdGhpcy50aW1lclNlcnZpY2Uuc3RvcFRpbWUoKTtcclxuICAgIHRoaXMudGltZXJTZXJ2aWNlID0gbmV3IFRpbWVyU2VydmljZSh0aGlzLnVwZGF0ZVRpbWUpO1xyXG4gICAgdGhpcy5pc0ZpcnN0Q2xpY2sgPSB0cnVlO1xyXG4gICAgdGhpcy51cGRhdGVUaW1lKDApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVUaW1lID0gICh0aW1lOiBudW1iZXIpID0+IHRoaXMubXNWaWV3LnVwZGF0ZVRpbWVyKHRpbWUpO1xyXG59IiwiZXhwb3J0IGVudW0gQ2VsbFR5cGUge1xyXG4gIHNwYWNlLFxyXG4gIG1pbmUsXHJcbiAgbnVtYmVyLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgQ29vcmRzID0ge1xyXG4gIHg6IG51bWJlcixcclxuICB5OiBudW1iZXIsXHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgQ2VsbCB7XHJcbiAgcHVibGljIHR5cGU6IENlbGxUeXBlO1xyXG4gIHB1YmxpYyBjb29yZHM6IENvb3JkcztcclxuICBwdWJsaWMgbnVtYmVyPzogbnVtYmVyO1xyXG4gIHB1YmxpYyBpc1JldmVhbGVkPzogYm9vbGVhbjtcclxuICBwdWJsaWMgaXNGbGFnZ2VkPzogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IoeyB0eXBlLCBjb29yZHMsIG51bWJlciA9IG51bGwsIGlzUmV2ZWFsZWQgPSBmYWxzZSwgaXNGbGFnZ2VkID0gZmFsc2UgfSkge1xyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgIHRoaXMuY29vcmRzID0gY29vcmRzO1xyXG4gICAgdGhpcy5udW1iZXIgPSBudW1iZXI7XHJcbiAgICB0aGlzLmlzUmV2ZWFsZWQgPSBpc1JldmVhbGVkO1xyXG4gIH1cclxuXHJcbiAgaXNNaW5lKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gQ2VsbFR5cGUubWluZTtcclxuICB9XHJcblxyXG4gIGlzU3BhY2UoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSBDZWxsVHlwZS5zcGFjZTtcclxuICB9XHJcblxyXG4gIGlzTnVtYmVyKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gQ2VsbFR5cGUubnVtYmVyO1xyXG4gIH1cclxuXHJcbn0iLCJleHBvcnQgdHlwZSBHYW1lTGV2ZWxzID0ge1xyXG4gIFtrZXk6IHN0cmluZ106IEdhbWVMZXZlbDtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEdhbWVMZXZlbCA9IHtcclxuICBsZXZlbDogc3RyaW5nO1xyXG4gIGNvbHVtbnM6IG51bWJlcjtcclxuICBudW1NaW5lczogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgR0FNRV9MRVZFTFM6IEdhbWVMZXZlbHMgPSB7XHJcbiAgZWFzeTogeyBsZXZlbDogXCJlYXN5XCIsIGNvbHVtbnM6IDksIG51bU1pbmVzOiAxMCB9LFxyXG4gIG5vcm1hbDogeyBsZXZlbDogXCJub3JtYWxcIiwgY29sdW1uczogMTYsIG51bU1pbmVzOiA0MCB9LFxyXG4gIHBybzogeyBsZXZlbDogXCJwcm9cIiwgY29sdW1uczogMzAsIG51bU1pbmVzOiAxNjAgfVxyXG59IiwiZXhwb3J0IGVudW0gR2FtZVN0YXR1cyB7XHJcbiAgd29uLFxyXG4gIGxvc3QsXHJcbiAgYWxpdmVcclxufSIsImltcG9ydCB7IExlZnRDbGljayB9IGZyb20gXCIuLi9pbnRlcmZhY2VzL2NsaWNrLmludGVyZmFjZVwiO1xyXG5pbXBvcnQgeyBDZWxsLCBDZWxsVHlwZSwgQ29vcmRzIH0gZnJvbSBcIi4vY2VsbC5tb2RlbFwiO1xyXG5pbXBvcnQgeyBHQU1FX0xFVkVMUyB9IGZyb20gXCIuL2dhbWUtbGV2ZWwudHlwZVwiO1xyXG5pbXBvcnQgeyBHYW1lU3RhdHVzIH0gZnJvbSBcIi4vZ2FtZS1zdGF0dXMuZW51bVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWVib2FyZCB7XHJcbiAgcHVibGljIGNlbGxzOiBDZWxsW11bXVxyXG4gIHB1YmxpYyByZW1haW5pbmdGbGFnczogbnVtYmVyO1xyXG5cclxuICBwcml2YXRlIG1pbmVzOiBDZWxsW10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzZWxlY3RlZExldmVsID0gR0FNRV9MRVZFTFMuZWFzeSkge1xyXG4gICAgdGhpcy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCkge1xyXG4gICAgdGhpcy5yZW1haW5pbmdGbGFncyA9IHRoaXMuc2VsZWN0ZWRMZXZlbC5udW1NaW5lcztcclxuICAgIHRoaXMuZmlsbEJvYXJkV2l0aFNwYWNlc01pbmVzKCk7XHJcbiAgICB0aGlzLmdlbmVyYXRlTnVtYmVycygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZsYWdnZWRDZWxsKHg6IHN0cmluZywgeTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBjZWxsID0gdGhpcy5jZWxsc1t4XVt5XTtcclxuICAgIGlmICghY2VsbC5pc1JldmVhbGVkKSB7XHJcbiAgICAgIHRoaXMucmVtYWluaW5nRmxhZ3MgKz0gY2VsbC5pc0ZsYWdnZWQgPyAxIDogLTE7XHJcbiAgICAgIGNlbGwuaXNGbGFnZ2VkID0gIWNlbGwuaXNGbGFnZ2VkO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGdhbWVTdGF0dXMgPSB0aGlzLmlzV2luKCkgPyBHYW1lU3RhdHVzLndvbiA6IEdhbWVTdGF0dXMuYWxpdmU7XHJcblxyXG4gICAgcmV0dXJuIHsgY2VsbCwgcmVtYWluaW5nRmxhZ3M6IHRoaXMucmVtYWluaW5nRmxhZ3MsIGdhbWVTdGF0dXMgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXZlYWxDZWxsKHg6IHN0cmluZywgeTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBhY3Rpb25zID0ge1xyXG4gICAgICBbQ2VsbFR5cGUuc3BhY2VdOiB0aGlzLnNwYWNlRm91bmQsXHJcbiAgICAgIFtDZWxsVHlwZS5taW5lXTogdGhpcy5taW5lRm91bmQsXHJcbiAgICAgIFtDZWxsVHlwZS5udW1iZXJdOiB0aGlzLm51bWJlckZvdW5kXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2VsbCA9IHRoaXMuY2VsbHNbeF1beV07XHJcblxyXG4gICAgaWYgKGNlbGwuaXNGbGFnZ2VkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNlbGwuaXNSZXZlYWxlZCA9IHRydWU7XHJcbiAgICByZXR1cm4gYWN0aW9uc1tjZWxsLnR5cGVdKGNlbGwpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzcGFjZUZvdW5kID0gKGNlbGw6IENlbGwpOiBMZWZ0Q2xpY2sgPT4ge1xyXG4gICAgY29uc3QgY2VsbHMgPSAgdGhpcy5zZWFyY2hPcGVuQXJlYShjZWxsKTtcclxuICAgIHJldHVybiB7IGNlbGxzLCBnYW1lU3RhdHVzOiBHYW1lU3RhdHVzLmFsaXZlLCBjZWxsIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgbWluZUZvdW5kID0gKGNlbGw6IENlbGwpOiBMZWZ0Q2xpY2sgPT4ge1xyXG4gICAgcmV0dXJuIHsgY2VsbHM6IHRoaXMubWluZXMsIGdhbWVTdGF0dXM6IEdhbWVTdGF0dXMubG9zdCwgY2VsbCB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG51bWJlckZvdW5kID0gKGNlbGw6IENlbGwpOiBMZWZ0Q2xpY2sgPT4ge1xyXG4gICAgY29uc3QgZ2FtZVN0YXR1cyA9ICB0aGlzLmlzV2luKCkgPyBHYW1lU3RhdHVzLndvbiA6IEdhbWVTdGF0dXMuYWxpdmU7XHJcbiAgICByZXR1cm4geyBjZWxsczogW2NlbGxdLCBnYW1lU3RhdHVzLCBjZWxsIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2VhcmNoT3BlbkFyZWEoY2VsbDogQ2VsbCwgYXJlYTogQ2VsbFtdID0gW10pOiBDZWxsW10ge1xyXG4gICAgaWYgKCFjZWxsLmlzU3BhY2UoKSkge1xyXG4gICAgICByZXR1cm4gYXJlYTtcclxuICAgIH1cclxuXHJcbiAgICBhcmVhLnB1c2goY2VsbCk7XHJcbiAgICBmb3IgKGNvbnN0IGNlbGxOZWlnaGJvdXIgb2YgdGhpcy5nZXROZWFyZXN0TmVpZ2hib3VycyhjZWxsKSkge1xyXG4gICAgICBjZWxsTmVpZ2hib3VyLmlzUmV2ZWFsZWQgPSB0cnVlO1xyXG4gICAgICBhcmVhLnB1c2goY2VsbE5laWdoYm91cik7XHJcbiAgICAgIGFyZWEuY29uY2F0KHRoaXMuc2VhcmNoT3BlbkFyZWEoY2VsbE5laWdoYm91ciwgYXJlYSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyZWE7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldE5lYXJlc3ROZWlnaGJvdXJzKGNlbGw6IENlbGwpIHtcclxuICAgIHJldHVybiB0aGlzLmdlbmVyYXRlTmVhcmVzdE5laWdoYm91cnMoY2VsbCkuZmlsdGVyKGNlbGwgPT4gIWNlbGwuaXNSZXZlYWxlZClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNXaW4oKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICB0aGlzLnJlbWFpbmluZ0ZsYWdzID09PSAwICYmXHJcbiAgICAgIHRoaXMuY2VsbHMuZXZlcnkocm93ID0+XHJcbiAgICAgICAgcm93LmV2ZXJ5KCh7IGlzUmV2ZWFsZWQsIGlzRmxhZ2dlZCB9KSA9PiBpc1JldmVhbGVkIHx8IGlzRmxhZ2dlZClcclxuICAgICAgICApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZW5lcmF0ZU51bWJlcnMoKSB7XHJcbiAgICB0aGlzLmNlbGxzLmZvckVhY2gocm93ID0+XHJcbiAgICAgIHJvdy5maWx0ZXIoY2VsbCA9PiAhY2VsbC5pc01pbmUoKSlcclxuICAgICAgLmZvckVhY2goY2VsbCA9PiB0aGlzLmFzc2lnbk51bWJlclRvQ2VsbChjZWxsKSkpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3NpZ25OdW1iZXJUb0NlbGwoY2VsbDogQ2VsbCkge1xyXG4gICAgY29uc3QgeyBsZW5ndGg6IG51bWJlck1pbmVzQXJvdWQgfSA9IHRoaXMuZ2V0TWluZXNBcm91bmQoY2VsbCk7XHJcblxyXG4gICAgaWYgKG51bWJlck1pbmVzQXJvdWQgPiAwKSB7XHJcbiAgICAgIE9iamVjdC5hc3NpZ24oY2VsbCwge1xyXG4gICAgICAgIHR5cGU6IENlbGxUeXBlLm51bWJlcixcclxuICAgICAgICBudW1iZXI6IG51bWJlck1pbmVzQXJvdWQsXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRNaW5lc0Fyb3VuZChjZWxsOiBDZWxsKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU5lYXJlc3ROZWlnaGJvdXJzKGNlbGwpLmZpbHRlcihjZWxsID0+IGNlbGwuaXNNaW5lKCkpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZW5lcmF0ZU5lYXJlc3ROZWlnaGJvdXJzKHtjb29yZHN9OiBDZWxsKTogQ2VsbFtdIHtcclxuICAgIGNvbnN0IHt4LCB5fSA9IGNvb3JkcztcclxuICAgIHJldHVybiBbXHJcbiAgICAgIHRoaXMuY2VsbHNbeCAtIDFdPy5beSAtMV0sXHJcbiAgICAgIHRoaXMuY2VsbHNbeF0/Llt5IC0gMV0sXHJcbiAgICAgIHRoaXMuY2VsbHNbeCArIDFdPy5beSAtIDFdLFxyXG4gICAgICB0aGlzLmNlbGxzW3ggKyAxXT8uW3ldLFxyXG4gICAgICB0aGlzLmNlbGxzW3ggKyAxXT8uW3kgKyAxXSxcclxuICAgICAgdGhpcy5jZWxsc1t4XT8uWyB5ICsgMV0sXHJcbiAgICAgIHRoaXMuY2VsbHNbeCAtIDFdPy5beSArIDFdLFxyXG4gICAgICB0aGlzLmNlbGxzW3ggLSAxXT8uW3ldXHJcbiAgICBdLmZpbHRlcihCb29sZWFuKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmlsbEJvYXJkV2l0aFNwYWNlc01pbmVzKCkge1xyXG4gICAgdGhpcy5nZW5lcmF0ZUJvYXJkKCk7XHJcbiAgICB0aGlzLmdlbmVyYXRlTWluZXMoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2VuZXJhdGVCb2FyZCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgY29sdW1ucyB9ID0gdGhpcy5zZWxlY3RlZExldmVsO1xyXG4gICAgdGhpcy5jZWxscyA9IEFycmF5LmZyb20oQXJyYXkoY29sdW1ucyksICgpID0+IG5ldyBBcnJheShjb2x1bW5zKSk7XHJcblxyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBjb2x1bW5zOyB4KyspIHtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBjb2x1bW5zOyB5Kyspe1xyXG4gICAgICAgIHRoaXMuY2VsbHNbeF1beV0gPSBuZXcgQ2VsbCh7XHJcbiAgICAgICAgICB0eXBlOiBDZWxsVHlwZS5zcGFjZSxcclxuICAgICAgICAgIGNvb3JkczogeyB4LCB5IH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2VuZXJhdGVNaW5lcygpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgbnVtTWluZXMsIGNvbHVtbnMgfSA9IHRoaXMuc2VsZWN0ZWRMZXZlbDtcclxuICAgIHRoaXMubWluZXMgPSBbXTtcclxuICAgIFxyXG4gICAgd2hpbGUgKG51bU1pbmVzID4gdGhpcy5taW5lcy5sZW5ndGgpIHtcclxuICAgICAgY29uc3QgY29vcmRzOiBDb29yZHMgPSB7XHJcbiAgICAgICAgeDogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY29sdW1ucyksXHJcbiAgICAgICAgeTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY29sdW1ucyksXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZiAoIXRoaXMuYWxyZWFkeU1pbmUoY29vcmRzKSkge1xyXG4gICAgICAgIGNvbnN0IGNlbGwgPSBuZXcgQ2VsbCh7XHJcbiAgICAgICAgICB0eXBlOiBDZWxsVHlwZS5taW5lLFxyXG4gICAgICAgICAgY29vcmRzLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubWluZXMucHVzaChjZWxsKTtcclxuICAgICAgICB0aGlzLmNlbGxzW2Nvb3Jkcy54XVtjb29yZHMueV0gPSBjZWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhbHJlYWR5TWluZSh7eCwgeX06IENvb3Jkcykge1xyXG4gICAgcmV0dXJuIHRoaXMubWluZXMuZmluZCgoe2Nvb3Jkc30pID0+IGNvb3Jkcy54ID09PSB4ICYmIGNvb3Jkcy55ID09PSB5KVxyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBHQU1FX0xFVkVMUywgR2FtZUxldmVsIH0gZnJvbSBcIi4uL21vZGVscy9nYW1lLWxldmVsLnR5cGVcIjtcclxuaW1wb3J0IHsgR2FtZVN0YXR1cyB9IGZyb20gXCIuLi9tb2RlbHMvZ2FtZS1zdGF0dXMuZW51bVwiO1xyXG5pbXBvcnQgeyBHYW1lYm9hcmQgfSBmcm9tIFwiLi4vbW9kZWxzL2dhbWVib2FyZC5tb2RlbFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1pbmVTd2VlcGVyU2VydmljZSB7XHJcbiAgcHVibGljIHNlbGVjdGVkTGV2ZWw6IEdhbWVMZXZlbCA9IEdBTUVfTEVWRUxTLmVhc3k7XHJcbiAgcHVibGljIGdhbWVCb2FyZDogR2FtZWJvYXJkID0gbmV3IEdhbWVib2FyZCgpO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIGluaXRHYW1lKCk6IEdhbWVMZXZlbCB7XHJcbiAgICByZXR1cm4gdGhpcy5idWlsZEdhbWUoR0FNRV9MRVZFTFMuZWFzeSk7XHJcbiAgfVxyXG5cclxuICBzZWxlY3RHYW1lTGV2ZWwobGV2ZWw6IHN0cmluZyk6IEdhbWVMZXZlbCB7XHJcbiAgICByZXR1cm4gdGhpcy5idWlsZEdhbWUoR0FNRV9MRVZFTFNbbGV2ZWxdKTsgXHJcbiAgfVxyXG5cclxuICByZXN0YXJ0R2FtZSgpOiBHYW1lTGV2ZWwge1xyXG4gICAgcmV0dXJuIHRoaXMuYnVpbGRHYW1lKCk7XHJcbiAgfVxyXG5cclxuICByaWdodENsaWNrKHg6IHN0cmluZywgeTogc3RyaW5nKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLmdhbWVCb2FyZC5mbGFnZ2VkQ2VsbCh4LCB5KTtcclxuICB9XHJcblxyXG4gIGxlZnRDbGljayh4OiBzdHJpbmcsIHk6IHN0cmluZyk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5nYW1lQm9hcmQucmV2ZWFsQ2VsbCh4LCB5KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRHYW1lKGxldmVsID0gdGhpcy5zZWxlY3RlZExldmVsKTogR2FtZUxldmVsIHtcclxuICAgIHRoaXMuc2VsZWN0ZWRMZXZlbCA9IGxldmVsO1xyXG4gICAgdGhpcy5nYW1lQm9hcmQgPSBuZXcgR2FtZWJvYXJkKHRoaXMuc2VsZWN0ZWRMZXZlbCk7XHJcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RlZExldmVsO1xyXG4gIH1cclxufSIsImltcG9ydCB7IGNsZWFySW50ZXJ2YWwgfSBmcm9tIFwidGltZXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGltZXJTZXJ2aWNlIHtcclxuICBwdWJsaWMgb25UaW1lU3RlcD86IEZ1bmN0aW9uO1xyXG4gIHByaXZhdGUgdGltZXJJRDtcclxuXHJcbiAgY29uc3RydWN0b3IgKG9uVGltZVN0ZXA6IEZ1bmN0aW9uKSB7XHJcbiAgICB0aGlzLm9uVGltZVN0ZXAgPSBvblRpbWVTdGVwO1xyXG4gIH1cclxuXHJcbiAgc3RhcnRUaW1lKCkge1xyXG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgIHRoaXMudGltZXJJRCA9IHNldEludGVydmFsKF8gPT4ge1xyXG4gICAgICBjb25zdCBzdGVwID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcclxuICAgICAgY29uc3QgYWN0dWFsVGltZSA9IE1hdGguZmxvb3Ioc3RlcCAvIDEwMDApO1xyXG4gICAgICB0aGlzLm9uVGltZVN0ZXAoYWN0dWFsVGltZSk7XHJcbiAgICB9LCAxMDAwKTtcclxuICB9XHJcblxyXG4gIHN0b3BUaW1lKCkge1xyXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVySUQpO1xyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBDZWxsLCBDZWxsVHlwZSB9IGZyb20gXCIuLi9tb2RlbHMvY2VsbC5tb2RlbFwiO1xyXG5pbXBvcnQgeyBHQU1FX0xFVkVMUywgR2FtZUxldmVsfSBmcm9tIFwiLi4vbW9kZWxzL2dhbWUtbGV2ZWwudHlwZVwiO1xyXG5pbXBvcnQgeyBHYW1lU3RhdHVzIH0gZnJvbSBcIi4uL21vZGVscy9nYW1lLXN0YXR1cy5lbnVtXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTWluZVN3ZWVwZXJWaWV3IHtcclxuICBwcml2YXRlIGFwcDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJyk7XHJcbiAgcHJpdmF0ZSBib2FyZDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9hcmQnKTtcclxuICBwcml2YXRlIGdhbWVDb250YWluZXI6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtY29udGFpbmVyJyk7XHJcbiAgcHJpdmF0ZSBnYW1lTGV2ZWxTZWxlY3Q6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtbGV2ZWwnKTtcclxuICBwcml2YXRlIHJlc3RhcnRCdG46IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3RhcnQnKTtcclxuICBwcml2YXRlIHJlbWFpbmluZ0ZsYXNnOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFncy1yZW1haW5pbmcnKTtcclxuICBwcml2YXRlIHRpbWVyOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aW1lLWNvdW50ZXInKTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmluaXQoR0FNRV9MRVZFTFMuZWFzeSk7XHJcbiAgfVxyXG5cclxuICBpbml0KGxldmVsU2VsZWN0ZWQ6IEdhbWVMZXZlbCkge1xyXG4gICAgdGhpcy5yZW5kZXJCb2FyZChsZXZlbFNlbGVjdGVkKTtcclxuICB9XHJcblxyXG4gIHJlbmRlckJvYXJkKHtsZXZlbCwgY29sdW1uc306IEdhbWVMZXZlbCkge1xyXG4gICAgdGhpcy5nYW1lQ29udGFpbmVyLmNsYXNzTmFtZSA9IGBnYW1lLWNvbnRhaW5lci0ke2xldmVsfWA7XHJcbiAgICB0aGlzLmJvYXJkLmNsYXNzTmFtZSA9IGBib2FyZC0ke2xldmVsfWA7XHJcbiAgICBsZXQgY2VsbHMgPSAnJztcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgY29sdW1uczsgeCsrKSB7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgY29sdW1uczsgeSsrKSB7XHJcbiAgICAgICAgY2VsbHMgKz0gYDxkaXYgaWQ9XCIke3h9LSR7eX1cIiBjbGFzcz1cImNlbGxcIiBkYXRhLXg9XCIke3h9XCIgZGF0YS15PVwiJHt5fVwiPjwvZGl2PmBcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5ib2FyZC5pbm5lckhUTUwgPSBjZWxscztcclxuICB9XHJcblxyXG4gIHJlZnJlc2hHYW1lU3RhdHVzKGdhbWVTdGF0dXM6IEdhbWVTdGF0dXMpIHtcclxuICAgIGlmIChnYW1lU3RhdHVzID09PSBHYW1lU3RhdHVzLndvbikge1xyXG4gICAgICB0aGlzLnBsYXllcldvbigpO1xyXG4gICAgfVxyXG4gICAgaWYgKGdhbWVTdGF0dXMgPT09IEdhbWVTdGF0dXMubG9zdCkge1xyXG4gICAgICB0aGlzLnBsYXllckxvc3QoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlZnJlc2hDZWxscyhjZWxsczogQ2VsbFtdLCBjZWxsVHlwZTogQ2VsbFR5cGUpIHtcclxuICAgIGNvbnN0IHJlZnJlc2ggPSB7XHJcbiAgICAgIFtDZWxsVHlwZS5zcGFjZV06IHRoaXMuc2hvd0NlbGxzLFxyXG4gICAgICBbQ2VsbFR5cGUubWluZV06IHRoaXMuc2hvd01pbmVzLFxyXG4gICAgICBbQ2VsbFR5cGUubnVtYmVyXTogdGhpcy5zaG93TnVtYmVyc1xyXG4gICAgfTtcclxuICAgIHJlZnJlc2hbY2VsbFR5cGVdKGNlbGxzKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZUZsYWdzQ291bnQoZmxhZ3M6IG51bWJlcik6IHZvaWQgeyBcclxuICAgIHRoaXMucmVtYWluaW5nRmxhc2cuaW5uZXJIVE1MID0gYCR7dGhpcy5scGFkKGZsYWdzLCAzKX1gXHJcbiAgfVxyXG5cclxuICB1cGRhdGVUaW1lcih0aW1lOiBudW1iZXIpOiB2b2lkIHsgXHJcbiAgICB0aGlzLnRpbWVyLmlubmVySFRNTCA9IGAke3RoaXMubHBhZCh0aW1lLCAzKX1gXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxwYWQodmFsdWUsIHBhZGRpbmcpIHtcclxuICAgIGNvbnN0IHplcm9lcyA9IG5ldyBBcnJheShwYWRkaW5nICsgMSkuam9pbignMCcpO1xyXG4gICAgcmV0dXJuICh6ZXJvZXMgKyB2YWx1ZSkuc2xpY2UoLXBhZGRpbmcpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93TWluZXMgPSAobWluZXM6IENlbGxbXSk6IHZvaWQgPT4ge1xyXG4gICAgZm9yIChjb25zdCBjZWxsIG9mIG1pbmVzKSB7XHJcbiAgICAgIHRoaXMuc2hvd01pbmUoY2VsbCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dOdW1iZXJzID0gKGNlbGxzOiBDZWxsW10pOiB2b2lkID0+IHtcclxuICAgIGZvciAoY29uc3QgY2VsbCBvZiBjZWxscykge1xyXG4gICAgICB0aGlzLnNob3dOdW1iZXIoY2VsbCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dDZWxscyA9IChjZWxsczogQ2VsbFtdKTogdm9pZCA9PiB7XHJcbiAgICBmb3IgKGNvbnN0IGNlbGwgb2YgY2VsbHMpIHtcclxuICAgICAgY2VsbC5pc1NwYWNlKCkgPyB0aGlzLnNob3dTcGFjZShjZWxsKSA6IHRoaXMuc2hvd051bWJlcihjZWxsKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvd01pbmUoe2Nvb3JkczogeyB4LCB5IH0gfTogQ2VsbCk6IHZvaWQge1xyXG4gICAgY29uc3QgY2VsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3h9LSR7eX1gKTtcclxuICAgIGNlbGwuY2xhc3NMaXN0LmFkZCgnbWluZScpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93TnVtYmVyKHtjb29yZHM6IHsgeCwgeSB9LCBudW1iZXIgfTogQ2VsbCk6IHZvaWQge1xyXG4gICAgY29uc3QgY2VsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3h9LSR7eX1gKTtcclxuICAgIGNlbGwuaW5uZXJIVE1MID0gYCR7bnVtYmVyfWA7XHJcbiAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3JldmVhbGVkJywgYG51bWJlci0ke251bWJlcn1gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvd1NwYWNlKHtjb29yZHM6IHsgeCwgeSB9IH06IENlbGwpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNlbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHt4fS0ke3l9YCk7XHJcbiAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3JldmVhbGVkJyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGxheWVyV29uKCk6IHZvaWQge1xyXG4gICAgYWxlcnQoJ1lvdSB3b24hJyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGxheWVyTG9zdCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RGVhZEZhY2UoKTtcclxuICAgIGFsZXJ0KCdZb3UgbG9zdCEnKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRTbWlsZXlGYWNlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZXN0YXJ0QnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2RlYWQtZmFjZScpO1xyXG4gICAgdGhpcy5yZXN0YXJ0QnRuLmNsYXNzTGlzdC5hZGQoJ3NtaWxleS1mYWNlJyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0RGVhZEZhY2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc3RhcnRCdG4uY2xhc3NMaXN0LnJlbW92ZSgnc21pbGV5LWZhY2UnKTtcclxuICAgIHRoaXMucmVzdGFydEJ0bi5jbGFzc0xpc3QuYWRkKCdkZWFkLWZhY2UnKTtcclxuICB9XHJcblxyXG4gIGJpbmRSZXN0YXJ0QnV0dG9uKGhhbmRsZXI6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc3RhcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGhhbmRsZXIoKTtcclxuICAgICAgdGhpcy5zZXRTbWlsZXlGYWNlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZsYWdnZUNlbGwoe2Nvb3JkczogeyB4LCB5IH19KTogdm9pZCB7XHJcbiAgICBjb25zdCBjZWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7eH0tJHt5fWApO1xyXG4gICAgY2VsbC5jbGFzc0xpc3QudG9nZ2xlKCdmbGFnJyk7XHJcbiAgfVxyXG5cclxuICBiaW5kR2FtZUxldmVsU2VsZWN0KGhhbmRsZXI6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICB0aGlzLmdhbWVMZXZlbFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBfID0+IHtcclxuICAgICAgaGFuZGxlcigodGhpcy5nYW1lTGV2ZWxTZWxlY3QgYXMgSFRNTFNlbGVjdEVsZW1lbnQpLnZhbHVlKTtcclxuICAgICAgdGhpcy5zZXRTbWlsZXlGYWNlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGJpbmRHYW1lQm94TGVmdENsaWNrKGhhbmRsZXI6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICB0aGlzLmJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgY29uc3Qge3gsIHl9ID0gZXZlbnQudGFyZ2V0LmRhdGFzZXQ7XHJcbiAgICAgIGhhbmRsZXIoeCx5KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYmluZEdhbWVCb3hSaWdodENsaWNrKGhhbmRsZXI6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICB0aGlzLmJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgY29uc3QgeyB4LCB5IH0gPSBldmVudC50YXJnZXQuZGF0YXNldDtcclxuICAgICAgaGFuZGxlcih4LHkpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICByZW1vdmVCb2FyZExpc3RlbmVycygpOiB2b2lkIHtcclxuICAgIGNvbnN0IGJvYXJkID0gdGhpcy5ib2FyZC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0aGlzLmFwcC5yZXBsYWNlQ2hpbGQoYm9hcmQsIHRoaXMuYm9hcmQpO1xyXG4gICAgdGhpcy5ib2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib2FyZCcpO1xyXG4gIH1cclxufSJdfQ==
