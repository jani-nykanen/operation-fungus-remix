/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Game scene
class GameScene implements Scene {

    // Components
    private stage : Stage
    private lstate : LocalState;
    private hud : HUDRenderer;
    private objm : ObjectManager;

    private paused : boolean;


    constructor() {

        // ...
    }


    public activate(param : any, ev : CoreEvent) {

        this.stage = new Stage();

        this.lstate = new LocalState();
        this.hud = new HUDRenderer(this.lstate);
        
        this.objm = new ObjectManager(this.lstate);

        this.paused = false;
    }


    public update(ev : CoreEvent) {

        if (ev.tr.isActive()) return;

        // This gives the unit speed for the
        // middle point of the ground
        const BACKGROUND_SPEED = 1.0 / 1.40;

        if (ev.gamepad.getButtonState("start") == State.Pressed) {

            this.paused = !this.paused;
        }

        if (this.paused) {

            return;
        }

        // Update stage
        this.stage.update(BACKGROUND_SPEED, ev);

        // Update objects
        this.objm.update(this.lstate, this.stage, this.hud, ev);

        // Update HUD
        this.hud.update(ev);

        // Update state
        this.lstate.update(ev);
    }


    public draw(c : Canvas) {

        c.moveTo();

        c.clear(170, 170, 170);

        // Draw stage
        this.stage.draw(c);

        // Draw objects
        this.objm.draw(c);

        // Draw HUD
        this.hud.draw(c);

        if (this.paused) {

            c.setColor(0, 0, 0, 0.5);
            c.fillRect(0, 0, 256, 192);

            c.drawText(c.getBitmap("font"), "GAME PAUSED",
                c.width/2, c.height/2 - 4, 0, 0, true);
        }
    }


    public deactivate() : any {

        // ...
    }
}
