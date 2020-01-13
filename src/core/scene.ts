/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Scene type
interface Scene {

    activate: (param : any, ev : CoreEvent, ap : AssetPack) => any
    update: (ev : CoreEvent) => any
    draw: (c : Canvas, ap : AssetPack) => any
    deactivate: () => any
}