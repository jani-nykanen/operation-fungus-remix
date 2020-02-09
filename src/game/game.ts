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
    private canvasCopied : boolean;


    constructor() {

        // Create pause menu
        this.pauseMenu = new Menu(
            [
                new MenuButton("RESUME", (ev : CoreEvent) => {
                    this.paused = false;
                    this.canvasCopied = false;
                }),
                new MenuButton("SELF-DESTRUCT", (ev : CoreEvent) => {
                    this.objm.killPlayer();
                    this.paused = false;
                    this.canvasCopied = false;
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
                        this.canvasCopied = false;

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
        this.canvasCopied = false;
    }


    public update(ev : CoreEvent) {

        if (ev.tr.isActive()) return;

        // This gives the unit speed for the
        // middle point of the ground
        const BACKGROUND_SPEED = 1.0 / 1.40;

        // Check if the game is over
        if (this.objm.isGameOver()) {

            if (!this.gameoverActivated) {

                ev.gamepad.forceStickReturnToOrigin();
                this.gameoverMenu.setCursorPos(0);

                this.gameoverActivated = true;
            }
            else {

                this.gameoverMenu.update(ev);
            }

            return;
        }

        // Check pause
        if (this.paused) {

            this.pauseMenu.update(ev);
            return;
        }
        else if (ev.gamepad.getButtonState("start") == State.Pressed) {

            this.paused = true;
            ev.gamepad.forceStickReturnToOrigin();
            this.pauseMenu.setCursorPos(0);

            this.canvasCopied = false;
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


    // Draw pause menu
    private drawPauseMenu(c : Canvas, title : string, menu : Menu) {

        const TITLE_Y = 64;
        const BOX_X = 64;
        const BOX_Y = 88;

        const BOX_W = 128;
        const BOX_H = 28;

        // Copy current background to the buffer
        if (!this.canvasCopied) {

            c.copyToBuffer();
            this.canvasCopied = true;
        }

        c.drawBitmap(c.getCanvasBuffer(), 0, 0);

        c.setColor(0, 0, 0, 0.67);
        c.fillRect(0, 0, 256, 192);

        c.drawText(c.getBitmap("fontBig"), title,
               c.width/2, TITLE_Y, -6, 0, true);

        // Draw box
        drawBoxWithBorders(c, BOX_X, BOX_Y, BOX_W, BOX_H,
            [[255, 255, 255], [0, 0, 0], [72, 145, 255]]);

        menu.draw(c, BOX_X+4, BOX_Y+4, 0, 12);
    }


    public draw(c : Canvas) {

        c.moveTo();

        // Draw the game over menu
        if (this.objm.isGameOver()) {

            this.drawPauseMenu(c, "YOU DIED.", this.gameoverMenu);
            return;
        }
        // Draw the pause screen
        else if (this.paused) {

            this.drawPauseMenu(c, "GAME PAUSED", this.pauseMenu);
            return;
        }

        // Draw stage
        this.stage.draw(c);

        // Draw objects
        this.objm.draw(c);

        // Draw HUD
        this.hud.draw(c);

    }


    public deactivate() : any {

        // ...
    }
}
