/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

// Why so stupid/weird a filename? So I can use
// *.ts in tsconfig.json without tsc
// complaining something not defined...


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
    protected timer : number;


    constructor(base : EntityBase,
        animCB? : (() => any)) {

        this.base = base;
        this.timer = 0;
        this.animCB = animCB;
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
            startTime : number,
            speed : number,
            animCB? : (() => any)) {

        super(base, animCB);

        this.period = period;
        this.speed = speed;

        this.timer -= startTime % period;
    }


    // Update
    public update(ev : CoreEvent) {

        this.timer += ev.step;
        if (this.timer >= this.period) {

            this.timer -= this.period;
            if (this.animCB != undefined) {

                this.animCB();
            }
        }
    }
}
