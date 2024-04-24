// ---- Musicians  Helper -----
// Class based approach to encapsulate the Metronome functionality
class Metronome {
    constructor() {
        // Initialize audio files
        this.standardClick = new Audio('audio/Click01-standard.mp3');
        this.highClick = new Audio('audio/Click01-high.mp3');
        this.lowClick = new Audio('audio/Click01-low.mp3');

        // Basic metronome settings
        this.beatsPerBar; // = 4;
        this.clicksPerBeat; // = 1;
        this.totalTicksPerBar = this.calculateTicksPerBar();
        this.currentTick = 0;

        // Initialize timeout and interval handlers
        this.bpmTimeout = null;
        this.metronomeInterval = null;

        // Initialize tap times for BPM calculation
        this.tapTimes = [];

        // Input fields modification flags
        this.inputModified = {
            bars: false,
            minutes: false,
            seconds: false,
            bpm: false
        };

        // Event listeners setup
        this.setupListeners();

        // Preload audio files to reduce latency
        this.preloadAudio();

        // call handleInput initialy to set all button states on startup correctly
        this.handleInput = this.handleInput.bind(this); // Bind in the constructor
        this.handleInput(); // Now it's safe to call
        this.updateHint(); // Set initial hint

    }

    setupListeners() {
        document.addEventListener("DOMContentLoaded", () => {
            const inputs = document.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.addEventListener("input", this.handleInput.bind(this));
                input.addEventListener("input", this.updateHint.bind(this)); // Update hint on input change
            });

            document.getElementById("calculateButton").addEventListener("click", this.calculateMusic.bind(this));
            document.getElementById("bpmTapper").addEventListener("click", this.tapBPM.bind(this));
            document.getElementById("resetButton").addEventListener("click", this.resetFields.bind(this));
            document.getElementById("playButton").addEventListener("click", this.startMetronome.bind(this));
            document.getElementById("stopButton").addEventListener("click", this.stopMetronome.bind(this));
            document.getElementById('volumeControl').addEventListener('input', this.adjustVolume.bind(this));
        });
    }

    preloadAudio() {
        [this.standardClick, this.highClick, this.lowClick].forEach(audio => {
            audio.preload = 'auto';
            audio.load();
        });
        console.log("Audio files preloaded.");
    }

    handleInput(event) {
        const barsInput = document.getElementById("bars").value.trim();
        const minutesInput = document.getElementById("minutes").value.trim();
        const secondsInput = document.getElementById("seconds").value.trim();
        const bpmInput = document.getElementById("bpm").value.trim();
        const rhythmSelected = document.getElementById("rhythmSelect").value;

        const canCalculate = bpmInput && (barsInput || (minutesInput && secondsInput));
        document.getElementById("calculateButton").disabled = !canCalculate;

        const canPlay = bpmInput && (barsInput || (minutesInput && secondsInput)) && rhythmSelected;
        document.getElementById("playButton").disabled = !canPlay;
    }

    calculateMusic() {
        const barsInput = document.getElementById("bars");
        const minutesInput = document.getElementById("minutes");
        const secondsInput = document.getElementById("seconds");
        const bpmInput = document.getElementById("bpm");

        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        const totalSeconds = minutes * 60 + seconds;
        const bars = parseInt(barsInput.value);
        const bpm = parseInt(bpmInput.value);

        let calculatedFields = [];

        if (bars && bpm && !totalSeconds) {
            const totalSeconds = Math.ceil((bars * 60) / bpm);
            minutesInput.value = Math.floor(totalSeconds / 60);
            secondsInput.value = totalSeconds % 60;
            calculatedFields = [minutesInput, secondsInput];
            this.inputModified.minutes = this.inputModified.seconds = true;
        } else if (totalSeconds && bpm && !bars) {
            const bars = Math.ceil((totalSeconds * bpm) / 60);
            barsInput.value = bars;
            calculatedFields = [barsInput];
            this.inputModified.bars = true;
        } else if (bars && totalSeconds && !bpm) {
            const bpm = Math.ceil((bars * 60) / totalSeconds);
            bpmInput.value = bpm;
            calculatedFields = [bpmInput];
            this.inputModified.bpm = true;
        }

        calculatedFields.forEach(field => field.classList.add("highlighted"));
    }

    tapBPM() {
        const now = new Date().getTime();
        this.tapTimes.push(now);

        if (this.tapTimes.length > 1) {
            const intervals = this.tapTimes.slice(1).map((time, index) => time - this.tapTimes[index]);
            const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
            const bpm = 60000 / averageInterval;
            const bpmInput = document.getElementById("bpm");
            bpmInput.value = Math.round(bpm);
            bpmInput.classList.add("highlighted");
        }

        clearTimeout(this.bpmTimeout);
        this.bpmTimeout = setTimeout(() => {
            this.tapTimes = [];
            document.getElementById("bpm").classList.remove("highlighted");
        }, 2000);
    }

    resetFields() {
        document.querySelectorAll('input[type="number"]').forEach(field => {
            field.value = "";
            field.classList.remove("highlighted");
        });
        this.tapTimes = [];
    }

    startMetronome() {
        const bpm = parseInt(document.getElementById("bpm").value);
        if (isNaN(bpm) || bpm <= 0) {
            alert("Please enter a valid BPM.");
            return;
        }
        const rhythmValue = document.getElementById("rhythmSelect").value;
        const bars = parseInt(document.getElementById("bars").value.trim());
        const minutes = parseInt(document.getElementById("minutes").value.trim());
        const seconds = parseInt(document.getElementById("seconds").value.trim());
        const totalTime = this.calculateTotalTime(bpm, bars, minutes, seconds);

        this.calculateTicksPerBar(rhythmValue); // Update ticks per bar based on rhythm
        this.setupLights(this.totalTicksPerBar); // Setup lights according to new ticks per bar

        this.setupMetronome(bpm, rhythmValue, totalTime);
        document.getElementById("playButton").disabled = true;
        document.getElementById("stopButton").disabled = false;
    }

    calculateTotalTime(bpm, bars, minutes, seconds) {
        if (bars) {
            return (60000 / bpm) * bars * 4;
        } else {
            return (minutes * 60 + seconds) * 1000;
        }
    }

    setupMetronome(bpm, rhythmValue, totalTime) {
        this.calculateTicksPerBar(rhythmValue);
        const intervalDuration = (60000 / bpm) / this.clicksPerBeat;

        clearInterval(this.metronomeInterval);
        this.metronomeInterval = setInterval(() => this.playSound(), intervalDuration);

        if (totalTime) {
            setTimeout(() => this.stopMetronome(), totalTime);
        }
    }

    stopMetronome() {
        clearInterval(this.metronomeInterval);
        this.currentTick = 0;
        document.getElementById("playButton").disabled = false;
        document.getElementById("stopButton").disabled = true;
    }

    playSound() {
        if (this.currentTick % this.totalTicksPerBar === 0) {
            this.highClick.play();
        } else if (this.currentTick % this.clicksPerBeat === 0) {
            this.standardClick.play();
        } else {
            this.lowClick.play();
        }

        this.updateLights(this.currentTick);
        this.currentTick = (this.currentTick + 1) % this.totalTicksPerBar;
    }

    adjustVolume(event) {
        const volume = parseFloat(event.target.value);
        [this.standardClick, this.highClick, this.lowClick].forEach(audio => {
            audio.volume = volume;
        });
    }

    calculateTicksPerBar(rhythmValue) {
        switch (rhythmValue) {
            case "1": // Quarter note
                this.clicksPerBeat = 1;
                this.beatsPerBar = 4;
                break;
            case "2": // Eighth note
                this.clicksPerBeat = 2;
                this.beatsPerBar = 4;
                break;
            case "3": // Sixteenth note
                this.clicksPerBeat = 4;
                this.beatsPerBar = 4;
                break;
            case "4": // Dotted quarter note (common in 6/8 time)
                this.clicksPerBeat = 1.5;
                this.beatsPerBar = 6;
                break;
            default:
                this.clicksPerBeat = 1;
                this.beatsPerBar = 4;
        }
        this.totalTicksPerBar = this.beatsPerBar * this.clicksPerBeat;
    }

    // Light indicator
    setupLights(totalTicksPerBar) {
        const container = document.getElementById('lightContainer');
        container.innerHTML = ''; // Clear existing lights

        // Adjust container width based on the number of beats
        container.style.maxWidth = `${(totalTicksPerBar <= 4 ? totalTicksPerBar : 4) * 40}px`; // 40px accounts for div width and margins

        for (let i = 0; i < totalTicksPerBar; i++) {
            let light = document.createElement('div');
            container.appendChild(light);
        }
    }


    updateLights(currentTick) {
        const lights = document.querySelectorAll('#lightContainer div');
        lights.forEach((light, index) => {
            light.className = ''; // Reset class
            if (index === currentTick) {
                light.classList.add(index === 0 ? 'first-beat' : 'active');
            }
        });
    }


    updateHint() {
        const barsInput = document.getElementById("bars").value.trim();
        const minutesInput = document.getElementById("minutes").value.trim();
        const secondsInput = document.getElementById("seconds").value.trim();
        const bpmInput = document.getElementById("bpm").value.trim();
        const timeInput = minutesInput || secondsInput;

        let hintMessage = "";
        const hintContainer = document.getElementById("hint");

        if (bpmInput && !barsInput && !timeInput) {
            hintMessage = "A) Please enter the number of bars to calculate song duration, or " +
                "B) enter minutes and/or seconds to calculate how many bars the song has.";
        } else if (barsInput && !bpmInput && !timeInput) {
            hintMessage = "A) Please enter the BPM to calculate song duration, or " +
                "B) enter minutes and/or seconds to calculate the tempo of the song (BPM).";
        } else if (timeInput && !barsInput && !bpmInput) {
            hintMessage = "A) Please enter the number of bars to calculate the BPM, or " +
                "B) enter the BPM to calculate how many bars the song has.";
        } else {
            hintContainer.style.display = "none";
            return;  // Exit the function if no hint is needed.
        }

        // Display the hint message only if one of the conditions is true
        hintContainer.textContent = hintMessage;
        hintContainer.style.display = "block";
    }

}

new Metronome(); // Instantiates the Metronome class
