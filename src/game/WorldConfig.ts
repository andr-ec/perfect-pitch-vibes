// World configurations for Pitch Jump
// Each world introduces new notes progressively

import { NoteName } from './NoteDefinitions';

export interface WorldConfig {
    worldNumber: number;
    name: string;
    description: string;
    availableNotes: NoteName[];
    enemyCount: number;
    wildcardCount: number; // Number of wildcard enemies at the end
}

export const WORLDS: WorldConfig[] = [
    {
        worldNumber: 1,
        name: 'World 1: C Only',
        description: 'Learn to hear and find the note C',
        availableNotes: ['C'],
        enemyCount: 10,
        wildcardCount: 1,
    },
    {
        worldNumber: 2,
        name: 'World 2: C and G',
        description: 'Two notes - can you tell them apart?',
        availableNotes: ['C', 'G'],
        enemyCount: 20,
        wildcardCount: 2,
    },
    {
        worldNumber: 3,
        name: 'World 3: C, E, G',
        description: 'The major triad',
        availableNotes: ['C', 'E', 'G'],
        enemyCount: 25,
        wildcardCount: 3,
    },
    {
        worldNumber: 4,
        name: 'World 4: Five Fingers',
        description: 'C, D, E, F, G - the five-finger position',
        availableNotes: ['C', 'D', 'E', 'F', 'G'],
        enemyCount: 25,
        wildcardCount: 4,
    },
    {
        worldNumber: 5,
        name: 'World 5: Full Octave',
        description: 'All seven notes - C to B',
        availableNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        enemyCount: 30,
        wildcardCount: 5,
    },
    {
        worldNumber: 6,
        name: 'World 6: Reinforcement',
        description: 'Mixed review of all notes',
        availableNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        enemyCount: 40,
        wildcardCount: 6,
    },
];

export function getWorld(worldNumber: number): WorldConfig | undefined {
    return WORLDS.find(w => w.worldNumber === worldNumber);
}

export function getNextWorld(currentWorld: number): WorldConfig | undefined {
    return getWorld(currentWorld + 1);
}

export interface NoteEntry {
    note: NoteName;
    isWildcard: boolean;
}

// Generate a sequence of notes for a world (wildcards are part of the total enemyCount)
export function generateNoteSequence(world: WorldConfig): NoteEntry[] {
    const sequence: NoteEntry[] = [];
    const { availableNotes, enemyCount, wildcardCount } = world;
    const regularCount = enemyCount - wildcardCount;

    for (let i = 0; i < regularCount; i++) {
        // For world 1, all notes are the same
        if (availableNotes.length === 1) {
            sequence.push({ note: availableNotes[0], isWildcard: false });
        } else {
            // Random selection from available notes
            const randomIndex = Math.floor(Math.random() * availableNotes.length);
            sequence.push({ note: availableNotes[randomIndex], isWildcard: false });
        }
    }

    // Add wildcards at the end - random notes but displayed as white
    for (let i = 0; i < wildcardCount; i++) {
        const randomIndex = Math.floor(Math.random() * availableNotes.length);
        sequence.push({ note: availableNotes[randomIndex], isWildcard: true });
    }

    return sequence;
}
