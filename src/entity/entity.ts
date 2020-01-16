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
        if (this.ai != undefined &&
            this.ai.update != undefined) {

            this.ai.update(ev);
        }
        if (this.renderComp != undefined &&
            this.renderComp.animate != undefined) {

            this.renderComp.animate(ev);
        }
        this.base.update(ev);
    }


    // Draw shadows
    drawShadow(c : Canvas) {

        if (!this.base.exist) return;

        if (this.renderComp != undefined) {

            this.renderComp.drawShadow(c);
        }
    }


    // Draw the back layer stuff
    drawBackLayer(c : Canvas) {

        if (!this.base.exist) return;
        
        if (this.renderComp != undefined &&
            this.renderComp.drawBefore != undefined) {

            this.renderComp.drawBefore(c);
        }
    }


    // Draw
    draw(c : Canvas, bmp? : Bitmap) {

        if (!this.base.exist) return;
        
        if (this.renderComp != undefined) {

            this.renderComp.draw(c, bmp);
        }
    }


    // Getters
    public doesExist = () => this.base.exist;

}
