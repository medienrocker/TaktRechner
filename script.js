// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// initialize base variables
let tapTimes = [];
let bpmTimeout;
let lastCalculated = null;
let inputModified = {
    bars: false,
    minutes: false,
    seconds: false,
    bpm: false
};


// adds event listeners to all input fields and
// adds the sanitize function to all input fields
document.addEventListener("DOMContentLoaded", function () {
    // Bindet handleInput an alle Nummerneingabefelder
    document.querySelectorAll('input[type="number"]').forEach((inputField) => {
        inputField.addEventListener("input", handleInput);
    });

    // Bindet calculateMusic an den Calculate-Button
    document.getElementById("calculateButton").addEventListener("click", calculateMusic);

    // Bindet tapBPM an den BPM Tapper-Button
    document.getElementById("bpmTapper").addEventListener("click", tapBPM);

    // Bindet resetFields an den Reset-Button
    document.getElementById("resetButton").addEventListener("click", resetFields);

    // bindet alle input fields an die updateHint function
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener("input", updateHint);
    });

    // Globaler Event Listener für die Eingabesanierung
    document.addEventListener('input', function (event) {
        if (event.target.type === 'number') {
            sanitizeInput(event);
        }
    });

    // Initialer Aufruf von handleInput, um den korrekten Zustand des Calculate-Buttons zu setzen
    handleInput();
});


function sanitizeInput(event) {
    // Allow numbers, a minus sign at the start, and a single decimal point
    event.target.value = event.target.value
        .replace(/[^0-9.-]/g, '')
        .replace(/(\..*)\./g, '$1') // only allow one decimal point
        .replace(/(?!^)-/g, ''); // allow minus sign only at the start
}


// Function to calculate music values based on the filled inputs
function calculateMusic() {
    //console.log("calculateMusic function started");
    const barsInput = document.getElementById("bars");
    const minutesInput = document.getElementById("minutes");
    const secondsInput = document.getElementById("seconds");
    const bpmInput = document.getElementById("bpm");

    let minutes = parseInt(minutesInput.value) || 0;
    let seconds = parseInt(secondsInput.value) || 0;
    let totalSeconds = minutes * 60 + seconds;
    let bars = parseInt(barsInput.value);
    let bpm = parseInt(bpmInput.value);
    let calculatedFields = [];

    // Reset input modification flags
    inputModified = { bars: false, minutes: false, seconds: false, bpm: false };

    if (bars && bpm && !minutes && !seconds) {
        totalSeconds = Math.ceil((bars * 60) / bpm);
        minutesInput.value = Math.floor(totalSeconds / 60);
        secondsInput.value = totalSeconds % 60;
        calculatedFields = [minutesInput, secondsInput];
        inputModified.minutes = inputModified.seconds = true;
    } else if (totalSeconds > 0 && bpm && !bars) {
        bars = Math.ceil((totalSeconds * bpm) / 60);
        barsInput.value = bars;
        calculatedFields = [barsInput];
        inputModified.bars = true;
    } else if (bars && totalSeconds > 0 && !bpm) {
        bpm = Math.ceil((bars * 60) / totalSeconds);
        bpmInput.value = bpm;
        calculatedFields = [bpmInput];
        inputModified.bpm = true;
    }

    // Highlight all calculated fields
    calculatedFields.forEach((field) => {
        field.classList.add("highlighted");
    });
}


// Function to handle input changes
function handleInput(event) {
    const barsInput = document.getElementById("bars");
    const minutesInput = document.getElementById("minutes");
    const secondsInput = document.getElementById("seconds");
    const bpmInput = document.getElementById("bpm");

    // Assess the current input values
    const bars = barsInput.value.trim();
    const minutes = minutesInput.value.trim();
    const seconds = secondsInput.value.trim();
    const bpm = bpmInput.value.trim();
    const rhythmSelected = document.getElementById("rhythmSelect").value;
    const canPlay = bpm && (bars || minutes || seconds) && rhythmSelected;

    document.getElementById("playButton").disabled = !canPlay;

    // Log current input states
    console.log(`Input states: Bars: ${bars}, Minutes: ${minutes}, Seconds: ${seconds}, BPM: ${bpm}`);

    // Determine if there's enough information to calculate something
    const hasTime = minutes !== "" || seconds !== "";
    const hasBarsOrBPM = bars !== "" || bpm !== "";

    // Check combinations of filled inputs
    let isValidCombination = false;
    if (bars && bpm && (!minutes || !seconds)) {
        // Allows recalculation of time if bars and bpm are present and time is adjusted
        isValidCombination = true;
    } else if (hasTime && bpm && !bars) {
        // Allows calculation of bars if time and bpm are present
        isValidCombination = true;
    } else if (hasTime && bars && !bpm) {
        // Allows calculation of bpm if time and bars are present
        isValidCombination = true;
    }

    // Log the decision to enable or disable the Calculate button
    console.log(`Button should be enabled: ${isValidCombination}`);

    // Enable or disable the Calculate button based on current valid combinations
    document.getElementById("calculateButton").disabled = !isValidCombination;
}




// Initial call to handleInput to set the proper state on page load
handleInput();


// get the BPM from tapping the "Tap" button
document.getElementById("bpmTapper").addEventListener("click", tapBPM);
document.getElementById("resetButton").addEventListener("click", resetFields);

function tapBPM() {
    const now = new Date().getTime();
    tapTimes.push(now);
    const bpmInput = document.getElementById("bpm");

    // Clear previous highlight
    bpmInput.classList.remove("highlighted");

    // When there are two or more taps, calculate the BPM
    if (tapTimes.length > 1) {
        const intervals = tapTimes.slice(1).map((time, index) => {
            return time - tapTimes[index];
        });
        const averageInterval =
            intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = 60000 / averageInterval; // Convert ms to BPM
        bpmInput.value = Math.round(bpm);

        // Highlight the BPM input field
        bpmInput.classList.add("highlighted");
    }

    // Reset if more than 2 seconds pass between taps
    clearTimeout(bpmTimeout);
    bpmTimeout = setTimeout(() => {
        tapTimes = [];
        bpmInput.classList.remove("highlighted");
    }, 2000);
    handleInput();
}


// resets all input fields
function resetFields() {
    // Select all the input fields by class or individually
    const inputFields = document.querySelectorAll('input[type="number"]');

    // Clear each field's value and remove the 'highlighted' class
    inputFields.forEach((field) => {
        field.value = "";
        field.classList.remove("highlighted");
    });

    // Also reset any stored BPM tap times
    tapTimes = [];
    handleInput();
}

// Gives the user a hint if more input is needed to calculate
function updateHint() {
    const barsInput = document.getElementById("bars").value.trim();
    const minutesInput = document.getElementById("minutes").value.trim();
    const secondsInput = document.getElementById("seconds").value.trim();
    const bpmInput = document.getElementById("bpm").value.trim();
    const timeInput = minutesInput || secondsInput;

    let hintMessage = "";
    const hintContainer = document.getElementById("hint");

    if (bpmInput && !barsInput && !timeInput) {
        hintMessage = "A) Please enter the number of bars to calculate Song duration or " +
            "B) enter minutes and/or seconds to calculate how much bars the song has!";
    } else if (barsInput && !bpmInput && !timeInput) {
        hintMessage = "A) Please enter the bpm to calculate Song duration or " +
            "B) enter minutes and/or seconds to calculate the tempo of the Song (BPM)!";
    } else if (timeInput && !barsInput && !bpmInput) {
        hintMessage = "A) Please enter the number of bars to calculate the BPM or " +
            "B) enter the Tempo (BPM) to calculate how much bars the song has!";
    } else {
        hintContainer.style.display = "none";
        return;  // If none of the above conditions are met, hide the hint and exit the function.
    }

    // Display the hint message only if one of the conditions is true
    hintContainer.textContent = hintMessage;
    hintContainer.style.display = "block";
}


// Metronom functionality ++++++++++++++++++++++++++++++++++++
document.getElementById("playButton").addEventListener("click", function () {
    startMetronome();
});

document.getElementById("stopButton").addEventListener("click", function () {
    stopMetronome();
});

let metronomeInterval;
function getTickInterval(bpm, rhythmFactor) {
    // Returns the interval duration based on the rhythm factor
    return (60000 / bpm) / rhythmFactor; // Shorter intervals for more frequent ticks
}

function calculateTicksPerBar(rhythmValue) {
    // Determines how many ticks occur in one bar based on the rhythm
    switch (rhythmValue) {
        case "1": // Full note (1)
            return 1; // 4 ticks per bar in 4/4 time
        case "2": // Quarter note (1/4)
            return 2; // 4 ticks per bar in 4/4 time
        case "3": // Eighth note (1/8)
            return 4; // 8 ticks per bar in 4/4 time
        case "4": // Dotted quarter note (6/8)
            return 3; // 6 ticks per bar in 6/8 time
        default:
            return 1; // Default to quarter note if unsure
    }
}

function playMetronomeIndefinitelyOrForDuration(totalTime, bpm, rhythmValue) {
    const ticksPerBar = calculateTicksPerBar(rhythmValue);
    const intervalDuration = (60000 / bpm) / ticksPerBar;

    let totalTicks = Infinity;
    if (totalTime > 0) {
        // Calculate the total number of intervals that fit in the total time
        totalTicks = Math.floor(totalTime / intervalDuration);
    }

    if (metronomeInterval) {
        clearInterval(metronomeInterval); // Clear previous interval if any
    }
    metronomeInterval = setInterval(playSound, intervalDuration);

    if (totalTicks !== Infinity) {
        setTimeout(() => {
            stopMetronome(); // Stop after the calculated number of ticks
        }, totalTicks * intervalDuration);
    }
}


function startMetronome() {
    const bpm = parseInt(document.getElementById("bpm").value);
    const rhythmValue = document.getElementById("rhythmSelect").value;
    const bars = document.getElementById("bars").value.trim();
    const minutes = document.getElementById("minutes").value.trim();
    const seconds = document.getElementById("seconds").value.trim();

    if (isNaN(bpm) || bpm <= 0) {
        alert("Please enter a valid BPM.");
        return;
    }

    let totalTime = 0;
    if (bars) {
        totalTime = (60000 / bpm) * bars * 4; // Total duration for 4 beats per bar
    } else if (minutes || seconds) {
        totalTime = (parseInt(minutes) * 60 + parseInt(seconds)) * 1000;
    }

    // Start playing the metronome
    playMetronomeIndefinitelyOrForDuration(totalTime, bpm, rhythmValue);

    document.getElementById("playButton").disabled = true;
    document.getElementById("stopButton").disabled = false;
}


function stopMetronome() {
    clearInterval(metronomeInterval);
    document.getElementById("playButton").disabled = false;
    document.getElementById("stopButton").disabled = true;
}



// Create a single Audio object to be reused
const audio = new Audio('audio/CLick01.mp3');

function playSound() {
    audio.currentTime = 0; // Reset the sound to start
    audio.play();
}


