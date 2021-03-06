/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Handles game objects
class ObjectManager {

    private player : Player;
    private bullets : Array<Bullet>;
    private pickups : Array<PickUp>;
    private enemyGen : EnemyGenerator;
    private flyingText : Array<FlyingText>;
    
    private finished : boolean;


    constructor(lstate? : LocalState) {

        this.player = new Player(48, -16, lstate);
        this.player.setBulletCallback(
            (pos : Vector2, speed: Vector2, power : number) => {

                this.spawnBullet(0, pos, speed, true, power);
            }
        );

        this.bullets = new Array<Bullet> ();
        this.enemyGen = new EnemyGenerator(
            (pos : Vector2, speed: Vector2, power : number, id = 1) => {

                this.spawnBullet(id, pos, speed, false, power);
            }
        );

        this.pickups = new Array<PickUp> ();
        this.flyingText = new Array<FlyingText> ();

        this.finished = false;
    }


    // Spawn a flying text
    private spawnFlyingText(msg : string,
        x : number, y : number,  color = FontColor.White, wait = 60) {

        let text : FlyingText;

        for (let t of this.flyingText) {
    
            if (!t.doesExist()) {
    
                text = t;
                break;
            }
        }
    
        if (text == null) {
            
            text = new FlyingText();
            this.flyingText.push(text);
        }

        text.spawn(msg, new Vector2(x, y), 2,
            10, wait, color);
    }


    // Spawn a bullet
    private spawnBullet(row : number,
        pos : Vector2, 
        speed : Vector2, 
        friendly : boolean,
        power = 1) {

        let bullet : Bullet;
        bullet = null;
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
    public update(lstate : LocalState, stage : Stage,
        hud : HUDRenderer, ev : CoreEvent) {

        const BOSS_ALERT_TIME = 120;

        const MESSAGES = [
            "DAMAGE", "DEFENSE",
            "SPEED", "BULLET"
        ];

        let oldLevel = lstate.getLevel();
        let blade = this.player.getBlade();
        let oldDeathState = this.player.isDying();

        // Check if finished
        if (!this.finished && 
            lstate.isFull()) {

            this.finished = true;
            this.enemyGen.startBossBattle(stage);
            stage.toggleSkyShift(true);
            hud.setBossAlert(BOSS_ALERT_TIME);

            ev.audio.stopMusic();
            ev.audio.playSample(ev.assets.getSound("alert"), 0.70);
            ev.audio.fadeInMusic(ev.assets.getSound("boss"), 0.70, 1000);
        }

        // Update bullets
        for (let b of this.bullets) {

            b.update(ev);
        }

        // Update pick-up items
        let id : number;
        let pos : Vector2;
        for (let p of this.pickups) {

            p.update(ev);
            // Player collision
            id = p.getSpriteRow();
            if (!this.player.isDisappearing() &&
                p.entityCollision(this.player, true, false, ev) > 0) {

                if (id < 4) {

                    pos = this.player.getPos();
                    this.spawnFlyingText(
                        MESSAGES[id] + " BONUS!",
                        pos.x, pos.y-16, FontColor.Yellow
                    );
                }
            }
        }

        if (hud.getStartTime() <= 0) {

            // Update enemies
            this.enemyGen.update(
                this.bullets,
                this.flyingText,
                this.pickups,
                this.player, 
                lstate,
                ev);
        }

        // Update player
        this.player.update(ev);
        let s : Vector2;
        for (let b of this.bullets) {

            if (b.isFriendly() || b.isDying() || !b.doesExist()) 
                continue;

            if (blade != null) {

                s = b.getSpeed();
                if (b.entityCollision(blade, true, false) > 0) {

                    this.spawnBullet(b.getRow()-1, b.getPos(), new Vector2(
                        -s.x, -s.y
                    ), true, b.getPower() * lstate.getDeflectPower());

                    continue;
                }
            }

            if (this.player.entityCollision(b, true, false, ev) > 0) {

                lstate.resetMultiplier();
            }
        }

        // If started to die, stop the music
        if (!oldDeathState && 
             this.player.isDying()) {

            ev.audio.stopMusic();
        }

        // Game over, stop here
        if (this.player.doesExist() == false) {

            return;
        }

        // Spawn level up text
        let p : Vector2;
        if (oldLevel != lstate.getLevel()) {

            p = this.player.getPos();
            this.spawnFlyingText("LEVEL UP!",
                p.x, p.y-12
                );

            ev.audio.playSample(ev.assets.getSound("levelUp"), 0.60);
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
        for (let p of this.pickups) {

            p.drawShadow(c);
        }

        // Draw objects (back layer)
        this.player.drawBackLayer(c);

        // Draw enemies
        this.enemyGen.draw(c);
        
        // Draw objects (base layer)
        //if (this.player.getBlade() != null)
        //    this.player.getBlade().draw(c);
        this.player.draw(c);
       
        // Draw bullets
        for (let b of this.bullets) {

            b.draw(c, c.getBitmap("bullet"));
        }

        // Draw pick-ups
        for (let p of this.pickups) {

            p.draw(c, c.getBitmap("pickup"));
        }

        // Draw the flying text
        for (let t of this.flyingText) {

            t.draw(c);
        }
    }


    // Reset
    public reset(lstate : LocalState, stage : Stage, hud : HUDRenderer) {

        this.player.reset();
        // Destroy objects
        for (let b of this.bullets) {

            b.kill(true);
        }
        for (let f of this.flyingText) {

            f.kill();
        }
        for (let p of this.pickups) {

            p.kill(true);
        }

        hud.reset();
        lstate.reset();
        stage.toggleSkyShift(false);

        this.finished = false;

        this.enemyGen.reset();
    }


    // Kill the player
    public killPlayer() {

        this.player.kill(false);
    }


    // Check if the game is over
    public isGameOver() : boolean {

        return !this.player.doesExist();
    }


    // Is the mission clear
    public missionClear() : boolean {

        return this.enemyGen.bossDead();
    }
}
