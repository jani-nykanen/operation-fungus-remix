/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */



class ConfirmBox {


    private yesNoMenu : Menu;
    private active : boolean;
    private title : string;


    constructor(title : string, cb : MenuButtonCallback) {

        this.active = false;

        this.title = title;
        this.yesNoMenu = new Menu(
            [
                new MenuButton("YES", (ev : CoreEvent) => {

                    cb(ev);
                    this.active = false;
                    return true;
                }),
                new MenuButton("NO", (ev : CoreEvent) => {

                    this.active = false;
                    return false;
                })
            ]
        );
    }


    // Update
    public update(ev : CoreEvent) {

        if (!this.active) return;

        this.yesNoMenu.update(ev);
    }


    // Draw
    public draw(c : Canvas, color = [[255, 255, 255], [0, 0, 0], [72, 145, 255]]) {

        if (!this.active) return;

        let w = this.title.length * 8 + 8;
        let h = 3 * 12 + 8;

        let x = c.width/2 - w/2;
        let y = c.height/2 - h/2;

        // Draw the box
        drawBoxWithBorders(c, x, y, w, h, color);

        // Draw title
        c.drawText(c.getBitmap("font"), this.title,
            x + 4, y + 4, 0, 0);

        // Draw the menu
        this.yesNoMenu.draw(c, x + 4, y + 20);
    }


    // Activate
    public activate(def = 0) {

        if (this.active) return;

        this.active = true;
        this.yesNoMenu.setCursorPos(negMod(def, 2));
    }


    // Getters
    public isActive = () => this.active;
}