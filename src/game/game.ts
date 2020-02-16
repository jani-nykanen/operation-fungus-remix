/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */




// Game scene
class GameScene implements Scene {

    private readonly MUSIC_VOLUME = 0.50;

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
    private skills : SkillMenu;

    private confirm : ConfirmBox;


    constructor() {

        // Create pause menu
        this.pauseMenu = new Menu(
            [
                new MenuButton("RESUME", (ev : CoreEvent) => {
                    this.paused = false;
                    this.canvasCopied = false;
                    ev.audio.resumeMusic();
                    return true;
                }),
                new MenuButton("SELF-DESTRUCT", (ev : CoreEvent) => {
                    this.confirm.activate(1);
                    return true;
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

                        // Restart music
                        ev.audio.stopMusic();
                        ev.audio.fadeInMusic(ev.assets.getSound("theme"), 
                            this.MUSIC_VOLUME, 1000);
                    });

                    return true;
                }),
                new MenuButton("UPGRADE SKILLS", (ev : CoreEvent) => {
                    this.skills.activate();
                    return true;
                })
            ]
        );

        this.confirm = new ConfirmBox(
            "Are you sure?",
            (ev : CoreEvent) => {

                ev.audio.resumeMusic();
                ev.audio.stopMusic();

                this.objm.killPlayer();
                this.paused = false;
                this.canvasCopied = false;

                return true;
            }
        );
    }



    public activate(param : any, ev : CoreEvent) {

        this.stage = new Stage();

        this.lstate = new LocalState();
        this.hud = new HUDRenderer(this.lstate);
        this.skills = new SkillMenu(this.lstate);
        this.objm = new ObjectManager(this.lstate);

        this.paused = false;
        this.gameoverActivated = false;
        this.canvasCopied = false;

        ev.audio.fadeInMusic(ev.assets.getSound("theme"), 
            this.MUSIC_VOLUME, 1000);
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

                if (!this.skills.isActive())
                    this.gameoverMenu.update(ev);
                else
                    this.skills.update(ev);
            }

            return;
        }

        // Check pause
        if (this.paused) {

            if (this.confirm.isActive())
                this.confirm.update(ev);
            else
                this.pauseMenu.update(ev);
            return;
        }
        else if (ev.gamepad.getButtonState("start") == State.Pressed) {

            this.paused = true;
            ev.gamepad.forceStickReturnToOrigin();
            this.pauseMenu.setCursorPos(0);

            this.canvasCopied = false;

            ev.audio.pauseMusic();

            return;
        }

        // Update stage
        this.stage.update(BACKGROUND_SPEED, ev);

        // Update objects
        this.objm.update(this.lstate, this.stage, this.hud, ev);
        // Start the ending sequence
        if (this.objm.missionClear()) {

            this.hud.enableEndMessage(
                (ev : CoreEvent) => {

                    ev.tr.activate(true, 1.0, TransitionType.Fade, 4,
                        (ev : CoreEvent) => {
                    ev.changeScene(new EndingScene());
                        });

                    return true;
                }
            );
        }

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

        c.drawText(c.getBitmap("fontBig"), title,
               c.width/2, TITLE_Y, -4, 0, true);

        // Draw box
        drawBoxWithBorders(c, BOX_X, BOX_Y, BOX_W, BOX_H,
            [[255, 255, 255], [0, 0, 0], [72, 145, 255]]);

        menu.draw(c, BOX_X+4, BOX_Y+4, 0, 12);
    }


    // Draw the skill menu
    public drawSkillMenu(c : Canvas) {

        c.drawBitmap(c.getCanvasBuffer(), 0, 0);

        c.setColor(0, 0, 0, 0.67);
        c.fillRect(0, 0, 256, 192);

        this.skills.draw(c);
    }


    public draw(c : Canvas) {

        c.moveTo();

        // Draw the stored frame
        if (this.objm.isGameOver() ||
            this.paused) {
        
            // Copy current background to the buffer
            if (!this.canvasCopied) {

                c.copyToBuffer();
                this.canvasCopied = true;
            }

            c.drawBitmap(c.getCanvasBuffer(), 0, 0);

            c.setColor(0, 0, 0, 0.67);
            c.fillRect(0, 0, c.width, c.height);
        }

        // Draw the game over menu
        if (this.objm.isGameOver()) {

            if (this.skills.isActive())
                this.drawSkillMenu(c);
            else
                this.drawPauseMenu(c, "YOU DIED.", this.gameoverMenu);
            return;
        }
        // Draw the pause screen
        else if (this.paused) {

            if (this.confirm.isActive()) {

                c.setColor(0, 0, 0, 0.67);
                c.fillRect(0, 0, c.width, c.height);

                this.confirm.draw(c);
            }
            else
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
