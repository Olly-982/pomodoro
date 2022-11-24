import Pomodoro from "./Pomodoro.js";

let clockSettings = {
  work_min: 25,
  short_break: 5,
  long_break: 30,
  reps: 1,
};

const pomodoro = new Pomodoro(clockSettings, "../img/tomato.svg");
pomodoro.init();
