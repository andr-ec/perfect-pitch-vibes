// Player entity - animated sprite character that walks and jumps
import { Scene, GameObjects } from 'phaser';

export enum PlayerState {
    WALKING = 'walking',
    WAITING = 'waiting',
    JUMPING = 'jumping',
}

export class Player {
    private scene: Scene;
    private sprite: GameObjects.Sprite;

    public x: number;
    public y: number;
    public state: PlayerState = PlayerState.WALKING;

    private walkSpeed: number = 150;
    private jumpHeight: number = 120;
    private groundY: number;

    constructor(scene: Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.groundY = y;

        // Create animations if they don't exist
        this.createAnimations();

        // Create sprite for the player (row 2 = right-facing, frames 4-7)
        this.sprite = scene.add.sprite(x, y, 'player', 4);
        this.sprite.setDepth(10);
        this.sprite.setScale(0.5); // Scale down if needed

        // Start walking animation
        this.sprite.play('player-walk-right');
    }

    private createAnimations(): void {
        // Only create animations once
        if (this.scene.anims.exists('player-walk-right')) return;

        // Row 1 (frames 0-3): Back/up facing
        this.scene.anims.create({
            key: 'player-walk-up',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1,
        });

        // Row 2 (frames 4-7): Right facing - main walking direction
        this.scene.anims.create({
            key: 'player-walk-right',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1,
        });

        // Row 3 (frames 8-11): Front/down facing
        this.scene.anims.create({
            key: 'player-walk-down',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1,
        });

        // Row 4 (frames 12-15): Left facing
        this.scene.anims.create({
            key: 'player-walk-left',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: -1,
        });

        // Idle animation (single frame from right-facing)
        this.scene.anims.create({
            key: 'player-idle',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 1,
            repeat: 0,
        });
    }

    update(delta: number): void {
        if (this.state === PlayerState.WALKING) {
            // Move right
            this.x += this.walkSpeed * (delta / 1000);
            this.sprite.setPosition(this.x, this.groundY);

            // Ensure walking animation is playing
            if (this.sprite.anims.currentAnim?.key !== 'player-walk-right') {
                this.sprite.play('player-walk-right');
            }
        }
    }

    stopWalking(): void {
        this.state = PlayerState.WAITING;
        this.sprite.setPosition(this.x, this.groundY);
        this.sprite.play('player-idle');
    }

    jump(onComplete: () => void): void {
        if (this.state === PlayerState.JUMPING) return;

        this.state = PlayerState.JUMPING;

        // Keep walking animation during jump
        this.sprite.play('player-walk-right');

        // Jump arc animation
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.groundY - this.jumpHeight,
            duration: 250,
            ease: 'Quad.easeOut',
            yoyo: true,
            onComplete: () => {
                this.state = PlayerState.WALKING;
                this.sprite.setPosition(this.x, this.groundY);
                onComplete();
            }
        });

        // Also move forward during jump
        this.scene.tweens.add({
            targets: this,
            x: this.x + 150,
            duration: 500,
            ease: 'Linear',
            onUpdate: () => {
                this.sprite.x = this.x;
            }
        });
    }

    getX(): number {
        return this.x;
    }

    setX(x: number): void {
        this.x = x;
        this.sprite.x = x;
    }

    moveBack(distance: number = 40, onComplete?: () => void): void {
        // Play left-walking animation while moving back
        this.sprite.play('player-walk-left');

        // Tween the player backward
        this.scene.tweens.add({
            targets: this,
            x: this.x - distance,
            duration: 200,
            ease: 'Quad.easeOut',
            onUpdate: () => {
                this.sprite.x = this.x;
            },
            onComplete: () => {
                this.state = PlayerState.WALKING;
                this.sprite.play('player-walk-right');
                if (onComplete) onComplete();
            }
        });
    }

    destroy(): void {
        this.sprite.destroy();
    }
}
