/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


enum TransitionType {

    Fade = 0,
    CircleOutside = 1,
}


type TransitionCallback = (ev : CoreEvent) => any;


// Transition manager
class Transition {

    private readonly TRANSITION_TIME = 60;

    private fadeIn : boolean;
    private timer : number;
    private type : TransitionType;
    private speed : number;
    private param : number;
    private active : boolean;
    private cb : TransitionCallback;


    constructor() {

        this.active = false;
    }


    // Activate
    public activate(fadeIn = false, speed = 1.0, 
        type = TransitionType.Fade, param = 0,
        cb? : TransitionCallback) {

        this.fadeIn = fadeIn;
        this.speed = speed;
        this.type = type;
        this.param = param;

        this.timer = this.TRANSITION_TIME;

        this.cb = cb;

        this.active = true;
    }


    // Update
    public update(ev : CoreEvent) {

        if (!this.active) return;

        // Update timer
        if ((this.timer -= this.speed * ev.step) <= 0) {

            if ((this.fadeIn = !this.fadeIn) == false) {

                if (this.cb != undefined)
                    this.cb(ev);

                this.timer += this.TRANSITION_TIME;
            }
            else {

                this.active = false;
                this.timer = 0;
            }
        }
    }


    // Draw
    public draw(c : Canvas) {

        if (!this.active) return;

        let t = this.getScaledTime(); 
        let r : number;

        let cx = c.width/2;
        let cy = c.height/2;

        let maxRadius = Math.max(
                hypot(cx, cy),
                hypot(c.width-cx, cy),
                hypot(c.width-cx, c.height-cy),
                hypot(cx, c.height-cy)
            );

        switch(this.type) {

        case TransitionType.Fade:

            if (this.param > 0) {

                t = Math.round(t * this.param) / this.param;
            }
            c.setColor(0, 0, 0, t);
            c.fillRect(0, 0, c.width, c.height);
            
            break;

        case TransitionType.CircleOutside:

            
            r = (1-t) * maxRadius;
            c.setColor(0);
            c.fillCircleOutside(r, cx, cy);

            break;

        default:
            break;
        }
    }


    // Get time scaled to [0,1] interval
    public getScaledTime() : number {

        let t = this.timer / this.TRANSITION_TIME;
        if (this.fadeIn) t = 1.0 - t;
        return t;
    }


    // Getters
    public isActive = () => this.active;
}