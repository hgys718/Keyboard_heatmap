let keyData = [];
let keyMap = {};
let layout = [
  ['Esc', '', '', '', '', '', '', '', '', '', '', '', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', 'Shift'],
  ['', '', 'Ctrl', 'Cmd', 'Alt', 'Space', 'Alt', 'Cmd', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight']
];

let hoverInfo = null;
let osc, prevHover = null;
let showTop3 = false;
let top3Keys = [];

function preload() {
  keyData = loadJSON('keyboard_usage_day_night.json');
}

function setup() {
  let cnv = createCanvas(1100, 600);
  cnv.parent('p5-container');

  osc = new p5.Oscillator('sine');
  osc.amp(0);
  osc.start();

  textFont('Helvetica Neue');
  textAlign(CENTER, CENTER);
  noStroke();

  if (!Array.isArray(keyData)) {
    keyData = Object.values(keyData);
  }

  keyData.forEach(k => {
    keyMap[k.key.toUpperCase()] = k;
  });

  let toggleButton = createButton('Show Top 3 Keys');
  toggleButton.position(width - 170, 20);
  toggleButton.mousePressed(toggleTop3);
  toggleButton.id('top3-button');
}

function draw() {
  background(20);

  fill(200);
  textSize(24);
  text("Backlit Keyboard: Day vs Night", width / 2, 40);

  if (hoverInfo && hoverInfo.key !== prevHover) {
    let freq = map(hoverInfo.day + hoverInfo.night, 0, 1400, 200, 1000);
    osc.freq(freq);
    osc.amp(0.2, 0.1);
    prevHover = hoverInfo.key;
  } else if (!hoverInfo) {
    osc.amp(0, 0.2);
    prevHover = null;
  }

  let keyW = 60;
  let keyH = 50;
  let gap = 8;
  let maxCols = 13;
  let keyboardWidth = maxCols * keyW + (maxCols - 1) * gap;
  let startX = (width - keyboardWidth) / 2;
  let startY = 100;

  hoverInfo = null;

  for (let row = 0; row < layout.length; row++) {
    let xOffset = 0;
    if (row === 1) xOffset = 40;
    if (row === 2) xOffset = 70;
    if (row === 3) xOffset = 100;

    for (let col = 0; col < layout[row].length; col++) {
      let key = layout[row][col];
      if (key === '') continue;

      if (showTop3 && !top3Keys.includes(key.toUpperCase())) {
        continue;
      }

      let x = startX + xOffset + col * (keyW + gap);
      let y = startY + row * (keyH + gap);

      let kData = keyMap[key.toUpperCase()];
      let day = kData?.day || 0;
      let night = kData?.night || 0;
      let total = day + night;

      let radius = map(total, 0, 1400, 20, keyH - 10);
      let d = dist(mouseX, mouseY, x + keyW / 2, y + keyH / 2);

      if (d < radius / 2) {
        hoverInfo = { key, day, night, x, y, w: keyW };
      }

      push();
      translate(x + keyW / 2, y + keyH / 2);

      if (day > night) {
        fill(255, 255, 255, 120); 
      } else {
        fill(100, 170, 255, 140); 
      }

      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = color(255, 255, 255, 100);

      ellipse(0, 0, radius);

      pop();

      fill(220);
      textSize(10);
      text(key, x + keyW / 2, y + keyH / 2);
    }
  }

  if (hoverInfo) {
    fill(0, 200);
    rect(hoverInfo.x - 50, hoverInfo.y - 65, 160, 50, 10);
    fill(255);
    textSize(12);
    text(
      `Key: ${hoverInfo.key}\nDay: ${hoverInfo.day}, Night: ${hoverInfo.night}`,
      hoverInfo.x + hoverInfo.w / 2,
      hoverInfo.y - 40
    );
  }
}

function toggleTop3() {
  showTop3 = !showTop3;

  if (showTop3) {
    let sorted = Object.values(keyMap).sort((a, b) => (b.day + b.night) - (a.day + a.night));
    top3Keys = sorted.slice(0, 3).map(k => k.key.toUpperCase());
    select('#top3-button').html('Show All Keys');
  } else {
    select('#top3-button').html('Show Top 3 Keys');
  }
}