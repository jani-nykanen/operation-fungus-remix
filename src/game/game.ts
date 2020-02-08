/**
 * Operation Fungus Remix
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
    private pauseMenu : Menu;
    private gameoverMenu : Menu;
    private gameoverActivated : boolean;


    constructor() {

        // Create pause menu
        this.pauseMenu = new Menu(
            [
                new MenuButton("RESUME", (ev : CoreEvent) => {
                    this.paused = false;
                }),
                new MenuButton("SELF-DESTRUCT", (ev : CoreEvent) => {
                    this.objm.killPlayer();
                    this.paused = false;
                })
            ]
        );

        // Create the game over menu
        this.gameoverMenu = new Menu(
            [
                new MenuButton("RETRY", (ev : CoreEvent) => {

                    ev.tr.activate(true, 2.0, TransitionType.Fade, 4,
                        (ev : CoreEvent) => {

                        this.gameoverActivated = false;

                        this.objm.reset(this.lstate, this.stage, this.hud);
                        this.objm.update(this.lstate, this.stage, this.hud, ev);
                    });
                }),
                new MenuButton("UPGRADE SKILLS", (ev : CoreEvent) => {
                    alert("Not implemented.");
                })
            ]
        );
    }


    public activate(param : any, ev : CoreEvent) {

        this.stage = new Stage();

        this.lstate = new LocalState();
        this.hud = new HUDRenderer(this.lstate);
        
        this.objm = new ObjectManager(this.lstate);

        this.paused = false;
        this.gameoverActivated = false;
    }


    public update(ev : CoreEvent) {

        if (ev.tr.isActive()) return;

        // This gives the unit speed for the
        // middle point of the ground
        const BACKGROUND_SPEED = 1.0 / 1.40;

        // Check if the game is over
        if (this.objm.isGameOver()) {

            if (!this.gameoverActivated) {

                this.gameoverMenu.setCursorPos(0);
            }

            this.gameoverMenu.update(ev);
            return;
        }

        // Check pause
        if (this.paused) {

            this.pauseMenu.update(ev);
            return;
        }
        else if (ev.gamepad.getButtonState("start") == State.Pressed) {

            this.paused = true;
            this.pauseMenu.setCursorPos(0);
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

        // Draw the game over menu
        if (this.objm.isGameOver()) {

            // Copy current background to the buffer
            if (!this.gameoverActivated) {

                c.copyToBuffer();
                this.gameoverActivated = true;
            }

            c.drawBitmap(c.getCanvasBuffer(), 0, 0);
            c.setColor(0, 0, 0, 0.67);
            c.fillRect(0, 0, 256, 192);

            c.drawText(c.getBitmap("fontBig"), "YOU DIED.",
                c.width/2, 56, -6, 0, true);

            this.gameoverMenu.draw(c, 64, 80, 0, 12);

            return;
        }

        // Draw stage
        this.stage.draw(c);

        // Draw objects
        this.objm.draw(c);

        // Draw HUD
        this.hud.draw(c);

        if (this.paused) {

            c.setColor(0, 0, 0, 0.67);
            c.fillRect(0, 0, 256, 192);

            c.drawText(c.getBitmap("fontBig"), "GAME PAUSED",
                c.width/2, 56, -6, 0, true);

            this.pauseMenu.draw(c, 64, 80, 0, 12);
        }
    }


    public deactivate() : any {

        // ...
    }
}
