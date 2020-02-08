/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


type MenuButtonCallback = ((ev : CoreEvent) => any);


class MenuButton {

    public readonly cb : MenuButtonCallback;
    public readonly text : string;


    constructor(text : string, cb? : MenuButtonCallback) {

        this.text = text;
        this.cb = cb;
    }
}


class Menu {

    private readonly MOVE_TIME = 15;


    private cursorPos : number;
    private targetPos : number;
    private cursorWave : number;
    private cursorTimer : number;
    private moving : boolean;
    private buttons : Array<MenuButton>;


    constructor(buttons : Array<MenuButton>) {

        this.buttons = new Array<MenuButton> (buttons.length);

        // Copy buttons
        for (let i = 0; i < buttons.length; ++ i) {

            this.buttons[i] = new MenuButton(
                buttons[i].text,
                buttons[i].cb
            );
        }

        this.cursorPos = 0;
        this.cursorTimer = 0;
        this.targetPos = 0;
        this.moving = false;
        this.cursorWave = 0.0;
    }


    // Update
    public update(ev : CoreEvent) {

        const EPS = 0.1;
        const WAVE_SPEED = 0.05;

        // Update moving
        if (this.moving) {

            this.cursorWave = 0.0;

            if ((this.cursorTimer -= ev.step) <= 0) {

                this.cursorTimer = 0;
                this.moving = false;

                this.cursorPos = this.targetPos;
            }
            return;
        }

        // Control the cursor
        let s = ev.gamepad.getStick().y;
        if (Math.abs(s) > EPS) {

            this.targetPos = 
                negMod(this.cursorPos + (s > 0.0 ? 1 : -1), 
                       this.buttons.length);

            this.moving = true;
            this.cursorTimer = this.MOVE_TIME;
        }
        // Check if activated
        else {

            if (this.buttons[this.cursorPos].cb != undefined && (
                ev.gamepad.getButtonState("start") == State.Pressed ||
                ev.gamepad.getButtonState("fire1") == State.Pressed)) {

                this.buttons[this.cursorPos].cb(ev);
            }
        }

        // Update wave
        this.cursorWave = (this.cursorWave + WAVE_SPEED * ev.step) % (Math.PI*2)
    }


    // Draw menu
    public draw(c : Canvas, x : number, y : number, xoff = 0, yoff = 12) {

        const CURSOR_OFF = 12;
        const CURSOR_AMPLITUDE = 2.0;

        // Draw text
        let b : MenuButton;
        for (let i = 0; i < this.buttons.length; ++ i) {

            b = this.buttons[i];

            c.drawText(
                c.getBitmap(this.cursorPos == i ? "fontYellow" : "font"),
                b.text, 
                x + CURSOR_OFF, 
                y + i*yoff, xoff, 0, false);

        }

        // Draw cursor
        c.drawBitmapRegion(c.getBitmap("fontYellow"), 0, 32, 8, 8,
            x + Math.round(Math.sin(this.cursorWave) * CURSOR_AMPLITUDE),
            y + this.cursorPos * yoff);
    }
}
