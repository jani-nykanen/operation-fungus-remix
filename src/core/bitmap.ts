/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */

class Bitmap {

    public readonly img : HTMLImageElement
    public readonly width : number
    public readonly height : number


    constructor(img : any) {

        this.img = img;

        this.width = img.width;
        this.height = img.height;
    }
}


// Create and fill a bitmap with another bitmap
function createFilledBitmap(bmp : Bitmap, w : number, h : number) : Bitmap {

    let canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    // Fill
    let c = canvas.getContext("2d");
    for (let y = 0; y < Math.floor(h / bmp.height) +1; ++ y) {

        for (let x = 0; x < Math.floor(w / bmp.width) +1; ++ x) {

            c.drawImage(bmp.img, x*bmp.width, y*bmp.height);
        }
    }

    return new Bitmap(canvas);
}