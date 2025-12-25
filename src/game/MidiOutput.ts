// MIDI Output Handler for Pitch Jump
// Sends notes to external MIDI devices (e.g., digital piano, synthesizer)

import { NOTES, NoteName } from './NoteDefinitions';

export class MidiOutput {
    private midiAccess: MIDIAccess | null = null;
    private isInitialized = false;
    private selectedOutput: MIDIOutput | null = null;
    private availableOutputs: MIDIOutput[] = [];

    async init(): Promise<boolean> {
        if (this.isInitialized) return true;

        if (!navigator.requestMIDIAccess) {
            console.warn('Web MIDI API not supported in this browser');
            return false;
        }

        try {
            this.midiAccess = await navigator.requestMIDIAccess();
            this.setupOutputs();

            // Listen for device connections/disconnections
            this.midiAccess.onstatechange = () => {
                this.setupOutputs();
            };

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to access MIDI devices:', error);
            return false;
        }
    }

    private setupOutputs(): void {
        if (!this.midiAccess) return;

        this.availableOutputs = [];

        this.midiAccess.outputs.forEach((output) => {
            this.availableOutputs.push(output);
        });

        // Auto-select first output if none selected
        if (!this.selectedOutput && this.availableOutputs.length > 0) {
            this.selectedOutput = this.availableOutputs[0];
        }
    }

    // Play a note on the MIDI output device
    playNote(noteName: NoteName, duration: number = 1500, velocity: number = 100): void {
        if (!this.selectedOutput) {
            console.warn('No MIDI output device selected');
            return;
        }

        const note = NOTES[noteName];
        if (!note) return;

        const midiNote = note.midiNote;
        const channel = 0; // Channel 1 (0-indexed)

        // Note On: 0x90 + channel, note, velocity
        const noteOnMessage = [0x90 + channel, midiNote, velocity];
        this.selectedOutput.send(noteOnMessage);

        // Schedule Note Off after duration
        setTimeout(() => {
            // Note Off: 0x80 + channel, note, velocity (or Note On with velocity 0)
            const noteOffMessage = [0x80 + channel, midiNote, 0];
            this.selectedOutput?.send(noteOffMessage);
        }, duration);
    }

    // Play the note one octave higher (for jump sound)
    playJumpNote(noteName: NoteName, velocity: number = 100): void {
        if (!this.selectedOutput) return;

        const note = NOTES[noteName];
        if (!note) return;

        // One octave higher = +12 semitones
        const midiNote = note.midiNote + 12;
        const channel = 0;
        const duration = 400;

        const noteOnMessage = [0x90 + channel, midiNote, velocity];
        this.selectedOutput.send(noteOnMessage);

        setTimeout(() => {
            const noteOffMessage = [0x80 + channel, midiNote, 0];
            this.selectedOutput?.send(noteOffMessage);
        }, duration);
    }

    // Select a specific output device by index
    selectOutput(index: number): boolean {
        if (index >= 0 && index < this.availableOutputs.length) {
            this.selectedOutput = this.availableOutputs[index];
            return true;
        }
        return false;
    }

    // Select output by name
    selectOutputByName(name: string): boolean {
        const output = this.availableOutputs.find(o => o.name === name);
        if (output) {
            this.selectedOutput = output;
            return true;
        }
        return false;
    }

    getAvailableOutputs(): { name: string; id: string }[] {
        return this.availableOutputs.map(o => ({
            name: o.name || 'Unknown Device',
            id: o.id,
        }));
    }

    getSelectedOutput(): string | null {
        return this.selectedOutput?.name || null;
    }

    hasOutputs(): boolean {
        return this.availableOutputs.length > 0;
    }

    isSupported(): boolean {
        return !!navigator.requestMIDIAccess;
    }
}

// Singleton instance
export const midiOutput = new MidiOutput();
