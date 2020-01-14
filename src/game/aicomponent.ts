/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A base class for any kind of "AI", includes
// player input...
class AIComponent {

    protected base : EntityBase;

    
    constructor(base : EntityBase) {

        this.base = base;
    }


    // Methods
    public update? (ev : CoreEvent) : any;
    public animate? (spr : Sprite, ev : CoreEvent) : any;
}
