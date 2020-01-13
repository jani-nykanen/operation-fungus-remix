/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Application event
class CoreEvent {

    public readonly step : number
    // References to required objects
    public readonly assets : AssetPack


    constructor(fps : number, ap? : AssetPack) {

        this.step = 60.0 / fps;
        
        this.assets = ap;
    }
}
