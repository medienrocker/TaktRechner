function calculateMusic() {
    const barsInput = document.getElementById('bars');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const bpmInput = document.getElementById('bpm');

    const bars = barsInput.value;
    const minutes = minutesInput.value;
    const seconds = secondsInput.value;
    const bpm = bpmInput.value;

    // Remove any existing highlights
    [barsInput, minutesInput, secondsInput, bpmInput].forEach(input => {
        input.classList.remove('highlighted');
    });

    if (bars && bpm && (!minutes && !seconds)) {
        // Calculate time from bars and BPM
        const totalSeconds = Math.ceil(bars * 60 / bpm);
        const calcMinutes = Math.floor(totalSeconds / 60);
        const calcSeconds = totalSeconds % 60;
        minutesInput.value = calcMinutes;
        secondsInput.value = calcSeconds;
        minutesInput.classList.add('highlighted');
        secondsInput.classList.add('highlighted');
    } else if (bpm && (minutes || seconds)) {
        // Calculate bars from time and BPM
        const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
        const calculatedBars = Math.ceil((totalSeconds * bpm) / 60);
        barsInput.value = calculatedBars;
        barsInput.classList.add('highlighted');
    } else if (bars && (minutes || seconds)) {
        // Calculate BPM from time and bars
        const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
        const calculatedBPM = Math.ceil((bars * 60) / totalSeconds);
        bpmInput.value = calculatedBPM;
        bpmInput.classList.add('highlighted');
    }
}

window.onload = function () {
    document.getElementById('musicForm').addEventListener('submit', function (event) {
        event.preventDefault();
        calculateMusic();
    });
}

// Calculate BPM from Tap-Tempo
let tapTimes = [];
let bpmTimeout;

function tapBPM() {
    const now = new Date().getTime();
    tapTimes.push(now);
    const bpmInput = document.getElementById('bpm');

    // Clear previous highlight
    bpmInput.classList.remove('highlighted');

    // When there are two or more taps, calculate the BPM
    if (tapTimes.length > 1) {
        const intervals = tapTimes.slice(1).map((time, index) => {
            return time - tapTimes[index];
        });
        const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = 60000 / averageInterval; // Convert ms to BPM
        bpmInput.value = Math.round(bpm);

        // Highlight the BPM input field
        bpmInput.classList.add('highlighted');
    }

    // Reset if more than 2 seconds pass between taps
    clearTimeout(bpmTimeout);
    bpmTimeout = setTimeout(() => {
        tapTimes = [];
        bpmInput.classList.remove('highlighted');
    }, 2000);
}

document.getElementById('bpmTapper').addEventListener('click', tapBPM);

