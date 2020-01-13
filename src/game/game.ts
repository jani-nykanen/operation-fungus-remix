/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Game scene
class GameScene implements Scene {

    // Components
    private stage : Stage


    constructor() {

    }


    activate(param : any, ev : CoreEvent) {

        this.stage = new Stage();
    }


    update(ev : CoreEvent) {

        // Update stage
        this.stage.update(ev);
    }


    draw(c : Canvas) {

        c.clear(170, 170, 170);

        // Draw stage
        this.stage.draw(c);

        c.drawText(c.bitmaps.font, "Hello world!",
            2, 2, -1, 0, false);
    }


    deactivate() {

    }
}
