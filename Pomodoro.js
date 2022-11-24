export default class Pomodoro {
  constructor(clockSettings = {}, imgPath) {
    this.clockSettings = clockSettings;
    this.sprite = `<img class="pomo" src=${imgPath} alt="tomato icon" />`;
    this.pauseValue;
    this.isRunning = false;
    this.count = 0;
    this.pomodoros = 0;
    this.currentMinutes = 0;
    this.pomoContainer = document.querySelector("#pomoContainer");
    this.timerState = document.querySelector("#timerState");
    this.displayMinutes = document.querySelector("#displayMinutes");
    this.displaySeconds = document.querySelector("#displaySeconds");
    this.clockface = document.querySelector(".clockface");
    this.settingsForm = document.querySelector("#setForm");
    this.userInputs = document.querySelectorAll(".user-selection");
    this.userInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.value <= 0) {
          input.value = 1;
        }
        this.clockSettings[input.name] = parseInt(input.value);
      });
    });
    // SVG //
    this.secPath = document.querySelector(".st1");
    this.minPath = document.querySelector(".st0");
    this.secPathLength = this.secPath.getTotalLength();
    this.minPathLength = this.minPath.getTotalLength();
    this.secPathIncrement = this.secPathLength / 60;
    // BUTTONS //
    this.startBtn = document.querySelector("#startBtn");
    this.startBtn.addEventListener("click", this.startOrPause);
    this.resetBtn = document.querySelector("#resetBtn");
    this.resetBtn.addEventListener("click", this.handleReset);
    this.settingsBtn = document.querySelector("#settingsBtn");
    this.settingsBtn.addEventListener("click", this.openSettings);
    this.closeSetBtn = document.querySelector("#closeSetBtn");
    this.closeSetBtn.addEventListener("click", this.handleCloseBtn);
  }

  setMinsAndSecs = () => {
    this.minutes = this.clockSettings.work_min;
    this.seconds = this.calcSeconds();
  };

  setCurrentMinutes = (minutes) => {
    if (
      minutes === this.clockSettings.long_break ||
      minutes === this.clockSettings.short_break ||
      minutes === this.clockSettings.work_min
    ) {
      this.currentMinutes = this.minutes;
    }
  };

  setClockSettings = () => {
    if (window.localStorage.getItem("clockSettings") !== null) {
      this.clockSettings = JSON.parse(
        window.localStorage.getItem("clockSettings")
      );
      this.userInputs.forEach((input) => {
        input.value = this.clockSettings[input.name];
      });
    } else {
      this.userInputs.forEach((input) => {
        this.clockSettings[input.name] = parseInt(input.value);
      });
    }
    this.setMinsAndSecs();
  };

  handleCloseBtn = () => {
    this.settingsForm.classList.remove("open-settings");
    window.localStorage.setItem(
      "clockSettings",
      JSON.stringify(this.clockSettings)
    );
    this.setMinsAndSecs();
    this.displayTime();
    this.resetPaths();
  };

  calcSeconds = () => {
    return Math.floor(this.minutes * 60);
  };

  formatTime = (time) => {
    return time >= 10 ? time : "0" + time;
  };

  tick = () => {
    this.setCurrentMinutes(this.minutes);
    this.colorMinPath();
    this.seconds = Math.floor(this.minutes * 60);
    this.countdown = setInterval(() => {
      this.handleFirstRun();
      this.isRunning = true;
      this.seconds--;
      this.minutes = this.seconds / 60;
      this.displayTime();
      this.updateSecsPath();
      this.updateMinsPath();
      this.handleTimesUp();
    }, 100);
  };

  handleFirstRun = () => {
    if (this.minutes === this.clockSettings.work_min && this.count === 0) {
      this.timerState.innerText = "work";
    }
  };

  evaluateTimer = () => {
    if (this.count <= 6) {
      if (this.count % 2 !== 0) {
        this.minutes = this.clockSettings.short_break;
        this.pomodoros++;
        pomoContainer.innerHTML += this.sprite;
        timerState.innerHTML = "short break";
      } else {
        this.minutes = this.clockSettings.work_min;
        this.timerState.innerText = "work";
      }
    } else {
      this.minutes = this.clockSettings.long_break;
      this.timerState.innerText = "long break";
      this.pomodoros++;
      if (this.pomodoros < 5) {
        this.pomoContainer.innerHTML += this.sprite;
      }
    }
    if (this.pomodoros < 5) {
      this.tick(this.minutes);
    }
    if (this.pomodoros >= 5 && this.clockSettings.reps >= 1) {
      this.handleReset();
      this.tick(this.clockSettings.work_min);
      this.clockSettings.reps--;
    }
    if (this.pomodoros >= 5 && this.clockSettings.reps <= 0) {
      this.timerState.innerText = "well done!";
    }
  };

  handleTimesUp() {
    if (this.seconds === 0) {
      this.updateSecsPath(true);
      // updateMinsPath(minPathLength, currentMinutes);
      clearInterval(this.countdown);
      this.count++;
      this.evaluateTimer();
    }
  }

  displayTime = () => {
    this.displayMinutes.innerText = this.formatTime(Math.floor(this.minutes));
    this.displaySeconds.innerText = this.formatTime(this.seconds % 60);
  };

  init = () => {
    this.setClockSettings();
    displayMinutes.innerText = this.formatTime(this.minutes);
    displaySeconds.innerText = "00";
  };

  // BUTTON HANDLERS //
  startOrPause = () => {
    if (!this.isRunning) {
      this.clockface.classList.remove("flash");
      this.startBtn.classList.add("pause-icon");
      this.tick();
      this.isRunning = true;
    } else {
      this.startBtn.classList.remove("pause-icon");
      this.pause();
    }
  };

  pause = () => {
    this.pauseValue = this.seconds;
    clearInterval(this.countdown);
    this.isRunning = false;
    this.clockface.classList.add("flash");
  };

  handleReset = () => {
    const { work_min } = this.clockSettings;
    clearInterval(this.countdown);
    this.resetPaths();
    this.minutes = work_min;
    this.seconds = this.calcSeconds();
    this.init(this.formatTime(this.minutes));
    this.isRunning = false;
    this.clockface.classList.remove("flash");
    this.pomoContainer.innerHTML = "";
    this.minPath.classList.remove("stroke-green");
    this.startBtn.classList.remove("pause-icon");
    this.timerState.innerText = "";
    this.count = 0;
    this.pomodoros = 0;
  };

  // SETTINGS HANDLERS //
  openSettings = () => {
    this.settingsForm.classList.add("open-settings");
  };

  // PATH ANIMATIONS //
  updateSecsPath = (end) => {
    if (end) {
      this.secPath.style.strokeDashoffset = 0;
      this.secPath.style.strokeDasharray = 38.5;
      return;
    }
    this.secPathLength -= this.secPathIncrement;
    this.secPath.style.strokeDashoffset = this.secPathLength;
  };

  resetPaths = () => {
    this.minPath.style.strokeDashoffset = 0;
    this.secPath.style.strokeDashoffset = 0;
    this.secPathLength = this.secPath.getTotalLength();
    this.minPathLength = this.minPath.getTotalLength();
  };

  colorMinPath = () => {
    if (this.count % 2 === 0) {
      this.minPath.classList.add("stroke-green");
    } else {
      this.minPath.classList.remove("stroke-green");
    }
  };

  updateMinsPath = () => {
    this.minPathIncrement = this.minPathLength / this.currentMinutes;

    // runs every second so only run on whole numbers
    if (this.minutes % 1 === 0) {
      // change style when time up
      if (this.minutes === 0) {
        this.minPath.style.opacity = 0;
        setTimeout(() => {
          this.minPath.style.opacity = 1;
        }, 250);
        this.minPath.style.strokeDashoffset = 0;
        // update path length otherwise
      } else {
        this.minPath.style.strokeDashoffset -= this.minPathIncrement;
      }
    }
  };
}
