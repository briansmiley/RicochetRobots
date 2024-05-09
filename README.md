# Ricochet Robots

My [p5.js](https://p5js.org/) implementation of the out-of-print, surprisingly fun mental-shape-translation game [Ricochet Robots](https://en.wikipedia.org/wiki/Ricochet_Robots)

Try out the latest version on [my site](https://briansmiley.github.io/p5/ricochetrobots/) or fiddle with the code\* in in the [p5 Editor](https://editor.p5js.org/briansmiley/sketches/LJjfo8k1P)

## **Instructions**

- Reach the target shape with the matching color robot in as few moves as possible (the rainbow shape can be reached by any color)

- For multiplayer, players find solutions in their heads without moving robots on screen. Once a player finds a solution path, they announce the number of moves it contains and start the timer. For up to one minute, other players can propose faster solutions. Once time is up, demonstrate the fastest valid solution on screen and collect the point for the appropriate player

### Controls

- Click or press `r` `g` `b` and `y` to select the red/green/blue/yellow robot

- `w` `a` `s` `d` or `↑` `←` `↓` `→` to move

- Robots move until they hit a wall or another robot

- `Backspace` undoes move recent move, `Spacebar` resets the current solution attempt, moving robots back to their marked starting positions

- Clicking center shape resets the turn and selects a new token (e.g. if the current target is trivial or too challenging to reach)

- Full original game instructions available [here](https://images-cdn.zmangames.com/us-east-1/filer_public/c0/b4/c0b482f1-ad3e-4e5d-ae48-0c11aa7c317a/en-ricochet_robot-rules.pdf)

- Board is shuffled on each page load!

<span style="font-size:.75em;">\*as of 05/04/24</span>

![App screenshot](./images/gameplay.png)
_App screenshot_

![Box art](./images/ricochet_robots_box.png)
_Original box art_

![Board game image](./images/ricochet_robots_real.jpeg)
_Physical game_
