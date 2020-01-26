/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Renders the HUD.
class HUDRenderer {

    // Bar values for rendering
    private healthBar : number;
    private healthTarget : number;
    private expBar : number;
    private expTarget : number;

    private readonly lstate : LocalState;


    constructor(state : LocalState) {

        this.healthBar = 1.0;
        this.healthTarget = this.healthBar;

        this.expBar = 0;
        this.expTarget = 0;

        this.lstate = state;
    }


    // Draw a bar
    private drawBar(c : Canvas, 
        sx : number, sy : number, sw : number, sh : number,
        dx : number, dy : number, fill : number, 
        iconOff? : number, text? : string) {

        let bmp = c.getBitmap("hud");     

        // Draw icon
        if (iconOff != undefined) {

             // Ugly assumptions, I know. Will fix later
            c.drawBitmapRegion(bmp, sx-sh, sy,
                sh, sh,
                dx, dy);

            iconOff += sh;
        }
        else {

            iconOff = 0;
        }

        let x = dx + iconOff;

        // Draw background  
        c.drawBitmapRegion(bmp, sx, 0,
            sw, sh,
            x, dy);

        // Draw the filled area
        let w = ((sw-4) * fill) | 0;
        if (w == sw-5) w = sw-4;

        c.drawBitmapRegion(bmp, 
            sx+2, sy,
            w, sh,
            x+2, dy);

        // Draw text
        if (text != undefined) {

            c.drawText(c.getBitmap("font"), text,
                x + 32, dy + 4, -1, 0, true);
        }

    }


    // Draw the power bar (this one is slightly
    // different than the other bards. In other words,
    // I'm lazy to make a generalized method for these)
    private drawPowerBar(c : Canvas, dy : number, fill : number) {

        const WIDTH = 96;
        const HEIGHT = 8;

        let x = c.width/2 - WIDTH/2;
        let y = dy;

        let bmp = c.getBitmap("hud");

        // Draw background bar
        c.drawBitmapRegion(bmp, 16, 48, WIDTH, HEIGHT,
            x, y);
        
        // Draw the filling (temporary, no animation)
        let w = ((WIDTH-4) * fill) | 0;
        if (w == WIDTH-5) w = WIDTH-4;
        c.drawBitmapRegion(bmp, 16+2, 56, w, HEIGHT,
            x+2, y);

        // Draw the icon
        c.drawBitmapRegion(bmp, 0, 48, 16, 16,
            x-17, y-6);

    }


    // Update
    public update(ev : CoreEvent) {

        const DELTA_SPEED = 0.01;

        this.healthBar = updateSpeedAxis(
            this.healthBar,
            this.lstate.getHealth() / this.lstate.getMaxHealth(),
            DELTA_SPEED * ev.step
        );

        this.expBar = updateSpeedAxis(
            this.expBar,
            this.lstate.getXpPercentage(),
            DELTA_SPEED * ev.step
        );
    }


    // Draw
    public draw(c : Canvas) {

        c.moveTo();

        // Draw health & exp bars
        let currentHealth = Math.round(this.lstate.getMaxHealth() * this.healthBar);
        this.drawBar(c, 16, 16, 64, 16,
            4, 4, 
            this.healthBar, 1,
            String(currentHealth) + 
            "/" + 
            String(this.lstate.getMaxHealth()));

        this.drawBar(c, 16, 32, 64, 16,
            136, 4, 
            this.expBar, 1,
            String("LEVEL ") + String(this.lstate.getLevel()));

        // Draw the multiplier
        let mul = this.lstate.getMultiplier() + 10;
        let mulStr = "\2" + String((mul/10) | 0) + "." + 
            String(mul - 10*((mul/10)|0));

        c.drawText(c.getBitmap("font"), mulStr,
            236, 5, -1, 0, true);

        // Draw the multiplier time bar
        this.drawBar(c, 80, 6, 32, 6,
            220, 13, 
            this.lstate.getMulTimer());

        // Draw the power bar
        this.drawPowerBar(c, c.height-11, this.lstate.getPower());
    }

}
