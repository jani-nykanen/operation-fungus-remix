/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A base class for rendering
class RenderComponent {

    public spr : Sprite;
    public base : EntityBase;
    public flip : boolean;
    public shadowSize : Vector2;


    constructor(base : EntityBase, 
        width : number, height : number) {

        this.base = base;
        this.spr = new Sprite(width, height);
        this.flip = false;

        // Set the default shadow size
        this.shadowSize = new Vector2();
        this.shadowSize.x = width * 0.75;
        this.shadowSize.y = this.shadowSize.x / 4;
    }


    // Animate
    public animate?(ev : CoreEvent) : any;


    // Draw
    public draw(c : Canvas, bmp? : Bitmap) {

        let x = Math.round(this.base.pos.x - this.spr.width/2);
        let y = Math.round(this.base.pos.y - this.spr.width/2);

        if (bmp != null) {

            c.drawSprite(this.spr, bmp, x, y,
                this.flip);
        }
        else {

            // A placeholder sprite for unfinished
            // stuff
            c.fillRect(x, y, this.spr.width, this.spr.height);
        }
    }


    // Draw a shadow
    public drawShadow(c : Canvas) {

        const SHADOW_ALPHA = 0.67;
        const SCALE_FACTOR = 0.5;
        const FLOOR_Y = 192-16;

        let scale = 1.0 - SCALE_FACTOR*
            Math.max(0, c.height - this.base.pos.y)/c.height;

        let w = (scale * this.shadowSize.x) | 0;
        let h = (scale * this.shadowSize.y) | 0;

        let x = (this.base.pos.x - w/2) | 0;
        let y = (FLOOR_Y - h/2) | 0;

        c.setAlpha(SHADOW_ALPHA);
        c.drawScaledBitmap(c.getBitmap("shadow"), x, y, w, h);
        c.setAlpha();
    }   
}
