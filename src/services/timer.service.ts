import { clearInterval } from "timers";

export class TimerService {
  public onTimeStep?: Function;
  private timerID;

  constructor (onTimeStep: Function) {
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
    clearInterval(this.timerID);
  }

}