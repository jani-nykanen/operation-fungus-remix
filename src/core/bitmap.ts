/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

class Bitmap {

    public readonly img : HTMLImageElement
    public readonly width : number
    public readonly height : number


    constructor(img : HTMLImageElement) {

        this.img = img;

        this.width = img.width;
        this.height = img.height;
    }
}
