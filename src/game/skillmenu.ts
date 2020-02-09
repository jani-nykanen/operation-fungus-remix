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
        "Increases the reload and\nbullet speed.",
        "Increases the movement\nspeed and invincibility\ntime.",
        "Increases the sword attack\nand deflect power.",
        "Increases the maximum health.",
        "Increases the amount of\n experience earned.",
        "Increases the amount of\nhealth regenerated per\nsecond.",
        "Increases the period of\nan additional bullet."
    ];


    // Reference to the local state
    private readonly lstate : LocalState;

    private skillMenu : Menu;
    private active : boolean;


    constructor(lstate : LocalState) {

        this.lstate = lstate;

        this.active = false;

        // Create a menu
        let buttons = new Array<MenuButton> ();
        for (let i = 0; i < 8; ++ i) {

            buttons.push(new MenuButton(
                this.SKILL_NAMES[i], 
                (ev) => this.increaseSkill(i)
            ));
        }
        buttons.push(new MenuButton(
            "BACK", (ev) => {

                this.active = false;
            }
        ));

        this.skillMenu = new Menu(buttons);
    }


    // Increase a skill
    private increaseSkill(index : number) {

        if (this.lstate.getSkillPoints() <= 0) return;

        this.lstate.increaseSkillLevel(index);
    }


    // Update
    public update(ev : CoreEvent) {

        if (!this.active) return;

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

        if (!this.active) return;

        // Draw a box for the stitle
        drawBoxWithBorders(c, BOX_X, TITLE_BOX_Y, BOX_W, TITLE_BOX_HEIGHT,
            [[255, 255, 255], [0, 0, 0], [72, 145, 255]]);

        // Draw skill points
        c.drawText(c.getBitmap("fontBig"), 
            "SKILL POINTS: " + String(this.lstate.getSkillPoints()),
            c.width/2, SKILL_POINT_Y, -6, 0, true);

        // Draw a box for the skill names
        drawBoxWithBorders(c, BOX_X, BOX_Y, BOX_W, BOX_H,
            [[255, 255, 255], [0, 0, 0], [72, 145, 255]]);

        // Draw the skill menu
        this.skillMenu.draw(
            c, BOX_X + 4, BOX_Y + 4
        );
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