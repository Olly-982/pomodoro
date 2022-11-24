/////////////////////////////////////////////// AUDIO ////////////////////////
let audioPlayer = new Audio();
let beginWorkMp3 = "./audio/beginWork.mp3";
let shortBreakMp3 = "./audio/shortBreak.mp3";
let noticeMp3 = "./audio/notification.mp3";
let longBreakMp3 = "./audio/longBreak.mp3";

volBtn.addEventListener("dblclick", () => {
  volBtn.classList.toggle("muted");
  if (volBtn.classList.contains("muted")) {
    audioPlayer.muted = true;
  } else {
    audioPlayer.muted = false;
  }
});

audioPlayer.volume = volume.value;
volBtn.classList.add("muted");
volume.addEventListener("change", () => {
  audioPlayer.volume = volume.value;
  if (volume.value === 0) {
    volBtn.classList.add("muted");
  } else {
    volBtn.classList.remove("muted");
  }
});

function playAudio(minutes, count) {
  if (minutes === clockSettings.work_min && count % 2 === 0) {
    audioPlayer.src = beginWorkMp3;
  } else if (minutes === clockSettings.short_break && count < 6) {
    audioPlayer.src = shortBreakMp3;
  } else if (minutes === clockSettings.long_break) {
    audioPlayer.src = longBreakMp3;
  } else {
    audioPlayer.src = "";
  }
  audioPlayer.play().catch((error) => {
    // do nothing
  });
}
