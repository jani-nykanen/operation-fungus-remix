/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */

 
enum EnemyType {
    Fly = 0,
    Slime = 1,
    Bee = 2,
    Cloud = 3,
    Kamikaze = 4,

    FleeingFly = -1,
    FleeingSlime = -2,
}


type ShootCallback = (pos : Vector2, speed: Vector2, power : number, id? : number) => any;

 
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
    protected shootCB : ShootCallback; 
    protected timer : number;


    constructor(base : EntityBase,
        animCB? : (() => any),
        shootCB? : ShootCallback) {

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
    private speedMod : number;
    private shootTimer : number;

    private shootPlayed : boolean;
    private deathPlayed : boolean;


    constructor(base : EntityBase) {

        super(base, 24, 24);

        this.deathPlayed = false;
        this.shootPlayed = false;
    }


    public reset(row = 0, speed = 0, speedMod = 0) {

        this.spr.setFrame(row+1, (Math.random()*4) | 0);
        this.animSpeed = speed;
        this.speedMod = speedMod;
        this.flickerTime = 0.0;

        this.deathPlayed = false;
        this.shootPlayed = false;
    }


    public animate(ev : CoreEvent) {

        let start = 0;
        if (this.shootTimer > 0) {

            if (!this.shootPlayed) {

                ev.audio.playSample(ev.assets.getSound("enemyShoot"), 0.50);
                this.shootPlayed = true;
            }

            this.shootTimer -= ev.step;
            if (this.shootTimer <= 0) {

                this.spr.setFrame(this.spr.getRow(),
                    this.spr.getFrame() - 4);
            }
            else {

                start += 4;
            }
        }

        let speed = this.animSpeed;
        if (this.speedMod > 0) {

            speed = this.animSpeed - Math.abs(this.base.speed.x) / this.speedMod;
        }
        
        this.spr.animate(this.spr.getRow(), start, start+3, 
            speed, ev.step);
    }


    // Animate shooting
    public animateShooting(time : number) {

    
        if (this.shootTimer <= 0) {

            this.spr.setFrame(this.spr.getRow(),
                this.spr.getFrame() + 4);

            this.shootPlayed = false;
        }

        this.shootTimer = time;

    }


    // Animate death
    public animateDeath(ev : CoreEvent) : boolean {

        const DEATH_SPEED = 4;

        if (!this.deathPlayed) {

            ev.audio.playSample(ev.assets.getSound("hurtEnemy"), 0.40);
            this.deathPlayed = true;
        }

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


    protected rendRef : any; // Sorry
    protected hurtIndex : number; // For the sword attack

    protected isStatic : boolean;

    
    constructor(x? : number, y?: number) {

        super(x, y);

        this.base.acc.x = 0.25;
        this.base.acc.y = 0.25;
        this.base.exist = false;
        this.base.hitbox = new Vector2(16, 16);

        this.rendRef = new EnemyRenderer(this.base);
        this.renderComp = this.rendRef;

        this.hurtIndex = 0;
        this.isStatic = false;
    }


    protected spawnEvent? (params? : Array<number>, 
        follow? : Entity,
        shootCB? : ShootCallback) 
        : any;

    
    // Spawn
    public spawn(pos : Vector2, index : EnemyType, 
        params? : Array<number>,
        shootCB? : ShootCallback) {

        this.base.exist = true;
        this.base.dying = false;
        this.base.pos = pos.clone();
        this.base.startPos = pos.clone();
        this.base.flip = false;
        this.base.moveStartPos = false;
        this.offset = new Vector2();
        this.hurtIndex = 0;
        this.base.killCB = undefined;

        if (index != EnemyType.Slime) {

            this.rendRef = new EnemyRenderer(this.base);
        }

        switch(index) {

            case EnemyType.Fly:

                this.ai = new FlyAI(this.base, this.rendRef, 
                    params, shootCB);

                this.rendRef.reset(
                    0, 4
                );
                this.offset.y = 3;

                break;

            
            case EnemyType.FleeingSlime:
            case EnemyType.Slime:
    
                this.ai = new SlimeAI(this.base, this.rendRef, 
                    params, shootCB);

                this.rendRef = new SlimeRenderer(this.base);
                this.rendRef.reset(1, 
                    index == EnemyType.FleeingSlime ? 4 : 0);

                this.rendRef.shadowSize = new Vector2(
                    24, 6
                );
                break;
    
            case EnemyType.FleeingFly:

                this.ai = new FleeingFlyAI(this.base, this.rendRef, 
                    params, shootCB);

                this.rendRef.reset(
                    2, 4
                );
                this.offset.y = 3;

                break;

            case EnemyType.Cloud:

                this.ai = new CloudAI(this.base, this.rendRef, 
                    params, shootCB);
                this.rendRef.reset(
                    3, 8
                );

                break;

            case EnemyType.Bee:

                this.ai = new BeeAI(this.base, this.rendRef, 
                    params, shootCB);
                this.rendRef.reset(
                    4, 4
                );

                break;

            case EnemyType.Kamikaze:

                this.ai = new KamikazeAI(this.base, this.rendRef, 
                    params, shootCB);
                this.rendRef.reset(
                    5, 10, 0.5
                );

                break;

            default:
                break;
        }
        this.renderComp = this.rendRef;

        //this.base.speed.x *= -1;
        //this.base.target.x *= -1;
    }


    // Hostile (read: bullet) collision
    protected hostileCollision(e : Entity, kill = true) {

        this.flicker(30);
        if (!this.isStatic)
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
