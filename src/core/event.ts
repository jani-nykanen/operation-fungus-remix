/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Application event
class CoreEvent {

    public readonly step : number;
    // References to required objects
    public readonly assets : AssetPack;
    public readonly input : InputManager;
    public readonly gamepad : Controller;
    public readonly tr : Transition;


    constructor(framerate : number, 
        ap? : AssetPack, 
        input? : InputManager,
        gamepad? : Controller,
        tr? : Transition) {

        this.step = 60.0 / framerate;
        
        this.assets = ap;
        this.input = input;
        this.gamepad = gamepad;
        this.tr = tr;
    }
}
