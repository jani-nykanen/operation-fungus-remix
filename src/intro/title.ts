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

        const AMPLITUDE = 16.0;
        const SHIFT = Math.PI * 2 / 24;
        const PRESS_ENTER_Y_OFF = 48;
        const PERIOD = Math.PI * 2 / 11;
        const FONT_OFF = 12;
        const FONT_AMPL = 6;

        c.clear(189, 109, 255);

        let bmp = c.getBitmap("logo");

        // Draw the sky
        c.drawBitmapRegion(c.getBitmap("sky"), 0,
            288, 256, 144, 0, 0);

        // Draw the sun
        c.drawBitmap(c.getBitmap("sun"), 184, 8);

        // Draw logo
        c.drawBitmapRegion(bmp, 0, 0, 256, 96, 0, 32);

        // Draw shadow
        c.setAlpha(0.333);
        let x = 0;
        for (let y = 0; y < 24; ++ y) {

            x = (Math.sin(this.wave + SHIFT*y) * (y / 24.0 *  AMPLITUDE)) | 0;
            c.drawBitmapRegion(bmp, 0, 96+y, 256, 1, x, 128+y);
        }
        c.setAlpha();

        // Draw "press enter"
        let fontBig = c.getBitmap("fontBig");
        x = c.width/2 - 11 * FONT_OFF / 2;

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
