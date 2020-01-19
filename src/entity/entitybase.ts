/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// The base entity component
class EntityBase {

    // These can be public since
    // they never are never accessed
    // outside the entity
    public pos : Vector2
    public startPos : Vector2;
    public speed : Vector2
    public target : Vector2
    public acc : Vector2
    public exist : boolean;
    public dying : boolean;
    public hitbox : Vector2;


    constructor(x? : number, y? : number) {

        this.pos = new Vector2(x, y);
        this.startPos = this.pos.clone();

        this.speed = new Vector2();
        this.target = new Vector2();
        this.acc = new Vector2(1, 1);
        this.hitbox = new Vector2(1, 1);

        this.dying = false;
        this.exist = false;
    }


    // Update
    update(ev : CoreEvent) {

        this.speed.x = updateSpeedAxis(
            this.speed.x, this.target.x,
            this.acc.x
        );
        this.speed.y = updateSpeedAxis(
            this.speed.y, this.target.y,
            this.acc.y
        );

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    }


    // Die
    public die() {

        if (!this.exist && this.dying)
            return;

        this.dying = true;
    
        this.speed.zeroes();
        this.target.zeroes();
    }
}
