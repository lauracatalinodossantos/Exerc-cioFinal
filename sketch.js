
// ================================================
// NEXUS: CHAOS ENGINE
// Generative interactive art
// JavaScript + p5.js
// ================================================

let particles = [];
let waves = [];

let totalParticles = 800;
let mode = 0;
let palette = 0;
let energy = 1;

let time = 0;
let shake = 0;
let autoWaves = 0;

let palettes = [
  [190, 205, 285, 325, 45],
  [175, 195, 220, 270, 310],
  [25, 45, 320, 345, 275],
  [110, 145, 185, 220, 300]
];

let modeNames = [
  "FLOW",
  "GRAVITY",
  "EXPLOSION",
  "VORTEX"
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100, 100);

  background(235, 60, 8);

  createParticles();
}

function createParticles() {

  particles = [];

  let maxRadius = max(width, height) * 0.65;

  for (let i = 0; i < totalParticles; i++) {

    let angle = random(TWO_PI);
    let radius = sqrt(random()) * maxRadius;

    let x = width / 2 + cos(angle) * radius;
    let y = height / 2 + sin(angle) * radius;

    particles.push({

      x: x,
      y: y,

      oldX: x,
      oldY: y,

      vx: random(-1, 1),
      vy: random(-1, 1),

      angle: angle,
      radius: radius,

      hue: random(5),
      size: random(1.5, 4.5),

      speed: random(0.5, 1.5)

    });
  }
}

// ================================================
// DRAW
// ================================================

function draw() {

  // Fundo com transparência para criar rastos

  background(235, 65, 7, 13);

  time += 0.008;

  if (shake > 0) {
    shake *= 0.92;
  }

  // Ondas automáticas

  autoWaves++;

  if (autoWaves > 180) {
    createWave(width / 2, height / 2);
    autoWaves = 0;
  }

  updateWaves();

  push();

  translate(
    random(-shake, shake),
    random(-shake, shake)
  );

  updateParticles();

  drawConnections();
  drawParticles();
  drawEnergyWaves();
  drawCore();
  drawAtmosphere();

  pop();

  drawInterface();

}

// ================================================
// PARTICLES
// ================================================

function updateParticles() {

  for (let p of particles) {

    p.oldX = p.x;
    p.oldY = p.y;

    // Campo de movimento orgânico

    let angle =
      sin(p.x * 0.002 + time) * 2 +
      cos(p.y * 0.002 - time) * 2;

    let forceX = cos(angle);
    let forceY = sin(angle);

    p.vx += forceX * 0.035 * p.speed;
    p.vy += forceY * 0.035 * p.speed;

    // Interação com o rato

    let dx = mouseX - p.x;
    let dy = mouseY - p.y;

    let distance = sqrt(dx * dx + dy * dy);

    if (
      mouseX > 0 && mouseX < width &&
      mouseY > 0 && mouseY < height &&
      distance < 280 && distance > 1
    ) {

      let intensity = (1 - distance / 280);

      let force = intensity * 0.16;

      if (mouseIsPressed) {
        force *= 3;
      }

      // FLOW

      if (mode === 0) {

        p.vx += -dy / distance * force;
        p.vy += dx / distance * force;

      }

      // GRAVITY

      else if (mode === 1) {

        p.vx += dx / distance * force;
        p.vy += dy / distance * force;

      }

      // EXPLOSION

      else if (mode === 2) {

        p.vx -= dx / distance * force * 3;
        p.vy -= dy / distance * force * 3;

      }

      // VORTEX

      else if (mode === 3) {

        p.vx += -dy / distance * force * 2;
        p.vy += dx / distance * force * 2;

      }

    }

    // Influência das ondas

    for (let w of waves) {

      let d = dist(p.x, p.y, w.x, w.y);

      let diferenca = abs(d - w.radius);

      if (diferenca < 35) {

        let intensidade = (1 - diferenca / 35) *
          w.power * 0.08;

        let nx = (p.x - w.x) / max(d, 1);
        let ny = (p.y - w.y) / max(d, 1);

        p.vx += nx * intensidade;
        p.vy += ny * intensidade;

      }

    }

    // Movimento natural

    p.vx *= 0.975;
    p.vy *= 0.975;

    p.x += p.vx;
    p.y += p.vy;

    // Reaparecer quando sai do ecrã

    if (p.x < -100) p.x = width + 100;
    if (p.x > width + 100) p.x = -100;

    if (p.y < -100) p.y = height + 100;
    if (p.y > height + 100) p.y = -100;

  }

}

// ================================================
// CONNECTIONS
// ================================================

function drawConnections() {

  let step = 3;

  for (let i = 0; i < particles.length; i += step) {

    let a = particles[i];

    // Ligações com partículas próximas na sequência

    for (let j = 1; j <= 3; j++) {

      let b = particles[
        (i + j * 7) % particles.length
      ];

      let d = dist(a.x, a.y, b.x, b.y);

      if (d < 75) {

        let hue = getHue(i);

        stroke(hue, 80, 100, map(d, 0, 75, 35, 0));

        strokeWeight(0.8);

        line(a.x, a.y, b.x, b.y);

      }

    }

  }

}

// ================================================
// PARTICLE RENDERING
// ================================================

function drawParticles() {

  noStroke();

  for (let i = 0; i < particles.length; i++) {

    let p = particles[i];

    let hue = getHue(i);

    let movement = dist(
      p.x, p.y,
      p.oldX, p.oldY
    );

    let brightness = constrain(
      70 + movement * 8,
      70, 100
    );

    // Aura exterior

    fill(hue, 85, 100, 12);

    circle(
      p.x,
      p.y,
      p.size * 7
    );

    // Brilho intermédio

    fill(hue, 65, 100, 35);

    circle(
      p.x,
      p.y,
      p.size * 3
    );

    // Núcleo

    fill(hue, 35, brightness, 100);

    circle(
      p.x,
      p.y,
      p.size
    );

  }

}

function getHue(i) {

  let colors = palettes[palette];

  let index = floor(i / 20) % colors.length;

  return (
    colors[index] +
    sin(time * 2 + i * 0.02) * 12 +
    360
  ) % 360;

}

// ================================================
// WAVES
// ================================================

function createWave(x, y) {

  waves.push({

    x: x,
    y: y,

    radius: 5,
    power: 1,

    hue: random(360)

  });

}

function updateWaves() {

  for (let w of waves) {

    w.radius += 4 * energy;
    w.power *= 0.985;

  }

  waves = waves.filter(w => w.radius < max(width, height) * 1.5);

}

function drawEnergyWaves() {

  noFill();

  for (let w of waves) {

    let hue = palettes[palette][
      floor(w.hue / 360 * palettes[palette].length) %
      palettes[palette].length
    ];

    stroke(hue, 80, 100, 45 * w.power);

    strokeWeight(2);

    circle(
      w.x,
      w.y,
      w.radius * 2
    );

    stroke(hue, 70, 100, 12 * w.power);

    strokeWeight(12);

    circle(
      w.x,
      w.y,
      w.radius * 2
    );

  }

}

// ================================================
// CENTRAL CORE
// ================================================

function drawCore() {

  push();

  translate(width / 2, height / 2);

  let pulse = sin(time * 4) * 12;

  // Grandes anéis

  noFill();

  for (let i = 0; i < 7; i++) {

    let radius = 35 + i * 23 + pulse;

    let hue = palettes[palette][i % 5];

    stroke(hue, 85, 100, 35 - i * 3);

    strokeWeight(1.5);

    ellipse(
      0,
      0,
      radius * 2,
      radius * 2
    );

  }

  // Geometria interior

  rotate(time * 2);

  for (let i = 0; i < 12; i++) {

    push();

    rotate(TWO_PI * i / 12);

    let hue = palettes[palette][i % 5];

    stroke(hue, 90, 100, 70);

    strokeWeight(2);

    line(0, 0, 0, -55 - pulse);

    fill(hue, 70, 100, 70);

    noStroke();

    circle(0, -55 - pulse, 5);

    pop();

  }

  // Centro luminoso

  noStroke();

  fill(palettes[palette][0], 65, 100, 20);
  circle(0, 0, 100 + pulse);

  fill(palettes[palette][1], 45, 100, 45);
  circle(0, 0, 40 + pulse * 0.4);

  fill(0, 0, 100, 100);
  circle(0, 0, 9);

  pop();

}

// ================================================
// ATMOSPHERE
// ================================================

function drawAtmosphere() {

  noFill();

  for (let i = 0; i < 4; i++) {

    let hue = palettes[palette][i];

    stroke(hue, 70, 100, 8);

    strokeWeight(2);

    let radius = 160 + i * 100 +
      sin(time * 3 + i) * 35;

    ellipse(
      width / 2,
      height / 2,
      radius * 2,
      radius * 2
    );

  }

}

// ================================================
// INTERFACE
// ================================================

function drawInterface() {

  push();

  colorMode(RGB, 255);

  noStroke();

  fill(255);

  textAlign(LEFT);

  textSize(25);

  textStyle(BOLD);

  text("NEXUS", 30, 42);

  fill(160, 180, 205);

  textSize(10);

  textStyle(NORMAL);

  text("CHAOS ENGINE / GENERATIVE SYSTEM", 30, 62);

  // Modo atual

  fill(255, 215, 140);

  textSize(12);

  textStyle(BOLD);

  text("MODE: " + modeNames[mode], 30, 105);

  fill(190, 200, 215);

  textSize(11);

  textStyle(NORMAL);

  text("1  FLOW", 30, 130);
  text("2  GRAVITY", 30, 150);
  text("3  EXPLOSION", 30, 170);
  text("4  VORTEX", 30, 190);

  text("SPACE  /  CHANGE COLORS", 30, 225);
  text("CLICK  /  ENERGY WAVE", 30, 245);
  text("R  /  RESTART", 30, 265);

  // Indicador

  textAlign(RIGHT);

  fill(170, 185, 205);

  textSize(10);

  text(
    "PARTICLES: " + particles.length,
    width - 30,
    42
  );

  text(
    "PALETTE: " + (palette + 1) + " / " + palettes.length,
    width - 30,
    62
  );

  // Rodapé

  textAlign(CENTER);

  fill(180, 195, 215);

  text(
    "MOVE / HOLD / CLICK TO DISTURB THE SYSTEM",
    width / 2,
    height - 24
  );

  // Cursor

  if (
    mouseX > 0 && mouseX < width &&
    mouseY > 0 && mouseY < height
  ) {

    noFill();

    stroke(255, 255, 255, 80);

    strokeWeight(1);

    circle(mouseX, mouseY, 45);

    noStroke();

    fill(255);

    circle(mouseX, mouseY, 3);

  }

  pop();

}

// ================================================
// INPUT / INTERACTION
// ================================================

function keyPressed() {

  if (key === "1") {
    mode = 0;
  }

  else if (key === "2") {
    mode = 1;
  }

  else if (key === "3") {
    mode = 2;
  }

  else if (key === "4") {
    mode = 3;
  }

  else if (key === " ") {

    palette = (palette + 1) % palettes.length;

  }

  else if (key === "r" || key === "R") {

    createParticles();
    waves = [];
    shake = 0;

  }

  return false;

}

function mousePressed() {

  createWave(mouseX, mouseY);

  shake = 7;

}

function doubleClicked() {

  energy = energy === 1 ? 2 : 1;

}

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

  createParticles();

}
