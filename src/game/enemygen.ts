/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An enemy generator
class EnemyGenerator {


    private timers : Array<number>;
    private lastIndices : Array<number>;
    private enemies : Array<Enemy>;
    private shootCB : ShootCallback;
    private bossBegun : boolean;

    private boss : Boss;


    constructor(shootCB? : ShootCallback) {

        const TIMER_COUNT = 3;

        this.enemies = new Array<Enemy> ();
        this.shootCB = shootCB;

        this.timers = new Array<number> (TIMER_COUNT);
        this.lastIndices = new Array<number> (TIMER_COUNT);
        this.initTimers();

        this.bossBegun = false;
    
        this.boss = null;
    }


    // Initialize timers
    private initTimers() {

        for (let i = 0; i < this.timers.length; ++ i) {

            this.timers[i] = 60.0 + i*30.0;
            this.lastIndices[i] = -1;
        }
    }


    // Spawn flies
    private spawnFlies(count : number, fleeing = false) {

        const MIN_Y = 32;
        const MAX_Y = 160;
        const AMPLITUDE_MIN = 12.0;
        const AMPLITUDE_MAX = 32.0;
        const COUNT_MODIF = 1.0;
        const LATITUDE_BASE = 0.033;
        const BODY_OFF = 32;
        const FLEEING_SPEED = 0.5;

        let maxAmpl = AMPLITUDE_MAX - COUNT_MODIF;

        let ampl = AMPLITUDE_MIN + 
            Math.floor(
                Math.random()*(maxAmpl-AMPLITUDE_MIN)
            );
        let lat = LATITUDE_BASE /
            (1 + (ampl-AMPLITUDE_MIN)/(maxAmpl-AMPLITUDE_MIN));
        let x = 256+12;
        let y = MIN_Y+ampl + 
            Math.floor(
                Math.random()* (MAX_Y - MIN_Y -2*ampl)
                );

        let start = Math.random() * (Math.PI); // *2
        for (let i = 0; i < count; ++ i) {

            this.getNextEnemy().spawn(
                new Vector2(x + i*BODY_OFF, y),
                fleeing ?  EnemyType.FleeingFly : EnemyType.Fly,
                [ampl, lat, 
                fleeing ? FLEEING_SPEED : 1.0, 
                start + Math.PI/count * i],
                this.shootCB
                );
        }
    }


    // Spawn slimes
    private spawnSlimes(count : number, flip = false) {

        const BODY_OFF = 32;
        const JUMP_MIN = 2.5;
        const JUMP_VARY = 2.0;
        const JUMP_WAIT_MIN = 30;
        const JUMP_WAIT_VARY = 60; 

        let x = 256+12;
        let y = 192 -16;

        let jumpWait = JUMP_WAIT_MIN + (Math.random()*JUMP_WAIT_VARY) | 0;
        let initialWait = (Math.random() * jumpWait) | 0;
        for (let i = 0; i < count; ++ i) {

            this.getNextEnemy().spawn(
                new Vector2(x + i*BODY_OFF, y),
                flip ? EnemyType.FleeingSlime : EnemyType.Slime,
                [jumpWait, 
                 JUMP_MIN + Math.random()*JUMP_VARY, 
                initialWait, 1.0, 
                flip ? 1 : 0],
                this.shootCB
                );
        }
    }


     // Spawn clouds
     private spawnClouds(count : number) {

        const MIN_Y = 48;
        const MAX_Y = 192 - 48;
        const SPEED_X_MIN = 0.25;
        const SPEED_X_VARY = 0.25;
        const SPEED_Y_MIN = 0.5;
        const SPEED_Y_VARY = 0.5;
        const BODY_OFF = 32;

        const LATITUDE_MIN = 0.025;
        const LATITUDE_VARY = 0.025;

        let x = 256+12;
        let y = (MIN_Y + Math.random()*(MAX_Y-MIN_Y)) | 0;

        let dir = Math.random() <= 0.5 ? 1 : -1;
        let speedx, speedy, lat : number;

        for (let i = 0; i < count; ++ i) {

            speedx = SPEED_X_MIN + Math.random()*SPEED_X_VARY;
            speedy = SPEED_Y_MIN + Math.random()*SPEED_Y_VARY;

            lat = LATITUDE_MIN + Math.random() * LATITUDE_VARY;

            this.getNextEnemy().spawn(
                new Vector2(x + i*BODY_OFF, y),
                EnemyType.Cloud,
                [speedx, speedy*dir, lat],
                this.shootCB
                );

            dir = dir == 1 ? -1 : 1;
        }
    }


    // Spawn bees
    private spawnBees(count = 4) {

        const DIST_MIN = 32;
        const DIST_VARY = 32;
        const ANGLE_SPEED_BASE = 0.033;
        const ANGLE_SPEED_COMPARE = DIST_MIN;

        let startAngle = Math.random() * (Math.PI * 2);
        let angleStep = Math.PI*2 / count;

        let dist = DIST_MIN + Math.random() * DIST_VARY;

        let midx = 256 + 12 + dist;
        let midy = 32 + dist + (128 - dist*2) * Math.random();

        let angleSpeed = ANGLE_SPEED_BASE / (dist/ANGLE_SPEED_COMPARE);
        let dir = Math.random() <= 0.5 ? 1 : -1;

        let angle : number;
        for (let i = 0; i < count; ++ i) {

            angle = startAngle + i * angleStep;
            angle %= (Math.PI * 2);

            this.getNextEnemy().spawn(
                new Vector2(
                    midx, 
                    midy),
                EnemyType.Bee,
                [dist, angleSpeed*dir, 1.0, angle],
                this.shootCB
                );
        }
    }


    // Spawn kamikaze bullets
    private spawnKamikaze(count : number) {

        const ACC = 0.1;
        const TARGET_SPEED = 4.0;
        const INITIAL_SPEED = 0.5;
        const BODY_OFF = 32;

        const MIN_Y = 20+12;
        const MAX_Y = 192-16-12;

        const DELTA_MIN = 32;
        const DELTA_VARY = 64;

        let delta = DELTA_MIN + DELTA_VARY * Math.random();
        delta *= (Math.random() <= 0.5 ? -1 : 1);

        let x = 256+12;
        let y = MIN_Y + ((Math.random()*(MAX_Y-MIN_Y)) | 0);

        for (let i = 0; i < count; ++ i) {

            this.getNextEnemy().spawn(
                new Vector2(x + i*BODY_OFF, y),
                EnemyType.Kamikaze,
                [ACC, TARGET_SPEED, INITIAL_SPEED],
                this.shootCB
                );

            y += delta;
            if (y < MIN_Y)
                y = MAX_Y - (MIN_Y-y);

            else if (y > MAX_Y)
                y = MIN_Y + (y-MAX_Y);
        }
    }


    // Get the next "non-existent" enemy in an array
    private getNextEnemy() : Enemy {

        let enemy : Enemy;
        for (let e of this.enemies) {
    
            if (!e.doesExist()) {
    
                enemy = e;
                break;
            }
        }
    
        if (enemy == null) {
            
            enemy = new Enemy();
            this.enemies.push(enemy);
        }

        return enemy;
    }


    // Randomize enemy type
    private randomizeEnemyType(t : number) :
         [number, boolean, number, number]  {

        if (t >= 3.0) return [0, false, 0, 0];

        const CAP = [
            3, 4, 5, 5
        ];

        const PROBABILITIES = [
            [0.40, 0.35, 0.25, 0.00, 0.00],
            [0.30, 0.25, 0.20, 0.25, 0.00],
            [0.25, 0.20, 0.15, 0.30, 0.10],
            [0.20, 0.20, 0.15, 0.25, 0.20],
            [0.20, 0.20, 0.15, 0.25, 0.20],
        ];

        const FLIP_PROBABILITY = [
            [0.75, 0.5, 0, 0, 0],
            [0.5, 0.25, 0, 0, 0],
            [0.25, 0.1, 0, 0, 0],
            [0.0, 0.0, 0, 0, 0],
            [0.0, 0.0, 0, 0, 0],
        ];

        const MAX_AMOUNT = [
            [2, 2, 1, 0, 0],
            [3, 3, 1, 2, 0],
            [4, 3, 1, 3, 2],
            [4, 3, 1, 4, 4],
            [4, 3, 1, 4, 4],
        ];

        let p = Math.random();
        let type = EnemyType.Fly;

        let totalProb = 0.0;
        let q : number;
        let s = t % 1.0;
        for (let i = 0; i < 5; ++ i) {

            q = (1-s) * PROBABILITIES[Math.floor(t)][i] +
                 s * PROBABILITIES[Math.floor(t) +1][i];

            totalProb += q;
            if (p < totalProb) {

                type = <EnemyType>i;
                break;
            }
        }

        let amount = MAX_AMOUNT[Math.round(t) | 0] [type];
        let flip = Math.random() < 
            (1-s) * FLIP_PROBABILITY[Math.floor(t)][type] +
            s * FLIP_PROBABILITY[Math.floor(t) +1][type];

        return [type, flip, amount, CAP[Math.floor(t)]];
    }   


    // Spawn an enemy
    private spawnEnemy(index : number, t : number) : number {

        const WAIT_BASE = 30;
        const WAIT_MOD = [
            45, 45, 75, 60, 60
        ];

        let out = this.randomizeEnemyType(t);

        let count = 1 + Math.floor(Math.random() * out[2]);
        let type = out[0]
        if (type == this.lastIndices[index]) {

            type = (type + 1) % out[3];
        }
        this.lastIndices[index] = type;

        let flip = out[1];
        
        switch(type) {
        
        case EnemyType.Fly:
            this.spawnFlies(count, flip);
            break;

        case EnemyType.Slime:

            if (flip) count = 1;

            this.spawnSlimes(count, flip);
            break;

        case EnemyType.Cloud:
            this.spawnClouds(count);
            break;

        case EnemyType.Bee:
            this.spawnBees();
            break;

        case EnemyType.Kamikaze:
            this.spawnKamikaze(count);
            break;

        default:
            break;
        }

        return WAIT_BASE + count * WAIT_MOD[type];
    }


    // Spawn the damage text
    // (wait why is this public shut up)
    public spawnDamageText(texts : Array<FlyingText>,
            dmg : number, pos : Vector2) {

        let text : FlyingText;

        for (let t of texts) {
    
            if (!t.doesExist()) {
    
                text = t;
                break;
            }
        }
    
        if (text == null) {
            
            text = new FlyingText();
            texts.push(text);
        }

        text.spawn("-" + String(dmg), pos, 2,
            10, 30, FontColor.Red);

    }


    // Spawn a pickup item
    private spawnPickUp(lstate : LocalState, 
        pickups : Array<PickUp>, pos : Vector2) {

        const LIFE_CHANCE = 0.125;
        const COIN_CHANCE = 0.25; // Assuming life did not happen
        const SPEED_X = 1.0;
        const SPEED_Y = -1.0;

        let id = 4;
        if (Math.random() > LIFE_CHANCE) {

            if (Math.random() <= COIN_CHANCE)
                id = (Math.random() * 4) | 0;
            else
                return;
        }

        let pickup : PickUp;
        for (let p of pickups) {

            if (!p.doesExist()) {

                pickup = p;
                break;
            }
        }
        if (pickup == null) {
            
            pickup = new PickUp(lstate);
            pickups.push(pickup);
        }

        pickup.spawn(pos,
            new Vector2(
                SPEED_X, SPEED_Y
            ), id);

    }
    


    // Update timers
    public updateTimers(lstate : LocalState, ev : CoreEvent) {

        // The last and final columns are unused,
        // but they are there to one bug I haven't
        // been able to fix...
        const TIMER_SPEEDS = [
            [1.0, 0.0, 0.0, 0.0],
            [1.0, 0.5, 0.0, 0.0],
            [1.0, 1.0, 0.5, 0.0],
            [1.0, 1.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 0.0]
        ];

        // No more enemies if the power is full
        let t = lstate.getPower();
        // The other check should be unnecessary...
        if (t >= 3.0 || Math.floor(t) +1 >= TIMER_SPEEDS.length) 
            return;

        let index = (t | 0);

        let s = t % 1.0;
        let speed = 0.0;
        for (let i = 0; i < this.timers.length; ++ i) {

            // Update timer
            speed = (1-s) * TIMER_SPEEDS[index][i]
                    + s*TIMER_SPEEDS[index +1][i];
            if ((this.timers[i] -= speed * ev.step) <= 0.0) {

                this.timers[i] += this.spawnEnemy(i, t);
            }
        }
    }


    // Update an enemy
    private updateEnemy(
        e : Enemy,
        bullets : Array<Bullet>, 
        text : Array<FlyingText>,
        pickups : Array<PickUp>, 
        player : Player,
        lstate : LocalState,
        ev : CoreEvent) {

        let dmg;
        let blade = player.getBlade();

        e.update(ev);

            // Bullet  & player collisions
            if (e.doesExist() && !e.isDying()) {

                if (player.entityCollision(e, true, false, ev) > 0) {

                    lstate.resetMultiplier();
                }

                // Blade collision
                if (blade != null &&
                    e.getHurtIndex != undefined &&
                    e.getHurtIndex() < blade.getAttackIndex()) {

                    dmg = e.entityCollision(blade, true, false);
                    if (dmg > 0) {

                        this.spawnDamageText(text, dmg, blade.getPos());
                        e.setHurtIndex(blade.getAttackIndex());

                        lstate.addExperience(e.getXP(dmg));
                    }

                }

                for (let b of bullets) {

                    if (!b.isFriendly()) continue;

                    dmg = e.entityCollision(b, true);
                    if (dmg > 0) {

                        this.spawnDamageText(text, dmg, b.getPos());
                        lstate.addExperience(e.getXP(dmg));
                    }
                }

                // If killed, increase multiplier and
                // spawn an item
                if (e.isDying()) {

                    lstate.increaseMultiplier();

                    this.spawnPickUp(lstate, pickups, e.getPos());
                }
            }
    }


    // Update
    public update(bullets : Array<Bullet>, 
        text : Array<FlyingText>,
        pickups : Array<PickUp>, 
        player : Player,
        lstate : LocalState,
        ev : CoreEvent) {

        // Update timer
        if (!this.bossBegun)
            this.updateTimers(lstate, ev);

        else {

            // Update boss & its orbiter
            this.updateEnemy(this.boss, bullets, text,
                pickups, player, lstate, ev);
            this.updateEnemy(<any>this.boss.getOrbiter(), bullets, text,
                pickups, player, lstate, ev);

            lstate.setPower(this.boss.getHealth() / 
                this.boss.getMaxHealth() * 3.0);
        }

        // Update enemies
        for (let e of this.enemies) {

            this.updateEnemy(e, bullets, text,
                pickups, player, lstate, ev);
        }
    }


    // Draw shadows
    public drawShadows(c : Canvas) {

        // Draw enemies
        for (let e of this.enemies) {

            e.drawShadow(c);
        }
        
        if (this.bossBegun) {

            this.boss.getOrbiter().drawShadow(c);
            this.boss.drawShadow(c);
        }
    }


    // Draw
    public draw(c : Canvas) {

        // Draw enemies
        for (let e of this.enemies) {

            e.draw(c, c.getBitmap("enemies"));
        }

        if (this.bossBegun) {

            this.boss.getOrbiter().draw(c, c.getBitmap("spikeball"));
            this.boss.draw(c);
        }
    }


    // Reset everything
    public reset() {

        for (let e of this.enemies) {

            e.kill(true);
        }

        this.initTimers();
        this.bossBegun = false;

        this.boss = null;
    }


    // Start the boss battle
    public startBossBattle(stage : Stage) {

        const BOSS_X = 96;

        if (this.bossBegun) return;

        // Kill all
        for (let e of this.enemies) {

            e.kill(false, false);
        }
        this.bossBegun = true;

        this.boss = new Boss(256+BOSS_X, 96, this.shootCB,
            () => {

                stage.toggleSkyShift(false);
            });
        
    }


    // Is the boss dead
    public bossDead() : boolean {

        return this.boss != null && 
            !this.boss.doesExist();
    }
}
