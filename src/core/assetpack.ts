/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A simple asset manager
class AssetPack {


    private bitmaps : Array<KeyValuePair<Bitmap>>


    constructor(path : string) {

        // ...
    }
    

    // Are the assets loaded already
    public hasLoaded() : boolean {

        return true;
    }
    

    // Getters for assets
    public getBitmap(name : string) : Bitmap {

        for (let bmp of this.bitmaps) {

            if (bmp.key == name) {

                return bmp.value;
            }
        }
        return null;
    }
}
