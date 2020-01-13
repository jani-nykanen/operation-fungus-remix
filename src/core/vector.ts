


class Vector2 {

    public x : number
    public y : number


    constructor(x? : number, y? : number) {

        this.x = x == undefined ? 0 : x;
        this.y = y == undefined ? 0 : y;
    }

}