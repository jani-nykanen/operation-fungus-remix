/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */

// (This file has a weird name so that it can extend
// the Enemy class)


// Orbiter, travels around the actual boss
class OrbiterAI extends AIComponent {


    private readonly center : Vector2;
    private radius : number;
    private angle : number;
    private speed : number;


    constructor(base : EntityBase, center : Vector2,  radius : number,
        speed = 1.0, angle = 0) {

        super(base);

        // We do not clone this since we need the
        // reference
        this.center = center;

        this.angle = angle;
        this.speed = speed;
        this.radius = radius;
    }


    // Update
    public update(ev : CoreEvent) {

        const SPEED_MUL = 0.033;
        const MIN_Y = 192-16;

        this.angle = (this.angle + SPEED_MUL*this.speed*ev.step) % (Math.PI*2);

        // Compute position
        this.base.pos.x = this.center.x +
            Math.cos(this.angle) * this.radius;

        this.base.pos.y = this.center.y +
            Math.sin(this.angle) * this.radius;

        this.base.pos.y = Math.min(MIN_Y - this.base.hitbox.y/2, this.base.pos.y);

    }


    // Set speed
    public setSpeed(s : number) {

        this.speed = s;
    }


    // Set radius
    public setRadius(r : number) {

        this.radius = r;
    }
}


class Orbiter extends Entity {


    private readonly aiRef : OrbiterAI;


    constructor(center : Vector2, radius : number, speed = 1.0, angle = 0) {

        super();

        this.aiRef = new OrbiterAI(this.base, center, radius,
            speed, angle);

        this.base.power = 100;
        this.base.hitbox = new Vector2(
            18, 18
        );

        this.base.exist = true;
        this.base.dying = false;

        this.renderComp = new RenderComponent(this.base, 32, 32);

        this.ai = this.aiRef;

        this.immune = true;
    }


    // Hostile collision (for bullets only)
    protected hostileCollision(e : Entity, kill = true) {

        if (kill)
            e.kill();
    }


    // Set speed
    public setSpeed = (s : number) => this.aiRef.setSpeed(s);

    // Set radius
    public setRadius = (s : number) => this.aiRef.setRadius(s);
}


class BossAI extends AIComponent {
    
    private readonly MOUTH_WAIT_MIN = 180;
    private readonly MOUTH_WAIT_VARY = 60;

    private readonly EYE_WAIT_MIN = 120;
    private readonly EYE_WAIT_VARY = 60;

    private readonly RUSH_TIME_MIN = 180;
    private readonly RUSH_TIME_VARY = 180;


    private rendComp : BossRenderer;
    private ready : boolean;

    private readonly shootCB : ShootCallback;

    private mouthWait : number;
    private eyeWait : number;
    private rushTime : number;
    private rushing : number;
    private speedMod : number;


    constructor(base : EntityBase, 
        rendComp : BossRenderer,
        shootCB? : ShootCallback) {

        super(base);
    
        this.rendComp = rendComp;
        this.ready = false;

        this.shootCB = shootCB;

        this.mouthWait = 0;
        this.eyeWait = this.EYE_WAIT_MIN;

        this.rushTime = this.RUSH_TIME_MIN + this.RUSH_TIME_VARY;
        this.rushing = 0;

        this.base.acc.x = 0.1;
        this.base.acc.y = 0.1;

        this.speedMod = 1.0;
    }


    // Open mouth
    private openMouth(ev : CoreEvent) {

        const MOUTH_TIME = 30;
        const SPEED_MIN = 2.0;
        const SPEED_VARY = 1.0;

        ev.audio.playSample(ev.assets.getSound("enemyShoot2"), 0.50);

        let bulletCount = 3 + 
            2 * Math.floor(3 * (1- this.base.health / this.base.maxHealth));

        let bAngle = Math.PI/3 / bulletCount;

        this.rendComp.animateMouth(MOUTH_TIME);

        this.mouthWait = this.MOUTH_WAIT_MIN + 
            (Math.random()*this.MOUTH_WAIT_VARY) | 0;

        // Create bullets
        let angle = 0;
        let speed = 0;
        for (let i = -Math.floor(bulletCount/2); i <= Math.floor(bulletCount/2); ++ i) {

            angle = i * bAngle;

            speed = SPEED_MIN + Math.random()*SPEED_VARY * 
                this.speedMod;
            this.shootCB(new Vector2(
                this.base.pos.x-8, this.base.pos.y+8
            ),
            new Vector2(
                -Math.cos(angle) * speed,
                Math.sin(angle) * speed
            ), 60, 3);
        }
    }


    // Open the eye
    private openEye(ev : CoreEvent) {

        const COUNT_1 = 3;

        const EYE_TIME = 30;
        const SPEED_1 = 4.0;
        const SPEED_2 = 3.0;
        const SPEED_REDUCE = 0.5;
        const ANGLE = Math.PI / 12.0;

        ev.audio.playSample(ev.assets.getSound("enemyShoot"), 0.50);

        this.rendComp.animateEye(EYE_TIME);

        this.eyeWait = this.EYE_WAIT_MIN + 
            (Math.random()*this.EYE_WAIT_VARY) | 0;

        let mode = (Math.random() * 2) | 0;

        let pos = new Vector2(
            this.base.pos.x - 8,
            this.base.pos.y-8
        );

        let bonus = Math.floor(3 * (1- this.base.health / this.base.maxHealth));

        let angle = 0;
        let speed = 0;
        switch(mode) {

        case 0:

            for (let i = 0; i < COUNT_1 + bonus; ++ i) {

                this.shootCB(
                    pos, 
                    new Vector2(-SPEED_1 + SPEED_REDUCE*i - (this.speedMod-1.0), 
                        -this.base.speed.y/4
                    ),
                    30
                );
            }
            break;

        case 1:

            speed = SPEED_2 + (this.speedMod-1.0);
            for (let i = -1 - bonus; i <= 1 + bonus; ++ i) {

                angle = ANGLE * i;
                this.shootCB(pos,
                    new Vector2(
                        -Math.cos(angle) * speed,
                        Math.sin(angle) * speed
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
        const LEFT = 48;
        const RIGHT = 48;
        const VERTICAL_SPEED = 1.0;
        const RUSH_SPEED = 2.0;
        const RUSH_MOD = 1.0;
        const SPEED_MOD = 0.5;

        // Compute speed modifier
        this.speedMod = 1.0 + SPEED_MOD * 
            Math.floor(3 * (1- this.base.health / this.base.maxHealth));

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
        

        // Check rushing
        if (this.rushing == 0) {

            // Update shooting timers
            if ((this.mouthWait -= ev.step * this.speedMod ) <= 0) {

                this.openMouth(ev);
            }
            if ((this.eyeWait -= ev.step * this.speedMod ) <= 0) {

                this.openEye(ev);
            }

            if ((this.rushTime -= ev.step * this.speedMod ) <= 0) {

                this.base.target.x = -RUSH_SPEED -
                    (this.speedMod-1.0) * RUSH_MOD;
                this.rushing = 1;
            }
        }
        else {

            if (this.rushing == 1 &&
                this.base.target.x < 0 &&
                this.base.pos.x < LEFT * this.speedMod) {

                this.base.target.x *= -1;
                this.rushing = 2;
            }
            else if (this.rushing == 2 &&
                this.base.target.x > 0 &&
                this.base.pos.x > 256 - RIGHT * this.speedMod) {

                this.base.target.x = 0;
                this.rushing = 0;

                this.rushTime = this.RUSH_TIME_MIN +
                    (Math.random() * this.RUSH_TIME_VARY) | 0;
            }
            
        }

        // Check vertical speed
        if ( (this.base.target.y < 0 &&
            this.base.pos.y < TOP) || 
            (this.base.target.y > 0 &&
                this.base.pos.y > BOTTOM)){

            this.base.target.y *= -1;
        }
    }


    // Getters
    public getSpeedMod = () => this.speedMod;
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
    private musicStopped : boolean;

    private readonly endCB? : (() => any);


    constructor(base : EntityBase, endCB? : (() => any)) {

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

        this.endCB = endCB;

        this.musicStopped = false;
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

        let oldTime = this.deathTimer;
        this.deathTimer -= ev.step;

        if (!this.musicStopped) {

            ev.audio.playSample(ev.assets.getSound("explode"), 0.40);
            ev.audio.stopMusic();
            this.musicStopped = true;
        }

        if (this.endCB != undefined &&
            oldTime > this.DEATH_TIME2 &&
            this.deathTimer <= this.DEATH_TIME2) {

            this.endCB();
        }

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
                Math.floor(this.deathTimer / this.DEATH_TIME2*4)/4);
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


    private orbiter : Orbiter;
    private aiRef : BossAI;


    constructor(x : number, y : number,
        shootCB? : ShootCallback,
        endCB? : (() => any)) {

        super(x, y);

        const HEALTH = 2400;
        const ORBITER_RADIUS = 56;

        this.base.exist = true;
        this.base.dying = false; // Should not be needed
        this.base.hitbox = new Vector2(48, 48);

        this.rendRef = new BossRenderer(this.base, endCB);
        this.renderComp = this.rendRef;

        this.aiRef = new BossAI(this.base, this.rendRef, shootCB);
        this.ai = this.aiRef;

        this.hurtIndex = 0;
        this.base.power = 100;
        this.base.xp = 1000;

        this.base.maxHealth = HEALTH;
        this.base.health = HEALTH;

        this.isStatic = true;

        this.orbiter = new Orbiter(this.base.pos,
            ORBITER_RADIUS,
            1.0, 0.0);
    }


    // Refresh
    public refresh(ev : CoreEvent) {

        if (!this.doesExist()) return;

        if (this.isDying())
            this.orbiter.kill();

        this.orbiter.setSpeed(this.aiRef.getSpeedMod());
    }


    // Get orbiter (for stuff)
    public getOrbiter() : Orbiter {

        return this.orbiter;
    }

}
