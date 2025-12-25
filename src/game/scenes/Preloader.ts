import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
        this.load.image('music-bg', 'music-bg.jpg');
        this.load.spritesheet('player', 'walking-animation.png', {
            frameWidth: 192,
            frameHeight: 192,
        });

        // Load floor tile
        this.load.image('brickfloor', 'brickfloor.png');

        // Load enemy sprites
        this.load.image('enemy-C', 'enemies/enemy-C.png');
        this.load.image('enemy-D', 'enemies/enemy-D.png');
        this.load.image('enemy-E', 'enemies/enemy-E.png');
        this.load.image('enemy-F', 'enemies/enemy-F.png');
        this.load.image('enemy-G', 'enemies/enemy-G.png');
        this.load.image('enemy-A', 'enemies/enemy-A.png');
        this.load.image('enemy-B', 'enemies/enemy-B.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
