/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// The base AI component
class BaseEnemyAI extends AIComponent {


    constructor(base : EntityBase) {

        super(base);
    }


    // "Control" the enemy
    protected control?(ev : CoreEvent) : any;


    // Update (general)
    public update(ev : CoreEvent) {

        if (this.control != undefined) {

            this.control(ev);
        }    

        if (this.base.pos.x < -12)
            this.base.exist = false;
    }
}



// Renders enemies
class EnemyRenderer extends RenderComponent {


    constructor(base : EntityBase) {

        super(base, 24, 24);
    }


    public reset(row? : number, speed? : number) {


    }
}



// The base enemy class
class Enemy extends Entity {


    constructor(x : number, y : number) {

        super(x, y);

        this.base.acc.x = 0.25;
        this.base.acc.y = 0.25;
        this.base.exist = true;
        this.base.hitbox = new Vector2(24, 24);
    }


    // Spawn
    public spawn(pos : Vector2, index : number) {

        this.base.exist = true;
        this.base.dying = false;
        this.base.pos = pos.clone();

        this.renderComp.reset();
    }
}
