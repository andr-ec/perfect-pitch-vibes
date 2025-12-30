// Enemy entity - a winged music note that represents a note
import { Scene, GameObjects } from 'phaser';
import { NoteName } from '../NoteDefinitions';

export class Enemy {
    private scene: Scene;
    private sprite: GameObjects.Image;

    public x: number;
    public y: number;
    public note: NoteName;
    public isActive: boolean = true;
    public isWildcard: boolean = false;

    private wobblePhase: number = 0;
    private baseY: number;
    private baseScale: number;

    constructor(scene: Scene, x: number, y: number, note: NoteName, isWildcard: boolean = false) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.note = note;
        this.isWildcard = isWildcard;

        // Create sprite - use white for wildcards, otherwise note color
        const textureKey = isWildcard ? 'enemy-white' : `enemy-${note}`;
        this.sprite = scene.add.image(x, y, textureKey);
        this.sprite.setDepth(5);

        // Wildcards are larger
        this.baseScale = isWildcard ? 0.5 : 0.35;
        this.sprite.setScale(this.baseScale);

        // Start wobble animation with random phase
        this.wobblePhase = Math.random() * Math.PI * 2;
    }

    update(_time: number): void {
        if (!this.isActive) return;

        // Gentle wobble animation
        this.wobblePhase += 0.05;
        const scaleX = this.baseScale * (1 + Math.sin(this.wobblePhase) * 0.05);
        const scaleY = this.baseScale * (1 - Math.sin(this.wobblePhase) * 0.05);
        this.sprite.setScale(scaleX, scaleY);

        // Slight hover effect
        this.sprite.y = this.baseY + Math.sin(this.wobblePhase * 0.5) * 3;
    }

    // Called when player jumps over this enemy
    defeat(): void {
        this.isActive = false;

        // Squash and disappear animation
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 0.5,
            scaleY: 0.1,
            alpha: 0,
            y: this.baseY + 30,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    getX(): number {
        return this.x;
    }

    destroy(): void {
        this.sprite.destroy();
    }
}
