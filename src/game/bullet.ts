/**
 * Operation Fungus Remix
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

        // Out of bounds
        if (this.base.pos.y < -16 ||
            this.base.pos.x > 256+16 ||
            this.base.pos.x < -16)
            this.base.exist = false;
    }
}


// Bullet render component
class BulletRenderComponent extends RenderComponent {


    private deathPlayed : boolean;


    constructor(base : EntityBase) {

        super(base, 16, 16);

        this.deathPlayed = false;
    }


    // Reset
    public reset(row : number) {

        this.spr.setFrame(row, 0);

        this.deathPlayed = false;
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

        if (!this.deathPlayed) {

            ev.audio.playSample(ev.assets.getSound("hit"), 0.40);
            this.deathPlayed = true;
        }

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

        this.base.hitbox = new Vector2(
            6, 6
        );
    }


    // Spawn
    public spawn(row : number, pos : Vector2,
        speed : Vector2, friendly : boolean,
        power = 1) {

        const HITBOX_SIZE = 
            [6, 6, 12, 12];

        this.base.exist = true;
        this.base.dying = false;
        
        this.base.pos = pos.clone();

        this.ai.reset(speed);
        this.renderComp.reset(row);

        this.friendly = friendly;

        this.base.power = power;

        this.base.hitbox.x = HITBOX_SIZE[row];
        this.base.hitbox.y = this.base.hitbox.x;
    }


    // Hostile (read: bullet) collision
    protected hostileCollision(e : Entity, kill = true) {

        this.kill();

        if (kill)
            e.kill();
    }


    // Getters
    public isFriendly = () => this.friendly;
    public getRow = () => this.renderComp.getSpriteRow();
}
