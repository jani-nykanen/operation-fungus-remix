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
    private keyStates : any;
    private prevent : any;
    private anyPressed : boolean;

    private gamepad : GamePad;


    constructor() {

        this.keyStates = new Array();
        this.prevent = new Array();
        this.anyPressed = false;

        // Set listeners
        window.addEventListener("keydown", 
            (e) => {

                if (this.keyPressed(e.code)) 
                    e.preventDefault();
            });
        window.addEventListener("keyup", 
            (e) => {

                if (this.keyReleased(e.code))
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

        // Create a gamepad listener
        this.gamepad = new GamePad();
    }


    // Called when a key pressed
    private keyPressed(key : string) {

        if (this.keyStates[key] != State.Down) {

            this.anyPressed = true;
            this.keyStates[key] = State.Pressed;
        }
            
        return this.prevent[key];
    }


    // Called when a key released
    private keyReleased(key : string) {

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

        // Update gamepad
        this.gamepad.update();
    }


    // Prevent a key
    public preventDefault(key : string) {

        this.prevent[key] = true;
    }


    // Getters
    public isAnyPressed = () => this.anyPressed;
    public getKeyState = (key : string) => 
        this.keyStates[key] | State.Up;
    public getButtonState = (button : number) => {

        return this.gamepad.getButtonState(button);
    }
    public getGamepadStick = () => this.gamepad.getStick();
}
