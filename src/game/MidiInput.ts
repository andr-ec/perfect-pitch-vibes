// MIDI Input Handler for Pitch Jump
// Uses Web MIDI API to receive input from MIDI keyboards

import { getNoteNameFromMidi, NoteName } from './NoteDefinitions';

export type MidiNoteCallback = (note: NoteName, midiNote: number, velocity: number) => void;

export class MidiInput {
    private midiAccess: MIDIAccess | null = null;
    private isInitialized = false;
    private onNoteCallback: MidiNoteCallback | null = null;
    private connectedDevices: string[] = [];

    async init(): Promise<boolean> {
        if (this.isInitialized) return true;

        if (!navigator.requestMIDIAccess) {
            console.warn('Web MIDI API not supported in this browser');
            return false;
        }

        try {
            this.midiAccess = await navigator.requestMIDIAccess();
            this.setupInputs();

            // Listen for device connections/disconnections
            this.midiAccess.onstatechange = () => {
                this.setupInputs();
            };

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to access MIDI devices:', error);
            return false;
        }
    }

    private setupInputs(): void {
        if (!this.midiAccess) return;

        this.connectedDevices = [];

        this.midiAccess.inputs.forEach((input) => {
            this.connectedDevices.push(input.name || 'Unknown Device');
            input.onmidimessage = (event) => this.handleMidiMessage(event);
        });

        if (this.connectedDevices.length > 0) {
            console.log('MIDI devices connected:', this.connectedDevices);
        }
    }

    private handleMidiMessage(event: MIDIMessageEvent): void {
        const [status, midiNote, velocity] = event.data as Uint8Array;

        // Note On message (status 144-159 for channels 1-16)
        // velocity > 0 means note pressed, velocity = 0 means note released
        if (status >= 144 && status <= 159 && velocity > 0) {
            const noteName = getNoteNameFromMidi(midiNote);

            if (noteName && this.onNoteCallback) {
                this.onNoteCallback(noteName, midiNote, velocity);
            }
        }
    }

    setNoteCallback(callback: MidiNoteCallback): void {
        this.onNoteCallback = callback;
    }

    clearCallback(): void {
        this.onNoteCallback = null;
    }

    getConnectedDevices(): string[] {
        return [...this.connectedDevices];
    }

    hasDevices(): boolean {
        return this.connectedDevices.length > 0;
    }

    isSupported(): boolean {
        return !!navigator.requestMIDIAccess;
    }
}

// Singleton instance
export const midiInput = new MidiInput();
