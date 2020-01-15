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


// Player render component
class PlayerRenderComponent extends RenderComponent {


    private sprHead : Sprite;
    private sprLegs : Sprite;


    constructor(base : EntityBase) {

        super(base, 32, 32);

        // Create additional sprites
        this.sprHead = new Sprite(32, 16);
        this.sprHead.setFrame(0, 1);

        this.sprLegs = new Sprite(32, 16);
        this.sprLegs.setFrame(1, 1);
    }


    // Animate
    public animate(ev : CoreEvent) {

        const EPS = 0.5;

        // Animate head
        this.sprHead.setFrame(0, 1);
        if (this.base.speed.y < -EPS) {

            this.sprHead.setFrame(0, 2);
        }
        else if (this.base.speed.y > EPS) {

            this.sprHead.setFrame(0, 3);
        }

        // Animate legs
        this.sprLegs.setFrame(1, 1);
        if (this.base.speed.x < -EPS) {

            this.sprLegs.setFrame(1, 3);
        }
        else if (this.base.speed.x > EPS) {

            this.sprLegs.setFrame(1, 2);
        }
    }


    // Override draw
    public draw(c : Canvas, bmp? : Bitmap) {

        let x = Math.round(this.base.pos.x - this.spr.width/2);
        let y = Math.round(this.base.pos.y - this.spr.width/2);

        // Draw body
        c.drawSprite(this.spr, 
            c.getBitmap("player"),
            x, y, this.flip);

        // Draw head
        c.drawSprite(this.sprHead,
            c.getBitmap("player"),
            x, y+2, this.flip);

        // Draw legs
        c.drawSprite(this.sprLegs,
            c.getBitmap("player"),
            x, y+16, this.flip);
    }
}


// The player itself
class Player extends Entity {

    constructor(x : number, y : number) {

        super(x, y);

        this.renderComp = new PlayerRenderComponent(this.base);
        this.ai = new PlayerAI(this.base);

        this.base.acc.x = 0.25;
        this.base.acc.y = 0.25;
        this.base.exist = true;
        this.base.hitbox = new Vector2(24, 24);
    }
}
