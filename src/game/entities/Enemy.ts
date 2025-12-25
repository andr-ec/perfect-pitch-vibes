// Enemy entity - a colored blob that represents a note
import { Scene, GameObjects } from 'phaser';
import { NOTES, NoteName } from '../NoteDefinitions';

export class Enemy {
    private scene: Scene;
    private sprite: GameObjects.Graphics;

    public x: number;
    public y: number;
    public note: NoteName;
    public isActive: boolean = true;

    private color: number;
    private strokeColor: number;
    private wobblePhase: number = 0;

    constructor(scene: Scene, x: number, y: number, note: NoteName) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.note = note;

        const noteData = NOTES[note];
        this.color = noteData.color;
        this.strokeColor = this.darkenColor(this.color, 0.3);

        // Create graphics object for the enemy
        this.sprite = scene.add.graphics();
        this.sprite.setDepth(5);
        this.drawEnemy(1, 1);

        // Start wobble animation
        this.wobblePhase = Math.random() * Math.PI * 2;
    }

    private drawEnemy(scaleX: number, scaleY: number, alpha: number = 1): void {
        this.sprite.clear();
        this.sprite.setPosition(this.x, this.y);
        this.sprite.setAlpha(alpha);

        // Main body
        this.sprite.fillStyle(this.color);
        this.sprite.fillEllipse(0, 0, 70 * scaleX, 60 * scaleY);
        this.sprite.lineStyle(4, this.strokeColor);
        this.sprite.strokeEllipse(0, 0, 70 * scaleX, 60 * scaleY);

        // Highlight/shine
        this.sprite.fillStyle(0xffffff, 0.4);
        this.sprite.fillEllipse(-10 * scaleX, -12 * scaleY, 20 * scaleX, 15 * scaleY);

        // Eyes (white)
        this.sprite.fillStyle(0xffffff);
        this.sprite.fillEllipse(-12 * scaleX, -5 * scaleY, 12 * scaleX, 14 * scaleY);
        this.sprite.fillEllipse(12 * scaleX, -5 * scaleY, 12 * scaleX, 14 * scaleY);

        // Pupils (black)
        this.sprite.fillStyle(0x000000);
        this.sprite.fillEllipse(-14 * scaleX, -3 * scaleY, 6 * scaleX, 8 * scaleY);
        this.sprite.fillEllipse(10 * scaleX, -3 * scaleY, 6 * scaleX, 8 * scaleY);
    }

    update(time: number): void {
        if (!this.isActive) return;

        // Gentle wobble animation
        this.wobblePhase += 0.05;
        const scaleX = 1 + Math.sin(this.wobblePhase) * 0.05;
        const scaleY = 1 - Math.sin(this.wobblePhase) * 0.05;
        this.drawEnemy(scaleX, scaleY);
    }

    private darkenColor(color: number, amount: number): number {
        const r = Math.floor(((color >> 16) & 255) * (1 - amount));
        const g = Math.floor(((color >> 8) & 255) * (1 - amount));
        const b = Math.floor((color & 255) * (1 - amount));
        return (r << 16) | (g << 8) | b;
    }

    // Called when player jumps over this enemy
    defeat(): void {
        this.isActive = false;

        // Squash and disappear animation
        let progress = 0;
        const animate = () => {
            progress += 0.05;
            if (progress >= 1) {
                this.destroy();
                return;
            }
            const scaleX = 1 + progress * 0.5;
            const scaleY = 1 - progress * 0.8;
            const alpha = 1 - progress;
            this.drawEnemy(scaleX, scaleY, alpha);
            this.scene.time.delayedCall(16, animate);
        };
        animate();
    }

    getX(): number {
        return this.x;
    }

    destroy(): void {
        this.sprite.destroy();
    }
}
