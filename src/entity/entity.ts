/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A general entity class
class Entity {

    protected base : EntityBase;
    protected renderComp? : RenderComponent;
    protected ai? : AIComponent;
    protected offset : Vector2;

    protected health : number;
    protected maxHealth : number;
    protected power : number;


    constructor(x? : number, y? : number) {

        this.base = new EntityBase(x, y);

        this.offset = new Vector2();
        this.power = 1;

        this.maxHealth = 1;
        this.health = this.maxHealth;
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
            this.renderComp.update != undefined) {

            this.renderComp.update(ev);
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

        // Skip frame, if flickering
        if (this.renderComp.flickerTime > 0 &&
            Math.floor(this.renderComp.flickerTime/4) % 2 == 0)
            return;
        
        if (this.renderComp != undefined) {

            c.move(this.offset.x | 0, this.offset.y | 0);
            this.renderComp.draw(c, bmp);
            c.move(-this.offset.x | 0, -this.offset.y | 0);
        }
    }


    protected hostileCollision?(e : Entity) : any;

    // Collision with another entity
    public entityCollision(e : Entity, hostile? : boolean) : number {

        if (!e.doesExist() || !this.base.exist ||
             e.isDying() || this.base.dying) return;

        let off = this.getOffset();
        let poff = e.getOffset();

        let p = this.base.pos.clone();
        p.x += off.x; p.y += off.y;
        let ep = e.getPos();
        ep.x += poff.x; p.y += poff.y;

        let h = this.base.hitbox;
        let eh = e.getHitbox();

        let collide = 
            p.x + h.x/2 >= ep.x - eh.x/2 &&
            p.y + h.y/2 >= ep.y - eh.y/2 &&
            p.x - h.x/2 <= ep.x + eh.x/2 &&
            p.y - h.y/2 <= ep.y + eh.y/2;

        if (hostile && collide && 
            this.hostileCollision != undefined) {

            this.hostileCollision(e);
            return e.getPower();
        }

        return 0;
    }


    // Kill
    public kill() {

        if (!this.base.exist) return;

        this.base.die();
    }


    // Start flickering
    public flicker(time : number) {

        this.renderComp.flickerTime = time;
    }


    // Reduce health
    public reduceHealth(delta : number) {

        this.health -= delta;
        if (this.health <= 0) {

            this.kill();
        }
    }


    // Getters
    public doesExist = () => this.base.exist;
    public getPower = () => this.power;
    public getPos = () => this.base.pos.clone();
    public getSpeed = () => this.base.speed.clone();
    public getHitbox = () => this.base.hitbox.clone();
    public isDying = () => this.base.dying;
    public getOffset = () => this.offset.clone();
    public getHealth = () => this.health;

}
