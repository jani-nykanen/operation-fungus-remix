/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A general entity class
class Entity {

    private base : EntityBase;
    private renderComp? : RenderComponent;


    constructor(x? : number, y? : number) {

        this.base = new EntityBase(x, y);
    }


    // Update EVERYTHING!!!
    update(ev : CoreEvent) {

        if (!this.base.exist) return;

        this.base.update(ev);
    }


    // Draw
    draw(c : Canvas, bmp : Bitmap) {

        if (!this.base.exist) return;

        if (this.renderComp != undefined) {

            this.renderComp.draw(c, bmp);
        }
    }

}