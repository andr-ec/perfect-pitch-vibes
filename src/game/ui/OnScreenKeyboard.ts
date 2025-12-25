// On-screen piano keyboard for fallback input
import { Scene, GameObjects } from 'phaser';
import { NOTES, NoteName, NOTE_NAMES } from '../NoteDefinitions';

const { Rectangle, Ellipse, Text } = GameObjects;

export type KeyPressCallback = (note: NoteName) => void;

export class OnScreenKeyboard {
    private scene: Scene;
    private container: GameObjects.Container;
    private keys: Map<NoteName, GameObjects.Container> = new Map();
    private onKeyPress: KeyPressCallback | null = null;
    private isVisible: boolean = true;

    private readonly KEY_WIDTH = 80;
    private readonly KEY_HEIGHT = 120;
    private readonly KEY_SPACING = 8;
    private readonly START_X = 512 - (7 * 88) / 2; // Center the keyboard

    constructor(scene: Scene, y: number = 700) {
        this.scene = scene;
        this.container = scene.add.container(0, y);
        this.container.setScrollFactor(0);
        this.container.setDepth(200);

        this.createKeys();
    }

    private createKeys(): void {
        NOTE_NAMES.forEach((note, index) => {
            const x = this.START_X + index * (this.KEY_WIDTH + this.KEY_SPACING);
            const keyContainer = this.createKey(note, x);
            this.keys.set(note, keyContainer);
            this.container.add(keyContainer);
        });
    }

    private createKey(note: NoteName, x: number): GameObjects.Container {
        const noteData = NOTES[note];
        const keyContainer = this.scene.add.container(x, 0);

        // Key background (white key)
        const keyBg = new Rectangle(this.scene, 0, 0, this.KEY_WIDTH, this.KEY_HEIGHT, 0xffffff);
        keyBg.setOrigin(0, 0);
        keyBg.setStrokeStyle(2, 0x333333);
        keyBg.setInteractive({ useHandCursor: true });

        // Color sticker on the key
        const sticker = new Ellipse(this.scene, this.KEY_WIDTH / 2, this.KEY_HEIGHT - 30, 50, 50, noteData.color);
        sticker.setStrokeStyle(3, this.darkenColor(noteData.color, 0.3));

        // Note label
        const label = new Text(this.scene, this.KEY_WIDTH / 2, this.KEY_HEIGHT - 30, note, {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        });
        label.setOrigin(0.5);

        keyContainer.add([keyBg, sticker, label]);

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

        return keyContainer;
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

    setCallback(callback: KeyPressCallback): void {
        this.onKeyPress = callback;
    }

    clearCallback(): void {
        this.onKeyPress = null;
    }

    show(): void {
        this.isVisible = true;
        this.container.setVisible(true);
    }

    hide(): void {
        this.isVisible = false;
        this.container.setVisible(false);
    }

    toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    destroy(): void {
        this.container.destroy();
    }
}
