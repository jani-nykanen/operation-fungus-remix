/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Handles stage background rendering
class Stage {

    private readonly LAYER_COUNT = 6;

    private timers : Array<number>;


    constructor() {

        this.timers = new Array<number> (this.LAYER_COUNT);
        // I miss you Array.fill ...
        for (let i = 0; i < this.timers.length; ++ i) {

            this.timers[i] = 0;
        }
    }


    // Draw a layer
    private drawLayer(c : Canvas, bmp : Bitmap, timer : number,
        left : number, top : number) {

        let loop = ((c.width / bmp.width) | 0) + 1;

        left -= (timer % bmp.width);

        for (let i = 0; i < loop; ++ i) {

            c.drawBitmap(bmp, Math.round(left) + i * bmp.width, top);
        }
    }


    // Update
    public update(ev : CoreEvent) {

        const TIMER_SPEEDS = [
            1.0, 0.5, 0.25, 0.2, 0.125, 0.1
        ];

        // Update timers
        for (let i = 0; i < this.timers.length; ++ i) {

            this.timers[i] += TIMER_SPEEDS[i] * ev.step;
            this.timers[i] %= 256; 
        }
    }


    // Draw
    public draw(c : Canvas) {

        const LAYERS_BITMAPS = [
            "forest", "mountainsFront", "cloudsFront",
            "mountainsBack", "cloudsBack"
        ];
        const LAYERS_TOP = [
            96, 40, 16, 40, 16
        ];
        const SUN_X = 208;
        const SUN_Y = 48;

        // Draw sky
        c.drawBitmap(c.bitmaps.sky, 0, 0);

        // Draw the sun
        c.drawBitmap(c.bitmaps.sun,
            SUN_X - c.bitmaps.sun.width/2,
            SUN_Y - c.bitmaps.sun.height/2);

        // Draw the moving layers
        for (let i = this.LAYER_COUNT-1; i >= 1; -- i) {

            this.drawLayer(c, c.bitmaps[LAYERS_BITMAPS[i-1]], 
                this.timers[i-1],
                0, LAYERS_TOP[i-1]);
        }

        // Draw the floor
        c.draw3DFloor(c.bitmaps.floor, 192-32, 32, 0);
    }
}
