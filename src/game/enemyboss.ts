/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

// (This file has a weird name so that it can extend
// the Enemy class)


class BossAI extends AIComponent {
    

    private rendComp : BossRenderer;
    private ready : boolean;

    private readonly shootCB : ShootCallback;


    constructor(base : EntityBase, 
        rendComp : BossRenderer,
        shootCB? : ShootCallback) {

        super(base);
    
        this.rendComp = rendComp;
        this.ready = false;

        this.shootCB = shootCB;
    }


    // Update
    public update(ev : CoreEvent) {

        const APPEAR_SPEED = 1.0;
        const APPEAR_LIMIT = 256-40;

        // Appear
        if (!this.ready) {

            this.base.target.x = -APPEAR_SPEED;
            this.base.speed.x = -APPEAR_SPEED;

            if (this.base.pos.x < APPEAR_LIMIT) {

                this.base.target.x = 0;
                this.ready = true;
            }
        }
    }
}


class BossRenderer extends RenderComponent {


    private readonly DEATH_TIME1 = 60;
    private readonly DEATH_TIME2 = 60;


    private sprPropeller : Sprite;
    private sprMouth : Sprite;
    private sprEye : Sprite;

    private deathTimer : number;


    constructor(base : EntityBase) {

        super(base, 64, 64);

        this.spr.setFrame(0, 0);

        this.sprPropeller = new Sprite(48, 16);
        this.sprPropeller.setFrame(4, 0);

        this.sprMouth = new Sprite(64, 32);
        this.sprMouth.setFrame(0, 1);

        this.sprEye = new Sprite(64, 32);
        this.sprEye.setFrame(0, 2);

        this.shadowSize.x = 56;
        this.shadowSize.y = this.shadowSize.x / 4;

        this.deathTimer = this.DEATH_TIME1 + this.DEATH_TIME2;
    }


    // Animate
    public animate(ev : CoreEvent) {

        const PROPELLER_SPEED = 4;

        this.sprPropeller.animate(4, 0, 3,
            PROPELLER_SPEED, ev.step);
    }


    // Animate death
    public animateDeath(ev : CoreEvent) : boolean {

        this.deathTimer -= ev.step;

        return this.deathTimer <= 0.0;
    }


    // Draw base
    private drawBase(c : Canvas, jump1 = 0, jump2 = 0, jump3 = 0) {

        let x = Math.round(this.base.pos.x - 32);
        let y = Math.round(this.base.pos.y - 32);

        let bmp = c.getBitmap("boss");

        // Propeller
        c.drawSpriteFrame(this.sprPropeller, bmp,
            this.sprPropeller.getFrame(), 
            this.sprPropeller.getRow() + jump2,
            x+8, y+56);

        // Body
        c.drawSpriteFrame(this.spr, bmp,
            this.spr.getFrame(), this.spr.getRow() + jump1,
            x, y);

        // Mouth
        c.drawSpriteFrame(this.sprMouth, bmp,
            this.sprMouth.getFrame(), this.sprMouth.getRow() + jump3,
            x, y+32);

        // Eye
        c.drawSpriteFrame(this.sprEye, bmp,
            this.sprEye.getFrame(), this.sprEye.getRow() + jump3,
            x, y+16);    
    }


    // Draw dying
    private drawDying(c : Canvas) {

        let x = Math.round(this.base.pos.x);
        let y = Math.round(this.base.pos.y);

        let w, h : number;
        let t : number;
        if (this.deathTimer >= this.DEATH_TIME2) {

           t = 1.0 - (this.deathTimer - this.DEATH_TIME2) / this.DEATH_TIME1;

           w = Math.floor(256 * t);
           h = Math.floor(192 * t);

           c.setColor(255, 255, 255);

           c.fillRect(x - w / 2, 0, w, 192);
           c.fillRect(0, y - h/2, 256, h);
        }
        else {

            c.setColor(255, 255, 255,
                Math.floor(this.deathTimer / this.DEATH_TIME2*8)/8);
            c.fillRect(0, 0, c.width, c.height);
        }
    }


    // Override draw
    public draw(c : Canvas, bmp? : Bitmap) {

        if (!this.base.dying ||
            this.deathTimer > this.DEATH_TIME2) {
            
            this.drawBase(c, 2, 8, 4);
            this.drawBase(c);
        }

        if (this.base.dying) {

            this.drawDying(c);
            return;
        }
    }
}


class Boss extends Enemy {


    constructor(x : number, y : number,
        shootCB? : ShootCallback) {

        super(x, y);

        const HEALTH = 3000;

        this.base.exist = true;
        this.base.hitbox = new Vector2(48, 48);

        this.rendRef = new BossRenderer(this.base);
        this.renderComp = this.rendRef;

        this.ai = new BossAI(this.base, this.rendRef);

        this.hurtIndex = 0;
        this.base.power = 100;

        this.base.maxHealth = HEALTH;
        this.base.health = HEALTH;

        this.isStatic = true;

    }

}
