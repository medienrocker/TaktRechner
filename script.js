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
    //console.log(`Input states: Bars: ${bars}, Minutes: ${minutes}, Seconds: ${seconds}, BPM: ${bpm}`);

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
    //console.log(`Button should be enabled: ${isValidCombination}`);

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
    // Adjust the ticks per bar based on the rhythm
    switch (rhythmValue) {
        case "1": // Quarter note
            ticksPerBar = 4; // 4 beats in a typical 4/4 bar
            return 1;
        case "2": // Eighth note
            ticksPerBar = 8; // 4 quarter notes in a 4/4 bar
            return 2;
        case "3": // Sixtenth NOte
            ticksPerBar = 16; // 8 eighth notes in a 4/4 bar
            return 4;
        case "4": // Dotted quarter note (commonly used in 6/8 time)
            ticksPerBar = 6; // Typically 6 eighth notes in a 6/8 bar
            return 2;
        default:
            ticksPerBar = 4; // Default to 4/4 time
            return 1;
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

    console.log("total ticks: " + totalTicks + " int.Duration: " + intervalDuration);
}


function calculateTotalTime(bpm, bars, minutes, seconds) {
    let totalTime = 0;
    if (bars) {
        totalTime = (60000 / bpm) * bars * 4; // Total duration for 4 beats per bar
    } else if (minutes || seconds) {
        totalTime = (parseInt(minutes) * 60 + parseInt(seconds)) * 1000;
    }
    console.log("Total time: " + totalTime);
    return totalTime;
}


// START the metronome
function startMetronome() {
    const bpm = parseInt(document.getElementById("bpm").value);
    const rhythmValue = document.getElementById("rhythmSelect").value;
    const bars = document.getElementById("bars").value.trim();
    const minutes = document.getElementById("minutes").value.trim();
    const seconds = document.getElementById("seconds").value.trim();

    currentTick = 0; // Reset tick count when metronome starts

    if (isNaN(bpm) || bpm <= 0) {
        alert("Please enter a valid BPM.");
        return;
    }


    setupLights(calculateTicksPerBar(rhythmValue));

    const totalTime = calculateTotalTime(bpm, bars, minutes, seconds);

    // Start playing the metronome
    playMetronomeIndefinitelyOrForDuration(totalTime, bpm, rhythmValue);

    document.getElementById("playButton").disabled = true;
    document.getElementById("stopButton").disabled = false;
}


function stopMetronome() {
    clearInterval(metronomeInterval);
    currentTick = 0; // Reset tick count when stopping the metronome
    document.getElementById("playButton").disabled = false;
    document.getElementById("stopButton").disabled = true;
}



// Create two single Audio objects to be reused
const highSound = new Audio('audio/Click01-high.mp3');
const lowSound = new Audio('audio/Click01-low.mp3');

let currentTick = 0;

function playSound() {
    
    if (currentTick % ticksPerBar === 0) {
        highSound.currentTime = 0;
        highSound.play();
    } else {
        lowSound.currentTime = 0;
        lowSound.play();
    }
    
    updateLights(currentTick); // Update the lights right before playing sound

    currentTick = (currentTick + 1) % ticksPerBar; // Ensures the counter resets after reaching the total ticks per bar
}



// Volume control
document.getElementById('volumeControl').addEventListener('input', function () {
    const volume = this.value; // Get the value from the slider
    highSound.volume = volume; // Set the volume for high sound
    lowSound.volume = volume; // Set the volume for low sound
});

window.onload = function () {
    const initialVolume = document.getElementById('volumeControl').value;
    highSound.volume = initialVolume;
    lowSound.volume = initialVolume;
};


// Light indicator
function setupLights(ticksPerBar) {
    const container = document.getElementById('lightContainer');
    container.innerHTML = ''; // Clear existing lights

    for (let i = 0; i < ticksPerBar; i++) {
        let light = document.createElement('div');
        container.appendChild(light);
    }
}

function updateLights(currentTick) {
    const lights = document.querySelectorAll('#lightContainer div');
    lights.forEach((light, index) => {
        light.className = ''; // Reset class
        if (index === currentTick) {
            light.classList.add(index === 0 ? 'first-beat' : 'active');
        }
    });
}
