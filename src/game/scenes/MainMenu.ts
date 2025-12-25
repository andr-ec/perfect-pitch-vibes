import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { NOTES } from '../NoteDefinitions';
import { WORLDS } from '../WorldConfig';

const { Ellipse, Text } = GameObjects;

export class MainMenu extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    subtitle: GameObjects.Text;
    startButton: GameObjects.Container;
    noteBlobs: GameObjects.Container[] = [];
    selectedWorld: number = 1;
    worldButtons: GameObjects.Container[] = [];
    worldDescriptionText: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    create() {
        // Sky background
        this.cameras.main.setBackgroundColor(0x87ceeb);

        // Title
        this.title = this.add.text(512, 150, 'Pitch Jump', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle
        this.subtitle = this.add.text(512, 220, 'Learn perfect pitch by playing!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Animated note blobs decoration
        this.createNoteBlobs();

        // World selector
        this.createWorldSelector();

        // Start button
        this.createStartButton();

        // Instructions
        this.add.text(512, 700, 'Use MIDI keyboard or press A-G keys to play', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Press any key to start
        this.input.keyboard?.on('keydown', () => this.changeScene());

        EventBus.emit('current-scene-ready', this);
    }

    private createNoteBlobs(): void {
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
        const startX = 200;
        const spacing = 100;

        notes.forEach((note, index) => {
            const x = startX + index * spacing;
            const y = 400;
            const noteData = NOTES[note];

            const container = this.add.container(x, y);

            // Blob body
            const blob = new Ellipse(this, 0, 0, 50, 45, noteData.color);
            blob.setStrokeStyle(3, this.darkenColor(noteData.color, 0.3));

            // Highlight
            const highlight = new Ellipse(this, -8, -8, 15, 12, 0xffffff);
            highlight.setAlpha(0.4);

            // Eyes
            const eye1 = new Ellipse(this, -8, -3, 8, 10, 0xffffff);
            const eye2 = new Ellipse(this, 8, -3, 8, 10, 0xffffff);
            const pupil1 = new Ellipse(this, -9, -2, 4, 5, 0x000000);
            const pupil2 = new Ellipse(this, 7, -2, 4, 5, 0x000000);

            // Note label
            const label = new Text(this, 0, 35, note, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
            }).setOrigin(0.5);

            container.add([blob, highlight, eye1, eye2, pupil1, pupil2, label]);

            // Bounce animation with offset
            this.tweens.add({
                targets: container,
                y: y - 15,
                duration: 600 + index * 50,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: index * 100
            });

            this.noteBlobs.push(container);
        });
    }

    private createWorldSelector(): void {
        // Section label
        this.add.text(512, 480, 'Select World:', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Create world buttons
        const buttonWidth = 50;
        const buttonSpacing = 60;
        const totalWidth = WORLDS.length * buttonSpacing - (buttonSpacing - buttonWidth);
        const startX = 512 - totalWidth / 2 + buttonWidth / 2;

        WORLDS.forEach((world, index) => {
            const x = startX + index * buttonSpacing;
            const container = this.add.container(x, 520);

            // Button background
            const bg = this.add.rectangle(0, 0, buttonWidth, 40, 0x4a90d9);
            bg.setStrokeStyle(3, 0x2d5a87);

            // World number
            const text = this.add.text(0, 0, `${world.worldNumber}`, {
                fontFamily: 'Arial Bold',
                fontSize: '20px',
                color: '#ffffff',
            }).setOrigin(0.5);

            container.add([bg, text]);
            this.worldButtons.push(container);

            // Make interactive
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => {
                if (this.selectedWorld !== world.worldNumber) {
                    bg.setFillStyle(0x5aa0e9);
                }
            });
            bg.on('pointerout', () => {
                if (this.selectedWorld !== world.worldNumber) {
                    bg.setFillStyle(0x4a90d9);
                }
            });
            bg.on('pointerdown', () => {
                this.selectWorld(world.worldNumber);
            });
        });

        // World description text
        this.worldDescriptionText = this.add.text(512, 560, WORLDS[0].description, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Highlight first world by default
        this.updateWorldSelection();
    }

    private selectWorld(worldNumber: number): void {
        this.selectedWorld = worldNumber;
        this.updateWorldSelection();
    }

    private updateWorldSelection(): void {
        // Update button visuals
        this.worldButtons.forEach((container, index) => {
            const bg = container.list[0] as GameObjects.Rectangle;
            if (WORLDS[index].worldNumber === this.selectedWorld) {
                bg.setFillStyle(0x2ecc71); // Green for selected
                bg.setStrokeStyle(3, 0x27ae60);
            } else {
                bg.setFillStyle(0x4a90d9); // Blue for unselected
                bg.setStrokeStyle(3, 0x2d5a87);
            }
        });

        // Update description
        const world = WORLDS.find(w => w.worldNumber === this.selectedWorld);
        if (world && this.worldDescriptionText) {
            this.worldDescriptionText.setText(world.description);
        }
    }

    private createStartButton(): void {
        this.startButton = this.add.container(512, 620);

        // Button background
        const bg = this.add.rectangle(0, 0, 200, 60, 0x4a90d9);
        bg.setStrokeStyle(4, 0x2d5a87);

        // Button text
        const text = this.add.text(0, 0, 'Start Game', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
        }).setOrigin(0.5);

        this.startButton.add([bg, text]);

        // Hover effect
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => {
            bg.setFillStyle(0x5aa0e9);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0x4a90d9);
        });
        bg.on('pointerdown', () => this.changeScene());

        // Pulse animation
        this.tweens.add({
            targets: this.startButton,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    private darkenColor(color: number, amount: number): number {
        const r = Math.floor(((color >> 16) & 255) * (1 - amount));
        const g = Math.floor(((color >> 8) & 255) * (1 - amount));
        const b = Math.floor((color & 255) * (1 - amount));
        return (r << 16) | (g << 8) | b;
    }

    changeScene() {
        this.scene.start('PitchJump', { worldNumber: this.selectedWorld });
    }
}
