/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// An enemy generator
class EnemyGenerator {


    private enemies : Array<Enemy>;

    // TODO: Moar timers?
    private enemyTimer : number;


    constructor() {

        this.enemies = new Array<Enemy> ();

        this.enemyTimer = 120;
    }


    // Spawn an enemy
    private spawnEnemy() {

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

        enemy.spawn(new Vector2(256+12, 
                20 + Math.floor(Math.random()*(192-40) ) ),
                EnemyType.Fly
                );
    }


    // Update
    public update(ev : CoreEvent) {

        const WAIT_TIME = 120;

        // Update timer
        if ((this.enemyTimer -= ev.step) <= 0.0) {

            this.spawnEnemy();
            this.enemyTimer += WAIT_TIME;
        }

        // Update enemies
        for (let e of this.enemies) {

            e.update(ev);
        }
    }


    // Draw
    public draw(c : Canvas) {

        // Draw enemies
        for (let e of this.enemies) {

            e.draw(c);
        }
    }

}
