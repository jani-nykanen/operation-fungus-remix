/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


 // Input states
enum State {

    Up = 0, 
    Down = 1, 
    Pressed = 2, 
    Released = 3
}

// Handles keyboard & gamepad
// input
class InputManager {

    // State arrays
    private keyStates : Array<State>;

    private prevent : any;
    private anyPressed : boolean;


    constructor() {

        this.keyStates = new Array<State> ();

        this.prevent = new Array();
        this.anyPressed = false;

        // Set listeners
        window.addEventListener("keydown", 
            (e) => {

                if (this.keyPressed(e.keyCode))
                    e.preventDefault();
            });
        window.addEventListener("keyup", 
            (e) => {

                if (this.keyReleased(e.keyCode))
                    e.preventDefault();
            });   
    
        // To get focus only
        window.addEventListener("mousemove", (e) => {

            window.focus();
        });
        window.addEventListener("mousedown", (e) => {

            window.focus();
        });
        // Disable context menu
        window.addEventListener("contextmenu", (e) => {

            e.preventDefault();
        });
    }


    // Called when a key pressed
    private keyPressed(key : number) {

        if (this.keyStates[key] != State.Down) {

            this.anyPressed = true;
            this.keyStates[key] = State.Pressed;
        }
            
        return this.prevent[key];
    }


    // Called when a key released
    private keyReleased(key : number) {

        if (this.keyStates[key] != State.Up)
            this.keyStates[key] = State.Released;

        return this.prevent[key];
    }


    // Update input states
    public updateStates() {

        for (let k in this.keyStates) {

            if (this.keyStates[k] == State.Pressed)
                this.keyStates[k] = State.Down;

            else if(this.keyStates[k] == State.Released) 
                this.keyStates[k] = State.Up;
        }
        this.anyPressed = false;
    }


    // Getters
    public isAnyPressed = () => this.anyPressed;
    public getKeyState = (key : number) => 
        this.keyStates[key] | State.Up;

}
