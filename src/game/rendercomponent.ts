/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A base class for rendering
class RenderComponent {

    public spr : Sprite;
    public base : EntityBase;
    public flip : boolean;


    constructor(base : EntityBase, 
        width : number, height : number) {

        this.base = base;
        this.spr = new Sprite(width, height);
        this.flip = false;
    }


    // Draw
    public draw(c : Canvas, bmp? : Bitmap) {

        let x = Math.round(this.base.pos.x - this.spr.width/2);
        let y = Math.round(this.base.pos.y - this.spr.width/2);

        if (bmp == null) {

            c.drawSprite(this.spr, bmp, x, y,
                this.flip);

        }
        else {

            // A placeholder sprite for unfinished
            // stuff
            c.fillRect(x, y, this.spr.width, this.spr.height);
        }
    }
}
