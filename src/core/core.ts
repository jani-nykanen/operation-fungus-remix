/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Application core
class Core {


    private canvas : Canvas
    private assets : AssetPack
    private input : InputManager
    private gamepad : Controller
    private ev : CoreEvent
    private tr : Transition;
    private audio : AudioPlayer;
    
    private initialized : boolean
    private timeSum : number
    private oldTime : number

    private activeScene : Scene


    constructor(conf : Config, gamepad? : Controller) {

        // Create an asset pack
        this.assets = new AssetPack(
            conf.getParam("asset_path", "null")
        );

        // Create a canvas
        this.canvas = new Canvas(
            Number(conf.getParam("canvas_width", "320")),
            Number(conf.getParam("canvas_height", "240")),
            this.assets
        );

        // Create input
        this.input = new InputManager();
        this.gamepad = gamepad;
        this.gamepad.initialize(this.input);

        // Set some basic events
        window.addEventListener("resize",
            (e) => {

                this.canvas.resize(window.innerWidth, 
                    window.innerHeight)
            });

        // Create transition
        this.tr = new Transition();

        // Create an audio player
        this.audio = new AudioPlayer();

        // Create an event... thing
        this.ev = new CoreEvent(
            Number(conf.getParam("framerate", "60")),
            this.assets,
            this.input,
            this.gamepad,
            this.tr,
            this.audio
        );

        // Set initial values
        this.initialized = false;
    }


    // Draw the loading screen
    public drawLoadingScreen(c : Canvas) {

        let barWidth = c.width / 4;
        let barHeight = barWidth / 8;
    
        // Black background
        c.clear(0);
    
        let t = this.assets.getLoadingRatio();
        let x = c.width/2 - barWidth/2;
        let y = c.height/2 - barHeight/2;

        x |= 0;
        y |= 0;
    
        // Draw outlines
        c.setColor(255);
        c.fillRect(x-2, y-2, barWidth+4, barHeight+4);
        c.setColor(0);
        c.fillRect(x-1, y-1, barWidth+2, barHeight+2);
    
        // Draw bar
        let w = (barWidth*t) | 0;
        c.setColor(255);
        c.fillRect(x, y, w, barHeight);
    }


    // The main loop
    public loop(ts : number) {

        // In the case refresh rate gets too low,
        // we don't want the game update its logic
        // more than 5 times (i.e. the minimum fps
        // is 60 / 5 = 12)
        const MAX_REFRESH = 5;
        const TARGET = 17 / this.ev.step;

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
                    this.activeScene.activate(null, this.ev)
                    this.initialized = true;
                }

                // Update the active scene
                this.activeScene.update(this.ev);

                // Update the transition
                this.tr.update(this.ev);
            }

            // Update gamepad
            if (this.gamepad != undefined) {

                this.gamepad.updateButtons(this.input);
            }
            // Update input
            this.input.updateStates();

            this.timeSum -= TARGET;
            redraw = true;
        }

        // (Re)draw the scene
        if (redraw) {

            if (this.assets.hasLoaded()) {
                
                this.activeScene.draw(this.canvas);
            }
            else {

                // Draw the loading screen
                this.drawLoadingScreen(this.canvas);
            }

            // Draw transition
            this.tr.draw(this.canvas);
        }

        this.oldTime = ts;

        // Next frame
        window.requestAnimationFrame( 
            (ts) => this.loop(ts) 
        );
    }



    // Run the application
    public run(initialScene : Scene) {

        this.activeScene = initialScene;

        // Start the main loop
        this.oldTime = 0;
        this.timeSum = 0;
        this.loop(0);
    }


    // Change the scene
    public changeScene(s : Scene) {

        this.activeScene = s;
    }
}
