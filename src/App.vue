<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PhaserGame from './PhaserGame.vue';
import { gameSettings, AudioOutputMode } from './game/GameSettings';
import { midiOutput } from './game/MidiOutput';

const showSettings = ref(false);
const audioMode = ref<AudioOutputMode>(gameSettings.getAudioOutputMode());
const midiOutputs = ref<{ name: string; id: string }[]>([]);
const selectedMidiOutput = ref<string | null>(gameSettings.getSelectedMidiOutputName());

onMounted(async () => {
    await midiOutput.init();
    midiOutputs.value = midiOutput.getAvailableOutputs();
    if (!selectedMidiOutput.value && midiOutputs.value.length > 0) {
        selectedMidiOutput.value = midiOutputs.value[0].name;
    }
});

function toggleSettings() {
    showSettings.value = !showSettings.value;
    // Refresh MIDI outputs when opening settings
    if (showSettings.value) {
        midiOutputs.value = midiOutput.getAvailableOutputs();
    }
}

function setAudioMode(mode: AudioOutputMode) {
    audioMode.value = mode;
    gameSettings.setAudioOutputMode(mode);
}

function selectMidiOutput(name: string) {
    selectedMidiOutput.value = name;
    gameSettings.setSelectedMidiOutputName(name);
    midiOutput.selectOutputByName(name);
}
</script>

<template>
    <div class="app-container">
        <PhaserGame />

        <!-- Settings button -->
        <button class="settings-button" @click="toggleSettings" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        </button>

        <!-- Settings panel -->
        <div v-if="showSettings" class="settings-overlay" @click.self="toggleSettings">
            <div class="settings-panel">
                <h2>Settings</h2>

                <div class="setting-group">
                    <h3>Audio Output</h3>
                    <p class="setting-description">Choose how notes are played when you encounter an enemy.</p>

                    <div class="toggle-buttons">
                        <button
                            :class="{ active: audioMode === 'browser' }"
                            @click="setAudioMode('browser')"
                        >
                            Browser Audio
                        </button>
                        <button
                            :class="{ active: audioMode === 'midi' }"
                            @click="setAudioMode('midi')"
                            :disabled="midiOutputs.length === 0"
                        >
                            MIDI Output
                        </button>
                    </div>

                    <p v-if="audioMode === 'browser'" class="mode-info">
                        Notes play through your speakers using synthesized piano sounds.
                    </p>
                    <p v-else class="mode-info">
                        Notes are sent to your MIDI device (piano/synthesizer) to play.
                    </p>
                </div>

                <div v-if="audioMode === 'midi'" class="setting-group">
                    <h3>MIDI Device</h3>
                    <div v-if="midiOutputs.length > 0" class="midi-devices">
                        <button
                            v-for="output in midiOutputs"
                            :key="output.id"
                            :class="{ active: selectedMidiOutput === output.name }"
                            @click="selectMidiOutput(output.name)"
                        >
                            {{ output.name }}
                        </button>
                    </div>
                    <p v-else class="no-devices">
                        No MIDI output devices found. Connect a MIDI device and reopen settings.
                    </p>
                </div>

                <button class="close-button" @click="toggleSettings">Close</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.app-container {
    position: relative;
}

.settings-button {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 100;
}

.settings-button:hover {
    background: rgba(0, 0, 0, 0.7);
    border-color: rgba(255, 255, 255, 0.5);
}

.settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
}

.settings-panel {
    background: #2a3f5f;
    border-radius: 12px;
    padding: 24px;
    min-width: 350px;
    max-width: 90%;
    color: white;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.settings-panel h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
    text-align: center;
}

.setting-group {
    margin-bottom: 24px;
}

.setting-group h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #a0c4ff;
}

.setting-description {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #ccc;
}

.toggle-buttons {
    display: flex;
    gap: 8px;
}

.toggle-buttons button,
.midi-devices button {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #4a6fa5;
    background: #1a2a3f;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.toggle-buttons button:hover:not(:disabled),
.midi-devices button:hover {
    background: #2a4a6f;
}

.toggle-buttons button.active,
.midi-devices button.active {
    background: #4a90d9;
    border-color: #6ab0ff;
}

.toggle-buttons button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.midi-devices {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.mode-info {
    margin: 12px 0 0 0;
    font-size: 13px;
    color: #aaa;
    font-style: italic;
}

.no-devices {
    color: #f0a0a0;
    font-size: 14px;
    margin: 8px 0;
}

.close-button {
    width: 100%;
    padding: 12px;
    background: #4a6fa5;
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
}

.close-button:hover {
    background: #5a8fc5;
}
</style>
