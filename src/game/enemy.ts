/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

 
enum EnemyType {
    Fly = 0,
}



// Renders enemies
class EnemyRenderer extends RenderComponent {

    private animSpeed : number;
    private shootTimer : number;

    constructor(base : EntityBase) {

        super(base, 24, 24);
    }


    public reset(row? : number, speed? : number) {

        this.spr.setFrame(row, (Math.random()*4) | 0);
        this.animSpeed = speed;
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
}


// The base AI component
class BaseEnemyAI extends AIComponent {

    
    protected moveComp? : MovementLogic;
    protected shootComp? : ShootingLogic;
    protected readonly follow? : Entity;
    protected readonly rendComp? : EnemyRenderer;

    constructor(base : EntityBase, 
        rendComp : EnemyRenderer,
        follow? : Entity) {

        super(base);
    
        this.rendComp = rendComp;
        this.follow = follow;
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


// Specific AIs
class FlyAI extends BaseEnemyAI {


    constructor(base : EntityBase,
        rendComp? : EnemyRenderer,
        params? : Array<number>,
        follow? : Entity,
        shootCB? : (pos : Vector2, speed: Vector2) => any) {

        super(base, rendComp, follow);

        this.moveComp = new WaveMovement(base,
            params[0], params[1], params[2], params[3]);
            
        this.shootComp = new SingleShot(base,
                Math.PI*2 / params[1],
                params[3] / (Math.PI*2),
                -3.0, 
                () => {
                    this.animateShooting();
                }, shootCB);
    }
}


// The base enemy class
class Enemy extends Entity {


    private rendRef : EnemyRenderer;


    constructor() {

        super();

        this.base.acc.x = 0.25;
        this.base.acc.y = 0.25;
        this.base.exist = false;
        this.base.hitbox = new Vector2(16, 16);

        this.rendRef = new EnemyRenderer(this.base);
        this.renderComp = this.rendRef;
    }


    // Spawn
    public spawn(pos : Vector2, index : number, 
        params? : Array<number>, follow? : Entity,
        shootCB? : (pos : Vector2, speed: Vector2) => any) {

        const BASE_SPEED = 1.40;

        this.base.exist = true;
        this.base.dying = false;
        this.base.pos = pos.clone();
        this.base.startPos = pos.clone();
        this.offset = new Vector2();

        this.renderComp.reset();
        
        switch(index) {

        case EnemyType.Fly:

            this.ai = new FlyAI(this.base, this.rendRef, 
                params, follow, shootCB);
            this.renderComp.reset(
                0, 4
            );
            this.offset.y = -4;

            break;

        default:
            break;
        }


        this.base.speed.x *= -BASE_SPEED;
        this.base.target.x *= -BASE_SPEED;
    }


    // Hostile (read: bullet) collision
    protected hostileCollision(e : Entity) {

        this.flicker(30);
        this.base.speed.x = e.getSpeed().x;

        e.kill();
    }

}
