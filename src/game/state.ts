/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */

// Local game state for the current "session". Has 
// a direct access to the variables
class LocalState {

    private health : number;
    private xp : number;
    private level : number;
    private multiplier : number;
    private mulTimer : number;
    private power : number;

    // Gameplay stats
    private maxHealth : number;
    private bulletPower : number;
    private reloadSpeed : number;
    private bulletSpeed : number;
    private swordSpeed : number;
    private swordPower : number;
    private moveSpeed : number;


    constructor() {

        const INITIAL_HEALTH = 100;

        // Set initial values
        this.maxHealth = INITIAL_HEALTH;
        this.health = this.maxHealth;
        
        this.xp = 0;
        this.level = 20;
        this.multiplier = 0;
        this.mulTimer = 0;
        this.power = 0;

        this.recomputeStats();
    }


    // Recompute stats
    private recomputeStats() {

        let x = this.level - 1;

        this.bulletPower = 5 + x;
        this.bulletSpeed = 3 + x/10.0;
        this.reloadSpeed = x;
        this.swordPower = 5 + x;
        this.moveSpeed = 1 + x/40.0;
        this.maxHealth = 100 + 10 * x;
    }


    // Getters
    public getHealth = () => this.health;
    public getLevel = () => this.level;
    public getExp = () => this.xp;
    public getMultiplier = () => this.multiplier;
    public getMulTimer = () => this.mulTimer;
    public getXpRequired = (lvl : number) =>  1000 * lvl;
    public getXpPercentage = () => (this.xp / this.getXpRequired(this.level));
    public getPower = () => this.power;

    public getMaxHealth = () => this.maxHealth;
    public getBulletPower = () => this.bulletPower;
    public getReloadSpeed = () => this.reloadSpeed;
    public getBulletSpeed = () => this.bulletSpeed;
    public getSwordSpeed  = () => this.swordSpeed;
    public getSwordPower  = () => this.swordPower;
    public getMoveSpeed   = () => this.moveSpeed;


    // Update
    public update(ev : CoreEvent) {

        const MUL_REDUCE_SPEED = 0.005;

        if (this.mulTimer > 0.0) {

            this.mulTimer -= MUL_REDUCE_SPEED * ev.step;
            if (this.mulTimer <= 0.0) {

                this.mulTimer = 0.0;
                this.multiplier = 0;
            }
        }
    }


    // Update health
    public updateHealth(amount : number) {

        this.health = clamp(amount, 0, this.maxHealth);
    }


    // Add experience
    public addExperience(amount : number, increaseStar = true) {

        let inc =  amount * (10 + this.multiplier);

        this.xp += inc;
        let limit = this.getXpRequired(this.level);
        if (this.xp >= limit) {

            this.xp -= limit;
            ++ this.level;

            this.recomputeStats();
        }

        // Also increase the star bar
        if (increaseStar) {

            // Just some random number for now
            this.power += inc / 24000; 
        }
    }


    // Increase multiplier
    public increaseMultiplier() {

        ++ this.multiplier;
        this.mulTimer = 1.0;
    }


    // Reset multiplier
    public resetMultiplier() {

        this.multiplier = 0;
        this.mulTimer = 0;
    }
}
