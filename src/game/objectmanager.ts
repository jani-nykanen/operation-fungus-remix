/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Handles game objects
class ObjectManager {

    private player : Player;
    private bullets : Array<Bullet>;
    private enemyGen : EnemyGenerator;
    private flyingText : Array<FlyingText>;


    constructor(lstate? : LocalState) {

        this.player = new Player(48, 88);
        this.player.setBulletCallback(
            (row : number,
            pos : Vector2, speed : Vector2, friendly : boolean) => 
            this.spawnBullet(row, pos, speed, friendly)
        );

        this.bullets = new Array<Bullet> ();
        this.enemyGen = new EnemyGenerator(
            (pos : Vector2, speed: Vector2) => {

                this.spawnBullet(1, pos, speed, false);
            }
        );

        this.flyingText = new Array<FlyingText> ();
    }


    // Spawn a bullet
    spawnBullet(row : number,
        pos : Vector2, 
        speed : Vector2, 
        friendly : boolean,
        power = 1) {

        let bullet : Bullet;
         for (let b of this.bullets) {
    
                if (!b.doesExist()) {
    
                    bullet = b;
                    break;
                }
            }
    
        if (bullet == null) {
    
            bullet = new Bullet();
            this.bullets.push(bullet);
        }

        bullet.spawn(row, pos, speed, friendly, power);
    }


    // Update
    update(ev : CoreEvent) {

        // Update bullets
        for (let b of this.bullets) {

            b.update(ev);
        }

        // Update enemies
        this.enemyGen.update(this.bullets,
            this.flyingText, ev);

        // Update player
        this.player.update(ev);
        for (let b of this.bullets) {

            if (b.isFriendly()) continue;

            this.player.entityCollision(b, true);
        }

        // Update the flying text
        for (let t of this.flyingText) {

            t.update(ev);
        }
    }


    // Draw
    draw(c : Canvas) {

        c.setColor(255, 0, 0);

        // Draw shadows
        this.player.drawShadow(c);
        this.enemyGen.drawShadows(c);

        // Draw objects (back layer)
        this.player.drawBackLayer(c);

        // Draw enemies
        this.enemyGen.draw(c);

        // Draw objects (base layer)
        this.player.draw(c);

        // Draw bullets
        for (let b of this.bullets) {

            b.draw(c, c.getBitmap("bullet"));
        }

        // Draw the flying text
        for (let t of this.flyingText) {

            t.draw(c);
        }
    }
}
