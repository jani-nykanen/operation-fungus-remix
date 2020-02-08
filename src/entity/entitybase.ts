/**
 * Operation Fungus Remix
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
    public health : number;
    public maxHealth : number;
    public power : number;
    public xp : number;
    public flip : boolean; // Should not be here, sorry
    public moveStartPos : boolean;

    public killCB? : (() => any);


    constructor(x? : number, y? : number) {

        this.pos = new Vector2(x, y);
        this.startPos = this.pos.clone();

        this.speed = new Vector2();
        this.target = new Vector2();
        this.acc = new Vector2(1, 1);
        this.hitbox = new Vector2(1, 1);

        this.dying = false;
        this.exist = false;

        this.power = 1;
        this.xp = 0;

        this.maxHealth = 1;
        this.health = this.maxHealth;

        this.flip = false;

        this.moveStartPos = false;
    }


    // Update
    update(ev : CoreEvent) {

        let p = this.pos;
        if (this.moveStartPos)
            p = this.startPos;

        this.speed.x = updateSpeedAxis(
            this.speed.x, this.target.x,
            this.acc.x
        );
        this.speed.y = updateSpeedAxis(
            this.speed.y, this.target.y,
            this.acc.y
        );

        p.x += this.speed.x * ev.step;
        p.y += this.speed.y * ev.step;
    }


    // Die
    public die(deathEvent = true) {

        if (!this.exist && this.dying)
            return;

        if (deathEvent && 
            this.killCB != undefined) {

            this.killCB();
        }

        this.dying = true;
    
        this.speed.zeroes();
        this.target.zeroes();
    }


    // Set the initial health
    public setInitialHealth(amount : number) {

        this.maxHealth = amount;
        this.health = amount;
    }
}
