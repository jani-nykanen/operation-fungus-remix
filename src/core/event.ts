/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Application event
class CoreEvent {

    private step : number
    // References to required objects
    private ap : AssetPack


    constructor(fps : number, ap : AssetPack) {

        this.step = 60.0 / fps;
        
        this.ap = ap;
    }
    

    // Getters
    getStep = () => this.step
}
