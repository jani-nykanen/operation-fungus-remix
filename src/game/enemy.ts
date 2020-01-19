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


    constructor(base : EntityBase) {

        super(base);
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


    constructor(base : EntityBase) {

        super(base);
    
        // TODO: Get the values elsewhere
        this.moveComp = new WaveMovement(base,
            16.0, 0.1, -1.0);
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

        this.spr.setFrame(row, 0);
        this.animSpeed = speed;
    }


    public animate(ev : CoreEvent) {

        this.spr.animate(this.spr.getRow(), 0, 4, 
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
    public spawn(pos : Vector2, index : number) {

        this.base.exist = true;
        this.base.dying = false;
        this.base.pos = pos.clone();
        this.base.startPos = pos.clone();

        this.renderComp.reset();
        
        switch(index) {

        case EnemyType.Fly:

            this.ai = new FlyAI(this.base);
            break;

        default:
            break;
        }
    }
}
