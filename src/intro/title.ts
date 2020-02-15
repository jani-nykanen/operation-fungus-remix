/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// The title screen scene
class TitleScreenScene implements Scene {


    private wave : number;


    public activate(param : any, ev : CoreEvent) {

        this.wave = 0.0;
    }


    public update(ev : CoreEvent) {

        const WAVE_SPEED = 0.05;

        // Update wave
        this.wave = (this.wave += WAVE_SPEED*ev.step) % (Math.PI * 2);

        if (ev.tr.isActive()) return;

        // Check for input
        if (ev.gamepad.getButtonState("start") == State.Pressed ||
            ev.gamepad.getButtonState("fire1") == State.Pressed) {

            ev.tr.activate(true, 2.0, TransitionType.Fade, 4,
                (ev : CoreEvent) => {
                    ev.changeScene(new GameScene());
                });
        }
        
    }


    public draw(c : Canvas) {

        const LOGO_AMPL = 4;
        const LOGO_Y = 24;
        const PRESS_ENTER_Y_OFF = 48;
        const PERIOD = Math.PI * 2 / 11;
        const FONT_OFF = 12;
        const FONT_AMPL = 6;

        c.clear(189, 109, 255);

        let bmp = c.getBitmap("logo");

        // Draw the sky
        c.drawBitmapRegion(c.getBitmap("sky"), 0,
            288, 256, 144, 0, 0);

        // Draw logo
        let y = (Math.sin(this.wave) * LOGO_AMPL) | 0;
        c.drawBitmapRegion(bmp, 0, 0, 256, 96, 0, LOGO_Y + y);

        // Draw "press enter"
        let fontBig = c.getBitmap("fontBig");
        let x = c.width/2 - 11 * FONT_OFF / 2;

        let str = "PRESS ENTER";

        for (let i = 0; i < str.length; ++ i) {

            c.drawText(fontBig, 
                String.fromCharCode(str.charCodeAt(i)), 
                x + i * FONT_OFF, 
                c.height-PRESS_ENTER_Y_OFF + 
                    ((Math.sin(this.wave + PERIOD*i) * FONT_AMPL) | 0), 
                -4, 0, true);
        }

        // Draw copyright
        c.drawText(c.getBitmap("fontYellow"), "©2020 Jani Nykänen",
            c.width/2, c.height-10, 0, 0, true);
    }


    public deactivate() : any {

    }
}
