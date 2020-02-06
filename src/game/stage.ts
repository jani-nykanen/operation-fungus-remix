/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Handles stage background rendering
class Stage {

    private readonly LAYER_COUNT = 6;
    private readonly SHIFT_TIME = 60;

    private timers : Array<number>;
    private bmpFloor : Bitmap;

    private skyshift : boolean;
    private skyTimer : number;


    constructor() {

        this.timers = new Array<number> (this.LAYER_COUNT);
        // I miss you Array.fill ...
        for (let i = 0; i < this.timers.length; ++ i) {

            this.timers[i] = 0;
        }

        this.bmpFloor = null;

        this.skyTimer = 0;
        this.skyshift = false;
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
    public update(globalSpeed : number,  ev : CoreEvent) {

        const TIMER_SPEEDS = [
            1.0, 0.5, 0.25, 0.2, 0.125, 0.1
        ];

        // Update sky shift
        if (this.skyshift &&
            this.skyTimer > 0) {

            this.skyTimer -= ev.step;
        }
        
        // Update timers
        for (let i = 0; i < this.timers.length; ++ i) {

            this.timers[i] += globalSpeed * TIMER_SPEEDS[i] * ev.step;
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
        const FLOOR_VANISH_Y = 129; // "Vanishing point"
        const FLOOR_OFF = 16;
        const FLOOR_DRIFT = 3;

        // Create the floor bitmap if none
        let b;
        if (this.bmpFloor == null) {

            b = c.getBitmap("floor");
            this.bmpFloor = createFilledBitmap(b,
                256 + b.width, 32);
        }

        // Draw sky
        let t : number;
        if (!this.skyshift || this.skyTimer > 0) {

            c.drawBitmapRegion(c.getBitmap("sky"),
                0, 0, 256, 144,
                0, 0);
        }
        
        if (this.skyshift) {

            t = 1.0 - Math.floor(this.skyTimer / this.SHIFT_TIME * 4) / 4;
            c.setAlpha(Math.min(1, t));
            c.drawBitmapRegion(c.getBitmap("sky"),
                0, 144, 256, 144,
                0, 0);
            c.setAlpha();
        }

        // Draw the sun
        b = c.getBitmap("sun");
        c.drawBitmap(b,
            SUN_X - b.width/2,
            SUN_Y - b.height/2);

        // Draw the moving layers
        for (let i = this.LAYER_COUNT-1; i >= 1; -- i) {

            this.drawLayer(c, c.getBitmap(LAYERS_BITMAPS[i-1]), 
                this.timers[i-1],
                0, LAYERS_TOP[i-1]);
        }

        // Draw the floor
        c.draw3DFloor(this.bmpFloor, 192-32, 32, 
            this.timers[0] % c.getBitmap("floor").width, 
            FLOOR_DRIFT, c.width, 
            FLOOR_VANISH_Y, FLOOR_OFF);
    }


    // Toggle sky shift
    public toggleSkyShift(state : boolean) {

        this.skyshift = state;
        if (!state) return;

        this.skyshift = true;
        this.skyTimer = this.SHIFT_TIME;
    }
}
