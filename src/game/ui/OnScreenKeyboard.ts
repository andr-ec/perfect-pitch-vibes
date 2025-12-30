// On-screen piano keyboard for fallback input
import { Scene, GameObjects } from 'phaser';
import { NoteName, NOTE_NAMES, AllNoteName } from '../NoteDefinitions';

export type KeyPressCallback = (note: AllNoteName) => void;

interface KeyElements {
    bg: GameObjects.Rectangle;
    sticker: GameObjects.Image;
    label: GameObjects.Text;
}

export class OnScreenKeyboard {
    private scene: Scene;
    private keys: Map<NoteName, KeyElements> = new Map();
    private allElements: (GameObjects.Rectangle | GameObjects.Image | GameObjects.Text)[] = [];
    private onKeyPress: KeyPressCallback | null = null;
    private isVisible: boolean = true;
    private y: number;

    private readonly WHITE_KEY_WIDTH = 80;
    private readonly WHITE_KEY_HEIGHT = 140;
    private readonly BLACK_KEY_WIDTH = 50;
    private readonly BLACK_KEY_HEIGHT = 85;
    private readonly KEY_SPACING = 4;

    constructor(scene: Scene, y: number = 700) {
        this.scene = scene;
        this.y = y;
        this.createKeys();
    }

    private createKeys(): void {
        // Calculate total width and center position
        const totalWidth = NOTE_NAMES.length * (this.WHITE_KEY_WIDTH + this.KEY_SPACING) - this.KEY_SPACING;
        const startX = 512 - totalWidth / 2;

        // Create white keys first (so black keys appear on top)
        NOTE_NAMES.forEach((note, index) => {
            const x = startX + index * (this.WHITE_KEY_WIDTH + this.KEY_SPACING);
            this.createWhiteKey(note, x);
        });

        // Create black keys (sharps) between appropriate white keys
        // Piano pattern: C C# D D# E F F# G G# A A# B
        // Sharps after: C, D, F, G, A (not after E or B)
        const sharps: { whiteKeyIndex: number; note: AllNoteName }[] = [
            { whiteKeyIndex: 0, note: 'C#' },
            { whiteKeyIndex: 1, note: 'D#' },
            { whiteKeyIndex: 3, note: 'F#' },
            { whiteKeyIndex: 4, note: 'G#' },
            { whiteKeyIndex: 5, note: 'A#' },
        ];

        sharps.forEach(({ whiteKeyIndex, note }) => {
            const x = startX + whiteKeyIndex * (this.WHITE_KEY_WIDTH + this.KEY_SPACING) + this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2 + this.KEY_SPACING / 2;
            this.createBlackKey(x, note);
        });
    }

    private createWhiteKey(note: NoteName, x: number): void {
        // Key background (white key)
        const keyBg = this.scene.add.rectangle(
            x + this.WHITE_KEY_WIDTH / 2,
            this.y + this.WHITE_KEY_HEIGHT / 2,
            this.WHITE_KEY_WIDTH,
            this.WHITE_KEY_HEIGHT,
            0xffffff
        );
        keyBg.setStrokeStyle(2, 0x333333);
        keyBg.setScrollFactor(0);
        keyBg.setDepth(200);
        keyBg.setInteractive({ useHandCursor: true });

        // Enemy sprite sticker on the key
        const sticker = this.scene.add.image(
            x + this.WHITE_KEY_WIDTH / 2,
            this.y + this.WHITE_KEY_HEIGHT - 35,
            `enemy-${note}`
        );
        sticker.setScale(0.2);
        sticker.setScrollFactor(0);
        sticker.setDepth(201);

        // Note label
        const label = this.scene.add.text(
            x + this.WHITE_KEY_WIDTH / 2,
            this.y + this.WHITE_KEY_HEIGHT - 35,
            note,
            {
                fontFamily: 'Arial Black',
                fontSize: '20px',
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

    private createBlackKey(x: number, note: AllNoteName): void {
        // Black key (sharp) - interactive
        const blackKey = this.scene.add.rectangle(
            x + this.BLACK_KEY_WIDTH / 2,
            this.y + this.BLACK_KEY_HEIGHT / 2,
            this.BLACK_KEY_WIDTH,
            this.BLACK_KEY_HEIGHT,
            0x222222
        );
        blackKey.setStrokeStyle(2, 0x000000);
        blackKey.setScrollFactor(0);
        blackKey.setDepth(210); // Above white keys
        blackKey.setInteractive({ useHandCursor: true });

        // Input handlers
        blackKey.on('pointerdown', () => {
            this.pressKey(note);
            blackKey.setFillStyle(0x444444);
        });

        blackKey.on('pointerup', () => {
            blackKey.setFillStyle(0x222222);
        });

        blackKey.on('pointerout', () => {
            blackKey.setFillStyle(0x222222);
        });

        this.allElements.push(blackKey);
    }

    private pressKey(note: AllNoteName): void {
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
