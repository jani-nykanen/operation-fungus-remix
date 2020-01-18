/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Renders the HUD.
class HUDRenderer {

    // Bar values for rendering
    private healthBar : number;

    private readonly state : LocalState;


    constructor(state : LocalState) {

        this.healthBar = 1.0;

        this.state = state;
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


    // Update
    public update() {

        // TODO: Update health
    }


    // Draw
    public draw(c : Canvas) {

        // Draw health & exp bars
        this.drawBar(c, 16, 16, 64, 16,
            4, 4, 
            this.state.getHealth() / this.state.getMaxHealth(), 1,
            String(this.state.getHealth()) + 
            "/" + 
            String(this.state.getMaxHealth()));

        this.drawBar(c, 16, 32, 64, 16,
            136, 4, 
            this.state.getXpPercentage(), 1,
            String("LEVEL ") + String(this.state.getLevel()));

        // Draw the multiplier
        let mul = this.state.getMultiplier() + 10;
        let mulStr = "\2" + String((mul/10) | 0) + "." + 
            String(mul - 10*((mul/10)|0));

        c.drawText(c.getBitmap("font"), mulStr,
            236, 5, -1, 0, true);

        // Draw the multiplier time bar
        this.drawBar(c, 80, 6, 32, 6,
            220, 13, 
            this.state.getMulTimer());
    }

}
