/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// A storage for the game state
class GameState {

    private intProp : Array<KeyValuePair<number>>;


    constructor() {

        // Add default properties
        this.intProp = new Array<KeyValuePair<number>> ();
        this.pushIntProp("maxHealth", 100)
            .pushIntProp("crystals", 0);
    }


    // Add an integer property
    public pushIntProp(name : string, value : number) : GameState {

        this.intProp.push(new KeyValuePair<number>(name, value));

        return this;
    }


    // Update an integer property
    public updateIntProp(name : string, newValue : number) {
        
        for (let p of this.intProp) {

            if (p.key == name) {

                p.value = newValue;
                return;
            }
        }

        this.pushIntProp(name, newValue);
    }


    // Get an integer property
    public getIntProp(name : string) {

        for (let p of this.intProp) {

            if (p.key == name) {

                return p.value;
            }
        }
        return 0;
    }
}


// Local game state for the current "session". Has 
// a direct access to the variables
class LocalState {

    private health : number;
    private maxHealth : number;
    private crystals : number;
    private powerBar : number;
    private multiplier : number;


    constructor(state : GameState) {

        // Fetch initial values
        this.maxHealth = state.getIntProp("maxHealth");
        this.health = this.maxHealth;
        this.crystals = state.getIntProp("crystals");

        this.powerBar = 0.0;
        this.multiplier = 1.0;
    }


    // Getters
    public getHealth = () => this.health;
    public getMaxHealth = () => this.maxHealth;
    public getCrystals = () => this.crystals;


    // Add crystals
    public addCrystals(count : number) {

        if (count <= 0) return;

        this.crystals += (this.multiplier * count) | 0;

        // TODO: Update power bar!
    }


    // Update health
    public updateHealth(delta : number) {

        this.health = clamp(this.health + delta, 0, this.maxHealth);
    }

}
