document.addEventListener("DOMContentLoaded", function(event) {
    
    const SECONDS = 59;
    let picContainer = document.querySelector('.pomo-container');
    let timerRunning;
    let isPaused = false;
    
    let clockSettings = {
        userWorkMin: 25,
        userShortMin: 5,
        userLongMin: 30,
        userRep: 1
    };
    
    if(localStorage.getItem('clockSettings') !== null){
        clockSettings = JSON.parse(window.localStorage.getItem('clockSettings'));
        workMinput.value = clockSettings.userWorkMin;
        longMinput.value = clockSettings.userLongMin;
        shortMinput.value = clockSettings.userShortMin;
        reps.value = clockSettings.userRep;
    }
    
    let workMinutes = clockSettings.userWorkMin;
    let coffeeBreak = clockSettings.userShortMin;
    let lunchBreak = clockSettings.userLongMin;
    let timerReps = clockSettings.userRep;
    
    
    /////////////////////
    // user input
    /////////////////////
    reps.addEventListener('change', () => {
        clockSettings.userRep = reps.value;
        timerReps = reps.value;
    })
    
    workMinput.addEventListener('change', () => {

        clockSettings.userWorkMin = workMinput.value;
        workMinutes = workMinput.value;
        displayMinutes.innerHTML = formatTime(workMinutes);

    })

    shortMinput.addEventListener('change', () => {
        clockSettings.userShortMin = shortMinput.value;
        coffeeBreak = shortMinput.value;
    })

    longMinput.addEventListener('change', () => {
        clockSettings.userLongMin = longMinput.value;
        lunchBreak = longMinput.value;
    })

    ///////////////////////////
    // DONT ACCEPT ZERO
    ///////////////////////////
    let allInputs = [workMinput, reps, shortMinput, longMinput];
    for(let el of allInputs){
        el.addEventListener('input', () => {
            if(el.value <= 0){
                alert('please enter a value of 1 or greater');
                el.value = 1;
            }
        })
        el.addEventListener('click', () => {
            return el.select();
        })
    }

    ////////////////
    // pomodoros
    ////////////////
    let pomodoros = 0;

    ////////////////////
    // make some noise
    ////////////////////
    let notice = new Audio('./audio/notification.mp3');
    let beginWork = new Audio('./audio/beginWork.mp3');
    let shortBreak = new Audio('./audio/shortBreak.mp3');
    let longBreak = new Audio('./audio/longBreak.mp3');
    let allAudio = [beginWork, shortBreak, longBreak];

    ////////////////////////
    // controls
    ///////////////////////
    // volume btn listener
    volBtn.addEventListener('click', () => {
        // volBtn.classList.toggle('muted')
        volume.classList.toggle('display-none');
        volume.addEventListener('input', () => {
            
            for(let aud of allAudio){
                aud.volume = volume.value;
                if(volume.value == 0){
                    volBtn.classList.add('muted');
                }else{
                    volBtn.classList.remove('muted');
                }
            }
        })
    })
    let main = document.querySelector('main');
    main.addEventListener('click', () => {
        volume.classList.toggle('display-none');
    })
    // settings
    settingsBtn.addEventListener('click', () => {
        if(!timerRunning){
            setForm.style.display = 'block';
            setTimeout( () => {
                setForm.style.bottom = '0';
                xOne.classList.toggle('rotate-clkwise');
                xTwo.classList.toggle('rotate-counter');
            }, 100)
        }else{
            notice.play();
            alert('Timer cannot be updated while running, please RESET timer to make changes. Your changes will be saved to the browser');
        }
    })
    // close settings btn
    closeSetBtn.addEventListener('click', function () {
        xOne.classList.toggle('rotate-clkwise');
        xTwo.classList.toggle('rotate-counter');
        setForm.style.bottom = '-472px';
        setTimeout(() => {
            setForm.style.display = 'none';
        }, 500)
        window.localStorage.setItem('clockSettings', JSON.stringify(clockSettings))
    })
    //////////////////////////
    //     START TIMER
    //////////////////////////
    startBtn.addEventListener('click', function(){
        if(this.innerHTML == 'start timer'){
            for(let el of allInputs){
                el.disabled = true;
            }
            updateTimer();
            isPaused = false;
            this.innerHTML = 'pause timer';
        }else if(this.innerHTML == 'resume timer'){
            isPaused = false;
            this.innerHTML = 'pause timer';
        }else{
            notice.play();
            alert('timer is paused');
            isPaused = true;
            this.innerHTML = 'resume timer';
        }
        
    })

    //////////////////////////
    //  STOP TIMER AND RESET
    //////////////////////////
    stopBtn.addEventListener('click',function(){
        reset();
    })

    // temp variables to update
    let seconds = SECONDS;
    let minutes = workMinutes

    /////////////////////////
    // CLOCK DISPLAY
    /////////////////////////
    
    // initialize clock display
    displaySeconds.innerHTML = '00';
    displayMinutes.innerHTML = formatTime(minutes);
    
    /////////////////////////
    // PATHS TO ANIMATE
    /////////////////////////

    // get stroke lengths
    let secPath = document.querySelector('.st1');
    let minPath = document.querySelector('.st0');
    let secPathLength = secPath.getTotalLength();
    let secPathIncrement = secPathLength / 60;
    let minPathLength = minPath.getTotalLength();
    let minPathIncrement;
    function getMinPathIncrement() {
        minPathIncrement = minPathLength / minutes;
    }



    function countdown(){
        if(!isPaused){
            if(seconds == 0 && minutes == 0){
                clearTimer();
                updateTimer();
            }
            // if full session not complete
            if(count < 9){
                if(seconds == 59 && minutes > 0){
                    minutes -= 1;
                    minPathLength -= minPathIncrement;
                    minPath.style.strokeDashoffset = minPathLength;
                }
                displaySeconds.innerHTML = formatTime(seconds);
                displayMinutes.innerHTML = formatTime(minutes);
                seconds--;
                secPathLength -= secPathIncrement;
                secPath.style.strokeDashoffset = secPathLength;
                if(seconds < 0){
                    seconds = 59;
                }
            }else{
                timerReps--;
                reset();
                if(timerReps > 0){
                    clearTimer();
                    updateTimer();
                }else{
                    return;
                }
            }
        }
    }

    function formatTime(timeValue){
        if(timeValue < 10){
            return '0' + timeValue;
        }else if(timeValue == 60){
            return '00';
        }else{
            return timeValue;
        }
    }

    function clearTimer(){
        clearInterval(timer);
        timerRunning = false;
    }

    function runTimer(){
        clearTimer();
        timerRunning = true;
        timer = setInterval(countdown, 1000);
    }

    // temp count for tracking 
    let count = 0;

    // evaluate tracking variables and reset to appropriate values
    function updateTimer(){
        if(pomodoros < 4 && count % 2 == 0 && count < 8){
            minutes = workMinutes;
            runTimer();
            beginWork.play();
            timerState.innerHTML = 'work';
            minPath.style.stroke = '#25e24e';
            getMinPathIncrement();
            pomodoros++;
            count++;
        }else if(pomodoros < 4 && count % 2 != 0){
            pomoText.innerHTML = `${pomodoros} complete`;
            picContainer.innerHTML += '<img class="pomo" src="./img/tomato.svg" alt="tomato icon">'
            minutes = coffeeBreak;
            runTimer();
            shortBreak.play();
            timerState.innerHTML = 'coffee break';
            minPath.style.stroke = '#fa7238';
            getMinPathIncrement();
            count++;
        }else if(pomodoros == 4 && count < 8){
            pomoText.innerHTML = `${pomodoros} complete`;
            picContainer.innerHTML += '<img class="pomo" src="./img/tomato.svg" alt="tomato icon">'
            minutes = lunchBreak;
            runTimer();
            longBreak.play();
            timerState.innerHTML = 'lunch break';
            minPath.style.stroke = '#fa7238';
            getMinPathIncrement();
            count++;
        }else{
            count++;
        }
    }

    function reset(){
        clearTimer();
        count = 0;
        pomodoros = 0;
        seconds = SECONDS;
        minutes = workMinutes
        // re-initialize clock display
        displaySeconds.innerHTML = '00';
        displayMinutes.innerHTML = formatTime(minutes);
        timerState.innerHTML = '';
        picContainer.innerHTML = '';
        for(let el of allInputs){
            el.disabled = false;
        }
        startBtn.innerHTML = 'start timer';
        settingsBtn.disabled = false;
        secPathLength = secPath.getTotalLength();
        secPath.style.strokeDashoffset = 0;
        minPathLength = minPath.getTotalLength();
        minPath.style.strokeDashoffset = 0;
        minPathIncrement = getMinPathIncrement();
        pomoText.innerHTML = '';
        isPaused = false;
    }

});