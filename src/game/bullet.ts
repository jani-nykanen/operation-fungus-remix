/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Bullet AI
class BulletAI  extends AIComponent {


    constructor(base : EntityBase) {

        super(base);
    }


    // Reset
    public reset(speed : Vector2) {

        this.base.speed = speed.clone();
        this.base.target = speed.clone();
        this.base.dying = false;
    }


    // Update
    public update(ev : CoreEvent) {

        const MIN_Y = 192-22;

        if (this.base.pos.y > MIN_Y) {

            this.base.die();
        }

        if (this.base.pos.x > 256+16)
            this.base.exist = false;
    }
}


// Bullet render component
class BulletRenderComponent extends RenderComponent {

    constructor(base : EntityBase) {

        super(base, 16, 16);
    }


    // Reset
    public reset(row : number) {

        this.spr.setFrame(row, 0);
    }


    // Animate
    public animate(ev : CoreEvent) {

        const APPEAR_SPEED = 3;

        if (this.spr.getFrame() < 2) {

            this.spr.animate(this.spr.getRow(),
                0, 2, APPEAR_SPEED, ev.step);
        }
    }


    // Animate death
    public animateDeath(ev : CoreEvent) : boolean {

        const DEATH_SPEED = 4;

        this.spr.animate(this.spr.getRow(), 3, 7, 
            DEATH_SPEED, ev.step);

        return this.spr.getFrame() == 7;
    }
}


// Bullet type
class Bullet extends Entity {


    private friendly : boolean;


    constructor() {

        super();

        this.renderComp = new BulletRenderComponent(this.base);
        this.ai = new BulletAI(this.base);

        this.base.exist = false;
    }


    // Spawn
    public spawn(row : number, pos : Vector2,
        speed : Vector2, friendly : boolean) {

        this.base.exist = true;
        this.base.pos = pos.clone();

        this.ai.reset(speed);
        this.renderComp.reset(row);

        this.friendly = friendly;
    }


    // Getters
    public isFriendly = () => this.friendly;
}
