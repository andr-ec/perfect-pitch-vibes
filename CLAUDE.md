# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pitch Jump is an educational game teaching perfect pitch recognition to children. Core mechanic: a character auto-walks toward colored note enemies, plays a tone, and the player must identify/play the correct note on a MIDI keyboard or on-screen piano. No fail states, infinite patience - the note replays until correctly identified.

## Commands

```bash
npm run dev          # Development server at localhost:8080 (with telemetry)
npm run build        # Production build to dist/
npm run dev-nolog    # Dev server without telemetry
npm run build-nolog  # Production build without telemetry
```

## Architecture

**Tech Stack:** Vue 3 + Phaser 3 + TypeScript + Vite

### Entry Flow
- `src/main.ts` → Vue app entry
- `src/App.vue` → Settings overlay (audio mode, MIDI device selection)
- `src/PhaserGame.vue` → Vue-Phaser bridge component
- `src/game/main.ts` → Phaser game configuration

### Game Scenes (`src/game/scenes/`)
Scene progression: Boot → Preloader → MainMenu → PitchJump → GameOver

- **PitchJump.ts** - Main gameplay loop (~150 lines, most complex scene)
- **MainMenu.ts** - World selection with decorative note blobs
- **GameOver.ts** - World completion screen

### Core Systems (`src/game/`)
- **AudioManager.ts** - Web Audio API synthesis (piano tones with harmonics), delegates to MidiOutput when enabled
- **MidiInput.ts** - Web MIDI API input handler, normalizes notes to single octave
- **MidiOutput.ts** - Sends MIDI notes to external devices
- **GameSettings.ts** - Singleton for persistent settings (localStorage key: `pitchJumpSettings`)
- **WorldConfig.ts** - 6 worlds with progressive note introduction (C only → full octave)
- **NoteDefinitions.ts** - MIDI note numbers, frequencies, and colors for all 12 chromatic notes

### Entities (`src/game/entities/`)
- **Player.ts** - Auto-walking character with 4-direction sprite animations
- **Enemy.ts** - Colored note blobs with wobble/hover animations

### UI (`src/game/ui/`)
- **OnScreenKeyboard.ts** - Piano keyboard with colored stickers matching note colors

### Vue-Phaser Communication
`EventBus.ts` provides an EventEmitter for cross-framework events (e.g., `'current-scene-ready'`)

## Audio Output Priority
1. Check `gameSettings.useMidiOutput()`
2. If MIDI enabled and devices available → `midiOutput.playNote()`
3. Otherwise → Web Audio API synthesis

## Key Design Decisions
- **No background music during gameplay** - Audio focus for pitch recognition
- **Latency critical** - Target <50ms for input response
- **Dual input support** - MIDI hardware primary, on-screen keyboard fallback
- **Color-coded notes** - Each of 12 chromatic notes has a distinct color defined in NoteDefinitions.ts
