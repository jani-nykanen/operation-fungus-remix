/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

class Bitmap {

    private img : HTMLImageElement
    private width : number
    private height : number


    constructor(img : HTMLImageElement) {

        this.img = img;

        this.width = img.width;
        this.height = img.height;
    }


    // Getters
    getWidth = () => this.width
    getHeight = () => this.height
    getImage = () => this.img
}