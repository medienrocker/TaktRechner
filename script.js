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