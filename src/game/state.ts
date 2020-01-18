/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

// Local game state for the current "session". Has 
// a direct access to the variables
class LocalState {

    private health : number;
    private maxHealth : number;
    private xp : number;
    private level : number;
    private multiplier : number;
    private mulTimer : number;
    private power : number;


    constructor() {

        const INITIAL_HEALTH = 100;

        // Set initial values
        this.maxHealth = INITIAL_HEALTH;
        this.health = this.maxHealth;
        
        this.xp = 0;
        this.level = 1;
        this.multiplier = 0;
        this.mulTimer = 0;
        this.power = 0;
    }


    // Getters
    public getHealth = () => this.health;
    public getMaxHealth = () => this.maxHealth;
    public getLevel = () => this.level;
    public getExp = () => this.xp;
    public getMultiplier = () => this.multiplier;
    public getMulTimer = () => this.mulTimer;
    public getXpRequired = (lvl : number) =>  1000 * lvl;
    public getXpPercentage = () => (this.xp / this.getXpRequired(this.level));
    public getPower = () => this.power;


    // Update health
    public updateHealth(delta : number) {

        this.health = clamp(this.health + delta, 0, this.maxHealth);
    }

}
