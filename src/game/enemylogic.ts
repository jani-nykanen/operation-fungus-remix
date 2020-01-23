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
