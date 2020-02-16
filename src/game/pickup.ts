/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An "AI" for pick-up items
class PickUpAI extends AIComponent {


    private id : number;


    constructor(base : EntityBase) {

        super(base);

        this.base.acc.x = 0.05;
        this.base.acc.y = 0.05;

        this.id = 0;
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
        const JUMP_MUL = 0.95;

        this.base.target.y = GRAVITY;

        if (this.base.pos.y > BOTTOM) {

            // In the case speed goes so low the coin
            // could fall below the floor.
            this.base.pos.y = BOTTOM;
            if (this.base.speed.y > 0) {

                this.base.speed.y *= -JUMP_MUL;

                if (this.id < 4)
                    this.id = (this.id + 1) % 4;
            }
        }

        if (this.base.pos.x < -8) {

            this.base.exist = false;
        }
    }


    // Getters & setters
    public setId(id : number) {
        this.id = id;
    }
    public getId = () => this.id;
}



// Renders pick-ups
class PickUpRenderer extends RenderComponent {

    private animSpeed : number;
    private length : number;


    constructor(base : EntityBase) {

        super(base, 16, 16);
    }


    public reset(row = 0, speed = 0, length = 4) {

        this.length = length;

        this.spr.setFrame(row, 0);
        this.animSpeed = speed;
    }


    public animate(ev : CoreEvent) {
        
        this.spr.animate(this.spr.getRow(), 0, this.length-1, 
            this.animSpeed, ev.step);
    }


    public changeRow(row : number) {

        this.spr.setRow(row);
    }


    public getRow = () => this.spr.getRow();
}


// Something to pick up
class PickUp extends Entity {


    private lstate : LocalState;
    private renderRef : PickUpRenderer;
    private aiRef : PickUpAI;


    constructor(lstate : LocalState) {

        super();

        this.renderRef = new PickUpRenderer(this.base);
        this.renderComp = this.renderRef;

        this.aiRef = new PickUpAI(this.base);
        this.ai = this.aiRef;

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

        this.aiRef.setId(id);
        
        this.renderRef.reset(id, SPIN_SPEED, id == 4 ? 8 : 4);
    }


    // Refresh
    public refresh() {

        if (this.base.dying || !this.base.exist)
            return;

        this.renderRef.changeRow(this.aiRef.getId());
    }


    // Hostile collision
    protected hostileCollision(e : Entity, kill = true, ev? : CoreEvent) {

        const SOUNDS = ["dmgUp", "defUp", "speedUp", "bulletsUp", "healthUp"];
        const BONUS_TIME = 5;

        this.kill();

        if (this.aiRef.getId() == 4) {

            e.addHealth(e.getMaxHealth() / 2);
        }
        else {

            this.lstate.increaseBonusTimer(BONUS_TIME * 60, 
                this.aiRef.getId());
        }

        ev.audio.playSample(ev.assets.getSound(SOUNDS[this.aiRef.getId()]), 0.50);
    }
}
