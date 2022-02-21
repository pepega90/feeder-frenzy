import kaboom from "kaboom";

kaboom({
  background: [0, 0, 0],
});

// load sprite
loadSprite("bg", "PlayLv1Bg.png");
loadSprite("crab", "crab.png");
loadSprite("bubble", "bubbleBig.png");
loadSprite("ikan1", "fish1.png");
loadSprite("ikan2", "fish2.png");
loadSprite("ikan3", "fish4.png");
loadSprite("player", "spritesheet.png", {
  sliceX: 3,
  anims: {
    right: {
      from: 0,
      to: 0,
    },
    left: {
      from: 2,
      to: 2,
    },
  },
});

loadSprite("fish1", "ui_fish1.png");
loadSprite("fish2", "ui_fish2.png");
loadSprite("fish3", "ui_fish4.png");
let eatSfx = new Audio("eating.wav");
let lose = new Audio("loose.mp3");
let menang = new Audio("fanfare.wav");
/*
    TODO
    - bikin score
*/

// game variable
// enum Grow {
//   SMALL = 1,
//   MEDIUM,
//   BIG,
// }

let grow = ["small", "medium", "big"];

let currentGrow = grow[0];
let listIkan = ["fish1", "fish2", "fish3"];
let bar1 = {
  width: 0,
  height: 20,
};

let bar2 = {
  width: 0,
  height: 20,
};

let bar3 = {
  width: 0,
  height: 20,
};

let score = 0;

scene("menu", () => {
  cursor("default");
  add([sprite("bg", { width: window.innerWidth, height: window.innerHeight })]);
  onDraw(() => {
    drawText({
      text: "Feeder Frenzy",
      pos: vec2(width() / 2, 80),
      origin: "center",
      color: YELLOW,
    });

    drawSprite({
      sprite: "player",
      pos: vec2(center()),
      origin: "center",
    });

    drawText({
      text: 'Tekan "SPACE" untuk play!',
      pos: vec2(width() / 2, height() / 2 + 150),
      origin: "center",
      size: 40,
    });

    drawText({
      text: "created by Aji Mustofa @pepega90",
      pos: vec2(10, height() - 30),
      size: 25,
      color: YELLOW,
    });
  });

  onKeyPress("space", () => {
    go("play");
  });
});

scene("play", () => {
  cursor("none");
  // add background
  add([sprite("bg", { width: window.innerWidth, height: window.innerHeight })]);

  let player = add([
    sprite("player", { anim: "right" }),
    pos(100, 100),
    scale(0.4),
    area(),
    rotate(0),
    origin("center"),
    {
      acc: vec2(),
      vel: vec2(),
    },
  ]);

  onUpdate(() => {
    let dx = mousePos().x - player.pos.x;
    let dy = mousePos().y - player.pos.y;
    let angle = Math.atan2(dy, dx);
    let fX = Math.cos(angle) * 20;
    let fY = Math.sin(angle) * 20;
    let distance = player.pos.dist(mousePos());

    if (distance > 100) {
      player.vel.x = fX;
      player.vel.y = fY;
    }

    if (fX > 0) player.play("right");
    if (fX < 0) player.play("left");

    player.acc.x = -player.vel.x * 0.2;
    player.acc.y = -player.vel.y * 0.2;

    player.vel = player.vel.add(player.acc);
    player.pos = player.pos.add(player.vel);
  });

  //   random ikan
  function spawnRandomIkan1() {
    let dir = choose([-47, width()]);
    let musuh = add([
      sprite("ikan1"),
      pos(dir, Math.floor(rand(0, height() - 81))),
      move(dir < 0 ? RIGHT : LEFT, 200),
      area(),
      cleanup(),
      "musuh",
    ]);

    musuh.flipX(dir < 0 ? false : true);

    wait(1.5, () => {
      spawnRandomIkan1();
    });
  }

  function spawnRandomIkan2() {
    let dir = choose([-99, width()]);
    let musuh2 = add([
      sprite("ikan2"),
      pos(dir, Math.floor(rand(0, height() - 84))),
      move(dir < 0 ? RIGHT : LEFT, 200),
      area(),
      cleanup(),
      "musuh2",
    ]);

    musuh2.flipX(dir < 0 ? false : true);

    wait(3, () => {
      spawnRandomIkan2();
    });
  }

  function spawnRandomIkan3() {
    let dir = choose([-222, width()]);
    let musuh3 = add([
      sprite("ikan3"),
      pos(dir, Math.floor(rand(0, height() - 190))),
      move(dir < 0 ? RIGHT : LEFT, 200),
      area({ height: 95, offset: vec2(10, 50) }),
      cleanup(),
      "musuh3",
    ]);

    musuh3.flipX(dir < 0 ? false : true);

    wait(5, () => {
      spawnRandomIkan3();
    });
  }

  spawnRandomIkan1();
  spawnRandomIkan2();
  spawnRandomIkan3();

  //   random bubble
  function spawnRandomBubble() {
    add([
      sprite("bubble"),
      pos(Math.floor(rand(0, width())), height()),
      scale(0.2),
      move(UP, 200),
    ]);

    wait(1, () => {
      spawnRandomBubble();
    });
  }

  spawnRandomBubble();

  function spawnCrab() {
    add([
      sprite("crab"),
      pos(width(), 530),
      move(LEFT, 200),
      area(),
      cleanup(),
    ]);

    wait((5, 10), () => {
      spawnCrab();
    });
  }

  spawnCrab();

  // player collision dengan ikan
  player.onCollide("musuh", (m) => {
    eatSfx.play();
    score += 2;
    destroy(m);
    if (bar1.width < 100) bar1.width += 10;
    if (bar1.width == 100 && currentGrow == grow[0]) {
      player.scaleTo(1);
      currentGrow = grow[1];
    }
  });

  player.onCollide("musuh2", (m) => {
    eatSfx.play();
    if (currentGrow == grow[1] || currentGrow == grow[2]) {
      score += 4;
      destroy(m);
    } else {
      go("game_over");
    }
    if (bar2.width < 100 && bar1.width === 100) {
      bar2.width += 10;
    }
    if (bar2.width == 100 && currentGrow == grow[1]) {
      player.scaleTo(2);
      currentGrow = grow[2];
    }
  });

  player.onCollide("musuh3", (m) => {
    eatSfx.play();
    if (currentGrow == grow[2]) {
      score += 6;
      destroy(m);
    } else {
      go("game_over");
    }

    if (bar3.width < 100 && bar2.width == 100) bar3.width += 10;
  });

  let win = false;

  onDraw(() => {
    if (bar3.width == 100) win = true;

    if (win) {
      menang.play();
      drawText({
        text: "Selamat! Kamu sekarang adalah penguasa lautan!",
        pos: vec2(center()),
        size: 40,
        origin: "center",
      });

      drawText({
        text: 'Tekan "R" untuk restart',
        pos: vec2(width() / 2, height() / 2 + 150),
        origin: "center",
        size: 30,
      });

      onKeyPress("r", () => {
        score = 0;
        bar1.width = 0;
        bar2.width = 0;
        bar3.width = 0;
        win = false;
        currentGrow = grow[0];
        go("play");
      });
    }

    drawText({
      text: "Menu",
      pos: vec2(20),
      size: 25,
    });
    drawText({
      text: "Growth",
      pos: vec2(20, 80),
      size: 25,
    });
    // bar ikan 1

    drawRect({
      width: 100,
      height: 20,
      pos: vec2(120, 80),
    });

    drawRect({
      width: bar1.width,
      height: bar1.height,
      pos: vec2(120, 80),
      color: GREEN,
    });

    // bar ikan 2
    drawRect({
      width: 100,
      height: 20,
      pos: vec2(250, 80),
    });

    drawRect({
      width: bar2.width,
      height: bar2.height,
      pos: vec2(250, 80),
      color: GREEN,
    });

    // bar ikan 3
    drawRect({
      width: 100,
      height: 20,
      pos: vec2(400, 80),
    });

    drawRect({
      width: bar3.width,
      height: bar3.height,
      pos: vec2(400, 80),
      color: GREEN,
    });

    for (let i = 0; i < listIkan.length; i++) {
      drawSprite({
        sprite: listIkan[i],
        pos: vec2(i * 160 + 150, 30),
        scale: 0.6,
        origin: "center",
      });
    }

    drawText({
      text: "Score: " + score,
      pos: vec2(width() - 160, 50),
      origin: "center",
      size: 50,
    });
  });
});

scene("game_over", () => {
  lose.play();
  cursor("default");
  // add background
  add([sprite("bg", { width: window.innerWidth, height: window.innerHeight })]);
  onDraw(() => {
    drawText({
      text: "Permainan Berakhir",
      pos: vec2(width() / 2, height() / 4),
      origin: "center",
      color: RED,
    });

    drawText({
      text: "Score Kamu: " + score,
      pos: vec2(width() / 2, height() / 2),
      origin: "center",
      size: 40,
    });

    drawText({
      text: 'Tekan "R" untuk restart',
      pos: vec2(width() / 2, height() / 2 + 150),
      origin: "center",
      size: 40,
    });
  });

  onKeyPress("r", () => {
    currentGrow = grow[0];
    score = 0;
    bar1.width = 0;
    bar2.width = 0;
    bar3.width = 0;
    go("play");
  });
});

go("menu");
