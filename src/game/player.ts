/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An "AI" for the player, which is not
// an AI at all, really
class PlayerAI extends AIComponent {


    constructor(base : EntityBase) {

        super(base);
    }


    // Restrict player movements
    private restrict() {

        const GROUND_HEIGHT = 16;

        if (this.base.speed.x < 0 &&
            this.base.pos.x-this.base.hitbox.x/2 < 0) {

            this.base.speed.x = 0;
            this.base.pos.x = this.base.hitbox.x/2;
        }
        else if (this.base.speed.x > 0 &&
            this.base.pos.x+this.base.hitbox.x/2 >= 256) {

            this.base.speed.x = 0;
            this.base.pos.x = 256 - this.base.hitbox.x/2;
        }

        if (this.base.speed.y < 0 &&
            this.base.pos.y-this.base.hitbox.y/2 < 0) {

            this.base.speed.y = 0;
            this.base.pos.y = this.base.hitbox.y/2;
        }
        else if (this.base.speed.y > 0 &&
            this.base.pos.y+this.base.hitbox.y/2 >= 192-GROUND_HEIGHT) {

            this.base.speed.y = 0;
            this.base.pos.y = 192-GROUND_HEIGHT 
                - this.base.hitbox.y/2;
        }
    }


    // Handle controls
    control(ev : CoreEvent) {

        let stick = ev.gamepad.getStick();

        this.base.target.x = stick.x * 2;
        this.base.target.y = stick.y * 2;
    }


    public update (ev : CoreEvent) {

        this.control(ev);
        this.restrict();
    }


    public animate (spr : Sprite, ev : CoreEvent) {
        
    }
}


// The player itself
class Player extends Entity {

    constructor(x : number, y : number) {

        super(x, y);

        this.renderComp = new RenderComponent(this.base, 24, 24);
        this.ai = new PlayerAI(this.base);

        this.base.acc.x = 0.25;
        this.base.acc.y = 0.25;
        this.base.exist = true;
        this.base.hitbox = new Vector2(24, 24);
    }
}