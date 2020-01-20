/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

 
enum EnemyType {
    Fly = 0,
}


// The base AI component
class BaseEnemyAI extends AIComponent {


    protected moveComp? : MovementLogic;
    protected shootComp? : ShootingLogic;
    protected readonly follow? : Entity;


    constructor(base : EntityBase, follow? : Entity) {

        super(base);
    
        this.follow = follow;
    }


    // Update
    public update(ev : CoreEvent) {

        // Move
        if (this.moveComp != undefined &&
            this.moveComp.move != undefined) {

            this.moveComp.move(ev);
        }    

        // Shoot
        if (this.shootComp != undefined) {

            // ...
        }   

        // Check if gone too far
        if (this.base.pos.x < -12)
            this.base.exist = false;
    }
}


// Specific AIs
class FlyAI extends BaseEnemyAI {


    constructor(base : EntityBase, 
        params? : Array<number>,
        follow? : Entity) {

        super(base, follow);

        this.moveComp = new WaveMovement(base,
            params[0], params[1], params[2], params[3]);
        this.shootComp = new ShootingLogic(base);
    }
}


// Renders enemies
class EnemyRenderer extends RenderComponent {

    private animSpeed : number;

    constructor(base : EntityBase) {

        super(base, 24, 24);
    }


    public reset(row? : number, speed? : number) {

        this.spr.setFrame(row, (Math.random()*4) | 0);
        this.animSpeed = speed;
    }


    public animate(ev : CoreEvent) {

        this.spr.animate(this.spr.getRow(), 0, 3, 
            this.animSpeed, ev.step);
    }
}



// The base enemy class
class Enemy extends Entity {


    constructor() {

        super();

        this.base.acc.x = 0.25;
        this.base.acc.y = 0.25;
        this.base.exist = false;
        this.base.hitbox = new Vector2(24, 24);

        this.renderComp = new EnemyRenderer(this.base);
    }


    // Spawn
    public spawn(pos : Vector2, index : number, 
        params? : Array<number>, follow? : Entity) {

        const BASE_SPEED = 1.40;

        this.base.exist = true;
        this.base.dying = false;
        this.base.pos = pos.clone();
        this.base.startPos = pos.clone();

        this.renderComp.reset();
        
        switch(index) {

        case EnemyType.Fly:

            this.ai = new FlyAI(this.base, params, follow);
            this.renderComp.reset(
                0, 4
            );

            break;

        default:
            break;
        }


        this.base.speed.x *= -BASE_SPEED;
        this.base.target.x *= -BASE_SPEED;
    }
}
