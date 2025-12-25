// On-screen piano keyboard for fallback input
import { Scene, GameObjects } from 'phaser';
import { NOTES, NoteName, NOTE_NAMES } from '../NoteDefinitions';

export type KeyPressCallback = (note: NoteName) => void;

interface KeyElements {
    bg: GameObjects.Rectangle;
    sticker: GameObjects.Ellipse;
    label: GameObjects.Text;
}

export class OnScreenKeyboard {
    private scene: Scene;
    private keys: Map<NoteName, KeyElements> = new Map();
    private allElements: (GameObjects.Rectangle | GameObjects.Ellipse | GameObjects.Text)[] = [];
    private onKeyPress: KeyPressCallback | null = null;
    private isVisible: boolean = true;
    private y: number;

    private readonly KEY_WIDTH = 80;
    private readonly KEY_HEIGHT = 120;
    private readonly KEY_SPACING = 8;
    private readonly START_X = 512 - (7 * 88) / 2; // Center the keyboard

    constructor(scene: Scene, y: number = 700) {
        this.scene = scene;
        this.y = y;
        this.createKeys();
    }

    private createKeys(): void {
        NOTE_NAMES.forEach((note, index) => {
            const x = this.START_X + index * (this.KEY_WIDTH + this.KEY_SPACING);
            this.createKey(note, x);
        });
    }

    private createKey(note: NoteName, x: number): void {
        const noteData = NOTES[note];

        // Key background (white key) - add directly to scene, not container
        const keyBg = this.scene.add.rectangle(
            x + this.KEY_WIDTH / 2,
            this.y + this.KEY_HEIGHT / 2,
            this.KEY_WIDTH,
            this.KEY_HEIGHT,
            0xffffff
        );
        keyBg.setStrokeStyle(2, 0x333333);
        keyBg.setScrollFactor(0);
        keyBg.setDepth(200);
        keyBg.setInteractive({ useHandCursor: true });

        // Color sticker on the key
        const sticker = this.scene.add.ellipse(
            x + this.KEY_WIDTH / 2,
            this.y + this.KEY_HEIGHT - 30,
            50,
            50,
            noteData.color
        );
        sticker.setStrokeStyle(3, this.darkenColor(noteData.color, 0.3));
        sticker.setScrollFactor(0);
        sticker.setDepth(201);

        // Note label
        const label = this.scene.add.text(
            x + this.KEY_WIDTH / 2,
            this.y + this.KEY_HEIGHT - 30,
            note,
            {
                fontFamily: 'Arial Black',
                fontSize: '22px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
            }
        );
        label.setOrigin(0.5);
        label.setScrollFactor(0);
        label.setDepth(202);

        this.keys.set(note, { bg: keyBg, sticker, label });
        this.allElements.push(keyBg, sticker, label);

        // Input handlers
        keyBg.on('pointerdown', () => {
            this.pressKey(note);
            keyBg.setFillStyle(0xdddddd);
        });

        keyBg.on('pointerup', () => {
            keyBg.setFillStyle(0xffffff);
        });

        keyBg.on('pointerout', () => {
            keyBg.setFillStyle(0xffffff);
        });
    }

    private darkenColor(color: number, amount: number): number {
        const r = Math.floor(((color >> 16) & 255) * (1 - amount));
        const g = Math.floor(((color >> 8) & 255) * (1 - amount));
        const b = Math.floor((color & 255) * (1 - amount));
        return (r << 16) | (g << 8) | b;
    }

    private pressKey(note: NoteName): void {
        if (this.onKeyPress) {
            this.onKeyPress(note);
        }
    }

    // Visually highlight a key (called when any input method triggers a note)
    highlightKey(note: NoteName): void {
        const keyElements = this.keys.get(note);
        if (!keyElements) return;

        keyElements.bg.setFillStyle(0xaaffaa); // Light green flash

        this.scene.time.delayedCall(150, () => {
            keyElements.bg.setFillStyle(0xffffff);
        });
    }

    setCallback(callback: KeyPressCallback): void {
        this.onKeyPress = callback;
    }

    clearCallback(): void {
        this.onKeyPress = null;
    }

    show(): void {
        this.isVisible = true;
        this.allElements.forEach(el => el.setVisible(true));
    }

    hide(): void {
        this.isVisible = false;
        this.allElements.forEach(el => el.setVisible(false));
    }

    toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    destroy(): void {
        this.allElements.forEach(el => el.destroy());
        this.allElements = [];
        this.keys.clear();
    }
}
