/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

// (This file has a weird name so that it can extend
// the Enemy class)


class BossAI extends AIComponent {
    

    private rendComp : BossRenderer;
    private ready : boolean;


    constructor(base : EntityBase, 
        rendComp : EnemyRenderer) {

        super(base);
    
        this.rendComp = rendComp;
        this.ready = false;
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


    constructor(base : EntityBase) {

        super(base, 64, 64);

        this.spr.setFrame(0, 0);
    }
}


class Boss extends Enemy {


    constructor(x : number, y : number) {

        super(x, y);

        const HEALTH = 4000;

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
