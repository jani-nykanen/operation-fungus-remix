/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */

declare var Howl : any;


// A simple asset manager
class AssetPack {


    private bitmaps : Array<KeyValuePair<Bitmap>>;
    private sounds : Array<KeyValuePair<any>>;
    private total : number
    private loaded : number


    constructor(path : string) {

        this.bitmaps = new Array<KeyValuePair<Bitmap>> ();
        this.sounds = new Array<KeyValuePair<any>> ();

        this.total = 1;
        this.loaded = 0;

        this.loadListFile(path);
    }
    

    // Load the JSON asset list file
    private loadListFile(path : string) {

        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/json");
        xobj.open("GET", path, true);

        // When loaded
        xobj.onreadystatechange = () => {

            if (xobj.readyState == 4 ) {

                if(String(xobj.status) == "200") {
                    
                    this.parseAssetList(JSON.parse(xobj.responseText));
                }
                ++ this.loaded;
            }
                
        };
        xobj.send(null);  
    }


    // Start loading a bitmap
    private loadBitmap(name : string, path : string) {

        ++ this.total;

        let image = new Image();
        image.onload = () => {

            ++ this.loaded;
            this.bitmaps.push(new KeyValuePair<Bitmap>(name, new Bitmap(image)));
        }
        image.src = path;
    }


    // Start loading a sample
    private loadSample(name : string, path : string) {

        ++ this.total;
        
        this.sounds.push(new KeyValuePair<any> (name, 
            new Howl({
                src: [path],
                onload: () => { 
                    ++ this.loaded;
                }
            })
        ));
    }


    // Parse asset list
    private parseAssetList(data : any) {

        // Load bitmaps
        let bitmapPath = data.bitmapPath;
        for (let b of data.bitmaps) {

            this.loadBitmap(
                b.name,
                bitmapPath + b.path
            );
        }

        // Load sounds
        let soundPath = data.soundPath;
        for (let b of data.sounds) {

            this.loadSample(
                b.name,
                soundPath + b.path
            );
        }
    }


    // Are the assets loaded already
    public hasLoaded() : boolean {

        return  this.loaded >= this.total;
    }


    // Get how many items have been loaded
    // (in range [0,1])
    public getLoadingRatio() : number {

        return (this.total == 0 ? 1 : this.loaded/this.total);
    }


    // Get a bitmap
    public getBitmap(name : string) : Bitmap {

        for (let b of this.bitmaps) {

            if (b.key == name)
                return b.value;
        }
        return null;
    }


    // Get a sound
    public getSound(name : string) : any {

        for (let b of this.sounds) {

            if (b.key == name)
                return b.value;
        }
        return null;
    }

}
