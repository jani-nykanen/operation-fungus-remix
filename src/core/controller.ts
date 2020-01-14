/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


class ControllerButton {

    public readonly key : string;
    public readonly jbutton : number;
    public readonly jbutton2? : number;
    public readonly name : string;

    public state : State;

    constructor(name : string, key : string, 
        jbutton? : number,
        jbutton2? : number) {

        this.name = name;
        this.key = key;
        this.jbutton = jbutton;
        this.jbutton2 = jbutton2;

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
    public addButton(name : string, 
        key : string, jbutton? : number, 
        jbutton2? : number) : Controller {

        this.buttons.push(
            new ControllerButton(name, key, jbutton, jbutton2)
        );

        return this;
    }


    // "Initialize", i.e. make sure the 
    // bound keys are prevented
    public initialize(input : InputManager) {

        for (let b of this.buttons) {

            input.preventDefault(b.key);
        }

        // Also prevent arrow keys
        input.preventDefault("ArrowLeft");
        input.preventDefault("ArrowRight");
        input.preventDefault("ArrowUp");
        input.preventDefault("ArrowDown");
    }


    // Update buttons
    public updateButtons(input : InputManager) {

        for (let b of this.buttons) {

            b.state = input.getKeyState(b.key);
        }

        // Update stick
        this.stick = new Vector2();
        if (input.getKeyState("ArrowLeft") == State.Down) {

            this.stick.x = -1.0;
        }
        else if (input.getKeyState("ArrowRight") == State.Down) {

            this.stick.x = 1.0;
        }

        if (input.getKeyState("ArrowUp") == State.Down) {

            this.stick.y = -1.0;
        }
        else if (input.getKeyState("ArrowDown") == State.Down) {

            this.stick.y = 1.0;
        }
        // Normalize to get emulated "analogue stick"
        // behavior
        this.stick.normalize();
    }


    // Get button state
    public getButtonState(name : string) : State {

        for (let b of this.buttons) {

            if (b.name == name) {

                return b.state;
            }
        }

        return State.Up;
    }


    // Other getters
    public getStick = () => this.stick.clone();
}