/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An enemy generator
class EnemyGenerator {


    private enemies : Array<Enemy>;
    private shootCB : (pos : Vector2, speed: Vector2) => any;

    // TODO: Moar timers?
    private enemyTimer : number;


    constructor(shootCB? : (pos : Vector2, speed: Vector2) => any) {

        this.enemies = new Array<Enemy> ();
        this.shootCB = shootCB;

        this.enemyTimer = 120;
    }


    // Spawn flies
    private spawnFlies(count : number) {

        const MIN_Y = 32;
        const MAX_Y = 160;
        const AMPLITUDE_MIN = 8.0;
        const AMPLITUDE_MAX = 32.0;
        const COUNT_MODIF = 1.0;
        const LATITUDE_BASE = 0.05;
        const BODY_OFF = 32;

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
                EnemyType.Fly,
                [ampl, lat, 1, 
                start + Math.PI/count * i],
                null,
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

        this.spawnFlies(count);

        return count;
    }


    // Update
    public update(bullets : Array<Bullet>, ev : CoreEvent) {

        const WAIT_TIME_MIN = 30;
        const WAIT_MOD = 45;

        // Update timer
        if ((this.enemyTimer -= ev.step) <= 0.0) {

            this.enemyTimer += WAIT_TIME_MIN +
                this.spawnEnemy() * WAIT_MOD;
        }

        // Update enemies
        for (let e of this.enemies) {

            e.update(ev);

            // Bullet collisions
            if (e.doesExist() && !e.isDying()) {

                for (let b of bullets) {

                    if (!b.isFriendly()) continue;

                    e.entityCollision(b, true);
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
