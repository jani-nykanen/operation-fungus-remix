/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Dust AI
class DustAI  extends AIComponent {


    constructor(base : EntityBase) {

        super(base);
    }


    // Reset
    public reset(speed : Vector2, 
        target? : Vector2, acc? : Vector2) {

        this.base.speed = speed.clone();
        if (target == undefined) {
            
            this.base.target = speed.clone();
        }
        else {

            this.base.target = target.clone();
        }

        const BASE_ACC = 0.1;
        if (acc == undefined) {

            this.base.acc.x = BASE_ACC;
            this.base.acc.y = BASE_ACC;
        }
        else {

            this.base.acc = acc.clone();
        }
    }


    // Update
    public update(ev : CoreEvent) {

        const MIN_Y = 192-22;

        this.base.pos.y = Math.min(MIN_Y, this.base.pos.y);
    }
}


// Dust render component
class DustRenderComponent extends RenderComponent {


    private speed : number;


    constructor(base : EntityBase) {

        super(base, 16, 16);

        this.speed = 0.0;
    }


    // Reset
    public reset(row : number, speed : number) {

        this.speed = speed;
        this.spr.setFrame(row, 0);
    }


    // Animate
    public animate(ev : CoreEvent) {

        const END_FRAME = [6];

        let end = END_FRAME[ 
            clamp(this.spr.getRow(), 0, END_FRAME.length) | 0 
        ];

        this.spr.animate(this.spr.getRow(), 0, end, this.speed, ev.step);
        if (this.spr.getFrame() == end) {

            this.base.exist = false;
        }
    }
}


// Dust type
class Dust extends Entity {


    constructor() {

        super();

        this.renderComp = new DustRenderComponent(this.base);
        this.ai = new DustAI(this.base);

        this.base.exist = false;
    }


    // Spawn
    public spawn(row : number, animSpeed : number, pos : Vector2,
        speed : Vector2, target? : Vector2, acc? : Vector2) {

        this.base.exist = true;
        this.base.pos = pos.clone();

        this.ai.reset(speed, target, acc);
        this.renderComp.reset(row, animSpeed);
    }
}
