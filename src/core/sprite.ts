/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An animatable (is that a word) sprite
class Sprite {

    private frame : number;
    private row : number;
    private count : number;
    public readonly width : number;
    public readonly height : number;


    constructor(width : number, height : number) {

        this.width = width;
        this.height = height;
    
        this.frame = 0;
        this.row = 0;
        this.count = 0.0;
    }


    // Animate the sprite
    animate(row : number, start : number, end : number, 
        speed : number, step : number) {

        // speed = Math.max(1, speed);

        // Nothing to animate
        if (start == end) {
    
            this.count = 0;
            this.frame = start;
            this.row = row;
            return;
        }
    
        // Swap row
        if (this.row != row) {
    
            this.count = 0;
            this.frame = end > start ? start : end;
            this.row = row;
        }
    
        // If outside the animation interval
        if (start < end && 
            (this.frame < start || this.frame > end)) {
    
            this.frame = start;
            this.count = 0;
        }
        else if (end < start && 
            (this.frame < end || this.frame > start)) {
    
            this.frame = end;
            this.count = 0;
        }
    
        // Animate
        this.count += 1.0 * step;
        if (this.count > speed) {
    
            if (start < end) {
    
                if (++this.frame > end) {
    
                    this.frame = start;
                }
                if (speed < 0) {

                    this.frame = Math.min(this.frame-speed, end);
                }   
            }
            else {
    
                if (--this.frame < end) {
    
                    this.frame = start;
                }
                if (speed < 0) {

                    this.frame = Math.max(this.frame+speed, start);
                } 
            }
    
            this.count -= speed;
        }
    }


    // Set frame
    setFrame(row : number, frame : number) {

        this.row = row;
        this.frame = frame;

        this.count = 0;
    }


    // Draw a frame
    drawFrame(c : Canvas, bmp : Bitmap, 
        frame : number, row : number, 
        dx : number, dy : number, 
        flip? : boolean) {
    
        c.drawBitmapRegion(bmp, 
            this.width * frame, this.height * row, 
            this.width, this.height, 
            dx, dy, flip);
    }


    // Draw the current frame
    draw(c : Canvas, bmp : Bitmap, 
        dx : number, dy : number, flip? : boolean) {

        this.drawFrame(c, bmp, 
            this.frame, this.row,
            dx, dy, flip);
    }


    // Getters
    public getFrame = () => this.frame;
    public getRow = () => this.row;
}

