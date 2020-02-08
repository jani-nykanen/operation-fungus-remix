/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Rendering happens here
class Canvas {


    private canvas : HTMLCanvasElement;
    private canvasBuffer : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    public readonly width : number;
    public readonly height : number;
    private tr : Vector2;

    private readonly assets : AssetPack;


    constructor(w : number, h : number, ap? : AssetPack) {

        this.canvas = null;
        this.ctx = null;

        this.width = w;
        this.height = h;
        this.assets = ap;

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

        // Create the main canvas
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;

        // Create the canvas buffer
        this.canvasBuffer = document.createElement("canvas");
        this.canvasBuffer.width = w;
        this.canvasBuffer.height = h;

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


    // Called when the window is resized (and in the creation)
    public resize(w : number, h : number) {

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
    public setColor(r = 255, g? : number, b? : number, a = 1.0) {

        if (r == undefined) r = 255;
        if (g == undefined) g = r;
        if (b == undefined) b = g;

        let s = getColorString(r, g, b, a);
        this.ctx.fillStyle = s;
        this.ctx.strokeStyle = s;
    }


    // Clear screen with a color
    public clear(r: number, g?: number, b?: number, a?: number) {

        this.setColor(r, g, b, a);
        this.fillRect(0, 0, this.width, this.height);
    }



    // Draw a filled rectangle
    public fillRect(x : number, y : number, w : number, h : number) {

        let c = this.ctx;

        // Apply translation
        x += this.tr.x;
        y += this.tr.y;

        c.fillRect(x, y, w, h);
    }


    // Draw a full bitmap
    public drawBitmap(bmp : Bitmap, dx : number, dy : number, 
        flip? : boolean) {

        this.drawBitmapRegion(bmp, 
            0, 0, bmp.width, bmp.height,
            dx, dy, flip);
    }


    // Draw a full, scaled bitmap
    public drawScaledBitmap(bmp : Bitmap, 
        dx : number, dy : number, dw : number, dh: number,
        flip? : boolean) {

        this.drawScaledBitmapRegion(bmp, 
            0, 0, bmp.width, bmp.height,
            dx, dy, dw, dh, flip);
    }

    
    // Draw a bitmap region
    public drawBitmapRegion(bmp : Bitmap, 
        sx : number, sy : number, sw : number, sh : number, 
        dx : number, dy : number, flip? : boolean) {

        this.drawScaledBitmapRegion(bmp, sx, sy, sw, sh,
            dx, dy, sw, sh, flip);
    }


     // Draw a scaled bitmap region
     public drawScaledBitmapRegion(bmp : Bitmap, 
        sx : number, sy : number, sw : number, sh : number, 
        dx : number, dy : number, dw : number, dh : number,
         flip? : boolean) {

        if (sw <= 0 || sh <= 0) 
            return;

        let c = this.ctx;
            
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


        c.drawImage(bmp.img, sx, sy, sw, sh, dx, dy, dw, dh);

        // ... and restore the old
        if (flip) {

            c.restore();
        }
    }


    // Draw scaled text
    public drawText(font : Bitmap, str : string, 
        dx : number, dy : number, xoff : 
        number, yoff : number, center? : boolean) {

        let cw = font.width / 16;
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
    

    // Draws a funky pseudo-3D floor
    public draw3DFloor(bmp : Bitmap, dy : number, h : number, 
        shift : number, angle : number, 
        width? : number, midy? : 
        number, eps? : number) {

        const EPS = 8;

        /*
         * This does not really work, it just gives a 
         * good enough impression.
         */

        if (width == undefined) {

            width = bmp.width;
        }

        let w = width;
        let x = this.width/2 - w/2;
        let xstep = angle;
        let sy = bmp.height-1;
        let z;
        if (midy == undefined) {

            midy = this.height / 2;
        }
        else {

            midy = 192 - midy;
        }
        if (eps == undefined) {

            eps = EPS;
        }

        w += h * xstep * 2;
        x -= h * xstep;

        for (let y = 0; y < h; ++ y) {
            
            // This might be a little slow...
            z = Math.log(1 / 
                ( (y+eps) / midy)) 
                / Math.LN2;

            sy = bmp.height / z;
            sy = negMod(sy, bmp.height)

            this.ctx.drawImage(bmp.img, 
                shift, bmp.height-1 - (sy | 0), width, 1, 
                x | 0, dy + (h-1-y), w | 0, 1);

            x += xstep;
            w -= xstep * 2;
        }
    }
        

    // Draw a sprite frame (another way)
    public drawSpriteFrame(spr : Sprite, bmp : Bitmap, 
        frame : number, row : number, 
        x : number, y : number, flip? : boolean)  {

        spr.drawFrame(this, bmp, frame, row, x, y, flip);
    }


    // Draw a sprite (another way)
    public drawSprite(spr : Sprite, bmp : Bitmap, 
        x : number, y : number, flip? : boolean)  {

        spr.draw(this, bmp, x, y, flip);
    }


    // Set global alpha
    public setAlpha(alpha? : number) {

        if (alpha == undefined)
            alpha = 1.0;

        this.ctx.globalAlpha = clamp(alpha, 0, 1);
    }


    // Translate the top-left corner
    public move(x : number, y : number) {

        this.tr.x = x;
        this.tr.y = y;
    }


    // Move the top-left corner to the given coordinate
    public moveTo(x? : number, y? : number) {

        this.tr.x = x == undefined ? 0 : x;
        this.tr.y = y == undefined ? 0 : y;
    }
     


    // Getters
    public getBitmap(name : string) : Bitmap {

        return this.assets.getBitmap(name);
    }


    // Copy the current canvas to a buffer
    public copyToBuffer() {

        let ctx = this.canvasBuffer.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(this.canvas, 0, 0);
    }


    // Get the canvas buffer as a bitmap
    public getCanvasBuffer() : Bitmap {

        return new Bitmap(this.canvasBuffer);
    }
}
