/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An enemy generator
class EnemyGenerator {


    private enemies : Array<Enemy>;
    private shootCB : (pos : Vector2, speed: Vector2, power : number) => any;

    // TODO: Moar timers?
    private enemyTimer : number;


    constructor(shootCB? : 
        (pos : Vector2, speed: Vector2, power : number) => any) {

        this.enemies = new Array<Enemy> ();
        this.shootCB = shootCB;

        this.enemyTimer = 120;
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
                EnemyType.Slime,
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
        let midy = 32 + (128 - dist) * Math.random();

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


    // Spawn an enemy
    private spawnEnemy() : number {

        let count = 1 + Math.floor(Math.random()*4);

        let type = (Math.random() * 4) | 0;

        switch(type) {
        
        case EnemyType.Fly:
            this.spawnFlies(count, Math.random() <= 0.5);
            break;

        case EnemyType.Slime:
            this.spawnSlimes(count, count == 1);
            break;

        case EnemyType.Cloud:
            this.spawnClouds(count);
            break;

        case EnemyType.Bee:
            this.spawnBees();
            count = 4;
            break;

        default:
            break;
        }

        return count;
    }


    // Spawn the damage text
    private spawnDamageText(texts : Array<FlyingText>,
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
            10, 30);

    }


    // Update
    public update(bullets : Array<Bullet>, 
        text : Array<FlyingText>, 
        player : Player,
        lstate : LocalState,
        ev : CoreEvent) {

        const WAIT_TIME_MIN = 30;
        const WAIT_MOD = 45;

        // Update timer
        if ((this.enemyTimer -= ev.step) <= 0.0) {

            this.enemyTimer += WAIT_TIME_MIN +
                this.spawnEnemy() * WAIT_MOD;
        }

        // Update enemies
        let dmg : number;
        let blade = player.getBlade();
        for (let e of this.enemies) {

            e.update(ev);

            // Bullet  & player collisions
            if (e.doesExist() && !e.isDying()) {

                if (player.entityCollision(e, true, false) > 0) {

                    lstate.resetMultiplier();
                }

                // Blade collision
                if (blade != null &&
                    e.getHurtIndex() < blade.getAttackIndex()) {

                    dmg = e.entityCollision(blade, true, false);
                    if (dmg > 0) {

                        this.spawnDamageText(text, dmg, blade.getPos());
                        e.setHurtIndex(blade.getAttackIndex());
                    }

                }

                for (let b of bullets) {

                    if (!b.isFriendly()) continue;

                    dmg = e.entityCollision(b, true);
                    if (dmg > 0) {

                        this.spawnDamageText(text, dmg, b.getPos());
                    }
                }

                // If killed, gain experience
                if (e.isDying()) {

                    lstate.addExperience(e.getXP());
                    lstate.increaseMultiplier();
                }
            }
        }
    }


    // Draw shadows
    public drawShadows(c : Canvas) {

        // Draw enemies
        for (let e of this.enemies) {

            e.drawShadow(c);
        }
    }


    // Draw
    public draw(c : Canvas) {

        // Draw enemies
        for (let e of this.enemies) {

            e.draw(c, c.getBitmap("enemies"));
        }
    }

}
