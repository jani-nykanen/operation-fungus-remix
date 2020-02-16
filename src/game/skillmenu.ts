/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Handles skill upgrading
class SkillMenu {


    private readonly SKILL_NAMES = [
        "BULLET POWER",
        "AGILITY",
        "DEXTERITY",
        "SWORDMANSHIP",
        "HEALTH",
        "EXPERIENCE BONUS",
        "REGENERATION",
        "EXTRA BULLET"
    ];

    // One could read these from a json file,
    // but I'm lazy
    private readonly SKILL_DESCRIPTIONS = [
        "Increases the bullet power.",
        "Increases the fire rate\nand the speed of bullets.",
        "Increases the movement\nspeed and invincibility\ntime.",
        "Increases the sword power\nand the power of deflected\nbullets.",
        "Increases the maximum\nhealth.",
        "Increases the amount of\nexperience gained.",
        "Improves the automatic\nhealth regeneration.",
        "An additional bullet spawns\nmore often."
    ];


    // Reference to the local state
    private readonly lstate : LocalState;

    private skillMenu : Menu;
    private confirm : ConfirmBox;
    private active : boolean;


    constructor(lstate : LocalState) {

        this.lstate = lstate;

        this.active = false;

        // Create a menu
        let buttons = new Array<MenuButton> ();
        for (let i = 0; i < 8; ++ i) {

            buttons.push(new MenuButton(
                this.SKILL_NAMES[i], 
                (ev) => {

                    if (lstate.getSkillPoints() <= 0 ||
                        lstate.getSkillLevel(i) >= 5) {

                        return false;
                    }
                    else {

                        this.confirm.activate(1);
                    }
                    return true;
                }
            ));
        }
        buttons.push(new MenuButton(
            "BACK", (ev) => {

                this.active = false;
                return false;
            }
        ));

        this.skillMenu = new Menu(buttons);
        this.confirm = new ConfirmBox("Upgrade this skill?",
            (ev : CoreEvent) => {
                this.increaseSkill(this.skillMenu.getCursorPos());
                return true;
            });
    }


    // Increase a skill
    private increaseSkill(index : number) {

        if (this.lstate.getSkillPoints() <= 0) return;

        this.lstate.increaseSkillLevel(index);
    }


    // Update
    public update(ev : CoreEvent) {

        if (!this.active) return;

        if (this.confirm.isActive()) {

            this.confirm.update(ev);
            return;
        }

        this.skillMenu.update(ev);
    }


    // Draw
    public draw(c : Canvas) {

        const SKILL_POINT_Y = 8;
        const TITLE_BOX_Y = SKILL_POINT_Y-1;
        const TITLE_BOX_HEIGHT = 17;

        const BOX_X = 16;
        const BOX_Y = 32;
        const BOX_W = 256 - BOX_X*2;
        const BOX_H = 116;

        const SKILL_OFF = 2;
        const SKILL_BEGIN_X = BOX_X + BOX_W - (SKILL_OFF+8)*5;
        const Y_OFF = 12;

        const DESCP_Y = BOX_Y + BOX_H + 7;
        const DESCP_H = 192-4 - DESCP_Y;

        if (!this.active) return;

        // Draw a box for the stitle
        drawBoxWithBorders(c, BOX_X, TITLE_BOX_Y, BOX_W, TITLE_BOX_HEIGHT,
            [[255, 255, 255], [0, 0, 0], [72, 145, 255]]);

        // Draw skill points
        c.drawText(c.getBitmap("fontBig"), 
            "SKILL POINTS: " + String(this.lstate.getSkillPoints()),
            c.width/2, SKILL_POINT_Y, -4, 0, true);

        // Draw a box for the skill names
        drawBoxWithBorders(c, BOX_X, BOX_Y, BOX_W, BOX_H,
            [[255, 255, 255], [0, 0, 0], [72, 145, 255]]);

        // Draw the skill menu
        this.skillMenu.draw(
            c, BOX_X + 4, BOX_Y + 4, 0, Y_OFF
        );

        // Draw the skill levels
        let sx = 0;
        let sy = 8;
        let font = c.getBitmap("font");
        for (let i = 0; i < 8; ++ i) {

            for (let j = 0; j < 5; ++ j) {

                sx = this.lstate.getSkillLevel(i) > j ? 8 : 0;

                c.drawBitmapRegion(font, sx, sy, 8, 8,
                    SKILL_BEGIN_X + j * (8+SKILL_OFF),
                    BOX_Y + 4 + i * Y_OFF);
            }
        }

        if (this.skillMenu.getCursorPos() < 8) {

            // Draw explanation box
            drawBoxWithBorders(c, BOX_X, DESCP_Y, BOX_W, DESCP_H,
                [[255, 255, 255], [0, 0, 0], [72, 145, 255]]);

            c.drawText(font, 
                this.SKILL_DESCRIPTIONS[this.skillMenu.getCursorPos()],
                BOX_X + 4, DESCP_Y+2, 0, 2);
        }

        // Draw confirmation box
        if (this.confirm.isActive()) {

            c.setColor(0, 0, 0, 0.67);
            c.fillRect(0, 0, c.width, c.height);

            this.confirm.draw(c);
        }
    }


    // Activate
    public activate() {

        if (this.active) return;

        this.skillMenu.setCursorPos(this.SKILL_NAMES.length);
        this.active = true;
        
    }


    // Getters
    public isActive = () => this.active;
}