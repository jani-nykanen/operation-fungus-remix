/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Rendering happens here
class Canvas {


    private canvas : HTMLCanvasElement
    private ctx : CanvasRenderingContext2D

    private width : number
    private height : number
    private tr : Vector2

    private ap : AssetPack


    constructor(w : number, h : number, ap? : AssetPack) {

        this.canvas = null;
        this.ctx = null;

        this.width = w;
        this.height = h;
        this.ap = ap;

        // Set other initial values
        this.tr = new Vector2();

        // Create the canvas
        this.createHtml5Canvas(w, h);

        // Black screen by default
        this.clear(0, 0, 0);

        // Set the proper size for the canvases (style-wise)
        this.resize(window.innerWidth, window.innerHeight);
    }


    // Create the Html5 canvas (and div where
    // it's embedded)
    private createHtml5Canvas(w : number, h : number) {

        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", 
            "position: absolute; top: 0; left: 0; z-index: -1");

        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;

        this.canvas.setAttribute(
            "style", 
            "position: absolute; top: 0; left: 0; z-index: -1;" + 
            "image-rendering: optimizeSpeed;" + 
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;"
            );
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);

        // Get 2D context and disable image smoothing
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
    }


    // Getters
    getWidth = () => this.width
    getHeight = () => this.height
    getBitmap = (name : string) => this.ap.getBitmap(name)


    // Called when the window is resized (and in the creation)
    resize(w : number, h : number) {

        let c = this.canvas;
        let x, y;
        let width, height;

        // Find the best multiplier for
        // square pixels
        let mul = Math.min(
            (w / c.width) | 0, 
            (h / c.height) | 0);
            
        // Compute properties
        width = c.width * mul;
        height = c.height * mul;
        x = w/2 - width/2;
        y = h/2 - height/2;
        
        // Set style properties
        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";

        c.style.height = String(height | 0) + "px";
        c.style.width = String(width | 0) + "px";
        c.style.top = top;
        c.style.left = left;
    }


    // Set global rendering color
    setColor(r : number, g : number, b : number, a? : number) {

        if (a == undefined) a = 1.0;

        let s = getColorString(r, g, b, a);
        this.ctx.fillStyle = s;
        this.ctx.strokeStyle = s;
    }


    // Clear screen with a color
    clear(r: number, g: number, b: number, a?: number) {

        this.setColor(r, g, b, a);
        this.fillRect(0, 0, this.width, this.height);
    }



    // Draw a filled rectangle
    fillRect(x : number, y : number, w : number, h : number) {

        let c = this.ctx;

        // Apply translation
        x += this.tr.x;
        y += this.tr.y;

        c.fillRect(x, y, w, h);
    }


    // Draw a full bitmap
    drawBitmap(bmp : Bitmap, dx : number, dy : number, flip : boolean) {

        this.drawBitmapRegion(bmp, 
            0, 0, bmp.getWidth(), bmp.getHeight(),
            dx, dy, flip);
    }

    
    // Draw a bitmap region
    drawBitmapRegion(bmp : Bitmap, 
        sx : number, sy : number, sw : number, sh : number, 
        dx : number, dy : number, flip : boolean) {

        if (sw <= 0 || sh <= 0) 
            return;

        let c = this.ctx;

        let dw = sw;
        let dh = sh;
            
        // Apply translation
        dx += this.tr.x;
        dy += this.tr.y;

        // Only integer positions etc. are
        // allowed
        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;

        dx |= 0;
        dy |= 0;

        // If flipping, save the current transformations
        // state
        if (flip) {

            c.save();

            c.translate(dw, 0);
            c.scale(-1, 1);
            dx *= -1;
        }


        c.drawImage(bmp.getImage(), sx, sy, sw, sh, dx, dy, dw, dh);

        // ... and restore the old
        if (flip) {

            c.restore();
        }
    }


    // Draw scaled text
    public drawText(font : Bitmap, str : string, 
        dx : number, dy : number, xoff : 
        number, yoff : number, center : boolean) {

        let cw = font.getWidth() / 16;
        let ch = cw;

        let x = dx;
        let y = dy;
        let c;

        if (center) {

            dx -= (str.length * (cw + xoff))/ 2.0 ;
            x = dx;
        }

        // Draw every character
        for (let i = 0; i < str.length; ++ i) {

            c = str.charCodeAt(i);
            if (c == '\n'.charCodeAt(0)) {

                x = dx;
                y += ch + yoff;
                continue;
            }

            // Draw the current character
            this.drawBitmapRegion(
                font, 
                (c % 16) * cw, ((c/16)|0) * ch,
                cw, ch, 
                x, y, false);

            x += cw + xoff;
        }
    }
    

}
