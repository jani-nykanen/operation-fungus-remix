/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

enum FontColor {

    White = 0,
    Red = 1,
    Yellow = 2,
};


// A text that flies
class FlyingText {

    private pos : Vector2;
    private speed : number;
    private stopTime : number;
    private waitTime : number;
    private output : string;

    private exist : boolean;
    private color : FontColor;


    constructor() {

        this.exist = false;
    }


    // Spawn
    public spawn(output : string,
        pos : Vector2, speed : number,
        stopTime : number, waitTime : number,
        color = FontColor.White)  {

        this.pos = pos;
        this.speed = speed;
        this.stopTime = stopTime;
        this.output = output;
        this.waitTime = waitTime;
        this.color = color;

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

        const STR = [
            "", "Red", "Yellow"
        ];

        if (!this.exist) return;

        c.drawText(c.getBitmap("font" + STR[this.color]),
            this.output, this.pos.x | 0, (this.pos.y | 0) -8, 
            -1, 0, true);
    }


    // Getters
    public doesExist = () => this.exist;
}
