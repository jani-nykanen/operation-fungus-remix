/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// The ending scene
class EndingScene implements Scene {

    public activate(param : any, ev : CoreEvent) {

    }


    public update(ev : CoreEvent) {

    }


    public draw(c : Canvas) {

        const TITLE_Y = 80;
        const TITLE_OFF = 16;

        c.clear(0, 0, 0);

        c.drawText(c.getBitmap("fontBig"), "THANK YOU",
            c.width/2, TITLE_Y, -4, 0, true);

        c.drawText(c.getBitmap("fontBig"), "FOR PLAYING!",
            c.width/2, TITLE_Y + TITLE_OFF, -4, 0, true);
    }


    public deactivate() : any {

    }
}
