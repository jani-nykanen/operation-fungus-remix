/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An "AI" for the player, which is not
// an AI at all, really
class PlayerAI extends AIComponent {

    private readonly renderComp : PlayerRenderComponent;
    private dustTimer : number;
    private disappear : number;

    private bulletCB : ((row : number,
        pos : Vector2, speed : Vector2, friendly : boolean) => any);


    constructor(base : EntityBase, 
        renderComp? : PlayerRenderComponent) {

        super(base);

        this.renderComp = renderComp;
        this.dustTimer = 0.0;
        this.disappear = 0;
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

        const BULLET_SPEED = 3;

        let stick = ev.gamepad.getStick();

        this.base.target.x = stick.x * 2;
        this.base.target.y = stick.y * 2;

        if (this.disappear) return;

        // Shoot a bullet
        if (!this.renderComp.isShooting() &&
            ev.gamepad.getButtonState("fire1") == State.Down) {

            if (this.renderComp.animateShooting() &&
                this.bulletCB != undefined) {

                this.bulletCB(0, 
                    new Vector2(
                        this.base.pos.x+20, 
                        this.base.pos.y +this.renderComp.getWaveDelta()-2),
                    new Vector2(
                        BULLET_SPEED + this.base.speed.x/4, 
                        this.base.speed.y/4),
                    true);
            }
        }

        // Disappear
        if (ev.gamepad.getButtonState("fire2") == State.Pressed) {

            this.renderComp.startDisappearing();
            this.disappear = 1;
        }
    }


    // Update dust
    private updateDust(ev : CoreEvent) {

        const DUST_TIME_BASE = 12.0;
        const DUST_TIME_VARY = 2.0;

        if (this.disappear != 0) return;

        let time = DUST_TIME_BASE - 
            DUST_TIME_VARY*this.base.speed.len();

        if ((this.dustTimer += ev.step) >= time) {

            this.renderComp.spawnDust(
                this.base.pos.x-4, 
                this.base.pos.y +8
                );
            this.dustTimer -= time;
        }
    }


    // Set bullet callback
    public setBulletCallback(cb : ((row : number,
        pos : Vector2, speed : Vector2, friendly : boolean) => any)) {

        this.bulletCB = cb;
    }


    public update (ev : CoreEvent) {

        this.disappear = this.renderComp.getDisappearPhase();

        this.control(ev);
        this.updateDust(ev);
        this.restrict();

        // Compute shadow scale, if disappearing
        this.renderComp.shadowSize.x = 24;
        
        let f = this.renderComp.getBodyFrame();
        if (this.disappear > 0) {

            this.renderComp.shadowSize.x -= f*3;
        }
        this.renderComp.shadowSize.y = 
            this.renderComp.shadowSize.x/4;
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
    private waveDelta : number;

    private shooting : boolean;
    private shootWait : number;

    private dust : Array<Dust>;

    private disappear : number;


    constructor(base : EntityBase) {

        super(base, 32, 32);

        // Create additional sprites
        this.sprHead = new Sprite(32, 16);
        this.sprLegs = new Sprite(32, 16);
        this.sprPropeller = new Sprite(32, 16);
        this.sprArm = new Sprite(32, 16);

        this.shooting = false;
        this.shootWait = 0.0;
        this.wave = 0.0;
        this.waveDelta = 0.0;

        this.dust = new Array<Dust> ();
    }


    // Animate disappearing
    private animateDisappear(ev : CoreEvent) {

        const ANIM_SPEED = 4;

        if (this.disappear == 1) {

            this.spr.animate(2, 0, 5, ANIM_SPEED, ev.step);
            if (this.spr.getFrame() == 5) {

                this.disappear = 2;
            }
        }
        else {
            
            this.spr.animate(2, 5, -1, ANIM_SPEED, ev.step);
            if (this.spr.getFrame() == -1) {

                this.spr.setFrame(0, 0);
                this.disappear = 0;
            }
        }
    }


    // Animate
    public animate(ev : CoreEvent) {

        const EPS = 0.5;
        const PROPELLER_SPEED_BASE = 5;
        const PROPELLER_VARY = 1.0;
        const SHOOT_SPEED = 4;
        const WAVE_SPEED = 0.075;
        const SHOOT_WAIT_TIME = 10; // This will be computed from stats later
        const WAVE_AMPLITUDE = 3;

        // Update wave
        this.wave = (this.wave + WAVE_SPEED*ev.step) % (Math.PI*2);
        this.waveDelta = (Math.sin(this.wave) * WAVE_AMPLITUDE);

        // Update dust
        for (let d of this.dust) {

            d.update(ev);
        }

        // Disappear
        if (this.disappear != 0) {

            this.animateDisappear(ev);
            return;
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
        let angle = Math.atan2(this.base.speed.y, this.base.speed.x);
        let len = this.base.speed.len();
        
        if (len > EPS) {

            if (angle <= -Math.PI/4 || angle > Math.PI - Math.PI/4) {

                this.sprLegs.setFrame(1, 3);
            }
            else {

                this.sprLegs.setFrame(1, 2);
            }
        }
        else {

            this.sprLegs.setFrame(1, 1);
        }

        // Animate propeller
        let propSpeed = (PROPELLER_SPEED_BASE -
                PROPELLER_VARY*this.base.speed.len()) | 0;
        this.sprPropeller.animate(2, 0, 3, 
            propSpeed, ev.step);

        // Animate arm
        if (this.shooting && this.shootWait <= 0.0) {

            this.sprArm.animate(3, 1, 7, SHOOT_SPEED, ev.step);
            if (this.sprArm.getFrame() == 7) {

                // In the case we continue shooting
                this.sprArm.setFrame(3, 1);

                this.shooting = false;
                this.shootWait = SHOOT_WAIT_TIME;
            }    
        }
        else {

            this.sprArm.setFrame(3, this.shooting ? 1 : 0);
        }

         // Update shoot wait timer
         if (this.shootWait > 0.0) {
            
            this.shootWait -= ev.step;
            if (this.shootWait <= 0.0) {

                this.shooting = false;
                this.shootWait = 0.0;
            }
        }
    }


    // Override draw
    public draw(c : Canvas, bmp? : Bitmap) {

        let x = Math.round(this.base.pos.x - this.spr.width/2);
        let y = Math.round(this.base.pos.y - this.spr.width/2);

        y += this.waveDelta | 0;

        if (this.disappear == 0) {

            // Draw propeller
            c.drawSprite(this.sprPropeller, 
                c.getBitmap("player"),
                x-6, y-3, this.flip);
        }
        else {

            y -= 4;
        }

        // Draw body
        c.drawSprite(this.spr, 
            c.getBitmap("player"),
            x, y, this.flip);

        if (this.disappear > 0) return;

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
    public animateShooting() : boolean {

        this.shooting = true;

        return this.shootWait <= 0;
    }


    // Animate disappearing
    public startDisappearing() {

        if (this.disappear != 0) return;

        this.disappear = 1;
        this.spr.setFrame(2, 0);

        this.sprPropeller.setFrame(2, 0);

        this.shooting = false;
        this.shootWait = 0;
        this.sprArm.setFrame(3, 0);
    }


    // Getters
    public isShooting = () => this.shooting;
    public getBodyFrame = () => this.spr.getFrame();
    public getDisappearPhase = () => this.disappear;
    public getWaveDelta = () => this.waveDelta;
}


// The player itself
class Player extends Entity {


    private aiRef : PlayerAI;


    constructor(x : number, y : number) {

        super(x, y);

        let plrend = new PlayerRenderComponent(this.base);
        this.renderComp = plrend;
        this.ai = (this.aiRef = new PlayerAI(this.base, plrend));

        this.base.acc.x = 0.25;
        this.base.acc.y = 0.25;
        this.base.exist = true;
        this.base.hitbox = new Vector2(24, 24);
    }


    // Set bullet callback
    public setBulletCallback(cb : ((row : number,
        pos : Vector2, speed : Vector2, friendly : boolean) => any)  ) {

        this.aiRef.setBulletCallback(cb);
    }
}
