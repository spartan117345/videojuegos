// Web Audio API Sound System
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.enabled = true;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.musicPlaying = false;
        this.oscillators = [];
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);

            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            this.enabled = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    // Generate jump sound effect
    playJump() {
        if (!this.enabled) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Generate collision/death sound
    playDeath() {
        if (!this.enabled) return;

        const now = this.audioContext.currentTime;

        // Main explosion sound
        const noise = this.audioContext.createBufferSource();
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = noiseBuffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.5);

        // Low thump
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();

        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Score point sound
    playScore() {
        if (!this.enabled) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Power-up collect sound
    playPowerUp() {
        if (!this.enabled) return;

        const now = this.audioContext.currentTime;

        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.sfxGain);

            const startFreq = 400 + (i * 200);
            osc.frequency.setValueAtTime(startFreq, now + i * 0.05);
            osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + i * 0.05 + 0.1);

            gain.gain.setValueAtTime(0.15, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.1);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.1);
        }
    }

    // Achievement unlock sound
    playAchievement() {
        if (!this.enabled) return;

        const now = this.audioContext.currentTime;
        const frequencies = [523, 659, 784, 1047]; // C, E, G, C (major chord)

        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    }

    // Background music generator
    startMusic() {
        if (!this.enabled || this.musicPlaying) return;

        this.musicPlaying = true;
        this.playMusicLoop();
    }

    playMusicLoop() {
        if (!this.musicPlaying || !this.enabled) return;

        const now = this.audioContext.currentTime;
        const bpm = 260; // 2025 ULTRA SPEED - INSANE!
        const beatDuration = 60 / bpm;

        // 2025 ULTRA BASS - Dubstep-style wobble
        const bassPattern = [150, 200, 150, 250, 150, 200, 150, 300, 150, 200, 150, 250, 150, 200, 150, 350];
        bassPattern.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = 'sawtooth';
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            filter.Q.value = 10;

            // Wobble effect
            const lfo = this.audioContext.createOscillator();
            lfo.frequency.value = 6; // 6 Hz wobble
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 400;

            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now + i * beatDuration);
            gain.gain.linearRampToValueAtTime(0.15, now + i * beatDuration + 0.003);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * beatDuration + beatDuration * 0.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now + i * beatDuration);
            lfo.start(now + i * beatDuration);
            osc.stop(now + i * beatDuration + beatDuration);
            lfo.stop(now + i * beatDuration + beatDuration);
        });

        // 2025 ULTRA MELODY - Layered synths
        const melody = [800, 950, 1100, 950, 1200, 1100, 950, 1400, 800, 950, 1100, 950, 1200, 1100, 950, 1600];
        melody.forEach((freq, i) => {
            // Main synth
            const osc1 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();

            osc1.type = 'triangle';
            osc1.frequency.value = freq;

            gain1.gain.setValueAtTime(0, now + i * beatDuration);
            gain1.gain.linearRampToValueAtTime(0.08, now + i * beatDuration + 0.003);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + i * beatDuration + beatDuration * 0.5);

            osc1.connect(gain1);
            gain1.connect(this.musicGain);

            osc1.start(now + i * beatDuration);
            osc1.stop(now + i * beatDuration + beatDuration);

            // Harmony layer (fifth above)
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();

            osc2.type = 'sine';
            osc2.frequency.value = freq * 1.5; // Perfect fifth

            gain2.gain.setValueAtTime(0, now + i * beatDuration);
            gain2.gain.linearRampToValueAtTime(0.04, now + i * beatDuration + 0.003);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + i * beatDuration + beatDuration * 0.5);

            osc2.connect(gain2);
            gain2.connect(this.musicGain);

            osc2.start(now + i * beatDuration);
            osc2.stop(now + i * beatDuration + beatDuration);
        });

        // HEART-PUMPING DRUMS - Four-on-the-floor kick pattern
        for (let i = 0; i < 16; i++) {
            // Kick drum (every beat)
            const kickOsc = this.audioContext.createOscillator();
            const kickGain = this.audioContext.createGain();

            kickOsc.frequency.setValueAtTime(150, now + i * beatDuration);
            kickOsc.frequency.exponentialRampToValueAtTime(40, now + i * beatDuration + 0.05);

            kickGain.gain.setValueAtTime(0.3, now + i * beatDuration);
            kickGain.gain.exponentialRampToValueAtTime(0.01, now + i * beatDuration + 0.1);

            kickOsc.connect(kickGain);
            kickGain.connect(this.musicGain);

            kickOsc.start(now + i * beatDuration);
            kickOsc.stop(now + i * beatDuration + 0.1);

            // Snare drum (on 2 and 4 of every bar)
            if (i % 4 === 2) {
                const snare = this.audioContext.createBufferSource();
                const snareBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
                const data = snareBuffer.getChannelData(0);
                for (let j = 0; j < data.length; j++) {
                    data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (this.audioContext.sampleRate * 0.02));
                }
                snare.buffer = snareBuffer;

                const snareGain = this.audioContext.createGain();
                const snareFilter = this.audioContext.createBiquadFilter();
                snareFilter.type = 'highpass';
                snareFilter.frequency.value = 1000;

                snareGain.gain.setValueAtTime(0.15, now + i * beatDuration);
                snareGain.gain.exponentialRampToValueAtTime(0.01, now + i * beatDuration + 0.1);

                snare.connect(snareFilter);
                snareFilter.connect(snareGain);
                snareGain.connect(this.musicGain);

                snare.start(now + i * beatDuration);
            }

            // Hi-hat (every beat for driving rhythm)
            const hihat = this.audioContext.createBufferSource();
            const hihatBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.03, this.audioContext.sampleRate);
            const hihatData = hihatBuffer.getChannelData(0);
            for (let j = 0; j < hihatData.length; j++) {
                hihatData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (this.audioContext.sampleRate * 0.005));
            }
            hihat.buffer = hihatBuffer;

            const hihatGain = this.audioContext.createGain();
            const hihatFilter = this.audioContext.createBiquadFilter();
            hihatFilter.type = 'highpass';
            hihatFilter.frequency.value = 5000;

            hihatGain.gain.setValueAtTime(i % 2 === 0 ? 0.06 : 0.03, now + i * beatDuration); // Accent on even beats
            hihatGain.gain.exponentialRampToValueAtTime(0.01, now + i * beatDuration + 0.03);

            hihat.connect(hihatFilter);
            hihatFilter.connect(hihatGain);
            hihatGain.connect(this.musicGain);

            hihat.start(now + i * beatDuration);
        }

        // Schedule next loop - 16 beats now instead of 8
        setTimeout(() => this.playMusicLoop(), beatDuration * 16 * 1000);
    }

    stopMusic() {
        this.musicPlaying = false;
        this.oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        this.oscillators = [];
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.musicGain) {
            this.musicGain.gain.value = volume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
        if (this.sfxGain) {
            this.sfxGain.gain.value = volume;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopMusic();
        }
        return this.enabled;
    }
}

// Export singleton instance
const audioSystem = new AudioSystem();
