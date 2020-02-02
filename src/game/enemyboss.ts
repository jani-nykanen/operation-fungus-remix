/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

// (This file has a weird name so that it can extend
// the Enemy class)


class BossAI extends AIComponent {
    
    private readonly MOUTH_WAIT_MIN = 180;
    private readonly MOUTH_WAIT_VARY = 60;

    private readonly EYE_WAIT_MIN = 120;
    private readonly EYE_WAIT_VARY = 60;


    private rendComp : BossRenderer;
    private ready : boolean;

    private readonly shootCB : ShootCallback;

    private mouthWait : number;
    private eyeWait : number;


    constructor(base : EntityBase, 
        rendComp : BossRenderer,
        shootCB? : ShootCallback) {

        super(base);
    
        this.rendComp = rendComp;
        this.ready = false;

        this.shootCB = shootCB;

        this.mouthWait = 0;
        this.eyeWait = this.EYE_WAIT_MIN;

        this.base.acc.x = 0.1;
        this.base.acc.y = 0.1;
    }


    // Open mouth
    private openMouth(ev : CoreEvent) {

        const MOUTH_TIME = 30;
        const SPEED_MIN = 2.0;
        const SPEED_VARY = 1.0;
        const ANGLE = Math.PI/3 / 5;

        this.rendComp.animateMouth(MOUTH_TIME);

        this.mouthWait = this.MOUTH_WAIT_MIN + 
            (Math.random()*this.MOUTH_WAIT_VARY) | 0;

        // Create bullets
        let angle = 0;
        let speed = 0;
        for (let i = -2; i <= 2; ++ i) {

            angle = i * ANGLE;

            speed = SPEED_MIN + Math.random()*SPEED_VARY;
            this.shootCB(new Vector2(
                this.base.pos.x-8, this.base.pos.y+8
            ),
            new Vector2(
                -Math.cos(angle) * speed,
                Math.sin(angle) * speed
            ), 60, 2);
        }
    }


    // Open the eye
    private openEye(ev : CoreEvent) {

        const COUNT_1 = 4;

        const EYE_TIME = 30;
        const SPEED_1 = 4.0;
        const SPEED_2 = 3.0;
        const SPEED_REDUCE = 0.75;
        const ANGLE = Math.PI / 6.0;

        this.rendComp.animateEye(EYE_TIME);

        this.eyeWait = this.EYE_WAIT_MIN + 
            (Math.random()*this.EYE_WAIT_VARY) | 0;

        let mode = (Math.random() * 2) | 0;

        let pos = new Vector2(
            this.base.pos.x - 8,
            this.base.pos.y-8
        );

        let angle = 0;
        switch(mode) {

        case 0:

            for (let i = 0; i < COUNT_1; ++ i) {

                this.shootCB(
                    pos, 
                    new Vector2(-SPEED_1 + SPEED_REDUCE*i, 
                        -this.base.speed.y/4
                    ),
                    30
                );
            }
            break;

        case 1:

            for (let i = -1; i <= 1; ++ i) {

                angle = ANGLE * i;
                this.shootCB(pos,
                    new Vector2(
                        -Math.cos(angle) * SPEED_2,
                        Math.sin(angle) * SPEED_2
                    ), 30);
            }

            break;

        default:
            break;
        }
    }


    // Update
    public update(ev : CoreEvent) {

        const APPEAR_SPEED = 1.0;
        const APPEAR_LIMIT = 256-40;

        const TOP = 56;
        const BOTTOM = 192-64;
        const VERTICAL_SPEED = 1.0;

        // Appear
        if (!this.ready) {

            this.base.target.x = -APPEAR_SPEED;
            this.base.speed.x = -APPEAR_SPEED;

            if (this.base.pos.x < APPEAR_LIMIT) {

                this.base.target.x = 0;
                this.ready = true;

                this.base.target.y = VERTICAL_SPEED;
            }

            return;
        }
        
        

        // Update timers
        if ((this.mouthWait -= ev.step) <= 0) {

            this.openMouth(ev);
        }
        if ((this.eyeWait -= ev.step) <= 0) {

            this.openEye(ev);
        }

        // Check vertical speed
        if ( (this.base.target.y < 0 &&
            this.base.pos.y < TOP) || 
            (this.base.target.y > 0 &&
                this.base.pos.y > BOTTOM)){

            this.base.target.y *= -1;
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

    private mouthTimer : number;
    private eyeTimer : number;


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

        this.mouthTimer = 0;
        this.eyeTimer = 0;
    }


    // Animate
    public animate(ev : CoreEvent) {

        const PROPELLER_SPEED = 4;

        this.sprPropeller.animate(4, 0, 3,
            PROPELLER_SPEED, ev.step);

        this.sprMouth.setFrame(this.mouthTimer > 0 ? 1 : 0, 1);
        this.sprEye.setFrame(this.eyeTimer > 0 ? 1 : 0, 2);

        if (this.mouthTimer > 0)
            this.mouthTimer -= ev.step;

        if (this.eyeTimer > 0)
            this.eyeTimer -= ev.step;    
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


    // Setters
    public animateMouth = (time : number) => {this.mouthTimer = time;}
    public animateEye = (time : number) => {this.eyeTimer = time;}
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

        this.ai = new BossAI(this.base, this.rendRef, shootCB);

        this.hurtIndex = 0;
        this.base.power = 100;

        this.base.maxHealth = HEALTH;
        this.base.health = HEALTH;

        this.isStatic = true;

    }

}
