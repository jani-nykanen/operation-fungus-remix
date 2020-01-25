/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

 
enum EnemyType {
    Fly = 0,
    Slime = 1,
    FleeingFly = 2,
}



 
class MovementLogic {

    protected base : EntityBase;

    constructor(base : EntityBase) {

        this.base = base;
    }

    public move? (ev : CoreEvent) : any;
}


class ShootingLogic {

    protected base : EntityBase;
    protected animCB : (() => any);
    protected shootCB : (pos : Vector2, speed: Vector2, power : number) => any; 
    protected timer : number;


    constructor(base : EntityBase,
        animCB? : (() => any),
        shootCB? : (pos : Vector2, speed: Vector2, power : number) => any) {

        this.base = base;
        this.timer = 0;
        this.animCB = animCB;
        this.shootCB = shootCB;
    }


    public update?(ev : CoreEvent) : any;
}


// Renders enemies
class EnemyRenderer extends RenderComponent {

    private animSpeed : number;
    private shootTimer : number;

    constructor(base : EntityBase) {

        super(base, 24, 24);
    }


    public reset(row? : number, speed? : number) {

        this.spr.setFrame(row+1, (Math.random()*4) | 0);
        this.animSpeed = speed;
        this.flickerTime = 0.0;
    }


    public animate(ev : CoreEvent) {

        let start = 0;
        if (this.shootTimer > 0) {

            this.shootTimer -= ev.step;
            if (this.shootTimer <= 0) {

                this.spr.setFrame(this.spr.getRow(),
                    this.spr.getFrame() - 4);
            }
            else {

                start += 4;
            }
        }
        
        this.spr.animate(this.spr.getRow(), start, start+3, 
            this.animSpeed, ev.step);
    }


    // Animate shooting
    public animateShooting(time : number) {

        if (this.shootTimer <= 0) {

            this.spr.setFrame(this.spr.getRow(),
                this.spr.getFrame() + 4);
        }

        this.shootTimer = time;

    }


    // Animate death
    public animateDeath(ev : CoreEvent) : boolean {

        const DEATH_SPEED = 4;

        this.spr.animate(0, 0, 6, 
            DEATH_SPEED, ev.step);

        return this.spr.getFrame() == 6;
    }
}


// The base AI component
class BaseEnemyAI extends AIComponent {

    protected moveComp? : MovementLogic;
    protected shootComp? : ShootingLogic;
    protected readonly follow? : Entity;
    protected readonly rendComp? : EnemyRenderer;


    constructor(base : EntityBase, 
        rendComp : EnemyRenderer) {

        super(base);
    
        this.rendComp = rendComp;
    }


    // Update
    public update(ev : CoreEvent) {

        // Move
        if (this.moveComp != undefined &&
            this.moveComp.move != undefined) {

            this.moveComp.move(ev);
        }    

        // Update shoot component
        if (this.base.pos.x < 256-this.rendComp.spr.width/2 &&
            this.shootComp != undefined &&
            this.shootComp.update != undefined) {

            this.shootComp.update(ev);
        }   

        // Check if gone too far
        if (this.base.pos.x < -12)
            this.base.exist = false;
    }


    // Animate shooting
    protected animateShooting() {

        const SHOOT_TIME = 30;

        this.rendComp.animateShooting(SHOOT_TIME);
    }
}


// The base enemy class
class Enemy extends Entity {


    protected rendRef : EnemyRenderer;
    protected hurtIndex : number; // For the sword attack


    constructor() {

        super();

        this.base.acc.x = 0.25;
        this.base.acc.y = 0.25;
        this.base.exist = false;
        this.base.hitbox = new Vector2(16, 16);

        this.rendRef = new EnemyRenderer(this.base);
        this.renderComp = this.rendRef;

        this.hurtIndex = 0;
    }


    protected spawnEvent? (params? : Array<number>, 
        follow? : Entity,
        shootCB? : (pos : Vector2, speed: Vector2, power : number) => any) 
        : any;

    
    // Spawn
    public spawn(pos : Vector2, index : EnemyType, 
        params? : Array<number>,
        shootCB? : (pos : Vector2, speed: Vector2, power : number) => any) {

        this.base.exist = true;
        this.base.dying = false;
        this.base.pos = pos.clone();
        this.base.startPos = pos.clone();
        this.base.flip = false;
        this.offset = new Vector2();
        this.hurtIndex = 0;

        switch(index) {

            case EnemyType.Fly:

                this.rendRef = new EnemyRenderer(this.base);
                
                this.ai = new FlyAI(this.base, this.rendRef, 
                    params, shootCB);

                this.rendRef.reset(
                    0, 4
                );
                this.offset.y = 3;

                break;

            case EnemyType.Slime:
    
                this.ai = new SlimeAI(this.base, this.rendRef, 
                    params, shootCB);

                this.rendRef = new SlimeRenderer(this.base);
                this.rendRef.reset(1)

                this.rendRef.shadowSize = new Vector2(
                    24, 6
                );
                break;
    
            case EnemyType.FleeingFly:

                this.rendRef = new EnemyRenderer(this.base);
                
                this.ai = new FleeingFlyAI(this.base, this.rendRef, 
                    params, shootCB);

                this.rendRef.reset(
                    2, 4
                );
                this.offset.y = 3;

                break;

            default:
                break;
        }
        this.renderComp = this.rendRef;

        // Reminder to self
        if (this.renderComp == undefined) {

            throw "Forgot something?"
        }

        this.base.speed.x *= -1;
        this.base.target.x *= -1;
    }


    // Hostile (read: bullet) collision
    protected hostileCollision(e : Entity, kill = true) {

        this.flicker(30);
        this.base.speed.x = e.getSpeed().x;
        this.reduceHealth(e.getPower());

        if (kill)
            e.kill();
    }


    // Get & set hurt index
    public getHurtIndex = () => this.hurtIndex;
    public setHurtIndex(i : number) {

        if (this.hurtIndex < i)
            this.hurtIndex = i;
    }
}
