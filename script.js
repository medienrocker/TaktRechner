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
