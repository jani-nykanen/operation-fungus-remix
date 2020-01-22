/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

 
class MovementLogic {

    protected base : EntityBase;

    constructor(base : EntityBase) {

        this.base = base;
    }

    public move? (ev : CoreEvent) : any;
}


class ShootingLogic {

    protected base : EntityBase;
    protected animCB : (() => any);
    protected shootCB : ((pos : Vector2, speed : Vector2) => any);
    protected timer : number;


    constructor(base : EntityBase,
        animCB? : (() => any),
        shootCB? : ((pos: Vector2, speed : Vector2) => any)) {

        this.base = base;
        this.timer = 0;
        this.animCB = animCB;
        this.shootCB = shootCB;
    }


    public update?(ev : CoreEvent) : any;
}


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
            shootCB? : ((pos: Vector2, speed : Vector2) => any)) {

        super(base, animCB, shootCB);

        this.period = period;
        this.speed = speed;
                
        this.timer = period * (1-delay);

        // console.log("Period: %d", period);
        // console.log("Timer: %d", this.timer);
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
                    new Vector2(this.speed, 0.0)
                    );
            }
        }
    }
}
