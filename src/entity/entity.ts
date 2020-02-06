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
    protected immune : boolean;


    constructor(x? : number, y? : number) {

        this.base = new EntityBase(x, y);

        this.offset = new Vector2();
        this.immune = false;
    }


    protected refresh?(ev : CoreEvent) : any;


    // Update the entity
    update(ev : CoreEvent) {

        if (!this.base.exist) return;

        if (this.refresh != undefined) {

            this.refresh(ev);
        }

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

        if (!this.base.exist || this.base.dying) return;

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
        if (!this.base.dying && 
            this.renderComp.flickerTime > 0 &&
            Math.floor(this.renderComp.flickerTime/4) % 2 == 0)
            return;
        
        if (this.renderComp != undefined) {

            //c.move(this.offset.x | 0, this.offset.y | 0);
            this.renderComp.draw(c, bmp);
            //c.move(-this.offset.x | 0, -this.offset.y | 0);
        }
    }


    protected hostileCollision?(e : Entity, kill? : boolean) : any;

    // Collision with another entity
    public entityCollision(e : Entity, hostile? : boolean, kill = true) : number {

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

            this.hostileCollision(e, kill);
            return this.immune ? 0 : e.getPower();
        }

        return 0;
    }


    // Kill
    public kill(hardDeath = false, deathEvent = true) {

        if (!this.base.exist) return;

        if (hardDeath) {

            this.base.exist = false;
            this.base.dying = false;
            return;
        }

        this.base.die(deathEvent);
    }


    // Start flickering
    public flicker(time : number) {

        this.renderComp.flickerTime = time;
    }


    // Death triggered
    protected triggerDeath?() : any;


    // Reduce health
    public reduceHealth(delta : number) {

        this.base.health -= delta;
        if (this.base.health <= 0) {

            if (this.triggerDeath != undefined)
                this.triggerDeath();

            this.kill();
        }
    }


    // Add health (TODO: Merge with the above method)
    public addHealth(amount : number) {

        this.base.health = Math.min(
            this.base.maxHealth,
            this.base.health + amount
        );
    }


    // Getters
    public doesExist = () => this.base.exist;
    public getPower = () => this.base.power;
    public getPos = () => this.base.pos.clone();
    public getSpeed = () => this.base.speed.clone();
    public getHitbox = () => this.base.hitbox.clone();
    public isDying = () => this.base.dying;
    public getOffset = () => this.offset.clone();
    public getHealth = () => this.base.health;
    public getXP(dmg = 0) : number {

        let c = 0;
        if (this.base.health >= 0)
            c = dmg;
        else {

            c = this.base.health + dmg;
        }
        return c;
    }
    public getMaxHealth = () => this.base.maxHealth;
    public getSpriteRow = () => this.renderComp.getSpriteRow();
}
