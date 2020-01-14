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
        (new Controller()).addButton("fire1", 90, 0)
                          .addButton("fire2", 88, 1)
                          .addButton("fire3", 67, 3)
                          .addButton("start", 13, 9, 7)
                          .addButton("select", 16, 8, 6)
    )).run(new GameScene())
}
