const ADJS = ["null", "void", "ghost", "rogue", "static", "broken", "cursed", "silent", "neon", "iron", "dead", "lost", "glitch", "severed", "phantom"];
const NOUNS = ["fang", "signal", "breach", "cipher", "spike", "wraith", "daemon", "proxy", "zero", "pulse", "root", "eye", "fragment", "echo", "shard"];
const RARITIES = [
  { name: "COMMON", traits: 2, w: 55, bg: "#111c14", text: "#7acc88", border: "#2a4a2e", pill: "#1a3a1e", pillText: "#55aa66", width: 240 },
  { name: "RARE", traits: 4, w: 28, bg: "#0f0f22", text: "#7799ff", border: "#1a1a44", pill: "#14144a", pillText: "#5577ff", width: 280 },
  { name: "LEGENDARY", traits: 6, w: 14, bg: "#1a1200", text: "#ffcc44", border: "#3a2800", pill: "#2a1e00", pillText: "#ffaa00", width: 320 },
  { name: "MYTHIC", traits: 8, w: 3, bg: "#130013", text: "#ff66ff", border: "#330033", pill: "#220022", pillText: "#ee44ee", width: 360 },
];
const TRAIT_KEYS = ["slider", "toggle", "knobs", "xypad", "leds", "colorpicker", "morse", "seq"];
const RARITY_ORDER = { slider: 0, toggle: 0, leds: 0, knobs: 1, xypad: 1, colorpicker: 2, morse: 2, seq: 3 };

let ac = "#22cc66";
let serial = 0;
let currentTraits = [];
const knobAngles = {};
const knobDragState = {};
let morseBuffer = "";
let morseTimer = null;
let morseDown = 0;

function rnd() {
  return Math.random();
}

function pick(items) {
  return items[Math.floor(rnd() * items.length)];
}

function rollRarity() {
  let total = 0;
  const target = rnd() * 100;
  for (const rarity of RARITIES) {
    total += rarity.w;
    if (target < total) return rarity;
  }
  return RARITIES[0];
}

function hslHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function create(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function setStyles(el, styles) {
  Object.entries(styles).forEach(([key, value]) => {
    el.style[key] = value;
  });
  return el;
}

function append(parent, ...children) {
  children.forEach((child) => parent.appendChild(child));
  return parent;
}

function createDivider(color) {
  return setStyles(create("div", "b-divider"), { background: color });
}

function setAc(color) {
  ac = color;
  document.documentElement.style.setProperty("--ac", color);
  document.querySelectorAll(".sl").forEach((slider) => {
    slider.style.accentColor = color;
  });
  document.querySelectorAll(".tg-track.on").forEach((track) => {
    track.style.background = color;
  });
  const preview = document.getElementById("cprev");
  if (preview) preview.style.background = color;
  const hex = document.getElementById("chex");
  if (hex) hex.textContent = color;
  const dot = document.getElementById("xydot");
  if (dot) dot.style.background = color;
  document.querySelectorAll(".sq-btn[data-on='true']").forEach((button) => {
    button.style.background = color;
  });
}

function buildSlider() {
  const value = Math.round(rnd() * 100);
  const label = pick(["FREQ", "GAIN", "BIAS", "RATE", "DIST", "MIX", "MOD"]);
  const row = create("div", "toy-row");
  const labelEl = create("span", "lbl", label);
  const slider = create("input", "sl");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.step = "1";
  slider.value = String(value);
  slider.dataset.lbl = label;
  const valueEl = create("span", "sl-val", String(value));
  valueEl.id = `sv_${label}`;
  append(row, labelEl, slider, valueEl);
  return row;
}

function buildToggle() {
  const on = rnd() > 0.5;
  const label = pick(["PULSE", "SYNC", "LOCK", "ECHO", "LOOP", "GATE"]);
  const row = create("div", "toy-row");
  const wrap = create("div", "tg-wrap");
  wrap.dataset.id = `tg_${label}`;
  const track = create("div", `tg-track${on ? " on" : ""}`);
  track.id = `tg_${label}`;
  if (on) track.style.background = ac;
  const thumb = create("div", "tg-thumb");
  track.appendChild(thumb);
  const labelEl = create("span", "tg-lbl", label);
  const valueEl = create("span", "tg-val", on ? "ON" : "OFF");
  valueEl.id = `tv_${label}`;
  append(wrap, track, labelEl, valueEl);
  row.appendChild(wrap);
  return row;
}

function buildKnobs() {
  const defs = [["VOL", rnd()], ["TONE", rnd()], ["RATE", rnd()]];
  const count = 2 + Math.round(rnd());
  const row = setStyles(create("div", "toy-row"), { justifyContent: "space-around" });

  defs.slice(0, count).forEach(([label, value]) => {
    const angle = Math.round((value * 270 - 135) * 10) / 10;
    const pct = Math.round(((angle + 135) / 270) * 100);
    const wrap = create("div", "knob-wrap");
    wrap.dataset.angle = String(angle);
    const knob = setStyles(create("div", "knob"), { width: "32px", height: "32px" });
    knob.id = `kn_${label}`;
    const knobLabel = create("span", "knob-lbl", label);
    const valueEl = create("span", "knob-val", `${pct}%`);
    valueEl.id = `kv_${label}`;
    append(wrap, knob, knobLabel, valueEl);
    row.appendChild(wrap);
  });

  return row;
}

function buildLeds() {
  const count = 2 + Math.floor(rnd() * 5);
  const colors = ["#ff2222", "#22ff66", "#ffdd00", "#00ccff", "#ff44ff", "#ff8800", "#44ffff"];
  const row = create("div", "led-row");

  for (let i = 0; i < count; i += 1) {
    const on = rnd() > 0.4;
    const color = colors[i % colors.length];
    const led = setStyles(create("div", "led"), {
      width: "12px",
      height: "12px",
      background: on ? color : "#222",
      opacity: on ? "1" : "0.4",
    });
    led.id = `led_${i}`;
    led.dataset.color = color;
    led.dataset.on = String(on);
    row.appendChild(led);
  }

  return row;
}

function buildColorPicker() {
  const hue = Math.floor(rnd() * 360);
  const hex = hslHex(hue, 65, 55);
  const row = setStyles(create("div", "toy-row"), { justifyContent: "center", gap: "12px" });
  const canvas = setStyles(create("canvas"), { borderRadius: "50%", cursor: "crosshair", flexShrink: "0" });
  canvas.id = "cwheel";
  canvas.width = 56;
  canvas.height = 56;

  const previewWrap = setStyles(create("div"), { display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" });
  const preview = setStyles(create("div"), {
    width: "36px",
    height: "36px",
    borderRadius: "6px",
    border: "1px solid #ffffff22",
    background: hex,
  });
  preview.id = "cprev";
  const hexEl = setStyles(create("span"), { fontFamily: "monospace", fontSize: "10px", opacity: ".4" });
  hexEl.id = "chex";
  hexEl.textContent = hex;
  append(previewWrap, preview, hexEl);
  append(row, canvas, previewWrap);
  return row;
}

function buildXY() {
  const x = Math.round(rnd() * 52 + 10);
  const y = Math.round(rnd() * 52 + 10);
  const row = setStyles(create("div", "toy-row"), { justifyContent: "center", gap: "10px" });
  const pad = setStyles(create("div"), { width: "72px", height: "72px" });
  pad.id = "xypad";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("style", "position:absolute;inset:0;width:100%;height:100%;pointer-events:none");
  const lineA = document.createElementNS("http://www.w3.org/2000/svg", "line");
  lineA.setAttribute("x1", "36");
  lineA.setAttribute("y1", "0");
  lineA.setAttribute("x2", "36");
  lineA.setAttribute("y2", "72");
  lineA.setAttribute("stroke", "#ffffff18");
  lineA.setAttribute("stroke-width", "1");
  const lineB = document.createElementNS("http://www.w3.org/2000/svg", "line");
  lineB.setAttribute("x1", "0");
  lineB.setAttribute("y1", "36");
  lineB.setAttribute("x2", "72");
  lineB.setAttribute("y2", "36");
  lineB.setAttribute("stroke", "#ffffff18");
  lineB.setAttribute("stroke-width", "1");
  append(svg, lineA, lineB);
  const dot = setStyles(create("div"), { left: `${x}px`, top: `${y}px`, background: ac });
  dot.id = "xydot";
  const values = create("div", "xy-vals");
  const xEl = create("span", "", `X: ${Math.round((x / 72) * 100)}`);
  xEl.id = "xy-x";
  const yEl = create("span", "", `Y: ${Math.round((y / 72) * 100)}`);
  yEl.id = "xy-y";
  append(values, xEl, yEl);
  append(pad, svg, dot);
  append(row, pad, values);
  return row;
}

function buildMorse() {
  const row = setStyles(create("div", "toy-row"), { justifyContent: "center", gap: "10px" });
  const button = create("button", "morse-btn", "KEY");
  button.id = "morsekey";
  const output = create("span");
  output.id = "morse-out";
  append(row, button, output);
  return row;
}

function buildSeq() {
  const row = create("div", "seq-wrap");
  for (let i = 0; i < 8; i += 1) {
    const on = rnd() > 0.5;
    const button = setStyles(create("div", "sq-btn"), {
      width: "26px",
      height: "26px",
      background: on ? ac : "#222",
    });
    button.id = `sq_${i}`;
    button.dataset.on = String(on);
    row.appendChild(button);
  }
  return row;
}

const BUILDERS = {
  slider: buildSlider,
  toggle: buildToggle,
  knobs: buildKnobs,
  xypad: buildXY,
  leds: buildLeds,
  colorpicker: buildColorPicker,
  morse: buildMorse,
  seq: buildSeq,
};

function newBadge() {
  const rarity = rollRarity();
  serial += 1;
  const name = `${pick(ADJS)}_${pick(NOUNS)}`.toUpperCase();
  const hue = Math.floor(rnd() * 360);
  ac = hslHex(hue, 65, 55);
  document.documentElement.style.setProperty("--ac", ac);
  currentTraits = [...TRAIT_KEYS].sort((a, b) => RARITY_ORDER[a] - RARITY_ORDER[b]).slice(0, rarity.traits);

  const badge = document.getElementById("badge");
  if (!badge) return;

  badge.replaceChildren();
  badge.style.width = `${rarity.width}px`;
  badge.style.background = rarity.bg;
  badge.style.color = rarity.text;
  badge.style.border = `1.5px solid ${rarity.border}`;

  const pill = setStyles(create("span", "pill", rarity.name), {
    background: rarity.pill,
    color: rarity.pillText,
  });
  const title = create("div", "b-title", name);
  const serialEl = create("div", "b-serial", `#${String(serial).padStart(4, "0")} · FARTCON 2025`);

  append(badge, pill, title, serialEl, createDivider(rarity.text));
  currentTraits.forEach((key) => {
    badge.appendChild(BUILDERS[key]());
  });
  badge.appendChild(createDivider(rarity.text));

  setAc(ac);
  initSliders();
  initToggles();
  initKnobs();
  initXY();
  initLeds();
  initColorPicker();
  initMorse();
  initSeq();
}

function initSliders() {
  document.querySelectorAll(".sl").forEach((slider) => {
    slider.style.accentColor = ac;
    slider.addEventListener("input", (event) => {
      const label = event.currentTarget.dataset.lbl;
      const valueEl = document.getElementById(`sv_${label}`);
      if (valueEl) valueEl.textContent = event.currentTarget.value;
    });
  });
}

function initToggles() {
  document.querySelectorAll(".tg-wrap").forEach((wrap) => {
    wrap.addEventListener("click", () => {
      const id = wrap.dataset.id;
      const track = document.getElementById(id);
      const valueEl = document.getElementById(`tv_${id.replace("tg_", "")}`);
      if (!track) return;
      const on = !track.classList.contains("on");
      track.classList.toggle("on", on);
      track.style.background = on ? ac : "";
      if (valueEl) valueEl.textContent = on ? "ON" : "OFF";
    });
  });
}

function drawKnob(knob, angle) {
  const xCenter = 16;
  const yCenter = 16;
  const radius = 14;
  const rad = ((angle - 90) * Math.PI) / 180;
  const x = xCenter + Math.cos(rad) * (radius - 4);
  const y = yCenter + Math.sin(rad) * (radius - 4);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "32");
  svg.setAttribute("height", "32");

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "16");
  circle.setAttribute("cy", "16");
  circle.setAttribute("r", "13");
  circle.setAttribute("fill", "#1a1a1a");
  circle.setAttribute("stroke", "#333");
  circle.setAttribute("stroke-width", "2");
  svg.appendChild(circle);

  for (let i = 0; i < 11; i += 1) {
    const tickAngle = ((-135 + i * 27) * Math.PI) / 180;
    const x1 = 16 + Math.cos(tickAngle) * 11;
    const y1 = 16 + Math.sin(tickAngle) * 11;
    const x2 = 16 + Math.cos(tickAngle) * 14;
    const y2 = 16 + Math.sin(tickAngle) * 14;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1.toFixed(1));
    line.setAttribute("y1", y1.toFixed(1));
    line.setAttribute("x2", x2.toFixed(1));
    line.setAttribute("y2", y2.toFixed(1));
    line.setAttribute("stroke", "#ffffff33");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
  }

  const pointer = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  pointer.setAttribute("cx", x.toFixed(1));
  pointer.setAttribute("cy", y.toFixed(1));
  pointer.setAttribute("r", "2.5");
  pointer.setAttribute("fill", "#fff");
  svg.appendChild(pointer);

  knob.replaceChildren(svg);
}

function moveKnob(id, knob, delta, startAngle) {
  knobAngles[id] = Math.max(-135, Math.min(135, startAngle + delta * 1.8));
  drawKnob(knob, knobAngles[id]);
  const pct = Math.round(((knobAngles[id] + 135) / 270) * 100);
  const label = id.replace("kn_", "");
  const valueEl = document.getElementById(`kv_${label}`);
  if (valueEl) valueEl.textContent = `${pct}%`;
}

function initKnobs() {
  document.querySelectorAll(".knob-wrap").forEach((wrap) => {
    const knob = wrap.querySelector(".knob");
    if (!knob) return;

    const id = knob.id;
    const angle = parseFloat(wrap.dataset.angle || "0");
    knobAngles[id] = angle;
    drawKnob(knob, angle);

    const startDrag = (clientY) => {
      knobDragState[id] = { startY: clientY, startAngle: knobAngles[id] };

      const move = (event) => {
        const pointerY = event.touches ? event.touches[0].clientY : event.clientY;
        moveKnob(id, knob, knobDragState[id].startY - pointerY, knobDragState[id].startAngle);
      };

      const stop = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("mouseup", stop);
        window.removeEventListener("touchend", stop);
      };

      window.addEventListener("mousemove", move);
      window.addEventListener("touchmove", move, { passive: true });
      window.addEventListener("mouseup", stop, { once: true });
      window.addEventListener("touchend", stop, { once: true });
    };

    knob.addEventListener("mousedown", (event) => {
      event.preventDefault();
      startDrag(event.clientY);
    });

    knob.addEventListener("touchstart", (event) => {
      event.preventDefault();
      startDrag(event.touches[0].clientY);
    }, { passive: false });
  });
}

function initXY() {
  const pad = document.getElementById("xypad");
  const dot = document.getElementById("xydot");
  if (!pad || !dot) return;

  const move = (clientX, clientY) => {
    const rect = pad.getBoundingClientRect();
    const x = Math.max(0, Math.min(72, ((clientX - rect.left) * 72) / rect.width));
    const y = Math.max(0, Math.min(72, ((clientY - rect.top) * 72) / rect.height));
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    const xEl = document.getElementById("xy-x");
    const yEl = document.getElementById("xy-y");
    if (xEl) xEl.textContent = `X: ${Math.round((x / 72) * 100)}`;
    if (yEl) yEl.textContent = `Y: ${Math.round((y / 72) * 100)}`;
  };

  const start = (clientX, clientY) => {
    move(clientX, clientY);
    const moveHandler = (event) => {
      if (event.touches) move(event.touches[0].clientX, event.touches[0].clientY);
      else move(event.clientX, event.clientY);
    };
    const stopHandler = () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("touchmove", moveHandler);
      window.removeEventListener("mouseup", stopHandler);
      window.removeEventListener("touchend", stopHandler);
    };
    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("touchmove", moveHandler, { passive: true });
    window.addEventListener("mouseup", stopHandler, { once: true });
    window.addEventListener("touchend", stopHandler, { once: true });
  };

  pad.addEventListener("mousedown", (event) => start(event.clientX, event.clientY));
  pad.addEventListener("touchstart", (event) => {
    event.preventDefault();
    start(event.touches[0].clientX, event.touches[0].clientY);
  }, { passive: false });
}

function initLeds() {
  document.querySelectorAll(".led").forEach((led) => {
    led.addEventListener("click", () => {
      const on = led.dataset.on === "true";
      led.dataset.on = String(!on);
      led.style.background = !on ? led.dataset.color : "#222";
      led.style.opacity = !on ? "1" : "0.4";
    });
  });
}

function initColorPicker() {
  const wheel = document.getElementById("cwheel");
  if (!wheel) return;
  const ctx = wheel.getContext("2d");
  if (!ctx) return;

  const draw = (selectedHue) => {
    ctx.clearRect(0, 0, 56, 56);
    for (let angle = 0; angle < 360; angle += 1) {
      ctx.beginPath();
      ctx.moveTo(28, 28);
      ctx.arc(28, 28, 26, (angle * Math.PI) / 180, ((angle + 2) * Math.PI) / 180);
      ctx.fillStyle = `hsl(${angle},65%,55%)`;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(28, 28, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();

    if (selectedHue !== null) {
      const markerAngle = (selectedHue * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(28 + Math.cos(markerAngle) * 18, 28 + Math.sin(markerAngle) * 18, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
  };

  draw(0);
  wheel.addEventListener("click", (event) => {
    const rect = wheel.getBoundingClientRect();
    const x = ((event.clientX - rect.left) * 56) / rect.width - 28;
    const y = ((event.clientY - rect.top) * 56) / rect.height - 28;
    if (Math.hypot(x, y) < 10) return;
    const hue = Math.round((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    const hex = hslHex(hue, 65, 55);
    setAc(hex);
    draw(hue);
  });
}

function initMorse() {
  const button = document.getElementById("morsekey");
  const output = document.getElementById("morse-out");
  if (!button || !output) return;

  const decode = {
    ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "..-.": "F", "--.": "G", "....": "H",
    "..": "I", ".---": "J", "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O", ".--.": "P",
    "--.-": "Q", ".-.": "R", "...": "S", "-": "T", "..-": "U", "...-": "V", ".--": "W", "-..-": "X",
    "-.--": "Y", "--..": "Z", "-----": "0", ".----": "1", "..---": "2", "...--": "3", "....-": "4",
    ".....": "5", "-....": "6", "--...": "7", "---..": "8", "----.": "9",
  };

  const release = () => {
    if (!morseDown) return;
    const duration = Date.now() - morseDown;
    morseDown = 0;
    morseBuffer += duration < 200 ? "." : "-";
    output.textContent = morseBuffer;
    clearTimeout(morseTimer);
    morseTimer = setTimeout(() => {
      const decoded = decode[morseBuffer] || "?";
      output.textContent = `${morseBuffer} ${decoded}`;
      morseBuffer = "";
      window.setTimeout(() => {
        output.textContent = "";
      }, 2000);
    }, 600);
  };

  button.addEventListener("mousedown", (event) => {
    morseDown = Date.now();
    event.preventDefault();
  });
  button.addEventListener("touchstart", (event) => {
    morseDown = Date.now();
    event.preventDefault();
  }, { passive: false });
  button.addEventListener("mouseup", release);
  button.addEventListener("touchend", release);
}

function initSeq() {
  document.querySelectorAll(".sq-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const on = button.dataset.on === "true";
      button.dataset.on = String(!on);
      button.style.background = !on ? ac : "#222";
    });
  });
}

window.newBadge = newBadge;
newBadge();
