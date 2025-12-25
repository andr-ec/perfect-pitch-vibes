// Pitch Jump - Main Game Scene
import { EventBus } from '../EventBus';
import { Scene, GameObjects } from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { audioManager } from '../AudioManager';
import { midiInput } from '../MidiInput';
import { NoteName, NOTES } from '../NoteDefinitions';
import { WorldConfig, getWorld, generateNoteSequence } from '../WorldConfig';
import { OnScreenKeyboard } from '../ui/OnScreenKeyboard';

enum GameState {
    INIT = 'init',
    WALKING = 'walking',
    WAITING_FOR_INPUT = 'waiting',
    JUMPING = 'jumping',
    WORLD_COMPLETE = 'world_complete',
}

export class PitchJump extends Scene {
    private player!: Player;
    private enemies: Enemy[] = [];
    private currentEnemyIndex: number = 0;
    private gameState: GameState = GameState.INIT;

    private worldConfig!: WorldConfig;
    private noteSequence: NoteName[] = [];

    private ground!: GameObjects.Rectangle;
    private worldText!: GameObjects.Text;
    private progressText!: GameObjects.Text;
    private instructionText!: GameObjects.Text;
    private onScreenKeyboard!: OnScreenKeyboard;

    private cameraOffset: number = 0;
    private readonly GROUND_Y = 450;  // Higher to make room for on-screen keyboard
    private readonly PLAYER_START_X = 150;
    private readonly ENEMY_SPACING = 300;
    private readonly ENEMY_START_X = 500;

    // Track current world number
    private currentWorldNumber: number = 1;

    constructor() {
        super('PitchJump');
    }

    init(data: { worldNumber?: number } = {}) {
        this.currentWorldNumber = data.worldNumber || 1;

        // Reset all state for scene restart
        this.enemies = [];
        this.currentEnemyIndex = 0;
        this.gameState = GameState.INIT;
        this.cameraOffset = 0;
        this.noteSequence = [];
    }

    async create() {
        // Initialize audio (needs user interaction first, but we prepare it)
        await audioManager.init();
        await midiInput.init();

        // Setup MIDI callback
        midiInput.setNoteCallback((note) => {
            this.handleNoteInput(note);
        });

        // Load world configuration
        this.worldConfig = getWorld(this.currentWorldNumber) || getWorld(1)!;
        this.noteSequence = generateNoteSequence(this.worldConfig);

        // Create game world
        this.createWorld();

        // Create player
        this.player = new Player(this, this.PLAYER_START_X, this.GROUND_Y - 30);

        // Create enemies based on note sequence
        this.createEnemies();

        // Create UI
        this.createUI();

        // Create on-screen keyboard (positioned below the ground)
        this.onScreenKeyboard = new OnScreenKeyboard(this, 520);
        this.onScreenKeyboard.setCallback((note) => {
            this.handleNoteInput(note);
        });

        // Start the game
        this.gameState = GameState.WALKING;

        // Emit ready event
        EventBus.emit('current-scene-ready', this);

        // Resume audio context on first interaction
        this.input.once('pointerdown', async () => {
            await audioManager.resume();
        });

        // Also allow keyboard to resume audio and act as fallback input
        this.input.keyboard?.on('keydown', async (event: KeyboardEvent) => {
            await audioManager.resume();
            this.handleKeyboardInput(event.key);
        });
    }

    private createWorld(): void {
        // Calculate world width based on enemy count (add extra padding at the end)
        const worldWidth = this.ENEMY_START_X + this.noteSequence.length * this.ENEMY_SPACING + 500;

        // Background image (tiled across the world width)
        const bgTileCount = Math.ceil(worldWidth / 1024);
        for (let i = 0; i < bgTileCount; i++) {
            const bg = this.add.image(512 + i * 1024, 384, 'music-bg');
            bg.setDisplaySize(1024, 768);
            bg.setDepth(-1);
        }

        // Ground (grass layer) - sized to fit all enemies
        this.ground = this.add.rectangle(
            worldWidth / 2,
            this.GROUND_Y + 25,
            worldWidth,
            50,
            0x7cba5f // Grass green
        );
        this.ground.setStrokeStyle(2, 0x5a8f4a);

        // Add some simple ground decoration (grass blades) across the entire world
        const grassCount = Math.ceil(worldWidth / 100);
        for (let i = 0; i < grassCount; i++) {
            const x = i * 100 + Math.random() * 50;
            const grassBlade = this.add.rectangle(
                x,
                this.GROUND_Y,
                3,
                10 + Math.random() * 8,
                0x5a8f4a
            );
            grassBlade.setOrigin(0.5, 1);
        }
    }

    private createEnemies(): void {
        this.enemies = [];
        this.currentEnemyIndex = 0;

        for (let i = 0; i < this.noteSequence.length; i++) {
            const x = this.ENEMY_START_X + i * this.ENEMY_SPACING;
            const enemy = new Enemy(
                this,
                x,
                this.GROUND_Y - 30,
                this.noteSequence[i]
            );
            this.enemies.push(enemy);
        }
    }

    private createUI(): void {
        // World title
        this.worldText = this.add.text(20, 20, this.worldConfig.name, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        });
        this.worldText.setScrollFactor(0);
        this.worldText.setDepth(100);

        // Progress counter
        this.progressText = this.add.text(20, 55, this.getProgressText(), {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        });
        this.progressText.setScrollFactor(0);
        this.progressText.setDepth(100);

        // Instruction text (shows when waiting for input)
        this.instructionText = this.add.text(
            512,
            200,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
                align: 'center',
            }
        );
        this.instructionText.setOrigin(0.5);
        this.instructionText.setScrollFactor(0);
        this.instructionText.setDepth(100);
        this.instructionText.setVisible(false);
    }

    private getProgressText(): string {
        return `${this.currentEnemyIndex} / ${this.noteSequence.length}`;
    }

    update(time: number, delta: number): void {
        // Don't update until fully initialized
        if (this.gameState === GameState.INIT || !this.player) {
            return;
        }

        if (this.gameState === GameState.WALKING) {
            this.player.update(delta);

            // Check if player reached next enemy
            const currentEnemy = this.enemies[this.currentEnemyIndex];
            if (currentEnemy && this.player.getX() >= currentEnemy.getX() - 80) {
                this.arriveAtEnemy(currentEnemy);
            }
        }

        // Update enemy wobble animations
        for (const enemy of this.enemies) {
            enemy.update(time);
        }

        // Always update camera smoothly (except when world complete)
        if (this.gameState !== GameState.WORLD_COMPLETE) {
            this.updateCamera();
        }
    }

    private updateCamera(): void {
        const targetX = this.player.getX() - 200;
        if (targetX > 0) {
            // Smooth lerp towards target
            this.cameraOffset += (targetX - this.cameraOffset) * 0.1;
            this.cameras.main.scrollX = this.cameraOffset;
        }
    }

    private arriveAtEnemy(enemy: Enemy): void {
        this.player.stopWalking();
        this.gameState = GameState.WAITING_FOR_INPUT;

        // Play the note
        audioManager.playNote(enemy.note);

        // Show instruction
        const noteData = NOTES[enemy.note];
        this.instructionText.setText(`Listen... What note is this?\n(${noteData.colorName} = ${enemy.note})`);
        this.instructionText.setVisible(true);
    }

    private handleNoteInput(note: NoteName): void {
        if (this.gameState !== GameState.WAITING_FOR_INPUT) return;

        const currentEnemy = this.enemies[this.currentEnemyIndex];
        if (!currentEnemy) return;

        if (note === currentEnemy.note) {
            // Correct!
            this.onCorrectNote(currentEnemy);
        } else {
            // Wrong - replay the note
            this.onWrongNote(currentEnemy);
        }
    }

    private handleKeyboardInput(key: string): void {
        // Fallback keyboard input (A-G keys)
        const keyMap: Record<string, NoteName> = {
            'a': 'A', 'A': 'A',
            'b': 'B', 'B': 'B',
            'c': 'C', 'C': 'C',
            'd': 'D', 'D': 'D',
            'e': 'E', 'E': 'E',
            'f': 'F', 'F': 'F',
            'g': 'G', 'G': 'G',
        };

        const note = keyMap[key];
        if (note) {
            this.handleNoteInput(note);
        }
    }

    private onCorrectNote(enemy: Enemy): void {
        this.gameState = GameState.JUMPING;
        this.instructionText.setVisible(false);

        // Play the note the player pressed, then the octave-higher jump sound
        audioManager.playNote(enemy.note, 0.5);
        this.time.delayedCall(150, () => {
            audioManager.playJumpNote(enemy.note);
        });

        // Jump over enemy
        this.player.jump(() => {
            // Defeat enemy
            enemy.defeat();

            // Move to next enemy
            this.currentEnemyIndex++;
            this.progressText.setText(this.getProgressText());

            // Check if world complete
            if (this.currentEnemyIndex >= this.enemies.length) {
                this.onWorldComplete();
            } else {
                this.gameState = GameState.WALKING;
            }
        });
    }

    private onWrongNote(enemy: Enemy): void {
        // Play wrong sound (soft thud)
        audioManager.playWrongSound();

        // Replay the correct note after a short delay
        this.time.delayedCall(300, () => {
            audioManager.playNote(enemy.note);
        });

        // Visual feedback - shake the instruction text slightly
        this.tweens.add({
            targets: this.instructionText,
            x: this.instructionText.x + 5,
            duration: 50,
            yoyo: true,
            repeat: 3,
        });
    }

    private onWorldComplete(): void {
        this.gameState = GameState.WORLD_COMPLETE;

        // Show completion message
        const completeText = this.add.text(
            512,
            300,
            `${this.worldConfig.name}\nComplete!`,
            {
                fontFamily: 'Arial Black',
                fontSize: '48px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center',
            }
        );
        completeText.setOrigin(0.5);
        completeText.setScrollFactor(0);
        completeText.setDepth(100);

        // Continue prompt
        const continueText = this.add.text(
            512,
            450,
            'Press any key to continue...',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center',
            }
        );
        continueText.setOrigin(0.5);
        continueText.setScrollFactor(0);
        continueText.setDepth(100);

        // Wait for input to go to next world or back to menu
        this.input.keyboard?.once('keydown', () => {
            this.goToNextWorld();
        });
        this.input.once('pointerdown', () => {
            this.goToNextWorld();
        });
    }

    private goToNextWorld(): void {
        const nextWorldNumber = this.currentWorldNumber + 1;
        const nextWorld = getWorld(nextWorldNumber);

        if (nextWorld) {
            // Go to next world
            this.scene.restart({ worldNumber: nextWorldNumber });
        } else {
            // All worlds complete - back to menu
            this.scene.start('MainMenu');
        }
    }

    // Public method to change scene (called from Vue)
    changeScene(): void {
        this.scene.start('MainMenu');
    }

    // Cleanup
    shutdown(): void {
        midiInput.clearCallback();
        if (this.onScreenKeyboard) {
            this.onScreenKeyboard.clearCallback();
            this.onScreenKeyboard.destroy();
        }
    }
}
