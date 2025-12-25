// Game Settings for Pitch Jump
// Manages persistent settings including audio output mode

export type AudioOutputMode = 'browser' | 'midi';

export interface GameSettingsData {
    audioOutputMode: AudioOutputMode;
    selectedMidiOutputName: string | null;
}

const STORAGE_KEY = 'pitchJumpSettings';

const DEFAULT_SETTINGS: GameSettingsData = {
    audioOutputMode: 'browser',
    selectedMidiOutputName: null,
};

class GameSettings {
    private settings: GameSettingsData;

    constructor() {
        this.settings = this.load();
    }

    private load(): GameSettingsData {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load settings from localStorage:', e);
        }
        return { ...DEFAULT_SETTINGS };
    }

    private save(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings to localStorage:', e);
        }
    }

    getAudioOutputMode(): AudioOutputMode {
        return this.settings.audioOutputMode;
    }

    setAudioOutputMode(mode: AudioOutputMode): void {
        this.settings.audioOutputMode = mode;
        this.save();
    }

    getSelectedMidiOutputName(): string | null {
        return this.settings.selectedMidiOutputName;
    }

    setSelectedMidiOutputName(name: string | null): void {
        this.settings.selectedMidiOutputName = name;
        this.save();
    }

    // Convenience method to check if using MIDI output
    useMidiOutput(): boolean {
        return this.settings.audioOutputMode === 'midi';
    }
}

// Singleton instance
export const gameSettings = new GameSettings();
