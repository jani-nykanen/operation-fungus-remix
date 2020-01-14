/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Game scene
class GameScene implements Scene {

    // Components
    private stage : Stage
    private gstate : GameState;
    private lstate : LocalState;
    private hud : HUDRenderer;

    constructor() {

    }


    activate(param : any, ev : CoreEvent) {

        this.stage = new Stage();

        // Create or get the global game state
        if (param == null) {

            this.gstate = new GameState();
        }
        else {

            this.gstate = param;
        }

        this.lstate = new LocalState(this.gstate);
        this.hud = new HUDRenderer(this.lstate);
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


    deactivate() : any {

        return this.gstate;
    }
}
