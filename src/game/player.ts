/**
 * Operation Fungus Remix
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

        this.base.hitbox = new Vector2(32, 24);

        this.attackIndex = 0;

        this.base.speed.x = 4.0;
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

    private readonly START_Y = 192/2;

    private readonly renderComp : PlayerRenderComponent;
    private dustTimer : number;
    private disappear : number;
    private readonly blade : Blade;
    private readonly lstate : LocalState;
    private regenTimer : number;
    private extraBulletTimer : number;
    private extraBulletDir : boolean;
    private appearing : boolean;

    private bulletCB : (pos : Vector2, speed: Vector2, power : number) => any;


    constructor(base : EntityBase, 
        renderComp : PlayerRenderComponent,
        blade : Blade,
        lstate : LocalState) {

        super(base);

        this.renderComp = renderComp;
        this.dustTimer = 0.0;
        this.disappear = 3;
        this.appearing = true;
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


    // Reset
    public reset() {

        this.appearing = true;
    }


    // Shoot bullet(s)
    private shootBullets() {

        const SHOOT_ANGLE = Math.PI / 6.0;

        let min = 0;
        let max = 0;

        let extra = false;

        let wait = this.lstate.getBulletWait();
        extra = wait == 0 && this.lstate.getBulletBonus() > 0;
        if (this.lstate.getBulletBonus() > 0)
            wait = 0;

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

        if (extra) {

            if (min == -1)
                max = 1;
            else if (min == 0)
                min = -1;
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


    // Appear
    private updateInitialAppearing(ev : CoreEvent) {

        const SPEED = 1.5;

        this.base.target.y = SPEED;
        this.base.speed.y = SPEED;
        
        this.base.target.x = 0;
        this.base.speed.x = 0;

        if (this.base.pos.y > this.START_Y) {

            this.base.target.y = 0;
            this.appearing = false;

            this.renderComp.forceReappear();
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
        if (this.base.health > 0 &&
            this.base.health < this.base.maxHealth &&
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

        if (this.appearing) {
1
            this.updateInitialAppearing(ev);
            this.renderComp.setBeamTime(
                (this.base.pos.y-this.base.startPos.y) / (this.START_Y-this.base.startPos.y)
            );
        }
        else {

            this.control(ev);
            this.updateDust(ev);
            this.restrict();    
        }

        // Compute shadow scale, if disappearing
        this.renderComp.shadowSize.x = 24;
        
        let f = this.renderComp.getBodyFrame();
        if (this.disappear > 0) {

            this.renderComp.shadowSize.x -= f*3;
        }
        this.renderComp.shadowSize.y = 
            this.renderComp.shadowSize.x/4;
    }

}


// Player render component
class PlayerRenderComponent extends RenderComponent {


    private sprHead : Sprite;
    private sprLegs : Sprite;
    private sprPropeller : Sprite;
    private sprArm : Sprite;
    private sprOrb : Sprite;
    private sprDie : Sprite;

    private wave : number;
    private waveDelta : number;

    private shooting : boolean;
    private shootWait : number;
    private shootMode : number;

    private dust : Array<Dust>;

    private disappear : number;
    private deathTimer : number;
    private beamTimer : number;

    private readonly lstate : LocalState;


    constructor(base : EntityBase,
        lstate : LocalState) {

        super(base, 32, 32);

        // Create additional sprites
        this.sprHead = new Sprite(32, 16);
        this.sprLegs = new Sprite(32, 16);
        this.sprPropeller = new Sprite(32, 16);
        this.sprArm = new Sprite(32, 16);
        this.sprOrb = new Sprite(16, 16);
        this.sprDie = new Sprite(24, 24);

        this.spr.setFrame(2, 4);

        this.shooting = false;
        this.shootWait = 0.0;
        this.wave = 0.0;
        this.waveDelta = 0.0;
        this.deathTimer = 0.0;
        this.beamTimer = 0.0;

        this.base.power = 1; // For pick-up collisions

        this.dust = new Array<Dust> ();

        this.lstate = lstate;
    }


    // Animate death
    public animateDeath(ev : CoreEvent) : boolean {

        const DEATH_TIME_MAX = 192;
        const DEATH_SPEED = 2;
        const ORB_ANIM_SPEED = 4;
        const BUFF_SPEED = 4;

        this.sprOrb.animate(0, 8, 10, ORB_ANIM_SPEED, ev.step);

        if (this.sprDie.getFrame() < 6) {

            this.sprDie.animate(0, 0, 6, BUFF_SPEED, ev.step);
        }

        return (this.deathTimer += DEATH_SPEED * ev.step) 
            >= DEATH_TIME_MAX;
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
        else if (this.disappear == 2) {
            
            this.spr.animate(2, 5, -1, ANIM_SPEED, ev.step);
            if (this.spr.getFrame() == -1) {

                this.spr.setFrame(0, 0);
                this.disappear = 0;
            }
        }
        else if (this.disappear == 3) {

            this.spr.animate(2, 4, 5, ANIM_SPEED, ev.step);
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


    // Reset
    public reset(row? : number, speed? : number, thirdParam? : number) {

        this.sprHead = new Sprite(32, 16);
        this.sprLegs = new Sprite(32, 16);
        this.sprPropeller = new Sprite(32, 16);
        this.sprArm = new Sprite(32, 16);
        this.sprOrb = new Sprite(16, 16);
        this.sprDie = new Sprite(24, 24);

        this.flickerTime = 0.0;

        this.shooting = false;
        this.shootWait = 0.0;
        this.wave = 0.0;
        this.waveDelta = 0.0;
        this.deathTimer = 0.0;

        for (let d of this.dust) {

            d.kill(true);
        }

        this.spr.setFrame(2, 4);
        this.disappear = 3;
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

            if (this.disappear < 3)
                return;
        }
        else {

            this.spr.setFrame(0, 0);
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
        let propSpeed : number;
        
        if (this.disappear != 0) {

            propSpeed = (PROPELLER_SPEED_BASE -
                    PROPELLER_VARY*this.base.speed.len()) | 0;
            this.sprPropeller.animate(2, 0, 3, 
                propSpeed, ev.step);
        }

        // Animate arm(s)
        this.animateArms(ev);
    }


    // Draw base body
    private drawBase(c : Canvas, jump1 = 0, jump2 = 0) {

        let x = Math.round(this.base.pos.x - 16);
        let y = Math.round(this.base.pos.y - 16);

        y += this.waveDelta | 0;

        jump1 = jump1 | 0;
        jump2 = jump2 | 0;

        let bmp = c.getBitmap("player");

        if (this.disappear == 0) {

            // Draw propeller
            c.drawSpriteFrame(this.sprPropeller, bmp,
                this.sprPropeller.getFrame(),
                this.sprPropeller.getRow() + jump1,
                x-6, y-3, this.flip);
        }
        else {

            y -= 4;
        }

        // Draw body
        c.drawSpriteFrame(this.spr, bmp,
            this.spr.getFrame(),
            this.spr.getRow() + jump2,
            x, y, this.flip);

        if (this.disappear > 0) {

            return;
        }

        // Draw arm
        c.drawSpriteFrame(this.sprArm, bmp,
            this.sprArm.getFrame(),
            this.sprArm.getRow() + jump1,
            x+12, y+9, this.flip);

        // Draw head
        c.drawSpriteFrame(this.sprHead, bmp,
            this.sprHead.getFrame(),
            this.sprHead.getRow() + jump1,
            x, y+2, this.flip);

        // Draw legs
        c.drawSpriteFrame(this.sprLegs, bmp,
            this.sprLegs.getFrame(),
            this.sprLegs.getRow() + jump1,
            x, y+16, this.flip);
    }


    // Draw dying
    private drawDying(c : Canvas) {

        const COUNT = 8;
        let angle = 0;

        let x = Math.round(this.base.pos.x);
        let y = Math.round(this.base.pos.y);

        // Draw "buff" clouds
        if (this.sprDie.getFrame() < 6) {

            c.drawSprite(this.sprDie, c.getBitmap("enemies"),
                x-12, y-12);
        }

        for (let i = 0; i < COUNT; ++ i) {

            angle = Math.PI*2 / COUNT * i;

            c.drawSprite(this.sprOrb, c.getBitmap("player"),
                x + ((Math.cos(angle) * this.deathTimer) | 0) - 8,
                y + ((Math.sin(angle) * this.deathTimer) | 0) - 8,
            );
        }
    }


    // Draw appearance background
    private drawAppearanceBackground(c : Canvas) {

        const BORDER_COLORS = [
            [0, 145, 255],
            [109, 218, 255],
            [218, 255, 255],
        ];

        const EPS = 0.2;
        const BASE_WIDTH = 32;

        let t = this.beamTimer;
        if (t <= 0.0) return;
        
        let w = BASE_WIDTH;
        if (t < EPS) {

            w *= t / EPS;
        }
        else if (t > 1.0 - EPS) {

            w *= 1.0 - (t - (1.0 - EPS)) / EPS;
        }

        w |= 0;

        let x = Math.round(this.base.pos.x);

        // Draw beam background
        c.setColor(255);
        c.fillRect(x- w/2, 0, w, 192-16);

        // Draw borders
        for (let i = 0; i < BORDER_COLORS.length; ++ i) {

            if (w < i*2) break;

            c.setColor(BORDER_COLORS[i][0], 
                       BORDER_COLORS[i][1], 
                       BORDER_COLORS[i][2]);

            c.fillRect(x- w/2 + i, 0, 1, 192-16);
            c.fillRect(x + w/2 -1 - i, 0, 1, 192-16);    
        }
    }


    // Override draw
    public draw(c : Canvas, bmp? : Bitmap) {

        if (this.base.dying) {

            this.drawDying(c);
            return;
        }

        if (this.disappear == 3) {

            this.drawAppearanceBackground(c);
        }

        this.drawBase(c, 8, 4);
        this.drawBase(c);
    }


    // Draw before other drawing
    public drawBefore(c : Canvas) {

        if (this.base.dying) return;

        // Draw dust
        let bmp = c.getBitmap("dust");
        for (let d of this.dust) {

            d.draw(c, bmp);
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


    // Force reappear
    public forceReappear() {

        this.disappear = 2;

        this.spr.setFrame(2, 5);
        this.sprPropeller.setFrame(2, 0);
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
               this.sprArm.getFrame() >= 1 &&
               this.sprArm.getFrame() <= BLADE_LAST_ACTIVE_FRAME;
    }

    
    // Set beam time
    public setBeamTime(time : number) {

        this.beamTimer = Math.min(1.0, time);
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
        this.renderComp.reset();
        this.ai = 
            (this.aiRef = new PlayerAI(this.base, this.rendRef, this.blade, lstate));

        this.base.exist = true;
        this.base.hitbox = new Vector2(12, 12);

        this.lstate = lstate;

        this.base.maxHealth = lstate.getMaxHealth();
        this.base.health = this.base.maxHealth;

        // this.offset.y = -4;
    }


    // Reset
    public reset() {

        this.base.dying = false;
        this.base.exist = true; 

        this.base.pos = this.base.startPos.clone();
        this.aiRef.reset();

        this.base.maxHealth = this.lstate.getMaxHealth();
        this.base.health = this.base.maxHealth;

        // Reset components
        this.renderComp.reset();
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
        this.reduceHealth(e.getPower() / this.lstate.getDamageReduction());
        
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
    public isDisappearing = () => this.rendRef.isDisappering();
}
