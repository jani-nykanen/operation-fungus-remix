/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A general entity class
class Entity {

    protected base : EntityBase;
    protected renderComp? : RenderComponent;
    protected ai? : AIComponent;

    protected power : number;


    constructor(x? : number, y? : number) {

        this.base = new EntityBase(x, y);

        this.power = 1;
    }


    // Update the entity
    update(ev : CoreEvent) {

        if (!this.base.exist) return;

        // Check death
        if (this.base.dying) {

            if (this.renderComp.animateDeath(ev)) {

                this.base.exist = false;
            }

            return;
        }

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


    protected hostileCollision?(e : Entity) : any;

    // Collision with another entity
    public entityCollision(e : Entity, hostile? : boolean) : boolean {

        if (!e.doesExist() || !this.base.exist ||
             e.isDying() || this.base.dying) return;

        let p = e.getPos();
        let ep = e.getPos();

        let h = e.getHitbox();
        let eh = e.getHitbox();

        let collide = 
            p.x + h.x/2 >= ep.x - eh.x/2 &&
            p.y + h.y/2 >= ep.y - eh.y/2 &&
            p.x - h.x/2 <= ep.x + eh.x/2 &&
            p.y - h.y/2 <= ep.y + eh.y/2;

        if (hostile && collide && 
            this.hostileCollision != undefined) {

            this.hostileCollision(e);
        }


        return false;
    }


    // Getters
    public doesExist = () => this.base.exist;
    public getPower = () => this.power;
    public getPos = () => this.base.pos.clone();
    public getHitbox = () => this.base.hitbox.clone();
    public isDying = () => this.base.dying;
}
