/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


class ControllerButton {

    public readonly key : number;
    public readonly jbutton : number;
    public readonly name : string;

    public state : State;

    constructor(name : string, key : number, 
        jbutton? : number) {

        this.name = name;
        this.key = key;
        this.jbutton = jbutton;

        this.state = State.Up;
    }

}


// A customizable... input container. Yeah.
class Controller {

    // Buttons
    private buttons : Array<ControllerButton>;

    // Analogue stick
    private stick : Vector2;


    constructor() {

        this.buttons = new Array<ControllerButton> ();
    }


    // Add a button
    public addButton(name : string, key : number, jbutton? : number) : Controller {

        this.buttons.push(new ControllerButton(name, key, jbutton));

        return this;
    }
}