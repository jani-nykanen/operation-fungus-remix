/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Handles game objects
class ObjectManager {

    private player : Player;
    private bullets : Array<Bullet>;


    constructor(lstate? : LocalState) {

        this.player = new Player(48, 88);
        this.player.setBulletCallback(
            (row : number,
            pos : Vector2, speed : Vector2, friendly : boolean) => 
            this.spawnBullet(row, pos, speed, friendly)
        );

        this.bullets = new Array<Bullet> ();
    }


    // Spawn a bullet
    spawnBullet(row : number,
        pos : Vector2, speed : Vector2, friendly : boolean) {

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

        bullet.spawn(row, pos, speed, friendly);
    }


    // Update
    update(ev : CoreEvent) {

        // Update bullets
        for (let b of this.bullets) {

            b.update(ev);
        }

        // Update player
        this.player.update(ev);
    }


    // Draw
    draw(c : Canvas) {

        c.setColor(255, 0, 0);

        // Draw shadows
        this.player.drawShadow(c);

        // Draw objects (back layer)
        this.player.drawBackLayer(c);

        // Draw objects (base layer)
        this.player.draw(c);

        // Draw bullets
        for (let b of this.bullets) {

            b.draw(c, c.getBitmap("bullet"));
        }
    }
}
