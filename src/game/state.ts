/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Skill indices
enum Skill {

    Accuracy     = 0, // Bullet power
    Agility      = 1, // Reload & bullet speed
    Dexterity    = 2, // Movement & invisibility time
    Strength     = 3, // Sword power
    Vitality     = 4, // Total health
    Growth       = 5, // More EXP
    Regeneration = 6, // Health regen
    Diversity    = 7, // Bullet count
}


// Local game state for the current "session". Has 
// a direct access to the variables
class LocalState {

    private health : number;
    private xp : number;
    private level : number;
    private multiplier : number;
    private mulTimer : number;
    private power : number;

    // Skill levels (this is an array
    // to make shopping easier!)
    private skillLevels : Array<number>;

    // Gameplay stats
    private maxHealth : number;
    private bulletPower : number;
    private reloadSpeed : number;
    private bulletSpeed : number;
    private swordSpeed : number;
    private swordPower : number;
    private moveSpeed : number;
    private regenSpeed : number;
    private flickerTime : number;


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

        this.skillLevels = new Array<number> (8);
        for (let i = 0; i < this.skillLevels.length; ++ i) {

            this.skillLevels[i] = 5;
        }

        this.recomputeStats();
    }


    // Recompute stats
    private recomputeStats() {

        let x = this.level - 1;

        this.bulletPower = 5 + x + this.skillLevels[Skill.Accuracy]*2;
        this.bulletSpeed = 3 + x/10.0 + this.skillLevels[Skill.Agility]/10.0;
        this.reloadSpeed = x + this.skillLevels[Skill.Agility]*2;
        this.swordPower = 5 + x + this.skillLevels[Skill.Strength]*3;
        this.moveSpeed = 1 + x/40.0 + this.skillLevels[Skill.Dexterity]/20.0;
        this.maxHealth = 100 + 10 * x + this.skillLevels[Skill.Vitality]*20;
        this.flickerTime = 1.0 + this.skillLevels[Skill.Dexterity]/5.0;

        let l = this.skillLevels[Skill.Regeneration];
        this.regenSpeed = l == 0 ? 0 : (60 - l*10);
    }


    // Getters
    public getHealth = () => this.health;
    public getLevel = () => this.level;
    public getExp = () => this.xp;
    public getMultiplier = () => this.multiplier;
    public getMulTimer = () => this.mulTimer;
    public getXpRequired = (lvl : number) =>  1000 * lvl * lvl;
    public getXpPercentage = () => (this.xp / this.getXpRequired(this.level));
    public getPower = () => this.power;

    public getMaxHealth   = () => this.maxHealth;
    public getBulletPower = () => this.bulletPower;
    public getReloadSpeed = () => this.reloadSpeed;
    public getBulletSpeed = () => this.bulletSpeed;
    public getSwordSpeed  = () => this.swordSpeed;
    public getSwordPower  = () => this.swordPower;
    public getMoveSpeed   = () => this.moveSpeed;
    public getRegenSpeed  = () => this.regenSpeed;
    public getFlickerTime = () => this.flickerTime;

    public getSkillLevel = (index : number) => 
        this.skillLevels[clamp(index, 0, this.skillLevels.length)]; // Sorry


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

        this.xp += inc * (1 + this.skillLevels[Skill.Growth]/10.0);

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
