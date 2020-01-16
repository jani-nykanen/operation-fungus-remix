/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An "AI" for the player, which is not
// an AI at all, really
class PlayerAI extends AIComponent {

    private readonly renderComp : PlayerRenderComponent;
    private dustTimer : number;


    constructor(base : EntityBase, 
        renderComp? : PlayerRenderComponent) {

        super(base);

        this.renderComp = renderComp;
        this.dustTimer = 0.0;
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

        // Shoot a bullet
        if (!this.renderComp.isShooting() &&
            ev.gamepad.getButtonState("fire1") == State.Down) {

            this.renderComp.animateShooting();
        }
    }


    // Update dust
    private updateDust(ev : CoreEvent) {

        const DUST_TIME_BASE = 12.0;
        const DUST_TIME_VARY = 2.0;

        let time = DUST_TIME_BASE - 
            DUST_TIME_VARY*this.base.speed.len();

        if ((this.dustTimer += ev.step) >= time) {

            this.renderComp.spawnDust(
                this.base.pos.x-4, this.base.pos.y+8
                );
            this.dustTimer -= time;
        }
    }


    public update (ev : CoreEvent) {

        this.control(ev);
        this.updateDust(ev);
        this.restrict();
    }


    public animate (spr : Sprite, ev : CoreEvent) {
        
    }
}


// Player render component
class PlayerRenderComponent extends RenderComponent {


    private sprHead : Sprite;
    private sprLegs : Sprite;
    private sprPropeller : Sprite;
    private sprArm : Sprite;

    private wave : number;
    private shooting : boolean;

    private dust : Array<Dust>;


    constructor(base : EntityBase) {

        super(base, 32, 32);

        // Create additional sprites
        this.sprHead = new Sprite(32, 16);
        this.sprLegs = new Sprite(32, 16);
        this.sprPropeller = new Sprite(32, 16);
        this.sprArm = new Sprite(32, 16);

        this.shooting = false;
        this.wave = 0.0;

        this.dust = new Array<Dust> ();
    }


    // Animate
    public animate(ev : CoreEvent) {

        const EPS = 0.5;
        const PROPELLER_SPEED_BASE = 5;
        const PROPELLER_VARY = 1.0;
        const SHOOT_SPEED = 5;
        const WAVE_SPEED = 0.075;

        // Update wave
        this.wave = (this.wave + WAVE_SPEED*ev.step) % (Math.PI*2);

        // Update dust
        for (let d of this.dust) {

            d.update(ev);
        }

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
        let sum = 0.5 * (this.base.speed.x + this.base.speed.y);
        if (sum < -EPS) {

            this.sprLegs.setFrame(1, 3);
        }
        else if (sum > EPS) {

            this.sprLegs.setFrame(1, 2);
        }

        // Animate propeller
        let propSpeed = (PROPELLER_SPEED_BASE -
                PROPELLER_VARY*this.base.speed.len()) | 0;
        this.sprPropeller.animate(2, 0, 3, 
            propSpeed, ev.step);
    
        // Animate arm
        if (this.shooting) {

            this.sprArm.animate(3, 1, 7, SHOOT_SPEED, ev.step);
            if (this.sprArm.getFrame() == 7) {

                // In the case we continue shooting
                this.sprArm.setFrame(3, 1);

                this.shooting = false;
            }    
        }
        else {

            this.sprArm.setFrame(3, 0);
        }
    }


    // Override draw
    public draw(c : Canvas, bmp? : Bitmap) {

        const WAVE_AMPLITUDE = 3;

        let x = Math.round(this.base.pos.x - this.spr.width/2);
        let y = Math.round(this.base.pos.y - this.spr.width/2);

        y += (Math.sin(this.wave) * WAVE_AMPLITUDE) | 0;

        // Draw propeller
        c.drawSprite(this.sprPropeller, 
            c.getBitmap("player"),
            x-6, y-3, this.flip);

        // Draw body
        c.drawSprite(this.spr, 
            c.getBitmap("player"),
            x, y, this.flip);

        // Draw arm
        c.drawSprite(this.sprArm, 
            c.getBitmap("player"),
            x+16, y+8, this.flip);

        // Draw head
        c.drawSprite(this.sprHead,
            c.getBitmap("player"),
            x, y+2, this.flip);

        // Draw legs
        c.drawSprite(this.sprLegs,
            c.getBitmap("player"),
            x, y+16, this.flip);
    }


    // Draw before other drawing
    public drawBefore(c : Canvas) {

        // Draw dust
        for (let d of this.dust) {

            d.draw(c, c.getBitmap("dust"));
        }
    }


    // Spawn dust
    public spawnDust(x : number, y : number) {

        const DUST_ANIM_SPEED = 7;

        let dust : Dust;
        for (let d of this.dust) {

            if (!d.doesExist()) {

                dust = d;
                break;
            }
        }

        if (dust == null) {

            dust = new Dust();
            this.dust.push(dust);
        }

        dust.spawn(0, DUST_ANIM_SPEED,
            new Vector2(x, y),
            new Vector2(-1.0, 1.0), new Vector2(-1.0, 0.0),
            new Vector2(0.1, 0.05));
    }


    // Start shooting animation
    animateShooting() {

        this.shooting = true;
    }


    // Getters
    public isShooting = () => this.shooting;
}


// The player itself
class Player extends Entity {

    constructor(x : number, y : number) {

        super(x, y);

        let plrend = new PlayerRenderComponent(this.base);
        this.renderComp = plrend;
        this.ai = new PlayerAI(this.base, plrend);

        this.base.acc.x = 0.25;
        this.base.acc.y = 0.25;
        this.base.exist = true;
        this.base.hitbox = new Vector2(24, 24);
    }
}
