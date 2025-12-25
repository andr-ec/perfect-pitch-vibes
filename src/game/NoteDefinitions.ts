// Note definitions with colors matching standard note colors
// Used by piano stickers and blob enemies

export interface NoteDefinition {
    note: string;
    midiNote: number;  // Middle octave (C4 = 60)
    color: number;     // Hex color
    colorName: string;
    frequency: number; // Hz for audio synthesis
}

export const NOTES: Record<string, NoteDefinition> = {
    C: { note: 'C', midiNote: 60, color: 0xff0000, colorName: 'Red', frequency: 261.63 },
    'C#': { note: 'C#', midiNote: 61, color: 0x333333, colorName: 'Black', frequency: 277.18 },
    D: { note: 'D', midiNote: 62, color: 0xff8c00, colorName: 'Orange', frequency: 293.66 },
    'D#': { note: 'D#', midiNote: 63, color: 0x333333, colorName: 'Black', frequency: 311.13 },
    E: { note: 'E', midiNote: 64, color: 0xffff00, colorName: 'Yellow', frequency: 329.63 },
    F: { note: 'F', midiNote: 65, color: 0x00ff00, colorName: 'Green', frequency: 349.23 },
    'F#': { note: 'F#', midiNote: 66, color: 0x333333, colorName: 'Black', frequency: 369.99 },
    G: { note: 'G', midiNote: 67, color: 0x0000ff, colorName: 'Blue', frequency: 392.00 },
    'G#': { note: 'G#', midiNote: 68, color: 0x333333, colorName: 'Black', frequency: 415.30 },
    A: { note: 'A', midiNote: 69, color: 0x8b00ff, colorName: 'Purple', frequency: 440.00 },
    'A#': { note: 'A#', midiNote: 70, color: 0x333333, colorName: 'Black', frequency: 466.16 },
    B: { note: 'B', midiNote: 71, color: 0xff69b4, colorName: 'Pink', frequency: 493.88 },
};

export const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export type NoteName = typeof NOTE_NAMES[number];

export const ALL_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type AllNoteName = typeof ALL_NOTE_NAMES[number];

// Get note name from MIDI note number (handles any octave)
export function getNoteNameFromMidi(midiNote: number): NoteName | null {
    const noteIndex = midiNote % 12;
    const mapping: Record<number, NoteName> = {
        0: 'C',
        2: 'D',
        4: 'E',
        5: 'F',
        7: 'G',
        9: 'A',
        11: 'B',
    };
    return mapping[noteIndex] || null;
}

// Check if a MIDI note matches the expected note (any octave)
export function midiNoteMatches(midiNote: number, expectedNote: NoteName): boolean {
    return getNoteNameFromMidi(midiNote) === expectedNote;
}
