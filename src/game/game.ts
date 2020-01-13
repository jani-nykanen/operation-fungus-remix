/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Game scene
class GameScene implements Scene {


    constructor() {

    }


    activate(param : any, ev : CoreEvent, ap : AssetPack) {

        
    }


    update(ev : CoreEvent) {

    }


    draw(c : Canvas, ap : AssetPack) {

        c.clear(170, 170, 170);

        c.drawText(ap.getBitmap("font"), "Hello world!",
            2, 2, -1, 0, false);
    }


    deactivate() {

    }
}
