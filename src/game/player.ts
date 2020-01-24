/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Player blade entity
class Blade extends Entity {


    private readonly follow : Player;
    private readonly lstate : LocalState;

    private attackIndex : number;


    constructor(pl : Player, lstate : LocalState) {

        super(0, 0);

        this.base.exist = true;
        this.follow = pl;
        this.lstate = lstate;

        // this.renderComp = new RenderComponent(this.base, 32,  16);

        this.base.hitbox = new Vector2(32, 16);

        this.attackIndex = 0;

        this.base.speed.x = 5.0;
    }


    // Refresh
    public refresh(ev : CoreEvent) {

        let p = this.follow.getPos();

        this.base.power = this.lstate.getSwordPower();;

        this.base.pos.x = p.x + 16;
        this.base.pos.y = p.y + this.follow.getWaveDelta() + 8;
    }


    // Increase the attack index
    public increaseAttackIndex() {

        ++ this.attackIndex;
    }


    // Getters
    public getAttackIndex = () => this.attackIndex;
}



// An "AI" for the player, which is not
// an AI at all, really
class PlayerAI extends AIComponent {

    private readonly renderComp : PlayerRenderComponent;
    private dustTimer : number;
    private disappear : number;
    private readonly blade : Blade;
    private readonly lstate : LocalState;
    private regenTimer : number;
    private extraBulletTimer : number;
    private extraBulletDir : boolean;

    private bulletCB : (pos : Vector2, speed: Vector2, power : number) => any;


    constructor(base : EntityBase, 
        renderComp : PlayerRenderComponent,
        blade : Blade,
        lstate : LocalState) {

        super(base);

        this.renderComp = renderComp;
        this.dustTimer = 0.0;
        this.disappear = 0;
        this.blade = blade;

        this.lstate = lstate;

        this.regenTimer = 0;
        this.extraBulletTimer = 0;
        this.extraBulletDir = false;
    }


    // Restrict player movements
    private restrict() {

        const WIDTH = 24;
        const HEIGHT = 24;
        const GROUND_HEIGHT = 20;
        const TOP_OFF = 20;

        if (this.base.speed.x < 0 &&
            this.base.pos.x-WIDTH/2 < 0) {

            this.base.speed.x = 0;
            this.base.pos.x = WIDTH/2;
        }
        else if (this.base.speed.x > 0 &&
            this.base.pos.x+WIDTH/2 >= 256) {

            this.base.speed.x = 0;
            this.base.pos.x = 256 - WIDTH/2;
        }

        if (this.base.speed.y < 0 &&
            this.base.pos.y-HEIGHT/2 < TOP_OFF) {

            this.base.speed.y = 0;
            this.base.pos.y = TOP_OFF + HEIGHT/2;
        }
        else if (this.base.speed.y > 0 &&
            this.base.pos.y+HEIGHT/2 >= 192-GROUND_HEIGHT) {

            this.base.speed.y = 0;
            this.base.pos.y = 192-GROUND_HEIGHT 
                - HEIGHT/2;
        }
    }


    // Shoot bullet(s)
    private shootBullets() {

        const SHOOT_ANGLE = Math.PI / 6.0;

        let min = 0;
        let max = 0;

        let wait = this.lstate.getBulletWait();
        if (wait >= 0) {

            if ((++ this.extraBulletTimer) >= wait) {

                this.extraBulletTimer -= wait;
                if (this.extraBulletDir) {

                    max = 1;
                }
                else {

                    min = -1;
                }
                this.extraBulletDir = !this.extraBulletDir;
            }
        }

        let angle : number;
        for (let i = min; i <= max; ++ i) {

            angle = i * SHOOT_ANGLE;

            this.bulletCB(
                new Vector2(
                    this.base.pos.x+20, 
                    this.base.pos.y + this.renderComp.getWaveDelta()-2),
                new Vector2(
                    this.lstate.getBulletSpeed()* Math.cos(angle) + 
                        this.base.speed.x/4, 
                    this.lstate.getBulletSpeed()* Math.sin(angle) + 
                        this.base.speed.y/4),
                    this.lstate.getBulletPower());

        }
    }


    // Handle controls
    public control(ev : CoreEvent) {

        const BASE_SPEED = 2;

        let stick = ev.gamepad.getStick();

        // Compute acceleration
        let s =  this.lstate.getMoveSpeed();
        this.base.acc.x = 0.25 * s;
        this.base.acc.y = 0.25 * s;

        // Compute target speed
        this.base.target.x = stick.x * BASE_SPEED * s;
        this.base.target.y = stick.y * BASE_SPEED * s;

        if (this.disappear) return;

        let fire1 = ev.gamepad.getButtonState("fire1");

        // Sword attack
        if (ev.gamepad.getButtonState("fire3") == State.Pressed) {

            if (!this.renderComp.isSwordActive()) {

                this.blade.increaseAttackIndex();
                this.renderComp.animateShooting(1);
            }
        }
        // Shoot a bullet
        else if (!this.renderComp.isShooting() &&
            (fire1 == State.Down || fire1 == State.Pressed)) {

            if (this.renderComp.animateShooting() &&
                this.bulletCB != undefined) {
                    
                this.shootBullets();
            }
        }

        // Disappear
        if (ev.gamepad.getButtonState("fire2") == State.Pressed) {

            this.renderComp.startDisappearing();
            this.disappear = 1;
        }

        // Regen
        if (this.base.health < this.base.maxHealth &&
            this.lstate.getRegenSpeed() > 0) {

            if ((++ this.regenTimer) >= this.lstate.getRegenSpeed()) {

                this.regenTimer -= this.lstate.getRegenSpeed();
                
                ++ this.base.health;

                this.lstate.updateHealth(this.base.health);
            }
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
    public setBulletCallback(cb : 
        (pos : Vector2, speed: Vector2, power : number) => any) {

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
    private shootMode : number;

    private dust : Array<Dust>;

    private disappear : number;

    private readonly lstate : LocalState;


    constructor(base : EntityBase,
        lstate : LocalState) {

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

        this.lstate = lstate;
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


    // Animate arms
    private animateArms(ev : CoreEvent) {

        const SHOOT_SPEED_BASE = [4, 4] ;
        const SHOOT_WAIT_TIME_BASE = 10; // This will be computed from stats later

        let index = clamp(this.shootMode, 0, 1);

        let row = 3 + this.shootMode*3;
        let end = [6, 6] [index];
        let start = [1, 0] [index];

        let timeReduce = SHOOT_WAIT_TIME_BASE-this.lstate.getReloadSpeed();
        let shootWait = Math.max(0, timeReduce) | 0;

        let shotSpeed =  SHOOT_SPEED_BASE[index];
        if (index == 0) {

            shotSpeed -= Math.max(0, -timeReduce) / 4;
        }

        // Animate arm
        if (this.shooting && this.shootWait <= 0.0) {

            this.sprArm.animate(row, start, end+1, 
               shotSpeed, ev.step);
            if (this.sprArm.getFrame() == end+1) {

                // In the case we continue shooting
                if (this.shootMode == 0)
                    this.sprArm.setFrame(3, 1);
                else 
                    this.sprArm.setFrame(3, 0);

                this.shootMode = 0;
                this.shooting = false;

                if (this.shootMode == 0)
                    this.shootWait = shootWait;
            }    
        }
        else {

            this.sprArm.setFrame(3, 
                (this.shooting && this.shootMode == 0) ? 1 : 0);
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


    // Animate
    public animate(ev : CoreEvent) {

        const EPS = 0.5;
        const PROPELLER_SPEED_BASE = 5;
        const PROPELLER_VARY = 1.0;
        const WAVE_SPEED = 0.075;
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

        // Animate arm(s)
        this.animateArms(ev);
    }


    // Override draw
    public draw(c : Canvas, bmp? : Bitmap) {

        let x = Math.round(this.base.pos.x - 16);
        let y = Math.round(this.base.pos.y - 16);

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
            x+12, y+9, this.flip);

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
    public animateShooting(mode? : number) : boolean {

        if (mode == 1) {

            this.shootWait = 0;
        }

        this.shooting = true;
        this.shootMode = mode == undefined ? 0 : mode;

        return this.shootWait <= 0 || this.shootMode != 0;
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
    public isDisappering = () => this.disappear != 0;

    public isSwordActive() : boolean {

        const BLADE_LAST_ACTIVE_FRAME = 4;

        return this.shooting &&
               this.shootMode == 1 &&
               this.sprArm.getFrame() <= BLADE_LAST_ACTIVE_FRAME;
    }
}


// The player itself
class Player extends Entity {


    private aiRef : PlayerAI;
    private rendRef : PlayerRenderComponent;
    private readonly lstate : LocalState;
    private blade : Blade;


    constructor(x : number, y : number, lstate : LocalState) {

        super(x, y);

        this.blade = new Blade(this, lstate);

        this.rendRef = new PlayerRenderComponent(this.base, lstate);
        this.renderComp = this.rendRef;
        this.ai = 
            (this.aiRef = new PlayerAI(this.base, this.rendRef, this.blade, lstate));

        this.base.exist = true;
        this.base.hitbox = new Vector2(12, 12);

        this.lstate = lstate;

        this.base.maxHealth = lstate.getMaxHealth();
        this.base.health = this.base.maxHealth;

        this.offset.y = -4;
    }


    // Set bullet callback
    public setBulletCallback(cb : 
        (pos : Vector2, speed: Vector2, power : number) => any)   {

        this.aiRef.setBulletCallback(cb);
    }


    // Hostile collision
    protected hostileCollision(e : Entity, kill = true) {

        if (this.renderComp.flickerTime > 0 ||
            this.rendRef.isDisappering()) return;

        this.flicker((60 * this.lstate.getFlickerTime()) | 0);
        this.reduceHealth(e.getPower());
        
        if (kill)
            e.kill();
    }


    // Refresh
    protected refresh(ev : CoreEvent) {

        this.lstate.updateHealth(this.base.health);

        this.base.maxHealth = this.lstate.getMaxHealth();

        if (this.doesExist() && !this.isDying())
            this.blade.refresh(ev);
    }


    // Get blade
    public getBlade() : Blade {

        if (this.rendRef.isSwordActive())
            return this.blade;

        return null;
    }


    // Getters
    public getWaveDelta = () => this.rendRef.getWaveDelta();
}
