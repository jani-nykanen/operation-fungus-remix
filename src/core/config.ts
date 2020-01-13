/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


 // A simple data structure for handling
 // configuration data
 class Config {

    private params : Array<KeyValuePair<string>>


    constructor() {

        this.params = new Array<KeyValuePair<string>> ();
    }


    // Push a parameter
    public push(key : string, value : string) : Config {

        this.params.push(new KeyValuePair<string>(key, value));

        return this;
    }


    // Get a parameter
    public getParam(name : string, def? : string) : string {
        
        for (let p of this.params) {

            if (p.key == name) {

                return p.value;
            }
        }
        
        return def;
    }
}