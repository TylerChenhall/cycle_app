// Various user inputs and display elements to modify
const title = document.querySelector('title');
const defaultTitleContent = title.textContent;
const beginButton = document.querySelector('#begin');
const submitButton = document.querySelector('#submit');
const activityInputs = document.querySelectorAll('.input input');
const radioOptions = document.querySelectorAll('input[type="radio"]');
const notesInput = document.querySelector('textarea');

// Table controls
const dateBackward = document.querySelector('.date-backward');
const dateForward = document.querySelector('.date-forward');
const tableDate = document.querySelector('.table-controls span');
const tableBody = document.querySelector('tbody');

// -------------- Activity Tracking -------------- //
let currentActivity;

// -------------- Timer -------------- //
// Timer display and controls
const timeDisplay = document.querySelector('h3.clock');
const startPause = document.querySelector('.start-pause');
const reset = document.querySelector('.reset');

/**
 * Represents a timer, supporting app-defined callbacks
 *
 * Supports custom durations, start/pause/reset, and
 * responding to updates to the time (ex: displaying time remaining)
 * as well as when the timer finishes.
 */
class Timer {
    timerActive = false;
    #timerId;
    #pauseTime = 100;

    // Time accumulated by this timer, in ms.
    #cumulativeTime = 0;

    // Last start time, in ms.
    #startTime;
    
    constructor(duration, timeChangedCallback, timerCompleteCallback) {
        this.duration = duration;
        this.timeChangedCallback = timeChangedCallback;
        this.timerCompleteCallback = timerCompleteCallback;
    }

    start() {
        if (!this.timerActive) {
            this.timerActive = true;
            this.#startTime = Date.now();
            this.#timerId = setInterval(() => this.#updateTimer(), 
                                        this.#pauseTime);
        }
    }

    pause() {
        if (this.timerActive) {
            this.timerActive = false;
            clearInterval(this.#timerId);
    
            this.#cumulativeTime += 
                Math.floor(Date.now()) - this.#startTime;
        }
    }

    reset() {
        if (this.timerActive) {
            this.timerActive = false;
            clearInterval(this.#timerId);
        }
    
        // Also reset stats.
        this.#cumulativeTime = 0;
        this.setTime(this.duration);
    }

    #updateTimer() {
        const milliseconds = Date.now() 
            - this.#startTime + this.#cumulativeTime;
    
        this.setTime(this.duration - milliseconds);
        if (milliseconds >= this.duration) {
            this.timerActive = false;
            clearInterval(this.#timerId);
            this.timerCompleteCallback();
        }
    }

    setTime(milliseconds) {
        const seconds = Math.max(0, Math.floor(milliseconds / 1000));
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        const formattedTime = String(mins).padStart(2, '0') 
            + ':' + String(secs).padStart(2, '0');
        this.timeChangedCallback(formattedTime);
    }
}

const timerDuration = 60 * 15 * 1000;
const timer = new Timer(timerDuration, timeChanged, timerComplete);
timer.setTime(timerDuration);
startPause.addEventListener('click', () => {
    setSetupEnabled(false);
    if (timer.timerActive) {
        startPause.textContent = 'Start';
        timer.pause();
    } else {
        startPause.textContent = 'Pause';
        timer.start();
    }
});
reset.addEventListener('click', () => {
    startPause.textContent = 'Start';
    timer.reset()
});

// -------------- Audio Setup -------------- //
let audio;

/**
 * Wraps audio to support starting or stopping a basic sound.
 *
 * We use an object to initialize, since we cannot create
 * the audio context before user interaction.
 * Setup inspired by https://github.com/mdn/webaudio-examples/blob/main/violent-theremin/scripts/app.js
 */
class Audio {
    constructor() {
        this.audioCtx = new window.AudioContext();
        
        this.oscillator = this.audioCtx.createOscillator();
        this.oscillator.frequency.value = 880;
        this.oscillator.start(0);
        this.gain = this.audioCtx.createGain();
        this.oscillator.connect(this.gain);
        this.gain.connect(this.audioCtx.destination);

        this.gain.gain.value = 0;
    }

    enableSound() {
        this.gain.gain.value = 0.1;
    }

    disableSound() {
        this.gain.gain.value = 0;
    }
}

// -------------- UI Handling -------------- //
// Attempts to submit activity choices and populate the in-progress
// section.
beginButton.addEventListener('click', () => {
    // The first user's click will trigger audio setup.
    // The audio stutters less if we enable it before using.
    if (audio === undefined) {
        audio = new Audio();
    }
    
    // On press, we check if all text inputs have content.
    // If not, communicate that they need content.
    let validInputs = true;
    const activities = [];
    for (const activityInput of activityInputs) {
        if (activityInput.value.length === 0) {
            activityInput.classList.add('error');
            validInputs = false;
        } else {
            // Remove the error class if it is present.
            activityInput.classList.remove('error');
        }
    }

    if (!validInputs) return;

    // If we have enough content, collect & clear it.
    // Then, populate the next section.
    for (const activityInput of activityInputs) {
        activities.push(activityInput.value);
        activityInput.value = '';
    }
    
    // Move information into the in-progress section.
    displayInProgressActivityOptions(activities);

    startPause.focus();
});

submitButton.addEventListener('click', () => {
    let choice = -1;
    for (let i = 1; i <= radioOptions.length; i++) {
        if (radioOptions[i-1].checked) {
            choice = i;
        }
    }

    currentActivity.setChoice(choice);
    currentActivity.setNotes(notesInput.value);
    currentActivity.setFinishTime(Date.now());
    
    const savePromise = saveActivity(currentActivity);
    currentActivity = undefined;
    
    // Reset app state
    initialState();
    // TODO: should this use await instead?
    savePromise.then((d) => {
        console.log(d);
        tableState();
    });
});

// Table controls
function getToday() {
    const today = new Date();

    // Modify today so it refers to the beginning of the day in the user's
    // timezone.
    today.setHours(0, 0, 0, 0);
    return today;
}

let dateValue = getToday();
dateBackward.addEventListener('click', () => {
    dateValue.setDate(dateValue.getDate() - 1);
    dateForward.disabled = false;
    setTableDate(dateValue);
    tableState();
});
dateForward.disabled = true;
dateForward.addEventListener('click', () => {
    dateValue.setDate(dateValue.getDate() + 1);
    if (dateValue.getTime() >= getToday().getTime()) {
        dateForward.disabled = true;
    }
    setTableDate(dateValue);
    tableState();
});

function setTableDate(date) {
    if (getToday().getTime() <= date.getTime()) {
        tableDate.textContent = 'Today';
    } else {
        tableDate.textContent = date.toDateString();
    }
}


for (const option of radioOptions) {
    option.addEventListener('change', () => {
        setActivitySubmitEnabled(true);
    });
}

function displayInProgressActivityOptions(activities) {
    if (activities.length !== 3) {
        // Throw an error?
        return;
    }

    // Set up radio inputs and labels for the new activity choices.
    for (let i = 1; i <= 3; i++) {
        const input = document.querySelector(`#act${i}`);
        const label = document.querySelector(`label[for="act${i}"`);
        input.setAttribute('value', activities[i-1]);
        input.checked = false;
        label.textContent = activities[i-1];
    }

    currentActivity = new Activity(/* Value unused */ -1,
                                   activities[0], 
                                   activities[1], 
                                   activities[2]);
    currentActivity.setStartTime(Date.now());
    currentActivity.setDuration(timerDuration);

    // Enable the timer
    setTimerControlsEnabled(true);
    timer.reset();
}

// Update app state for time changes.
function timeChanged(timeString) {
    timeDisplay.textContent = timeString;

    if (timer.timerActive) {
        title.textContent = `${timeString} - ${defaultTitleContent}`;
    } else {
        title.textContent = defaultTitleContent;
    }
}

// Update app state and alert the user.
// TODO: the audio and text updates seem to wait until I click
// back to the tab if I've been away for a while. How to fix?
function timerComplete() {
    setTimerControlsEnabled(false);
    setActivityControlsEnabled(true);

    title.textContent = '!! Time !!';
    timeDisplay.classList.add('animate');
    audio.enableSound();
    setTimeout(() => {
        timeDisplay.classList.remove('animate');
        audio.disableSound();
    }, 1500);
}

function setTimerControlsEnabled(enabled) {
    startPause.disabled = !enabled;
    reset.disabled = !enabled;
}

function setActivityControlsEnabled(enabled) {
    for (let i = 1; i <= 3; i++) {
        const input = document.querySelector(`#act${i}`);
        input.disabled = !enabled;
    }
    notesInput.disabled = !enabled;
}

function setActivitySubmitEnabled(enabled) {
    submitButton.disabled = !enabled;
}

function setSetupEnabled(enabled) {
    for (const activityInput of activityInputs) {
        activityInput.disabled = !enabled;
    }
    beginButton.disabled = !enabled;
}

function initialState() {
    // Does initial app setup.
    setSetupEnabled(true);
    setTimerControlsEnabled(false);
    startPause.textContent = 'Start';
    setActivityControlsEnabled(false);
    setActivitySubmitEnabled(false);
    for (let i = 1; i <= 3; i++) {
        const input = document.querySelector(`#act${i}`);
        const label = document.querySelector(`label[for="act${i}"`);
        input.setAttribute('value', '');
        input.checked = false;
        label.textContent = '';
    }
    notesInput.value = '';
    title.textContent = defaultTitleContent;
    timer.reset();
}

async function tableState() {
    const dateUsed = new Date(dateValue.getTime());
    const cycleHistory = await lookupDayHistory(dateValue);

    if (dateUsed.getTime() !== dateValue.getTime()) return;

    // Clear old activity data or filler data.
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.lastChild);
    }
    // Repopulate the table with the new data.
    for (const cycle of cycleHistory) {
        tableBody.appendChild(cycle.activityHTML());
    }
}

initialState();
tableState();
