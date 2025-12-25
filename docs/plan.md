# Pitch Jump

A game that teaches perfect pitch the way Mario Teaches Typing taught typing.

---

## Core Mechanic

1. Character walks right
2. Character stops in front of enemy
3. Note plays
4. Game waits (no timer)
5. Player presses a key on piano/MIDI keyboard
6. **Correct** → Character jumps over enemy → Walks to next enemy
7. **Wrong** → Note replays → Wait for correct key

No lives. No fail state. No time pressure. The game is infinitely patient.

---

## Input

**Primary:** MIDI keyboard (or acoustic piano with MIDI adapter)

**Fallback:** On-screen software keyboard (for travel, no piano available)

**Toggle:** Parent setting, not visible to child

---

## Visual Design

**Enemies are colored blobs matching standard note colors:**

| Note | Color  | Enemy |
|------|--------|-------|
| C    | Red    | Red blob |
| D    | Orange | Orange blob |
| E    | Yellow | Yellow blob |
| F    | Green  | Green blob |
| G    | Blue   | Blue blob |
| A    | Purple | Purple blob |
| B    | Pink   | Pink blob |

Piano keys have matching colored stickers. Kid sees red blob, hears C, looks for red sticker, presses key.

Over time: color recognition becomes optional. They just hear it.

**Character:** Simple. Doesn't matter. A dot, a cat, whatever. Not the point.

**World:** Flat ground, scrolling background. Minimal. No distractions.

---

## Progression

### World 1: C Only
- Every enemy is red
- Every note is C
- Player is just learning: hear note → find key → press
- ~10 enemies to clear the world

### World 2: C and G
- Red and blue enemies
- Two notes to distinguish
- First real pitch discrimination

### World 3: C, E, G
- Three enemies, three notes
- Major triad

### World 4: C, D, E, F, G
- Five-finger position
- Real variety now

### World 5: Full Octave
- All seven notes
- C to B

### World 6+: Reinforcement
- Mixed review
- Longer sequences
- Optional: tempo increases (enemies spaced closer)

---

## Audio

**Instrument:** Piano (acoustic grand sample)

**Note plays:**
- When character stops in front of enemy
- On wrong key press (replays correct note, not the wrong one)
- Clear, prominent, isolated

**Feedback sounds:**
- Correct: Satisfying jump sound (not a note—avoid confusion)
- Wrong: Soft thud. Neutral. Not punishing.

**No background music during gameplay.** Ear needs silence to focus on the note.

Background music OK on menus, world complete screens.

---

## Session Structure

**No forced session length.** 

Kid plays until they stop. Could be 2 minutes, could be 20.

**World = natural checkpoint.** Completing a world is a good stopping point.

**Progress saves automatically.** Pick up where you left off.

---

## Parent Controls

Accessed via settings (not visible during gameplay):

- **Input toggle:** MIDI / Software keyboard
- **Current world:** Can unlock or re-lock worlds manually
- **Stats view:** Accuracy per note, total enemies cleared, time played
- **Reset progress:** Start over

No daily limits. No notifications. No gamification of the parent.

---

## What We're NOT Building (for now)

- Timer/speed modes
- Lives/fail states
- Multiple characters or skins
- Story or cutscenes
- Achievements or badges
- Multiplayer
- Sharps and flats
- Multiple octaves
- Microphone input (pitch detection for singing)

These can all come later. They are not the core.

---

## Technical Notes

**Latency:** MIDI input to jump animation must be <50ms. This is critical. Sluggish response breaks the connection between press and action.

**Engine:** Whatever gets us a prototype fastest. Unity, Godot, or even a web app with Tone.js + Web MIDI API.

**Platform:** iPad first (most likely device). Mac secondary. 

**Offline:** Must work without internet. All assets bundled.

---

## Success Criteria

After consistent play:

- Week 2: Recognizes C reliably
- Week 4: Distinguishes C and G
- Week 6: Identifies C, E, G triad
- Week 10: Identifies 5+ notes
- Week 12+: Full octave recognition emerging

Test by playing random notes on piano away from the game. Can they name it? Find it? Sing it back?

---

## First Prototype

Just build World 1 and 2:

- Character (rectangle)
- Walks right
- Stops at enemy (colored circle)
- Note plays
- Waits for MIDI input
- Correct = jump, continue
- Wrong = replay note
- Clear world after 20 enemies

If that's fun and works, we build the rest.

---

## Implementation Progress

### Completed (Prototype)

**Tech Stack:**
- Phaser 3 + TypeScript + Vite
- Web Audio API for sound synthesis
- Web MIDI API for keyboard input

**Core Game Loop:** ✅
- Player (blue blob) walks right automatically
- Stops at each enemy blob
- Note plays when arriving at enemy
- Waits for input (infinitely patient)
- Correct note → plays note + octave-higher jump sound → jumps over enemy
- Wrong note → soft thud → replays correct note → waits again
- Smooth camera follow

**Input Methods:** ✅
- MIDI keyboard (any octave, detects note name)
- On-screen piano keyboard with colored stickers
- Computer keyboard fallback (A-G keys)

**Visual Design:** ✅
- Colored blob enemies matching note colors (C=Red, D=Orange, etc.)
- Cute blob player character
- Sky blue background with grass ground
- Enemy wobble animation
- Jump animation with squash defeat effect

**Audio:** ✅
- Synthesized piano tones (Web Audio API)
- Note plays on enemy arrival
- Note plays on correct input
- Octave-higher note as jump sound (reinforces pitch)
- Soft thud on wrong input
- No background music during gameplay

**Worlds:** ✅
- World 1: C only (20 enemies)
- World 2: C and G (20 enemies)
- World 3: C, E, G (25 enemies)
- World 4: C, D, E, F, G (25 enemies)
- World 5: Full octave (30 enemies)
- World 6: Reinforcement (40 enemies)
- Auto-progression between worlds

**UI:** ✅
- Main menu with bouncing note blobs
- World title and progress counter
- Instruction text showing note color hint
- World complete screen

### Not Yet Implemented

- Progress saving (localStorage)
- Parent controls / settings screen
- Input toggle (MIDI vs software keyboard)
- Stats tracking (accuracy per note, time played)
- Real piano samples (currently synthesized)
- Remove hint text (color = note) - let the colors speak for themselves
- Better sprites (proper artwork instead of programmatic shapes)
- Custom levels via MIDI file upload (Vue UI to upload .mid file, parse note sequence, play as custom world)