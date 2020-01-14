/**
 * Operating Fungus Remix
 * (c) 2020 Jani Nykänen
 */


window.onload = () => {
    
    (new Core(
        (new Config()).push("canvas_width", "256")
                      .push("canvas_height", "192") 
                      .push("framerate", "60")
                      .push("asset_path", "assets/assets.json"),
        (new Controller()).addButton("fire1", "KeyZ", 0)
                          .addButton("fire2", "KeyX", 1)
                          .addButton("fire3", "KeyC", 3)
                          .addButton("start", "Enter", 9, 7)
                          .addButton("back", "Escape", 8, 6)
    )).run(new GameScene())
}
