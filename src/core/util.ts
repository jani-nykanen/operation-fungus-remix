/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


// Negative modulus
function negMod(m : number, n : number) {

    if(m < 0) {

        return n - (-m % n);
    }
    return m % n;
}


// Clamp a number to the range [min, max]
function clamp(x : number, min : number, max : number) {

    return Math.max(min, Math.min(x, max));
}


// A helper function that updates a 
// "speed axis", like actual speed or
// angle speed
function updateSpeedAxis(speed : number, target : number, d : number) {

    if (speed < target) {

         speed = Math.min(speed + d, target);
    }
    else if (speed > target) {

        speed = Math.max(speed - d, target);
    }
    return speed;
}


// Convert RGBA values to a string that is 
// understood by Html5
function getColorString(r : number, g : number, b : number, a : number) {

    if (r == null) r = 255;
    if (g == null) g = r;
    if (b == null) b = g;

    if (a == null) 
        a = 1.0;
    
    return "rgba("
        + String(r | 0) + ","
        + String(g | 0) + ","
        + String(b | 0) + ","
         + String(a) + ")";
}



// A key-value pair (strings)
class KeyValuePair<T> {

    public value : T
    public key : string

    constructor(key : string, value : T) {

        this.key = key;
        this.value = value;
    }
}
