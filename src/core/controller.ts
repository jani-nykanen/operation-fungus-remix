/**
 * Operation Fungus Remix
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

        this.stick = new Vector2();

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
    }


    // Update buttons
    public updateButtons(input : InputManager) {

        const EPS = 0.01;

        // Update buttons
        for (let b of this.buttons) {

            b.state = input.getKeyState(b.key);
            // Nice pyramid
            if (b.state == State.Up) {

                b.state = input.getButtonState(b.jbutton);
                if (b.jbutton2 != undefined && b.state == State.Up) {

                    b.state = input.getButtonState(b.jbutton2);
                }
            }
        }

        // Update stick
        this.stick = new Vector2();
        if (this.getButtonState("left") == State.Down) {

            this.stick.x = -1.0;
        }
        else if (this.getButtonState("right") == State.Down) {

            this.stick.x = 1.0;
        }

        if (this.getButtonState("up") == State.Down) {

            this.stick.y = -1.0;
        }
        else if (this.getButtonState("down") == State.Down) {

            this.stick.y = 1.0;
        }

        // Normalize to get emulated "analogue stick"
        // behavior
        this.stick.normalize();

        let padStick = input.getGamepadStick();
        if (hypot(this.stick.x, this.stick.y) < EPS &&
            hypot(padStick.x, padStick.y) > EPS) {

            this.stick.x = padStick.x;
            this.stick.y = padStick.y;
        }
        
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