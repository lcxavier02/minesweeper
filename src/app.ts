import { MineSweeperController } from "./controllers/minesweeper.controller";
import { MineSweeperService } from "./services/minesweeper.service";
import { MineSweeperView } from "./views/minesweeper.view";

new MineSweeperController(new MineSweeperView(), new MineSweeperService());