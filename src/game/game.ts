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


    constructor() {

        // ...
    }


    activate(param : any, ev : CoreEvent) {

        this.stage = new Stage();

        this.lstate = new LocalState();
        this.hud = new HUDRenderer(this.lstate);
        
        this.objm = new ObjectManager(this.lstate);
    }


    update(ev : CoreEvent) {

        // Update stage
        this.stage.update(ev);

        // Update objects
        this.objm.update(ev);

        // Update HUD
        this.hud.update(ev);
    }


    draw(c : Canvas) {

        c.moveTo();

        c.clear(170, 170, 170);

        // Draw stage
        this.stage.draw(c);

        // Draw objects
        this.objm.draw(c);

        // Draw HUD
        this.hud.draw(c);
    }


    deactivate() : any {

        
    }
}
