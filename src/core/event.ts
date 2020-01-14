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


    constructor(framerate : number, 
        ap? : AssetPack, 
        input? : InputManager) {

        this.step = 60.0 / framerate;
        
        this.assets = ap;
        this.input = input;
    }
}
