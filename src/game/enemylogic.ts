/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Wave-like movement
class WaveMovement extends MovementLogic {


    private amplitude : number;
    private latitude : number;
    private waveTime : number;


    constructor(base : EntityBase,
        amplitude : number,
        latitude : number,
        speed : number,
        start = 0.0) {

        super(base);

        this.amplitude = amplitude;
        this.latitude = latitude;

        this.waveTime = negMod(start, Math.PI*2);

        this.base.speed.y = 0.0;
        this.base.speed.x = speed;

        this.base.target = this.base.speed.clone();
    }


    public move(ev : CoreEvent) {

        this.waveTime += this.latitude * ev.step;
        this.waveTime %= Math.PI * 2;

        this.base.pos.y = this.base.startPos.y +
            Math.sin(this.waveTime) * this.amplitude;
    }
}


// Jumping movement
class JumpMovement extends MovementLogic {

    private initialWaitTime : number;
    private waitTime : number;
    private canJump : boolean;
    private jumpHeight : number;


    constructor(base : EntityBase,
        waitTime : number,
        jumpHeight : number,
        speed : number) {

        super(base);

        this.waitTime = waitTime;
        this.initialWaitTime = this.waitTime;
        this.jumpHeight = jumpHeight;

        this.base.speed.y = 0.0;

        this.base.speed.x = speed;
        this.base.target.x = speed;

        this.base.acc.x = 1.0;
        this.base.acc.y = 0.15;
    }


    public move(ev : CoreEvent) {

        const GRAVITY = 4.0;
        const BOTTOM = 192-16 - 10;

        this.base.target.y = GRAVITY;

        if (this.canJump && this.base.pos.x < 256-12) {

            this.waitTime -= ev.step;
            if (this.waitTime <= 0) {

                this.waitTime += this.initialWaitTime;

                this.base.speed.y = -this.jumpHeight;
            }
        }


        // Ground collision
        this.canJump = false;
        if (this.base.speed.y > 0.0 &&
            this.base.pos.y >= BOTTOM) {

            this.base.pos.y = BOTTOM;
            this.base.speed.y = 0.0;

            this.canJump = true;
        }
    }
}


// Renders enemies
class SlimeRenderer extends EnemyRenderer {

    public animate(ev : CoreEvent) {

        const EPS = 0.5;

        this.spr.setFrame(this.spr.getRow(), 0);
        if (this.base.speed.y < -EPS) {

            this.spr.setFrame(this.spr.getRow(), 1);
        }
        else if (this.base.speed.y > EPS) {

            this.spr.setFrame(this.spr.getRow(), 2);
        }
    }   

}



// Shoots a single bullet
class SingleShot extends ShootingLogic {

    private period : number;
    private speed : number;


    constructor(base : EntityBase,
            period : number,
            delay : number,
            speed : number,
            animCB? : (() => any),
            shootCB? : (pos : Vector2, speed: Vector2, power : number) => any) {

        super(base, animCB, shootCB);

        this.period = period;
        this.speed = speed;
                
        this.timer = period * (1-delay);
    }


    // Update
    public update(ev : CoreEvent) {

        this.timer += ev.step;
        if (this.timer >= this.period) {

            this.timer -= this.period;
            // Shoot
            if (this.animCB != undefined) {

                this.animCB();
            }
            if (this.shootCB != undefined) {

                this.shootCB(
                    new Vector2(this.base.pos.x-8, this.base.pos.y+4),
                    new Vector2(this.speed, 0.0), 30
                    );
            }
        }
    }
}


// Specific AIs
class FlyAI extends BaseEnemyAI {


    constructor(base : EntityBase,
        rendComp? : EnemyRenderer,
        params? : Array<number>,
        shootCB? : (pos : Vector2, speed: Vector2, power : number) => any) {

        super(base, rendComp);

        this.moveComp = new WaveMovement(base,
            params[0], params[1], params[2], params[3]);
            
        this.shootComp = new SingleShot(base,
                Math.PI*2 / params[1],
                params[3] / (Math.PI*2),
                -3.0, 
                () => {
                    this.animateShooting();
                }, shootCB);

        
        this.base.setInitialHealth(15);
        this.base.power = 50;
        this.base.xp = 20;

        this.base.hitbox = new Vector2(
            16, 16
        );
    }
}


class SlimeAI extends BaseEnemyAI {


    constructor(base : EntityBase,
        rendComp? : EnemyRenderer,
        params? : Array<number>,
        shootCB? : (pos : Vector2, speed: Vector2, power : number) => any) {

        super(base, rendComp);

        this.moveComp = new JumpMovement(base,
            params[0], params[1], params[2]);
        
        this.base.setInitialHealth(15);
        this.base.power = 60;
        this.base.xp = 20;

        this.base.hitbox = new Vector2(
            16, 16
        );
    }
}
