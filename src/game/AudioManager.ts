// Audio Manager for Pitch Jump
// Synthesizes piano-like tones using Web Audio API
// Can also delegate to MIDI output based on settings

import { NOTES, NoteName, AllNoteName } from './NoteDefinitions';
import { gameSettings } from './GameSettings';
import { midiOutput } from './MidiOutput';

export class AudioManager {
    private audioContext: AudioContext | null = null;
    private isInitialized = false;

    async init(): Promise<void> {
        if (this.isInitialized) return;

        // Create audio context (requires user interaction first)
        this.audioContext = new AudioContext();

        // Initialize MIDI output as well
        await midiOutput.init();

        // Restore selected MIDI output from settings
        const savedOutput = gameSettings.getSelectedMidiOutputName();
        if (savedOutput) {
            midiOutput.selectOutputByName(savedOutput);
        }

        this.isInitialized = true;
    }

    // Resume audio context after user interaction
    async resume(): Promise<void> {
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Play a piano-like note
    playNote(noteName: NoteName | AllNoteName, duration: number = 1.5): void {
        // Check if we should use MIDI output instead
        if (gameSettings.useMidiOutput() && midiOutput.hasOutputs()) {
            midiOutput.playNote(noteName, duration * 1000); // Convert to ms
            return;
        }

        if (!this.audioContext) {
            console.warn('AudioManager not initialized');
            return;
        }

        const note = NOTES[noteName];
        if (!note) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create oscillators for a richer piano-like sound
        const fundamental = ctx.createOscillator();
        const harmonic2 = ctx.createOscillator();
        const harmonic3 = ctx.createOscillator();

        // Gain nodes for each oscillator
        const fundGain = ctx.createGain();
        const harm2Gain = ctx.createGain();
        const harm3Gain = ctx.createGain();

        // Master gain with envelope
        const masterGain = ctx.createGain();

        // Set frequencies (fundamental + harmonics for piano-like timbre)
        fundamental.frequency.value = note.frequency;
        harmonic2.frequency.value = note.frequency * 2;
        harmonic3.frequency.value = note.frequency * 3;

        // Use sine waves for cleaner sound
        fundamental.type = 'sine';
        harmonic2.type = 'sine';
        harmonic3.type = 'sine';

        // Set harmonic levels (fundamental loudest)
        fundGain.gain.value = 0.5;
        harm2Gain.gain.value = 0.15;
        harm3Gain.gain.value = 0.05;

        // Connect oscillators through their gain nodes
        fundamental.connect(fundGain);
        harmonic2.connect(harm2Gain);
        harmonic3.connect(harm3Gain);

        // Connect to master gain
        fundGain.connect(masterGain);
        harm2Gain.connect(masterGain);
        harm3Gain.connect(masterGain);

        // Connect to output
        masterGain.connect(ctx.destination);

        // Piano-like envelope: quick attack, gradual decay
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.7, now + 0.01);  // Quick attack
        masterGain.gain.exponentialRampToValueAtTime(0.3, now + 0.1);  // Initial decay
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + duration);  // Sustain decay

        // Start and stop
        fundamental.start(now);
        harmonic2.start(now);
        harmonic3.start(now);

        fundamental.stop(now + duration);
        harmonic2.stop(now + duration);
        harmonic3.stop(now + duration);
    }

    // Play the note one octave higher (for jump sound)
    playJumpNote(noteName: NoteName): void {
        // Check if we should use MIDI output instead
        if (gameSettings.useMidiOutput() && midiOutput.hasOutputs()) {
            midiOutput.playJumpNote(noteName);
            return;
        }

        if (!this.audioContext) return;

        const note = NOTES[noteName];
        if (!note) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const duration = 0.4;

        // Play the same note one octave higher (double the frequency)
        const frequency = note.frequency * 2;

        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const gain2 = ctx.createGain();
        const masterGain = ctx.createGain();

        osc.frequency.value = frequency;
        osc2.frequency.value = frequency * 2; // Add second harmonic
        osc.type = 'sine';
        osc2.type = 'sine';

        gain.gain.value = 0.4;
        gain2.gain.value = 0.1;

        osc.connect(gain);
        osc2.connect(gain2);
        gain.connect(masterGain);
        gain2.connect(masterGain);
        masterGain.connect(ctx.destination);

        // Bright, short envelope
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.5, now + 0.02);
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + duration);
        osc2.stop(now + duration);
    }

    // Play a soft "wrong" thud (neutral, not punishing)
    playWrongSound(): void {
        if (!this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.1);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }
}

// Singleton instance
export const audioManager = new AudioManager();
