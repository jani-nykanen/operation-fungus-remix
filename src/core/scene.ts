/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Scene type
interface Scene {

    activate: (param : any, ev : CoreEvent) => any
    update: (ev : CoreEvent) => any
    draw: (c : Canvas) => any
    deactivate: () => any
}