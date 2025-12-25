// Player entity - a simple character that walks and jumps
import { Scene, GameObjects } from 'phaser';

export enum PlayerState {
    WALKING = 'walking',
    WAITING = 'waiting',
    JUMPING = 'jumping',
}

export class Player {
    private scene: Scene;
    private sprite: GameObjects.Graphics;

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

        // Create graphics object for the player
        this.sprite = scene.add.graphics();
        this.sprite.setDepth(10);
        this.drawPlayer();
    }

    private drawPlayer(): void {
        this.sprite.clear();
        this.sprite.setPosition(this.x, this.y);

        // Body - blue blob
        this.sprite.fillStyle(0x4a90d9);
        this.sprite.fillEllipse(0, 0, 50, 60);
        this.sprite.lineStyle(3, 0x2d5a87);
        this.sprite.strokeEllipse(0, 0, 50, 60);

        // Eyes (white)
        this.sprite.fillStyle(0xffffff);
        this.sprite.fillEllipse(-10, -10, 10, 12);
        this.sprite.fillEllipse(10, -10, 10, 12);

        // Pupils (black)
        this.sprite.fillStyle(0x000000);
        this.sprite.fillEllipse(-8, -10, 5, 6);
        this.sprite.fillEllipse(12, -10, 5, 6);
    }

    update(delta: number): void {
        if (this.state === PlayerState.WALKING) {
            // Move right
            this.x += this.walkSpeed * (delta / 1000);

            // Simple bobbing animation while walking
            const bob = Math.sin(this.scene.time.now / 100) * 3;
            this.sprite.setPosition(this.x, this.groundY + bob);
        }
    }

    stopWalking(): void {
        this.state = PlayerState.WAITING;
        this.sprite.setPosition(this.x, this.groundY);
    }

    jump(onComplete: () => void): void {
        if (this.state === PlayerState.JUMPING) return;

        this.state = PlayerState.JUMPING;

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

    destroy(): void {
        this.sprite.destroy();
    }
}
