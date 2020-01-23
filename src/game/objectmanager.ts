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

        this.player = new Player(48, 88, lstate);
        this.player.setBulletCallback(
            (pos : Vector2, speed: Vector2, power : number) => {

                this.spawnBullet(0, pos, speed, true, power);
            }
        );

        this.bullets = new Array<Bullet> ();
        this.enemyGen = new EnemyGenerator(
            (pos : Vector2, speed: Vector2, power : number) => {

                this.spawnBullet(1, pos, speed, false, power);
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
    update(lstate : LocalState, ev : CoreEvent) {

        // Update bullets
        for (let b of this.bullets) {

            b.update(ev);
        }

        // Update enemies
        this.enemyGen.update(
            this.bullets,
            this.flyingText,
            this.player, 
            lstate,
            ev);

        // Update player
        this.player.update(ev);
        for (let b of this.bullets) {

            if (b.isFriendly()) continue;

            if (this.player.entityCollision(b, true) > 0) {

                lstate.resetMultiplier();
            }
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
