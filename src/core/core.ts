/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Application core
class Core {


    private canvas : Canvas
    private assets : AssetPack
    private ev : CoreEvent
    
    private initialized : boolean
    private timeSum : number
    private oldTime : number

    private activeScene : Scene


    constructor(conf : Config) {

        // Create an asset pack
        this.assets = new AssetPack(null)

        // Create a canvas
        this.canvas = new Canvas(
            Number(conf.getParam("canvas_width", "320")),
            Number(conf.getParam("canvas_height", "240")),
            this.assets
        );

        // Set some basic events
        window.addEventListener("resize",
            (e) => {

                this.canvas.resize(window.innerWidth, 
                    window.innerHeight)
            });

        // Create an event... thing
        this.ev = new CoreEvent(
            Number(conf.getParam("framerate", "60")),
            this.assets
        );

        // Set initial values
        this.initialized = false;
    }


    // The main loop
    loop(ts : number) {

        // In the case refresh rate gets too low,
        // we don't want the game update its logic
        // more than 5 times (i.e. the minimum fps
        // is 60 / 5 = 12)
        const MAX_REFRESH = 5;
        const TARGET = 17 / this.ev.getStep();

        this.timeSum += ts - this.oldTime;

        // Compute target loop count
        let loopCount = Math.floor(this.timeSum / TARGET) | 0;
        if (loopCount > MAX_REFRESH) {

            this.timeSum = MAX_REFRESH * TARGET;
            loopCount = MAX_REFRESH;
        }

        // If no looping, no reason to redraw
        let redraw = loopCount > 0;

        // Update game logic
        while ( (loopCount --) > 0) {

            if (this.assets.hasLoaded()) {

                if (!this.initialized) {

                    // Initialize the initial scene
                    this.activeScene.activate(null, this.ev, this.assets)
                    this.initialized = true;
                }
            }

            // Update input
            // this.input.updateStates();

            this.timeSum -= TARGET;
            redraw = true;
        }

        // (Re)draw the scene
        if (redraw) {

            if (this.assets.hasLoaded()) {
                
                this.activeScene.draw(this.canvas, this.assets);
            }
            else {

                // Draw the loading screen
                //this.drawLoadingScreen(this.canvas);
            }
        }

        this.oldTime = ts;

        // Next frame
        window.requestAnimationFrame( 
            (ts) => this.loop(ts) 
        );
    }



    // Run the application
    run(initialScene : Scene) {

        this.activeScene = initialScene;

        // Start the main loop
        this.oldTime = 0;
        this.timeSum = 0;
        this.loop(0);
    }
}
