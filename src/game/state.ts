/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Skill indices
enum Skill {

    Accuracy     = 0, // Bullet power
    Agility      = 1, // Reload & bullet speed
    Dexterity    = 2, // Movement & invincibility time
    Strength     = 3, // Sword power & deflect power
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
    private xpReq : number;
    private level : number;
    private multiplier : number;
    private mulTimer : number;
    private power : number;
    private full : boolean;

    // Skill levels (this is an array
    // to make shopping easier!)
    private skillLevels : Array<number>;
    private skillPoints : number;

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
    private bulletWait : number;
    private deflectPower : number;

    // Bonues timers
    private bonusTimers : Array<number>;


    constructor() {

        const INITIAL_HEALTH = 100;

        // Set initial values
        this.maxHealth = INITIAL_HEALTH;
        this.health = this.maxHealth;
        
        this.xp = 0;
        this.xpReq = 0;
        this.level = 8;
        this.multiplier = 0;
        this.mulTimer = 0;
        this.power = 0;
        this.skillPoints = this.level-1;

        this.bonusTimers = new Array<number> (4);
        for (let i = 0; i < this.bonusTimers.length; ++ i) {

            this.bonusTimers[i] = 0.0;
        }

        this.skillLevels = new Array<number> (8);
        for (let i = 0; i < this.skillLevels.length; ++ i) {

            this.skillLevels[i] = 0;
        }

        this.recomputeStats();
    }


    // Compute experience required for the next level
    private computeExpRequired(level : number) : number {

        return 800 * Math.sqrt(level*level*level);
    }


    // Recompute stats
    private recomputeStats() {

        let x = this.level - 1;

        this.bulletPower = 5 + x + this.skillLevels[Skill.Accuracy]*2;
        this.bulletSpeed = 3 + x/10.0 + this.skillLevels[Skill.Agility]/10.0;
        this.reloadSpeed = x + this.skillLevels[Skill.Agility]*2;
        this.swordPower = 8 + 
            Math.round(1.5*x) + this.skillLevels[Skill.Strength]*4;
        this.moveSpeed = 1 + x/40.0 + this.skillLevels[Skill.Dexterity]/20.0;
        this.maxHealth = 100 + 10 * x + this.skillLevels[Skill.Vitality]*20;
        this.flickerTime = 1.0 + this.skillLevels[Skill.Dexterity]/5.0;
        this.deflectPower = 0.5 + 0.1 * this.skillLevels[Skill.Strength];

        let l = this.skillLevels[Skill.Diversity];
        this.bulletWait = l == 0 ? -1 : (5 - this.skillLevels[Skill.Diversity]);

        l = this.skillLevels[Skill.Regeneration];
        this.regenSpeed = l == 0 ? 0 : (60 - l*10);

        this.xpReq = this.computeExpRequired(this.level);
    }


    // Increase a bonus timer
    public increaseBonusTimer(time : number, index : number) {

        this.bonusTimers[index] += time;
    }


    // Getters
    public getHealth = () => this.health;
    public getLevel = () => this.level;
    public getExp = () => this.xp;
    public getMultiplier = () => this.multiplier;
    public getMulTimer = () => this.mulTimer;
    public getXpRequired = () => this.xpReq;
    public getXpPercentage = () => (this.xp / this.xpReq);
    public getPower = () => this.power;

    public getMaxHealth   = () => this.maxHealth;
    public getBulletPower = () => 
        this.bulletPower * (this.bonusTimers[0] > 0 ? 2 : 1);
    public getReloadSpeed = () => 
        (this.reloadSpeed * (this.bonusTimers[2] > 0 ? 1.5 : 1)) | 0;
    public getBulletSpeed = () => this.bulletSpeed;
    public getSwordSpeed  = () => this.swordSpeed;
    public getSwordPower  = () => 
        this.swordPower * (this.bonusTimers[0] > 0 ? 2 : 1);
    public getMoveSpeed   = () => 
        this.moveSpeed * (this.bonusTimers[2] > 0 ? 1.5 : 1);
    public getRegenSpeed  = () => this.regenSpeed;
    public getFlickerTime = () => this.flickerTime;
    public getBulletWait  = () => this.bulletWait;
    public getDeflectPower = () => this.deflectPower;
    public getBulletBonus = () => 
        (this.bonusTimers[3] > 0 ? 1 : 0);
    public getDamageReduction = () => 
        (this.bonusTimers[1] > 0 ? 2 : 1);
    public getBonusTime = (index : number) => this.bonusTimers[index];

    public getSkillLevel = (index : number) => 
        this.skillLevels[clamp(index, 0, this.skillLevels.length)]; // Sorry
    public getSkillPoints = () => this.skillPoints;

    public isFull = () => this.full;


    // Update
    public update(ev : CoreEvent) {

        const MUL_REDUCE_SPEED = 0.005;

        // Update multiplier timer
        if (this.mulTimer > 0.0) {

            this.mulTimer -= MUL_REDUCE_SPEED * ev.step;
            if (this.mulTimer <= 0.0) {

                this.mulTimer = 0.0;
                this.multiplier = 0;
            }
        }

        // Update bonus timers
        for (let i = 0; i < this.bonusTimers.length; ++ i) {

            if (this.bonusTimers[i] > 0) {

                this.bonusTimers[i] = 
                    Math.max(0, this.bonusTimers[i] - ev.step);
            }
        }
    }


    // Update health
    public updateHealth(amount : number) {

        this.health = clamp(amount, 0, this.maxHealth);
    }


    // Add experience
    public addExperience(amount : number, increaseStar = true) {

        const STAR_AMOUNT = [3200, 9600, 19200];

        let inc =  amount * (10 + this.multiplier);

        this.xp += inc * (1 + this.skillLevels[Skill.Growth]/10.0);

        if (this.xp >= this.xpReq) {

            this.xp -= this.xpReq;
            ++ this.level;

            // Obtain one skill point per level
            ++ this.skillPoints;

            this.recomputeStats();
        }

        // Also increase the star bar
        if (increaseStar) {

            // Just some random number for now
            this.power += inc / STAR_AMOUNT[Math.floor(this.power)]; 
            if (this.power >= 3.0) {

                this.power = 3.0;
                this.full = true;
            }
        }
    }


    // Increase multiplier
    public increaseMultiplier() {

        ++ this.multiplier;
        this.mulTimer = 1.0;
    }


    // Increase a skill level
    public increaseSkillLevel(index : number) {

        if (index < 0 || index >= this.skillLevels.length ||
            this.skillLevels[index] >= 5)
            return;

        ++ this.skillLevels[index];
        -- this.skillPoints;

        this.recomputeStats();
    }


    // Reset multiplier
    public resetMultiplier() {

        this.multiplier = 0;
        this.mulTimer = 0;
    }


    // Reset
    public reset() {

        this.resetMultiplier();

        for (let i = 0; i < this.bonusTimers.length; ++ i) {

            this.bonusTimers[i] = 0.0;
        }
        this.power = 0;
        this.full = false;
    }


    // Set power (for boss battle)
    public setPower(x : number) {

        this.power = clamp(x, 0, 3.0);
    }


    // Reduce a skill point
    public reduceSkillPoint() {

        if (this.skillPoints > 0)
            -- this.skillPoints;
    }
}
