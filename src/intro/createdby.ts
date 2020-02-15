/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// The ending scene
class CreatedByScene implements Scene {

    private readonly WAIT_TIME = 90;


    private waitTime : number;
    private phase : number;


    public activate(param : any, ev : CoreEvent) {

        ev.tr.activate(false, 2.0, TransitionType.Fade, 4);

        this.waitTime = this.WAIT_TIME;
        this.phase = 0;
    }


    public update(ev : CoreEvent) {

        if (ev.tr.isActive()) return;

        if (ev.gamepad.getButtonState("start") == State.Pressed ||
            ev.gamepad.getButtonState("fire1") == State.Pressed) {

           this.waitTime = 0.0;
        }

        if ((this.waitTime -= ev.step) <= 0.0) {

            this.waitTime += this.WAIT_TIME;
            ev.tr.activate(true, 2.0, TransitionType.Fade, 4,
                (ev : CoreEvent) => {

                if (++ this.phase == 2) {

                    ev.tr.activate(false, 2.0, TransitionType.CircleOutside);
                    ev.changeScene(new TitleScreenScene());
                }
            });
        }
    }


    public draw(c : Canvas) {

        c.clear(0);

        let bmp = c.getBitmap("creator");

        c.drawBitmapRegion(bmp, 0, this.phase * (bmp.height/2),
            bmp.width, bmp.height/2,
            c.width/2 - bmp.width/2, 
            c.height/2 - bmp.height/4);
    }


    public deactivate() : any {

    }
}
