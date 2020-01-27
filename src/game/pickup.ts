/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An "AI" for pick-up items
class PickUpAI extends AIComponent {


    constructor(base : EntityBase) {

        super(base);

        this.base.acc.x = 0.05;
        this.base.acc.y = 0.05;
    }   


    public reset(speed : Vector2,
        target? : Vector2, acc? : Vector2) {

        this.base.speed = speed.clone();
        this.base.speed.x = -1.0 + this.base.speed.x;
        this.base.target.x = -1.0;
    }


    public update(ev : CoreEvent) {

        const BOTTOM = 192-16 - 6;
        const GRAVITY = 4.0;
        const JUMP_MUL = 0.90;

        this.base.target.y = GRAVITY;

        if (this.base.pos.y > BOTTOM) {

            // In the case speed goes so low the coin
            // could fall below the floor.
            this.base.pos.y = BOTTOM;
            if (this.base.speed.y > 0) {

                this.base.speed.y *= -JUMP_MUL;
            }
        }

        if (this.base.pos.x < -8) {

            this.base.exist = false;
        }
    }
}



// Renders pick-ups
class PickUpRenderer extends RenderComponent {

    private animSpeed : number;


    constructor(base : EntityBase) {

        super(base, 16, 16);
    }


    public reset(row = 0, speed = 0, speedMod? : number) {

        this.spr.setFrame(row, 0);
        this.animSpeed = speed;
    }


    public animate(ev : CoreEvent) {
        
        this.spr.animate(this.spr.getRow(), 0, 3, 
            this.animSpeed, ev.step);
    }
}


// Something to pick up
class PickUp extends Entity {


    private lstate : LocalState;
    private renderRef : PickUpRenderer;


    constructor(lstate : LocalState) {

        super();

        this.renderRef = new PickUpRenderer(this.base);
        this.renderComp = this.renderRef;
        this.ai = new PickUpAI(this.base);

        this.base.exist = false;
        this.base.hitbox = new Vector2(
            16, 16
        );

        this.lstate = lstate;
    }


    // Spawn
    public spawn(pos : Vector2, speed : Vector2, id : number) {

        const SPIN_SPEED = 6;

        this.base.exist = true;
        this.base.dying = false;

        this.base.pos = pos.clone();
        this.ai.reset(speed);
        
        this.renderRef.reset(0, SPIN_SPEED);
    }


    // Hostile collision
    protected hostileCollision(e : Entity, kill = true) {

        this.kill();

        // TODO: Effect?
    }
}
