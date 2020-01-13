/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


window.onload = () => {
    
    (new Core(
        (new Config()).push("canvas_width", "256")
                      .push("canvas_height", "192") 
                      .push("framerate", "60")
    )).run(new GameScene())
}
