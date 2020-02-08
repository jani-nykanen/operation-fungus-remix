/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// 2-components real-valued vector
class Vector2 {

    public x : number
    public y : number


    constructor(x? : number, y? : number) {

        this.x = x == undefined ? 0 : x;
        this.y = y == undefined ? 0 : y;
    }

    
    // Get length
    public len = () =>  Math.sqrt(this.x*this.x + this.y*this.y);

    
    // Normalize
    public normalize() : Vector2 {

        const EPS = 0.001;

        let len = this.len();
        if (len < EPS) return this.clone();

        this.x /= len;
        this.y /= len;

        return this.clone();
    }


    // Clone
    public clone() : Vector2 {

        return new Vector2(this.x, this.y);
    }


    // Set to zeroes
    public zeroes() {

        this.x = 0;
        this.y = 0;
    }
}
