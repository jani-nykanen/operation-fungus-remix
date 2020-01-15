/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A general entity class
class Entity {

    protected base : EntityBase;
    protected renderComp? : RenderComponent;
    protected ai? : AIComponent;


    constructor(x? : number, y? : number) {

        this.base = new EntityBase(x, y);
    }


    // Update the entity
    update(ev : CoreEvent) {

        if (!this.base.exist) return;

        // Update every component
        if (this.ai != undefined) {

            this.ai.update(ev);
        }
        this.base.update(ev);
    }


    // Draw
    draw(c : Canvas, bmp? : Bitmap) {

        if (!this.base.exist) return;
        
        if (this.renderComp != undefined) {

            this.renderComp.draw(c, bmp);
        }
    }

}
