/**
 * Operation Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// The ending scene
class AudioIntroScene implements Scene {


    private confirm : ConfirmBox;


    public activate(param : any, ev : CoreEvent) {

        ev.audio.toggle(false);

        this.confirm = new ConfirmBox(
            "Enable audio?",
            (ev : CoreEvent) => {
                ev.audio.toggle(true);
                ev.changeScene(new CreatedByScene());
                return true;
            }
        );
        this.confirm.activate(0);
    }


    public update(ev : CoreEvent) {

        
        this.confirm.update(ev);

        if (this.confirm.isActive() == false) {

            ev.changeScene(new CreatedByScene());
        }
    }


    public draw(c : Canvas) {

        c.clear(0);
        this.confirm.draw(c);
    }


    public deactivate() : any {

    }
}
