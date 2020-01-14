/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Application event
class CoreEvent {

    public readonly step : number;
    // References to required objects
    public readonly assets : AssetPack;
    public readonly input : InputManager;
    public readonly gamepad : Controller;


    constructor(framerate : number, 
        ap? : AssetPack, 
        input? : InputManager,
        gamepad? : Controller) {

        this.step = 60.0 / framerate;
        
        this.assets = ap;
        this.input = input;
        this.gamepad = gamepad;
    }
}
