/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Handles game objects
class ObjectManager {

    private player : Player;


    constructor(lstate? : LocalState) {

        this.player = new Player(48, 88);
    }


    // Update
    update(ev : CoreEvent) {

        this.player.update(ev);
    }


    // Draw
    draw(c : Canvas) {

        c.setColor(255, 0, 0);

        // Draw shadows
        this.player.drawShadow(c);

        // Draw objects
        this.player.draw(c);
    }
}
