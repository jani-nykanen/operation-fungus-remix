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
                new MenuButton("YES", cb),
                new MenuButton("NO", (ev) => {

                    this.active = false;
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
    public draw(c : Canvas) {

        if (!this.active) return;
    }


    // Activate
    public activate(def = 0) {

        if (this.active) return;

        this.active = true;
        this.yesNoMenu.setCursorPos(negMod(def, 2));
    }
}