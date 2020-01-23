/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A text that flies
class FlyingText {

    private pos : Vector2;
    private speed : number;
    private stopTime : number;
    private waitTime : number;
    private output : string;

    private exist : boolean;


    constructor() {

        this.exist = false;
    }


    // Spawn
    public spawn(output : string,
        pos : Vector2, speed : number,
        stopTime : number, waitTime : number)  {

        this.pos = pos;
        this.speed = speed;
        this.stopTime = stopTime;
        this.output = output;
        this.waitTime = waitTime;

        this.exist = true;
    }


    // Update
    public update(ev : CoreEvent) {

        if (!this.exist) return;

        if (this.stopTime > 0) {

            this.stopTime -= ev.step;
            this.pos.y -= this.speed * ev.step;
        }
        else {

            if ((this.waitTime -= ev.step) <= 0) {

                this.exist = false;
            }
        }
    }


    // Draw
    public draw(c : Canvas) {

        if (!this.exist) return;

        c.drawText(c.getBitmap("fontRed"),
            this.output, this.pos.x | 0, (this.pos.y | 0) -8, 
            -1, 0, true);
    }


    // Getters
    public doesExist = () => this.exist;
}
