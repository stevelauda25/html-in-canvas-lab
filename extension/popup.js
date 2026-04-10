const PRESETS = {
  blur: {
    kind: "fragment",
    source: `precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uResolution;
// Jimenez 13-tap blur (COD: Advanced Warfare) — 2D footprint, no boxy artifacts.
// Increase 'radius' for stronger blur.
void main() {
  float radius = 4.0;
  vec2 t = radius / uResolution;
  vec4 A = texture2D(uTex, vUv + t * vec2(-1.0, -1.0));
  vec4 B = texture2D(uTex, vUv + t * vec2( 0.0, -1.0));
  vec4 C = texture2D(uTex, vUv + t * vec2( 1.0, -1.0));
  vec4 D = texture2D(uTex, vUv + t * vec2(-0.5, -0.5));
  vec4 E = texture2D(uTex, vUv + t * vec2( 0.5, -0.5));
  vec4 F = texture2D(uTex, vUv + t * vec2(-1.0,  0.0));
  vec4 G = texture2D(uTex, vUv);
  vec4 H = texture2D(uTex, vUv + t * vec2( 1.0,  0.0));
  vec4 I = texture2D(uTex, vUv + t * vec2(-0.5,  0.5));
  vec4 J = texture2D(uTex, vUv + t * vec2( 0.5,  0.5));
  vec4 K = texture2D(uTex, vUv + t * vec2(-1.0,  1.0));
  vec4 L = texture2D(uTex, vUv + t * vec2( 0.0,  1.0));
  vec4 M = texture2D(uTex, vUv + t * vec2( 1.0,  1.0));
  vec2 div = (1.0 / 4.0) * vec2(0.5, 0.125);
  vec4 o  = (D + E + I + J) * div.x;
       o += (A + B + F + G) * div.y;
       o += (B + C + G + H) * div.y;
       o += (F + G + K + L) * div.y;
       o += (G + H + L + M) * div.y;
  gl_FragColor = o;
}`,
  },
  swirl: {
    kind: "fragment",
    source: `precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uResolution;
void main() {
  vec2 uv = vUv - 0.5;
  uv.x *= uResolution.x / uResolution.y;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float strength = 2.5;
  a += strength * exp(-r * 3.0) + uTime * 0.3;
  vec2 sUv = vec2(cos(a), sin(a)) * r;
  sUv.x *= uResolution.y / uResolution.x;
  sUv += 0.5;
  gl_FragColor = texture2D(uTex, sUv);
}`,
  },
  invert: {
    kind: "fragment",
    source: `precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uResolution;
void main() {
  vec4 c = texture2D(uTex, vUv);
  gl_FragColor = vec4(1.0 - c.rgb, c.a);
}`,
  },
  chromatic: {
    kind: "fragment",
    source: `precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uResolution;
void main() {
  float a = 0.005 * (1.0 + sin(uTime));
  float r = texture2D(uTex, vUv + vec2(a, 0.0)).r;
  float g = texture2D(uTex, vUv).g;
  float b = texture2D(uTex, vUv - vec2(a, 0.0)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}`,
  },
  wave: {
    kind: "fragment",
    source: `precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uResolution;
void main() {
  vec2 uv = vUv;
  uv.x += sin(uv.y * 30.0 + uTime * 2.0) * 0.005;
  gl_FragColor = texture2D(uTex, uv);
}`,
  },
  ascii: {
    kind: "fragment",
    source: `precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uResolution;
void main() {
  float px = 8.0;
  vec2 uv = floor(vUv * uResolution / px) * px / uResolution;
  gl_FragColor = texture2D(uTex, uv);
}`,
  },
  roll: {
    kind: "roll",
    hint: "Requires <code>chrome://flags/#canvas-draw-element</code>. This preset uses a built-in WebGL mesh pass with live <code>uProgress</code> control.",
    controls: [
      { key: "rollProgress", label: "Roll progress", min: 0, max: 1, default: 0.1 },
    ],
    source: `// Built-in 3D roll preset.
// This preset swaps the fullscreen fragment pass for a subdivided mesh.
// Use the slider below, then click Apply. If the effect is already active,
// the slider updates live while the popup stays open.
//
// Engine uniforms:
//   uProgress  0.0 = tightly rolled, 1.0 = flat page
//   uTex       live drawElement() page snapshot
//   uAspect    viewport aspect ratio
//   uRadius    outer curl radius
//   uThickness spiral thickness per turn`,
  },
  blackhole: {
    kind: "blackhole",
    hint: "Cursor becomes a gravitational singularity. Adjust <code>strength</code>, <code>radius</code>, <code>speed</code>, <code>spin</code> below.",
    controls: [
      { key: "strength", label: "Strength", min: 0, max: 1, default: 0.5 },
      { key: "radius", label: "Radius", min: 0.05, max: 1, default: 0.4 },
      { key: "speed", label: "Speed", min: 0.01, max: 1, default: 0.5 },
      { key: "spin", label: "Spin", min: 0, max: 1, default: 0.3 },
    ],
    source: `// Built-in Black Hole preset.
// The cursor acts as a gravitational singularity.
// DOM elements are pulled toward it and captured.
// A 3D black hole with accretion ring follows the cursor.`,
  },
  fireburn: {
    kind: "fireburn",
    hint: "Hover to burn. Elements char progressively and disintegrate. Adjust <code>intensity</code>, <code>radius</code>, <code>burn speed</code>, <code>particles</code> below.",
    controls: [
      { key: "fbIntensity", label: "Intensity", min: 0.1, max: 1, default: 0.6 },
      { key: "fbRadius", label: "Spread radius", min: 0.1, max: 1, default: 0.4 },
      { key: "fbBurnspeed", label: "Burn speed", min: 0.05, max: 1, default: 0.5 },
      { key: "fbParticles", label: "Particles", min: 0.1, max: 1, default: 0.6 },
    ],
    source: `// Built-in Fire Burn preset.
// Hover to emit fire from the cursor.
// Elements under fire take progressive burn damage and disintegrate.
// No WebGL — pure DOM + Canvas 2D particle system.`,
  },
  magnetic: {
    kind: "magnetic",
    hint: "Cursor acts as a magnet. Elements are attracted, captured, and stack on cursor. Press <code>Space</code> to release. Toggle <code>attract/repel</code> below.",
    controls: [
      { key: "mgStrength", label: "Strength", min: 0.05, max: 1, default: 0.5 },
      { key: "mgRadius", label: "Radius", min: 0.1, max: 1, default: 0.5 },
      { key: "mgSmoothing", label: "Smoothing", min: 0.05, max: 1, default: 0.5 },
      { key: "mgMode", label: "Mode", type: "select", options: ["attract", "repel"], default: "attract" },
    ],
    source: `// Built-in Magnetic Field preset.
// The cursor acts as a magnet — DOM elements are attracted or repelled.
// Captured elements follow the cursor. Press Space to release.
// A 3D horseshoe magnet follows the cursor.`,
  },
  seedgrowth: {
    kind: "seedgrowth",
    hint: "Click to drop seeds. Organic vines grow progressively on elements. Adjust <code>growth speed</code>, <code>density</code>, <code>spread</code> below.",
    controls: [
      { key: "sgGrowthSpeed", label: "Growth speed", min: 0.1, max: 1, default: 0.5 },
      { key: "sgDensity", label: "Density", min: 0.1, max: 1, default: 0.5 },
      { key: "sgSpread", label: "Spread", min: 0.1, max: 1, default: 0.5 },
    ],
    source: `// Built-in Seed Growth preset.
// Click to drop seeds. Seeds land on DOM elements and grow
// organic vine/branch structures. Growth is progressive
// from root to stem to branches to leaves.`,
  },
  liquid: {
    kind: "liquid",
    hint: "Cursor pushes DOM elements like a liquid surface. Elements spring back with soft-body physics. Adjust <code>force</code>, <code>radius</code>, <code>tension</code>, <code>damping</code> below.",
    controls: [
      { key: "lqForce", label: "Force", min: 0.1, max: 1, default: 0.5 },
      { key: "lqRadius", label: "Radius", min: 0.1, max: 1, default: 0.5 },
      { key: "lqTension", label: "Tension", min: 0.05, max: 1, default: 0.4 },
      { key: "lqDamping", label: "Damping", min: 0.05, max: 1, default: 0.5 },
    ],
    source: `// Built-in Liquid UI preset.
// DOM elements behave like a soft fluid surface.
// Cursor pushes nearby elements; they spring back.
// Neighbor influence creates ripple propagation.
// No canvas, no overlay — pure DOM transforms.`,
  },
  storm: {
    kind: "storm",
    hint: "Cursor generates a storm. Wind pushes elements permanently. Lightning flashes. A 3D tornado follows the cursor. Adjust <code>wind</code>, <code>radius</code>, <code>chaos</code> below.",
    controls: [
      { key: "stWind", label: "Wind force", min: 0.1, max: 1, default: 0.5 },
      { key: "stRadius", label: "Radius", min: 0.1, max: 1, default: 0.5 },
      { key: "stChaos", label: "Chaos", min: 0, max: 1, default: 0.4 },
    ],
    source: `// Built-in Storm preset.
// Cursor generates directional wind. Elements are pushed and stay
// displaced (no spring-back). Tornado cursor, lightning flashes,
// wind streaks, debris particles, vignette darkening.`,
  },
  fighting: {
    kind: "fighting",
    hint: "Click Apply, then click a DOM element to fight it. Controls: <code>A/D</code> move, <code>Space</code> jump, <code>Click</code> attack.",
    controls: [
      { key: "ftDifficulty", label: "Difficulty", min: 0.1, max: 1, default: 0.4 },
    ],
    source: `// Built-in UI Fighter preset.
// Select a DOM element as opponent. Fight it in a retro arena.
// A/D = move, Space = jump, Click = attack.
// Both sides have 100 HP. Reduce enemy HP to 0 to win.`,
  },
};

const DEFAULT_PRESET = "blur";

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const shaderEl = $("shader");
const presetEl = $("preset");
const presetHintEl = $("preset_hint");
const dynamicControlsEl = $("dynamic_controls");
const editorEl = document.querySelector(".editor");
const hlEl = document.querySelector("#shader-hl code");

const appState = {
  appliedEngine: null,
};

const GLSL_KEYWORDS = new Set([
  "if",
  "else",
  "for",
  "while",
  "do",
  "return",
  "break",
  "continue",
  "discard",
  "in",
  "out",
  "inout",
  "const",
  "uniform",
  "varying",
  "attribute",
  "precision",
  "highp",
  "mediump",
  "lowp",
  "struct",
  "true",
  "false",
]);
const GLSL_TYPES = new Set([
  "void",
  "bool",
  "int",
  "uint",
  "float",
  "vec2",
  "vec3",
  "vec4",
  "ivec2",
  "ivec3",
  "ivec4",
  "uvec2",
  "uvec3",
  "uvec4",
  "bvec2",
  "bvec3",
  "bvec4",
  "mat2",
  "mat3",
  "mat4",
  "mat2x2",
  "mat2x3",
  "mat2x4",
  "mat3x2",
  "mat3x3",
  "mat3x4",
  "mat4x2",
  "mat4x3",
  "mat4x4",
  "sampler2D",
  "samplerCube",
  "sampler3D",
  "sampler2DArray",
]);
const GLSL_BUILTINS = new Set([
  "gl_FragColor",
  "gl_Position",
  "gl_FragCoord",
  "gl_PointCoord",
  "texture",
  "texture2D",
  "textureCube",
  "textureLod",
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "pow",
  "exp",
  "log",
  "exp2",
  "log2",
  "sqrt",
  "inversesqrt",
  "abs",
  "sign",
  "floor",
  "ceil",
  "fract",
  "mod",
  "min",
  "max",
  "clamp",
  "mix",
  "step",
  "smoothstep",
  "length",
  "distance",
  "dot",
  "cross",
  "normalize",
  "reflect",
  "refract",
  "any",
  "all",
  "not",
  "dFdx",
  "dFdy",
  "fwidth",
]);

function escHtml(s) {
  return s.replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]),
  );
}

function highlight(src) {
  const re =
    /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(^[ \t]*#[^\n]*)|("(?:\\.|[^"\\])*")|(\b\d+\.?\d*(?:e[+-]?\d+)?\b)|([A-Za-z_][A-Za-z_0-9]*)|([\s\S])/gm;
  let out = "";
  src.replace(re, (m, com1, com2, pp, str, num, ident) => {
    if (com1 || com2) out += `<span class="tok-com">${escHtml(m)}</span>`;
    else if (pp) out += `<span class="tok-pp">${escHtml(m)}</span>`;
    else if (str) out += `<span class="tok-str">${escHtml(m)}</span>`;
    else if (num) out += `<span class="tok-num">${m}</span>`;
    else if (ident) {
      if (GLSL_KEYWORDS.has(ident))
        out += `<span class="tok-key">${ident}</span>`;
      else if (GLSL_TYPES.has(ident))
        out += `<span class="tok-type">${ident}</span>`;
      else if (GLSL_BUILTINS.has(ident))
        out += `<span class="tok-bi">${ident}</span>`;
      else out += ident;
    } else out += escHtml(m);
    return "";
  });
  return out + "\n";
}

function syncHighlight() {
  hlEl.innerHTML = highlight(shaderEl.value);
  hlEl.parentElement.scrollTop = shaderEl.scrollTop;
  hlEl.parentElement.scrollLeft = shaderEl.scrollLeft;
}

function getPreset() {
  return PRESETS[presetEl.value] || PRESETS[DEFAULT_PRESET];
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function setStatus(message) {
  statusEl.textContent = message || "";
}

// ── Dynamic control system ──────────────────────────────────────
// Renders controls from preset.controls[], reads values, syncs labels,
// and live-updates the active engine — all from one unified codepath.

function renderControls(preset) {
  dynamicControlsEl.innerHTML = "";
  const controls = preset.controls;
  if (!controls || controls.length === 0) return;

  for (const ctrl of controls) {
    const div = document.createElement("div");
    div.className = "control";

    if (ctrl.type === "select") {
      div.innerHTML = `
        <label>
          <span>${ctrl.label}</span>
          <span class="__ctrl_val" data-key="${ctrl.key}">${ctrl.default}</span>
        </label>
        <select class="__ctrl_input" data-key="${ctrl.key}"
          style="width:100%;background:#1a1a1a;color:#eee;border:1px solid #333;padding:4px;border-radius:4px;">
          ${ctrl.options.map((o) => `<option value="${o}"${o === ctrl.default ? " selected" : ""}>${o}</option>`).join("")}
        </select>`;
    } else {
      const val = Number(ctrl.default).toFixed(2);
      div.innerHTML = `
        <label>
          <span>${ctrl.label}</span>
          <span class="__ctrl_val" data-key="${ctrl.key}">${val}</span>
        </label>
        <input class="__ctrl_input" data-key="${ctrl.key}" type="range"
          min="${ctrl.min}" max="${ctrl.max}" step="${ctrl.step || 0.01}"
          value="${ctrl.default}" />`;
    }
    dynamicControlsEl.appendChild(div);
  }

  // Attach live-update listeners
  const inputs = dynamicControlsEl.querySelectorAll(".__ctrl_input");
  for (const input of inputs) {
    const evtType = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(evtType, async () => {
      syncControlLabels();
      const kind = getPreset().kind;
      if (kind !== appState.appliedEngine) return;
      try {
        await inject(updateShaderConfigInPage, [getControlValues()]);
        setStatus("");
      } catch (e) {
        setStatus(String(e));
      }
    });
  }
}

function syncControlLabels() {
  const valEls = dynamicControlsEl.querySelectorAll(".__ctrl_val");
  for (const valEl of valEls) {
    const key = valEl.dataset.key;
    const input = dynamicControlsEl.querySelector(
      `.__ctrl_input[data-key="${key}"]`,
    );
    if (!input) continue;
    if (input.tagName === "SELECT") {
      valEl.textContent = input.value;
    } else {
      valEl.textContent = Number(input.value).toFixed(2);
    }
  }
}

function getControlValues() {
  const values = {};
  const inputs = dynamicControlsEl.querySelectorAll(".__ctrl_input");
  for (const input of inputs) {
    const key = input.dataset.key;
    if (input.tagName === "SELECT") {
      values[key] = input.value;
    } else {
      values[key] = clamp01(Number(input.value));
    }
  }
  return values;
}

function buildApplyConfig() {
  const preset = getPreset();
  return {
    engine: preset.kind,
    fragSrc: shaderEl.value,
    ...getControlValues(),
  };
}

// ── Preset UI sync ──────────────────────────────────────────────

function syncPresetUi() {
  const preset = getPreset();
  shaderEl.value = preset.source;
  shaderEl.readOnly = preset.kind !== "fragment";
  editorEl.classList.toggle("is-readonly", preset.kind !== "fragment");

  // Render this preset's controls (or clear if none)
  renderControls(preset);
  syncControlLabels();

  // Hint text
  if (preset.hint) {
    presetHintEl.innerHTML = preset.hint;
  } else {
    presetHintEl.innerHTML =
      "Requires <code>chrome://flags/#canvas-draw-element</code>. Fragment presets expose <code>uTex</code>, <code>uTime</code>, <code>uResolution</code>, <code>vUv</code>.";
  }
  syncHighlight();
}

shaderEl.addEventListener("input", syncHighlight);
shaderEl.addEventListener("scroll", () => {
  hlEl.parentElement.scrollTop = shaderEl.scrollTop;
  hlEl.parentElement.scrollLeft = shaderEl.scrollLeft;
});
shaderEl.addEventListener("keydown", (e) => {
  if (shaderEl.readOnly) return;
  if (e.key === "Tab") {
    e.preventDefault();
    const start = shaderEl.selectionStart;
    const end = shaderEl.selectionEnd;
    shaderEl.value = `${shaderEl.value.slice(0, start)}  ${shaderEl.value.slice(
      end,
    )}`;
    shaderEl.selectionStart = shaderEl.selectionEnd = start + 2;
    syncHighlight();
  }
});

presetEl.value = DEFAULT_PRESET;
syncPresetUi();

presetEl.addEventListener("change", () => {
  setStatus("");
  syncPresetUi();
});

async function inject(func, args = []) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func,
    args,
    world: "MAIN",
  });
}

$("apply").addEventListener("click", async () => {
  setStatus("");
  try {
    const config = buildApplyConfig();
    const res = await inject(applyShaderInPage, [config]);
    const err = res?.[0]?.result;
    if (err) {
      appState.appliedEngine = null;
      setStatus(err);
      return;
    }
    appState.appliedEngine = config.engine;
  } catch (e) {
    appState.appliedEngine = null;
    setStatus(String(e));
  }
});

$("remove").addEventListener("click", async () => {
  appState.appliedEngine = null;
  try {
    await inject(removeShaderInPage);
    setStatus("");
  } catch (e) {
    setStatus(String(e));
  }
});

function applyShaderInPage(rawConfig) {
  const ctx2dProto = CanvasRenderingContext2D.prototype;
  const hasDrawImage = "drawElementImage" in ctx2dProto;
  const hasDraw = "drawElement" in ctx2dProto;
  const hasPlace = "placeElement" in ctx2dProto;
  if (!hasDrawImage && !hasDraw && !hasPlace) {
    return "No drawElementImage/drawElement on CanvasRenderingContext2D. Enable chrome://flags/#canvas-draw-element and restart Chrome.";
  }

  function clampUnit(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
  }

  function compileShader(gl, type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "Unknown compile error";
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(gl, vsSrc, fsSrc) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || "Unknown link error";
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function createSnapshotTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  function createPlaneGrid(xSegments, ySegments) {
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let y = 0; y <= ySegments; y += 1) {
      const v = y / ySegments;
      const posY = 1 - v * 2;
      for (let x = 0; x <= xSegments; x += 1) {
        const u = x / xSegments;
        const posX = u * 2 - 1;
        positions.push(posX, posY);
        uvs.push(u, v);
      }
    }

    const stride = xSegments + 1;
    for (let y = 0; y < ySegments; y += 1) {
      for (let x = 0; x < xSegments; x += 1) {
        const a = y * stride + x;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    return {
      positions: new Float32Array(positions),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices),
    };
  }

  function createFragmentRenderer(gl, sourceCanvas, config) {
    const vsSrc = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

    const fsHeader = `#version 300 es
precision highp float;
out vec4 outColor;
#define gl_FragColor outColor
#define texture2D(s,uv) texture(s,uv)
#define varying in
#define attribute in
`;
    const fsSrc =
      fsHeader +
      config.fragSrc
        .replace(/^\s*precision[^;]*;/m, "")
        .replace(/^\s*varying[^\n]*\n/m, "in vec2 vUv;\n");

    const program = createProgram(gl, vsSrc, fsSrc);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(program, "aPos");
    const texture = createSnapshotTexture(gl);
    const uniforms = {
      uTex: gl.getUniformLocation(program, "uTex"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uResolution: gl.getUniformLocation(program, "uResolution"),
    };

    return {
      resize() {},
      update() {},
      render(time, width, height) {
        gl.viewport(0, 0, width, height);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sourceCanvas,
        );

        gl.uniform1i(uniforms.uTex, 0);
        gl.uniform1f(uniforms.uTime, time);
        gl.uniform2f(uniforms.uResolution, width, height);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      destroy() {
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      },
    };
  }

  function createRollRenderer(gl, sourceCanvas, config) {
    const vsSrc = `#version 300 es
precision highp float;
in vec2 aPosition;
in vec2 aUv;
uniform float uProgress;
uniform float uTopAnchor;
uniform float uRadius;
uniform float uThickness;
uniform float uAspect;
uniform float uCameraDist;
uniform float uFovScale;
uniform float uNear;
uniform float uFar;
out vec2 vUv;
void main() {
  vUv = aUv;

  vec3 pos = vec3(aPosition, 0.0);
  float unrollAmount = clamp(uProgress, 0.0, 1.0) * 2.0;
  float d = uTopAnchor - pos.y;
  float rolledAmount = max(d - unrollAmount, 0.0);
  float angle = rolledAmount / uRadius;
  float r = max(uRadius - angle * uThickness, 0.01);
  float rollCenterY = uTopAnchor - unrollAmount;
  float rolledY = rollCenterY - sin(angle) * r;
  float rolledZ = cos(angle) * r - uRadius - 0.001;

  if (d > unrollAmount) {
    pos.y = rolledY;
    pos.z = -rolledZ;
  }

  pos.x *= uAspect;
  float viewZ = pos.z - uCameraDist;
  float clipX = pos.x * uFovScale / uAspect;
  float clipY = pos.y * uFovScale;
  float clipZ = ((uFar + uNear) / (uNear - uFar)) * viewZ + ((2.0 * uFar * uNear) / (uNear - uFar));

  gl_Position = vec4(clipX, clipY, clipZ, -viewZ);
}`;

    const fsSrc = `#version 300 es
precision highp float;
uniform sampler2D uTex;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec4 texel = texture(uTex, vUv);
  float edgeFade = smoothstep(0.0, 0.12, vUv.x) * smoothstep(0.0, 0.12, 1.0 - vUv.x);
  float bottomFade = smoothstep(0.0, 0.3, vUv.y);
  float rolledPresence = 1.0 - smoothstep(0.22, 0.92, vUv.y);
  float coreShadow = edgeFade * bottomFade * rolledPresence;
  float spreadShadow = edgeFade * smoothstep(0.0, 0.55, vUv.y) * (1.0 - smoothstep(0.45, 1.0, vUv.y));
  float shadow = min(coreShadow * 0.28 + spreadShadow * 0.12, 0.34);
  vec3 shadowColor = vec3(0.0);
  outColor = vec4(mix(texel.rgb, shadowColor, shadow), texel.a);
}`;

    const program = createProgram(gl, vsSrc, fsSrc);
    const geometry = createPlaneGrid(1, 384);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.uvs, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

    const texture = createSnapshotTexture(gl);
    const locations = {
      aPosition: gl.getAttribLocation(program, "aPosition"),
      aUv: gl.getAttribLocation(program, "aUv"),
      uTex: gl.getUniformLocation(program, "uTex"),
      uProgress: gl.getUniformLocation(program, "uProgress"),
      uTopAnchor: gl.getUniformLocation(program, "uTopAnchor"),
      uRadius: gl.getUniformLocation(program, "uRadius"),
      uThickness: gl.getUniformLocation(program, "uThickness"),
      uAspect: gl.getUniformLocation(program, "uAspect"),
      uCameraDist: gl.getUniformLocation(program, "uCameraDist"),
      uFovScale: gl.getUniformLocation(program, "uFovScale"),
      uNear: gl.getUniformLocation(program, "uNear"),
      uFar: gl.getUniformLocation(program, "uFar"),
    };

    const state = {
      width: 1,
      height: 1,
      progress: 1,
      targetProgress: clampUnit(Number(config.rollProgress ?? 1)),
      introFrom: 1,
      introTo: clampUnit(Number(config.rollProgress ?? 1)),
      introStartTime: 0,
      introDuration: 0.7,
      introActive: true,
    };
    const near = 0.1;
    const far = 10;
    const fov = Math.PI / 4;
    const fovScale = 1 / Math.tan(fov / 2);
    const cameraDist = fovScale;

    return {
      resize(width, height) {
        state.width = width;
        state.height = height;
      },
      update(nextConfig) {
        if ("rollProgress" in nextConfig) {
          const nextProgress = clampUnit(Number(nextConfig.rollProgress));
          state.targetProgress = nextProgress;
          if (nextConfig.animateFrom !== undefined) {
            state.introFrom = clampUnit(Number(nextConfig.animateFrom));
            state.introTo = nextProgress;
            state.introStartTime = Number(nextConfig.time ?? 0);
            state.introActive = true;
            state.progress = state.introFrom;
          } else if (state.introActive) {
            state.introTo = nextProgress;
          } else {
            state.progress = nextProgress;
          }
        }
      },
      render(time, width, height) {
        if (state.introActive) {
          const t = Math.min(
            Math.max((time - state.introStartTime) / state.introDuration, 0),
            1,
          );
          const eased = 1 - Math.pow(1 - t, 3);
          state.progress =
            state.introFrom + (state.introTo - state.introFrom) * eased;
          if (t >= 1) {
            state.introActive = false;
            state.progress = state.targetProgress;
          }
        }

        gl.viewport(0, 0, width, height);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(locations.aPosition);
        gl.vertexAttribPointer(locations.aPosition, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.enableVertexAttribArray(locations.aUv);
        gl.vertexAttribPointer(locations.aUv, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sourceCanvas,
        );

        gl.uniform1i(locations.uTex, 0);
        gl.uniform1f(locations.uProgress, state.progress);
        gl.uniform1f(locations.uTopAnchor, 1.0);
        gl.uniform1f(locations.uRadius, 0.08);
        gl.uniform1f(locations.uThickness, 0.003);
        gl.uniform1f(
          locations.uAspect,
          state.width / Math.max(state.height, 1),
        );
        gl.uniform1f(locations.uCameraDist, cameraDist);
        gl.uniform1f(locations.uFovScale, fovScale);
        gl.uniform1f(locations.uNear, near);
        gl.uniform1f(locations.uFar, far);
        gl.drawElements(
          gl.TRIANGLES,
          geometry.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        );
      },
      destroy() {
        gl.deleteTexture(texture);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(uvBuffer);
        gl.deleteBuffer(indexBuffer);
        gl.deleteProgram(program);
      },
    };
  }

  // ── Black Hole DOM engine ───────────────────────────────────────
  // No WebGL. Manipulates individual DOM elements toward the cursor.
  function createBlackholeEngine(config) {
    const state = {
      cursorX: innerWidth / 2,
      cursorY: innerHeight / 2,
      smoothX: innerWidth / 2,
      smoothY: innerHeight / 2,
      strength: clampUnit(Number(config.strength ?? 0.5)),
      radius: clampUnit(Number(config.radius ?? 0.4)),
      speed: clampUnit(Number(config.speed ?? 0.5)),
      spin: clampUnit(Number(config.spin ?? 0.3)),
      glowPulse: 0,
    };

    // Radius in pixels (mapped from 0-1 to 100-800px)
    const getRadiusPx = () => 100 + state.radius * 700;

    // Track which elements are being affected
    const tracked = new Map(); // element → { origRect, progress, rotation }
    const absorbed = new Set();

    // Particle burst canvas overlay
    const particleCanvas = document.createElement("canvas");
    particleCanvas.id = "__html_shader_bh_particles__";
    Object.assign(particleCanvas.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      zIndex: "2147483646",
    });
    const pDpr = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = Math.floor(innerWidth * pDpr);
    particleCanvas.height = Math.floor(innerHeight * pDpr);
    document.body.appendChild(particleCanvas);
    const pCtx = particleCanvas.getContext("2d");
    pCtx.scale(pDpr, pDpr);

    const particles = []; // { x, y, vx, vy, life, maxLife, size, hue }

    function spawnBurst(x, y, count) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 200;
        const life = 0.4 + Math.random() * 0.6;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life,
          maxLife: life,
          size: 2 + Math.random() * 4,
          hue: 20 + Math.random() * 30, // orange-yellow
        });
      }
      // Trigger glow pulse
      state.glowPulse = 1.0;
    }

    function shakeScreen() {
      const intensity = 6;
      const dur = 300;
      const start = performance.now();
      const orig = document.body.style.transform;
      function tick() {
        const t = (performance.now() - start) / dur;
        if (t >= 1) {
          document.body.style.transform = orig;
          return;
        }
        const decay = 1 - t;
        const ox = (Math.random() - 0.5) * 2 * intensity * decay;
        const oy = (Math.random() - 0.5) * 2 * intensity * decay;
        document.body.style.transform = `translate(${ox}px, ${oy}px)`;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    // Collect targetable elements (skip our own injected elements)
    const SKIP_IDS = new Set([
      "__html_shader_bh_cursor__",
      "__html_shader_bh_particles__",
    ]);
    function getTargetElements() {
      const all = document.body.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, a, button, img, li, span, " +
          "div, section, nav, article, header, footer, ul, ol, " +
          "input, textarea, select, label, code, pre, blockquote, " +
          "table, tr, td, th, figure, figcaption, svg",
      );
      const results = [];
      for (const el of all) {
        if (SKIP_IDS.has(el.id)) continue;
        if (el.closest("[id^='__html_shader']")) continue;
        // Only target leaf-ish elements (no deep nesting of other targets)
        const hasTargetChild = el.querySelector(
          "h1,h2,h3,p,a,button,img,li,span,code,pre",
        );
        if (!hasTargetChild || el.tagName === "LI" || el.tagName === "A") {
          results.push(el);
        }
      }
      return results;
    }

    let raf = 0;
    let running = true;
    let lastTime = performance.now();

    function tick() {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Smooth cursor
      const lerpRate = 0.05 + state.speed * 0.25;
      state.smoothX += (state.cursorX - state.smoothX) * lerpRate;
      state.smoothY += (state.cursorY - state.smoothY) * lerpRate;

      const cx = state.smoothX;
      const cy = state.smoothY;
      const radiusPx = getRadiusPx();
      const pullStrength = state.strength;
      const spinAmount = state.spin;

      // Process DOM elements
      const elements = getTargetElements();
      for (const el of elements) {
        if (absorbed.has(el)) continue;

        const rect = el.getBoundingClientRect();
        const elCx = rect.left + rect.width / 2;
        const elCy = rect.top + rect.height / 2;
        const dx = cx - elCx;
        const dy = cy - elCy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radiusPx) {
          // Outside radius — reset if was tracked
          if (tracked.has(el)) {
            el.style.transform = "";
            el.style.opacity = "";
            el.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";
            tracked.delete(el);
            // Clean transition after reset
            setTimeout(() => {
              if (!tracked.has(el)) el.style.transition = "";
            }, 400);
          }
          continue;
        }

        // Inside radius — apply gravity
        if (!tracked.has(el)) {
          tracked.set(el, { progress: 0, rotation: 0 });
        }
        const data = tracked.get(el);

        // Influence: 0 at edge, 1 at center (quadratic)
        const norm = 1 - dist / radiusPx;
        const influence = norm * norm;

        // Progress accumulates — once pulled, keeps going
        const pullSpeed = influence * pullStrength * 2.0;
        data.progress = Math.min(data.progress + pullSpeed * dt, 1);

        // Rotation accumulates with spin
        data.rotation += spinAmount * influence * 180 * dt;

        const p = data.progress;
        // Ease-in curve for acceleration toward center
        const eased = p * p * p;

        const tx = dx * eased;
        const ty = dy * eased;
        const scale = 1 - eased * 0.8; // shrink to 0.2
        const opacity = 1 - eased;
        const rot = data.rotation * eased;

        el.style.transition = "none";
        el.style.transform = `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rot}deg)`;
        el.style.opacity = String(Math.max(opacity, 0));

        // Absorbed — element reached singularity
        if (p >= 0.95 && opacity <= 0.1) {
          absorbed.add(el);
          tracked.delete(el);
          el.style.visibility = "hidden";
          el.style.transform = "";
          el.style.opacity = "";
          // Particle burst at absorption point
          spawnBurst(cx, cy, 20 + Math.floor(Math.random() * 15));
          shakeScreen();
        }
      }

      // ── Render particles ──
      pCtx.save();
      pCtx.setTransform(1, 0, 0, 1, 0, 0);
      pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      pCtx.restore();

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.life -= dt;
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vx *= 0.96;
        pt.vy *= 0.96;
        const t = pt.life / pt.maxLife;
        const alpha = t * 0.9;
        pCtx.beginPath();
        pCtx.arc(pt.x, pt.y, pt.size * t, 0, Math.PI * 2);
        pCtx.fillStyle = `hsla(${pt.hue}, 100%, 60%, ${alpha})`;
        pCtx.fill();
      }

      // Decay glow pulse
      state.glowPulse *= 0.92;

      raf = requestAnimationFrame(tick);
    }

    return {
      state,
      start() {
        running = true;
        lastTime = performance.now();
        tick();
      },
      update(nextConfig) {
        if ("strength" in nextConfig)
          state.strength = clampUnit(Number(nextConfig.strength));
        if ("radius" in nextConfig)
          state.radius = clampUnit(Number(nextConfig.radius));
        if ("speed" in nextConfig)
          state.speed = clampUnit(Number(nextConfig.speed));
        if ("spin" in nextConfig)
          state.spin = clampUnit(Number(nextConfig.spin));
      },
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        // Reset all tracked elements
        for (const [el] of tracked) {
          el.style.transform = "";
          el.style.opacity = "";
          el.style.transition = "";
        }
        tracked.clear();
        // Restore absorbed elements
        for (const el of absorbed) {
          el.style.visibility = "";
          el.style.transform = "";
          el.style.opacity = "";
        }
        absorbed.clear();
        particleCanvas.remove();
      },
    };
  }

  // ── Fire Burn DOM engine ────────────────────────────────────────
  // Click-drag to emit fire. Progressive burn damage to DOM elements.
  // Particle system: fire + embers + smoke on Canvas 2D overlay.
  // Burn mask tracks scorched areas with charred visual overlay.
  // ── Fire Burn DOM engine ────────────────────────────────────────
  // Hover-driven, element-bound burns.
  // All persistent burn state (scars, damage) is stored per-element
  // and applied via inline CSS — scrolls with the element.
  // Only particles + glow use a viewport-fixed canvas (ephemeral).
  function createFireBurnEngine(config) {
    const state = {
      cursorX: -9999,
      cursorY: -9999,
      prevX: -9999,
      prevY: -9999,
      active: false,
      intensity: clampUnit(Number(config.fbIntensity ?? 0.6)),
      radius: clampUnit(Number(config.fbRadius ?? 0.4)),
      burnSpeed: clampUnit(Number(config.fbBurnspeed ?? 0.5)),
      particleDensity: clampUnit(Number(config.fbParticles ?? 0.6)),
    };

    const getRadiusPx = () => 20 + state.radius * 60;
    const pDpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.floor(innerWidth * pDpr);
    const ch = Math.floor(innerHeight * pDpr);

    // ── Particle canvas (viewport-fixed, ephemeral — clears each frame) ──
    const fireCanvas = document.createElement("canvas");
    fireCanvas.id = "__html_shader_fire_canvas__";
    Object.assign(fireCanvas.style, {
      position: "fixed", inset: "0",
      width: "100vw", height: "100vh",
      pointerEvents: "none", zIndex: "2147483647",
    });
    fireCanvas.width = cw;
    fireCanvas.height = ch;
    document.body.appendChild(fireCanvas);
    const fCtx = fireCanvas.getContext("2d");
    fCtx.scale(pDpr, pDpr);

    // ── Glow canvas (viewport-fixed, ephemeral) ──
    const glowCanvas = document.createElement("canvas");
    glowCanvas.id = "__html_shader_fire_glow__";
    Object.assign(glowCanvas.style, {
      position: "fixed", inset: "0",
      width: "100vw", height: "100vh",
      pointerEvents: "none", zIndex: "2147483646",
      mixBlendMode: "screen", opacity: "0.7",
    });
    glowCanvas.width = cw;
    glowCanvas.height = ch;
    document.body.appendChild(glowCanvas);
    const gCtx = glowCanvas.getContext("2d");
    gCtx.scale(pDpr, pDpr);

    // ── Particles (viewport coordinates — ephemeral) ──
    const particles = [];
    const MAX_PARTICLES = 400;

    function spawnFlame(x, y, count) {
      for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        const spd = 15 + Math.random() * 50 * state.intensity;
        const life = 0.2 + Math.random() * 0.4;
        particles.push({
          kind: 0, x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(a) * spd + (Math.random() - 0.5) * 20,
          vy: Math.sin(a) * spd,
          life, maxLife: life,
          size: 2 + Math.random() * 6 * state.intensity,
          hue: 10 + Math.random() * 35,
        });
      }
    }

    function spawnEmber(x, y, count) {
      for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 10 + Math.random() * 50;
        const life = 0.6 + Math.random() * 1.0;
        particles.push({
          kind: 1, x, y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd - 20 - Math.random() * 30,
          life, maxLife: life,
          size: 1 + Math.random() * 2,
          hue: 25 + Math.random() * 20,
        });
      }
    }

    function spawnSmoke(x, y, count) {
      for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
        const life = 1.5 + Math.random() * 2.0;
        particles.push({
          kind: 2,
          x: x + (Math.random() - 0.5) * 10, y: y - 2,
          vx: (Math.random() - 0.5) * 8,
          vy: -8 - Math.random() * 20,
          life, maxLife: life,
          size: 4 + Math.random() * 10, hue: 0,
        });
      }
    }

    // ── Per-element damage state ──
    // { progress: 0..1, overlay: HTMLCanvasElement, oCtx, lastHit }
    // The overlay canvas is positioned inside the element and scrolls with it.
    const dmg = new Map();
    const destroyed = new Set();

    const SKIP_IDS = new Set([
      "__html_shader_fire_canvas__",
      "__html_shader_fire_glow__",
    ]);

    function getTargetElements() {
      const all = document.body.querySelectorAll(
        "h1,h2,h3,h4,h5,h6,p,a,button,img,li,span," +
          "div,section,nav,article,header,footer,ul,ol," +
          "input,textarea,select,label,code,pre,blockquote," +
          "table,tr,td,th,figure,figcaption,svg",
      );
      const results = [];
      for (const el of all) {
        if (SKIP_IDS.has(el.id)) continue;
        if (el.closest("[id^='__html_shader']")) continue;
        if (el.classList.contains("__fb_overlay")) continue;
        const hasChild = el.querySelector(
          "h1,h2,h3,p,a,button,img,li,span,code,pre",
        );
        if (!hasChild || el.tagName === "LI" || el.tagName === "A") {
          results.push(el);
        }
      }
      return results;
    }

    // ── Create per-element burn overlay (canvas inside the element) ──
    function ensureDmgEntry(el) {
      if (dmg.has(el)) return dmg.get(el);

      // Ensure the element can contain an overlay
      const pos = getComputedStyle(el).position;
      if (pos === "static") el.style.position = "relative";
      el.style.overflow = "hidden";

      const overlay = document.createElement("canvas");
      overlay.className = "__fb_overlay";
      Object.assign(overlay.style, {
        position: "absolute", inset: "0",
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: "1",
        mixBlendMode: "multiply",
      });
      // Size to element
      const rect = el.getBoundingClientRect();
      const w = Math.max(Math.ceil(rect.width * pDpr), 1);
      const h = Math.max(Math.ceil(rect.height * pDpr), 1);
      overlay.width = w;
      overlay.height = h;
      el.appendChild(overlay);

      const oCtx = overlay.getContext("2d");
      const d = { progress: 0, overlay, oCtx, lastHit: 0, w: rect.width, h: rect.height };
      dmg.set(el, d);
      return d;
    }

    // ── Paint burn scar onto element's local overlay canvas ──
    function paintElScar(d, localX, localY, r) {
      const ctx = d.oCtx;
      const sx = localX * pDpr;
      const sy = localY * pDpr;
      const sr = r * pDpr;

      const n = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * sr * 0.9;
        const bx = sx + Math.cos(angle) * dist;
        const by = sy + Math.sin(angle) * dist;
        const br = 1 + Math.random() * sr * 0.4;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(15, 8, 2, ${0.06 + Math.random() * 0.06})`;
        ctx.fill();
      }

      // Glowing edge ring
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const edgeR = sr * 1.1;
      const grad = ctx.createRadialGradient(sx, sy, sr * 0.4, sx, sy, edgeR);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.6, "rgba(0,0,0,0)");
      grad.addColorStop(0.8, `rgba(255, 120, 20, ${0.04 * state.intensity})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, edgeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ── Main loop ──
    let running = true;
    let raf = 0;
    let lastTime = performance.now();
    let flickerSeed = 0;

    function tick() {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      flickerSeed += dt;

      const cx = state.cursorX;
      const cy = state.cursorY;
      const radiusPx = getRadiusPx();
      const isOnPage = cx > -999 && state.active;

      // ── Emit particles on hover (viewport coords) ──
      if (isOnPage) {
        const dx = cx - state.prevX;
        const dy = cy - state.prevY;
        const moveDist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(moveDist / 5));
        const density = Math.max(1, Math.floor(state.particleDensity * 4));

        for (let s = 0; s <= steps; s++) {
          const t = steps > 0 ? s / steps : 1;
          const px = state.prevX + dx * t;
          const py = state.prevY + dy * t;
          spawnFlame(px, py, density);
          if (Math.random() < 0.3) spawnEmber(px, py, 1);
          if (Math.random() < 0.15) spawnSmoke(px, py, 1);
        }
        state.prevX = cx;
        state.prevY = cy;
      }

      // ── Draw particles (viewport-fixed canvas, clears each frame) ──
      fCtx.save();
      fCtx.setTransform(1, 0, 0, 1, 0, 0);
      fCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
      fCtx.restore();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const t = p.life / p.maxLife;

        if (p.kind === 0) {
          p.vy -= 80 * dt;
          p.vx += (Math.random() - 0.5) * 150 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const sz = p.size * (0.3 + t * 0.7);
          const lum = 50 + (1 - t) * 35;
          fCtx.beginPath();
          fCtx.arc(p.x, p.y, sz, 0, Math.PI * 2);
          fCtx.fillStyle = `hsla(${p.hue - (1 - t) * 20}, 95%, ${lum}%, ${t * 0.8})`;
          fCtx.fill();
        } else if (p.kind === 1) {
          p.vy -= 25 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.98;
          fCtx.beginPath();
          fCtx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
          fCtx.fillStyle = `hsla(${p.hue}, 100%, ${55 + Math.random() * 25}%, ${t})`;
          fCtx.fill();
        } else {
          p.vy -= 5 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.size += 8 * dt;
          fCtx.beginPath();
          fCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          fCtx.fillStyle = `rgba(35, 30, 25, ${t * 0.18})`;
          fCtx.fill();
        }
      }

      // ── Flickering glow at cursor (viewport-fixed, clears each frame) ──
      gCtx.save();
      gCtx.setTransform(1, 0, 0, 1, 0, 0);
      gCtx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
      gCtx.restore();

      if (isOnPage) {
        const flicker = 0.85 + Math.sin(flickerSeed * 18) * 0.08
                       + Math.sin(flickerSeed * 31) * 0.07;
        const glowR = radiusPx * 2.0;
        const grad = gCtx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        const a = state.intensity * flicker;
        grad.addColorStop(0, `rgba(255, 180, 60, ${0.25 * a})`);
        grad.addColorStop(0.4, `rgba(255, 100, 20, ${0.1 * a})`);
        grad.addColorStop(1, "rgba(255, 60, 0, 0)");
        gCtx.fillStyle = grad;
        gCtx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
      }

      // ── Element-bound burn damage ──
      if (isOnPage) {
        const elements = getTargetElements();
        for (const el of elements) {
          if (destroyed.has(el)) continue;

          const rect = el.getBoundingClientRect();
          // Closest point on element to cursor (viewport coords)
          const nearX = Math.max(rect.left, Math.min(cx, rect.right));
          const nearY = Math.max(rect.top, Math.min(cy, rect.bottom));
          const edgeDx = cx - nearX;
          const edgeDy = cy - nearY;
          const edgeDist = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);

          if (edgeDist > radiusPx) continue;

          const d = ensureDmgEntry(el);
          d.lastHit = now;

          // Resize overlay if element changed size
          if (Math.abs(rect.width - d.w) > 2 || Math.abs(rect.height - d.h) > 2) {
            d.w = rect.width;
            d.h = rect.height;
            d.overlay.width = Math.max(Math.ceil(rect.width * pDpr), 1);
            d.overlay.height = Math.max(Math.ceil(rect.height * pDpr), 1);
          }

          // Cursor position in element-local coords
          const localX = cx - rect.left;
          const localY = cy - rect.top;

          // Paint scar on element's own overlay (scrolls with element)
          paintElScar(d, localX, localY, radiusPx * 0.5);

          const proximity = 1 - edgeDist / radiusPx;
          d.progress = Math.min(
            d.progress + proximity * proximity * state.burnSpeed * 1.2 * dt,
            1,
          );
          const p = d.progress;

          // ── Progressive CSS damage (applied to the element itself) ──
          const brightness = 1 - p * 0.65;
          const sepia = Math.min(p * 1.5, 1);
          const contrast = 1 + p * 0.3;
          const blur = p > 0.5 ? (p - 0.5) * 3 : 0;
          const opacity = p > 0.7 ? 1 - (p - 0.7) * 3.3 : 1;

          // Heat distortion — subtle oscillating warp
          const heatAmt = Math.min(p, 0.4) * proximity;
          const warpX = Math.sin(now * 0.012 + rect.top * 0.07) * heatAmt * 4;
          const warpY = Math.cos(now * 0.015 + rect.left * 0.09) * heatAmt * 3;

          // Flickering inset glow + char shadow
          const fl = 0.7 + Math.sin(flickerSeed * 22 + rect.top) * 0.3;
          const charShadow = p > 0.15
            ? `inset 0 0 ${p * 12}px rgba(255, 90, 10, ${p * 0.25 * fl}),` +
              ` 0 0 ${p * 6}px rgba(15, 5, 0, ${p * 0.4})`
            : "none";

          const nearFlicker = proximity > 0.3 && p < 0.7
            ? 1 + Math.sin(flickerSeed * 15 + rect.left * 0.05) * 0.04 * state.intensity
            : 1;

          el.style.transition = "none";
          el.style.filter =
            `brightness(${brightness * nearFlicker}) sepia(${sepia}) contrast(${contrast}) blur(${blur}px)`;
          el.style.opacity = String(Math.max(opacity, 0));
          el.style.transform = `translate(${warpX}px, ${warpY}px)`;
          el.style.boxShadow = charShadow;

          // ── Destroyed ──
          if (p >= 0.97) {
            destroyed.add(el);
            dmg.delete(el);
            const elCx = rect.left + rect.width / 2;
            const elCy = rect.top + rect.height / 2;
            el.style.transition = "opacity 0.4s ease-out, transform 0.4s ease-out";
            el.style.opacity = "0";
            el.style.transform = `translate(${warpX}px, ${warpY - 5}px) scale(0.95)`;
            spawnEmber(elCx, elCy, 12);
            spawnSmoke(elCx, elCy, 4);
            setTimeout(() => {
              el.style.visibility = "hidden";
              el.style.transform = "";
              el.style.filter = "";
              el.style.boxShadow = "";
              // Remove the overlay canvas
              if (d.overlay.parentNode) d.overlay.remove();
            }, 400);
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }

    return {
      state,
      start() {
        running = true;
        lastTime = performance.now();
        tick();
      },
      update(nextConfig) {
        if ("fbIntensity" in nextConfig)
          state.intensity = clampUnit(Number(nextConfig.fbIntensity));
        if ("fbRadius" in nextConfig)
          state.radius = clampUnit(Number(nextConfig.fbRadius));
        if ("fbBurnspeed" in nextConfig)
          state.burnSpeed = clampUnit(Number(nextConfig.fbBurnspeed));
        if ("fbParticles" in nextConfig)
          state.particleDensity = clampUnit(Number(nextConfig.fbParticles));
      },
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        for (const [el, d] of dmg) {
          el.style.filter = "";
          el.style.opacity = "";
          el.style.transform = "";
          el.style.boxShadow = "";
          el.style.transition = "";
          el.style.overflow = "";
          if (d.overlay.parentNode) d.overlay.remove();
        }
        dmg.clear();
        for (const el of destroyed) {
          el.style.visibility = "";
          el.style.filter = "";
          el.style.opacity = "";
          el.style.transform = "";
          el.style.boxShadow = "";
          el.style.transition = "";
          el.style.overflow = "";
          // Remove any lingering overlays
          el.querySelectorAll(".__fb_overlay").forEach((c) => c.remove());
        }
        destroyed.clear();
        fireCanvas.remove();
        glowCanvas.remove();
      },
    };
  }

  // ── Magnetic Field DOM engine ───────────────────────────────────
  // Hover-driven. Elements attracted → captured → reparented to body
  // as position:fixed so they follow the cursor freely across the
  // entire viewport. Press Space to release (spring back to origin).
  function createMagneticFieldEngine(config) {
    const state = {
      cursorX: -9999,
      cursorY: -9999,
      smoothX: -9999,
      smoothY: -9999,
      active: false,
      strength: clampUnit(Number(config.mgStrength ?? 0.5)),
      radius: clampUnit(Number(config.mgRadius ?? 0.5)),
      smoothing: clampUnit(Number(config.mgSmoothing ?? 0.5)),
      mode: config.mgMode === "repel" ? -1 : 1,
      pulseIntensity: 0,
      captureCount: 0,
      vibePhase: 0,
    };

    const getRadiusPx = () => 80 + state.radius * 350;
    const CAPTURE_THRESHOLD = 0.35;

    // Per-element data. Captured elements store DOM origin for release.
    //   origParent, origNext: where to put it back on release
    //   origStyles: snapshot of position/top/left/width/height/margin/zIndex/pointerEvents/transform/transition
    //   followX, followY: smoothed absolute viewport position
    const tracked = new Map();
    let captureOrder = 0;

    const SKIP_SELECTOR = "[id^='__html_shader']";

    function getTargetElements() {
      const all = document.body.querySelectorAll(
        "h1,h2,h3,h4,h5,h6,p,a,button,img,li,span," +
          "div,section,nav,article,header,footer,ul,ol," +
          "input,textarea,select,label,code,pre,blockquote," +
          "table,tr,td,th,figure,figcaption,svg",
      );
      const results = [];
      for (const el of all) {
        if (el.closest(SKIP_SELECTOR)) continue;
        if (el.dataset.__mgCaptured) continue; // skip already-captured
        const hasChild = el.querySelector(
          "h1,h2,h3,p,a,button,img,li,span,code,pre",
        );
        if (!hasChild || el.tagName === "LI" || el.tagName === "A") {
          results.push(el);
        }
      }
      return results;
    }

    function ensureTracked(el, rect) {
      if (tracked.has(el)) return tracked.get(el);
      const d = {
        status: "free",
        tx: 0, ty: 0, vx: 0, vy: 0,
        rot: 0, scale: 1,
        captureIndex: 0,
        captureOffX: 0, captureOffY: 0,
        followX: 0, followY: 0,
        // DOM restore info (filled on capture)
        origParent: null, origNext: null,
        origStyles: null,
        origW: 0, origH: 0,
        // Original position in page for release animation target
        releaseTargetX: 0, releaseTargetY: 0,
      };
      tracked.set(el, d);
      return d;
    }

    function stackOffset(index, total) {
      if (total <= 1) return { x: 0, y: 0 };
      const angle = (index / Math.max(total, 1)) * Math.PI * 2 +
                    Math.sin(index * 1.7) * 0.5;
      const ring = 15 + Math.min(total, 12) * 4;
      return { x: Math.cos(angle) * ring, y: Math.sin(angle) * ring };
    }

    // ── Capture: reparent to body, position:fixed ──
    function captureElement(el, d, rect) {
      // Save DOM position for release
      d.origParent = el.parentNode;
      d.origNext = el.nextSibling;
      d.origW = rect.width;
      d.origH = rect.height;

      // Snapshot inline styles we'll overwrite
      const s = el.style;
      d.origStyles = {
        position: s.position, top: s.top, left: s.left,
        width: s.width, height: s.height,
        margin: s.margin, zIndex: s.zIndex,
        pointerEvents: s.pointerEvents,
        transform: s.transform, transition: s.transition,
        boxSizing: s.boxSizing,
      };

      // Set initial fixed position to current viewport rect (no visual jump)
      const hw = rect.width / 2;
      const hh = rect.height / 2;

      // Reparent to body
      document.body.appendChild(el);
      el.dataset.__mgCaptured = "1";

      // Make position:fixed at element's current viewport location
      Object.assign(el.style, {
        position: "fixed",
        top: "0px",
        left: "0px",
        width: rect.width + "px",
        height: rect.height + "px",
        margin: "0",
        boxSizing: "border-box",
        pointerEvents: "none",
        transition: "none",
        zIndex: String(10000 + d.captureIndex),
      });

      // Initialize follow position to current center
      d.followX = rect.left + hw;
      d.followY = rect.top + hh;

      // Set transform so element appears exactly where it was
      el.style.transform =
        `translate(${(d.followX - hw).toFixed(2)}px, ${(d.followY - hh).toFixed(2)}px)`;
    }

    // ── Release: reparent back, restore styles ──
    function releaseElement(el, d) {
      delete el.dataset.__mgCaptured;

      // Calculate where the element needs to go back
      // (we'll animate it to the original DOM position)
      if (d.origParent && d.origParent.isConnected) {
        if (d.origNext && d.origNext.parentNode === d.origParent) {
          d.origParent.insertBefore(el, d.origNext);
        } else {
          d.origParent.appendChild(el);
        }
      }

      // Restore original styles
      if (d.origStyles) {
        const os = d.origStyles;
        el.style.position = os.position;
        el.style.top = os.top;
        el.style.left = os.left;
        el.style.width = os.width;
        el.style.height = os.height;
        el.style.margin = os.margin;
        el.style.boxSizing = os.boxSizing;
        el.style.pointerEvents = os.pointerEvents;
        el.style.zIndex = os.zIndex;
      }

      // Animate return with a smooth transition
      el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "";

      setTimeout(() => {
        el.style.transition = d.origStyles ? d.origStyles.transition : "";
      }, 550);

      d.status = "free";
      d.tx = 0; d.ty = 0; d.vx = 0; d.vy = 0;
      d.rot = 0; d.scale = 1;
      d.origParent = null; d.origNext = null; d.origStyles = null;
    }

    function releaseAll() {
      for (const [el, d] of tracked) {
        if (d.status === "captured") {
          releaseElement(el, d);
        }
      }
      captureOrder = 0;
      state.captureCount = 0;
    }

    let running = true;
    let raf = 0;
    let lastTime = performance.now();

    function tick() {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const lerpRate = 0.08 + state.smoothing * 0.2;
      if (state.active && state.cursorX > -999) {
        state.smoothX += (state.cursorX - state.smoothX) * lerpRate;
        state.smoothY += (state.cursorY - state.smoothY) * lerpRate;
      }

      const cx = state.smoothX;
      const cy = state.smoothY;
      const radiusPx = getRadiusPx();
      const captureRadiusPx = radiusPx * CAPTURE_THRESHOLD;
      const isOnPage = cx > -999 && state.active;
      const isAttract = state.mode > 0;

      state.pulseIntensity *= 0.92;
      state.vibePhase += dt * 20;

      // Count captured and recompute stacking
      let capturedCount = 0;
      let stackIdx = 0;
      for (const [, d] of tracked) {
        if (d.status === "captured") {
          capturedCount++;
          const off = stackOffset(stackIdx, capturedCount);
          d.captureOffX = off.x;
          d.captureOffY = off.y;
          stackIdx++;
        }
      }
      // Fix: recompute after we know total
      if (stackIdx !== capturedCount) {
        stackIdx = 0;
        for (const [, d] of tracked) {
          if (d.status === "captured") {
            const off = stackOffset(stackIdx, capturedCount);
            d.captureOffX = off.x;
            d.captureOffY = off.y;
            stackIdx++;
          }
        }
      }
      state.captureCount = capturedCount;

      // ── Process captured elements (they are now position:fixed in body) ──
      for (const [el, d] of tracked) {
        if (d.status !== "captured") continue;

        const hw = d.origW / 2;
        const hh = d.origH / 2;

        // Target = cursor + stack offset
        const targetX = cx + d.captureOffX;
        const targetY = cy + d.captureOffY;

        // Inertia-based follow with per-element lag
        const followLag = 0.12 + d.captureIndex * 0.015;
        const lr = Math.min(followLag + state.smoothing * 0.15, 0.5);
        d.followX += (targetX - d.followX) * lr;
        d.followY += (targetY - d.followY) * lr;

        // Vibration
        const vibeAmp = Math.min(capturedCount * 0.15, 2.0);
        const vibeX = Math.sin(state.vibePhase + d.captureIndex * 2.1) * vibeAmp;
        const vibeY = Math.cos(state.vibePhase * 1.3 + d.captureIndex * 1.7) * vibeAmp;

        // Rotation + scale
        const targetRot = Math.sin(now * 0.002 + d.captureIndex * 1.5) * 3;
        d.rot += (targetRot - d.rot) * 0.08;
        const targetScale = 0.92 + Math.sin(now * 0.003 + d.captureIndex) * 0.03;
        d.scale += (targetScale - d.scale) * 0.1;

        // Position via transform (element is fixed at 0,0)
        const px = d.followX + vibeX - hw;
        const py = d.followY + vibeY - hh;

        el.style.transform =
          `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) ` +
          `rotate(${d.rot.toFixed(2)}deg) scale(${d.scale.toFixed(4)})`;
        el.style.zIndex = String(10000 + d.captureIndex);
      }

      // ── Process free/attracting elements (still in normal DOM flow) ──
      const elements = getTargetElements();
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const d = ensureTracked(el, rect);
        if (d.status === "captured") continue;

        const elCx = rect.left + rect.width / 2;
        const elCy = rect.top + rect.height / 2;

        let targetTx = 0;
        let targetTy = 0;
        let targetRot = 0;
        let targetScale = 1;

        if (isOnPage) {
          const dx = cx - elCx;
          const dy = cy - elCy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radiusPx && dist > 1) {
            const norm = 1 - dist / radiusPx;
            const influence = norm * norm;
            const maxDisplace = 60 * state.strength;
            const dirX = dx / dist;
            const dirY = dy / dist;

            targetTx = dirX * influence * maxDisplace * state.mode;
            targetTy = dirY * influence * maxDisplace * state.mode;
            targetRot = (dirX * 0.5 - dirY * 0.3) * influence * 8 * state.mode;
            targetScale = 1 + influence * 0.08 * state.mode;

            d.status = "attracting";

            // ── CAPTURE if close enough ──
            if (isAttract && dist < captureRadiusPx) {
              d.status = "captured";
              d.captureIndex = captureOrder++;
              captureElement(el, d, rect);
              state.captureCount++;
              state.pulseIntensity = Math.min(state.pulseIntensity + 0.5, 1);
              continue;
            }
          } else {
            if (d.status === "attracting") d.status = "free";
          }
        } else {
          if (d.status === "attracting") d.status = "free";
        }

        // Spring physics for free/attracting
        const springK = 4 + state.smoothing * 8;
        const damping = 0.15 + state.smoothing * 0.1;
        const ax = (targetTx - d.tx) * springK;
        const ay = (targetTy - d.ty) * springK;
        d.vx = (d.vx + ax * dt) * (1 - damping);
        d.vy = (d.vy + ay * dt) * (1 - damping);
        d.tx += d.vx * dt * 60;
        d.ty += d.vy * dt * 60;
        d.rot += (targetRot - d.rot) * Math.min(springK * dt, 0.3);
        d.scale += (targetScale - d.scale) * Math.min(springK * dt, 0.3);

        const moving = Math.abs(d.tx) > 0.1 || Math.abs(d.ty) > 0.1 ||
                        Math.abs(d.rot) > 0.05 || Math.abs(d.scale - 1) > 0.001;

        if (moving) {
          el.style.transition = "none";
          el.style.transform =
            `translate(${d.tx.toFixed(2)}px, ${d.ty.toFixed(2)}px) ` +
            `rotate(${d.rot.toFixed(2)}deg) scale(${d.scale.toFixed(4)})`;
          el.style.zIndex = Math.abs(d.tx) + Math.abs(d.ty) > 10 ? "1" : "";
        } else if (d.status === "free" &&
                   Math.abs(d.tx) < 0.05 && Math.abs(d.ty) < 0.05) {
          el.style.transform = "";
          el.style.zIndex = "";
        }
      }

      raf = requestAnimationFrame(tick);
    }

    return {
      state,
      releaseAll,
      start() {
        running = true;
        lastTime = performance.now();
        tick();
      },
      update(nextConfig) {
        if ("mgStrength" in nextConfig)
          state.strength = clampUnit(Number(nextConfig.mgStrength));
        if ("mgRadius" in nextConfig)
          state.radius = clampUnit(Number(nextConfig.mgRadius));
        if ("mgSmoothing" in nextConfig)
          state.smoothing = clampUnit(Number(nextConfig.mgSmoothing));
        if ("mgMode" in nextConfig)
          state.mode = nextConfig.mgMode === "repel" ? -1 : 1;
      },
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        // Release all captured elements back to their original parents
        for (const [el, d] of tracked) {
          if (d.status === "captured") {
            releaseElement(el, d);
          }
          el.style.transform = "";
          el.style.transition = "";
          el.style.zIndex = "";
          el.style.pointerEvents = "";
        }
        tracked.clear();
      },
    };
  }

  // ── Seed Growth DOM engine ──────────────────────────────────────
  // Click to drop seeds. Canvas-based per-element rendering.
  // Each plant has a fixed root. Wind affects only upper segments.
  // Growth is segment-by-segment, not scale-based.
  function createSeedGrowthEngine(config) {
    const state = {
      cursorX: 0, cursorY: 0,
      growthSpeed: clampUnit(Number(config.sgGrowthSpeed ?? 0.5)),
      density: clampUnit(Number(config.sgDensity ?? 0.5)),
      spread: clampUnit(Number(config.sgSpread ?? 0.5)),
    };

    const MAX_GROWTHS = 50; // soft cap — oldest plants are recycled
    const growths = [];

    // Particle overlay (viewport-fixed, ephemeral)
    const pDpr = Math.min(window.devicePixelRatio || 1, 2);
    const particleCanvas = document.createElement("canvas");
    particleCanvas.id = "__html_shader_sg_particles__";
    Object.assign(particleCanvas.style, {
      position: "fixed", inset: "0",
      width: "100vw", height: "100vh",
      pointerEvents: "none", zIndex: "2147483647",
    });
    particleCanvas.width = Math.floor(innerWidth * pDpr);
    particleCanvas.height = Math.floor(innerHeight * pDpr);
    document.body.appendChild(particleCanvas);
    const pCtx = particleCanvas.getContext("2d");
    pCtx.scale(pDpr, pDpr);

    const particles = [];
    const MAX_PARTICLES = 200;

    // Seed bag cursor
    const cursorEl = document.createElement("div");
    cursorEl.id = "__html_shader_sg_cursor__";
    Object.assign(cursorEl.style, {
      position: "fixed", pointerEvents: "none",
      zIndex: "2147483647",
      width: "28px", height: "32px",
      transform: "translate(-50%, -100%)",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
    });
    cursorEl.innerHTML = `<svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 10 C6 6 10 3 14 3 C18 3 22 6 22 10" stroke="#8B6914" stroke-width="2" fill="none"/>
      <path d="M4 12 C4 10 6 9 6 9 L22 9 C22 9 24 10 24 12 L23 28 C23 30 21 31 19 31 L9 31 C7 31 5 30 5 28 Z" fill="#C4A24E" stroke="#8B6914" stroke-width="1"/>
      <circle class="__sg_bobseed" cx="10" cy="18" r="1.5" fill="#5D4E1A"/>
      <circle class="__sg_bobseed" cx="14" cy="20" r="1.5" fill="#6B5B1F"/>
      <circle class="__sg_bobseed" cx="18" cy="17" r="1.5" fill="#5D4E1A"/>
      <circle class="__sg_bobseed" cx="12" cy="23" r="1.3" fill="#6B5B1F"/>
      <circle class="__sg_bobseed" cx="16" cy="24" r="1.3" fill="#5D4E1A"/>
      <circle class="__sg_bobseed" cx="9" cy="26" r="1.2" fill="#5D4E1A"/>
      <circle class="__sg_bobseed" cx="19" cy="25" r="1.2" fill="#6B5B1F"/>
      <circle class="__sg_bobseed" cx="14" cy="27" r="1.4" fill="#5D4E1A"/>
    </svg>`;
    document.body.appendChild(cursorEl);
    const bobSeeds = cursorEl.querySelectorAll(".__sg_bobseed");
    const bobBaseCY = Array.from(bobSeeds).map((s) => parseFloat(s.getAttribute("cy")) || 20);
    let swingPhase = 0;
    let clickPulse = 0;

    // ── Segment data structure ──
    // A plant is a tree of segments. Each segment knows its depth
    // from root (0 = base), its parent, and its children.
    // Wind displacement scales with depth: root=0, tips=max.

    function generatePlant(rootX, rootY, density, spread) {
      const segments = [];
      const leaves = [];
      const maxDepth = 4 + Math.floor(density * 3);
      const spreadAngle = 0.4 + spread * 0.8;

      function grow(px, py, angle, len, depth, parentIdx, delay) {
        if (depth > maxDepth || len < 3) return;
        const segCount = 2 + Math.floor(Math.random() * 2);
        let cx = px, cy = py;
        let curAngle = angle;

        for (let s = 0; s < segCount; s++) {
          const segLen = len / segCount * (0.8 + Math.random() * 0.4);
          curAngle += (Math.random() - 0.5) * 0.5;
          // Gravity bias: tend upward for stems, lateral for branches
          if (depth === 0) curAngle += ((-Math.PI / 2) - curAngle) * 0.1;

          const nx = cx + Math.cos(curAngle) * segLen;
          const ny = cy + Math.sin(curAngle) * segLen;

          // Control points for cubic bezier (organic curve)
          const cp1x = cx + Math.cos(curAngle + 0.3) * segLen * 0.35 + (Math.random() - 0.5) * 4;
          const cp1y = cy + Math.sin(curAngle + 0.3) * segLen * 0.35 + (Math.random() - 0.5) * 4;
          const cp2x = nx + Math.cos(curAngle - 0.3) * segLen * -0.25 + (Math.random() - 0.5) * 3;
          const cp2y = ny + Math.sin(curAngle - 0.3) * segLen * -0.25 + (Math.random() - 0.5) * 3;

          const seg = {
            x1: cx, y1: cy, x2: nx, y2: ny,
            cp1x, cp1y, cp2x, cp2y,
            depth, segIndex: s,
            totalDepth: depth + s / segCount, // fractional depth for smooth wind
            thickness: Math.max(0.8, 3.5 - depth * 0.7 - s * 0.2),
            hue: 85 + Math.random() * 50,
            sat: 30 + Math.random() * 30,
            lum: 22 + depth * 5 + Math.random() * 10,
            opacity: 0.7 + Math.random() * 0.3,
            delay: delay + s * 0.08,
            parentIdx,
          };
          segments.push(seg);
          parentIdx = segments.length - 1;
          cx = nx;
          cy = ny;
        }

        // Leaves at tips and mid-branches
        if (depth >= maxDepth - 2) {
          const leafCount = 2 + Math.floor(Math.random() * 3);
          for (let l = 0; l < leafCount; l++) {
            const la = curAngle + (Math.random() - 0.5) * 1.2;
            leaves.push({
              x: cx + Math.cos(la) * (2 + Math.random() * 3),
              y: cy + Math.sin(la) * (2 + Math.random() * 3),
              rx: 2.5 + Math.random() * 3.5,
              ry: 4 + Math.random() * 4,
              angle: la * (180 / Math.PI) + (Math.random() - 0.5) * 30,
              hue: 90 + Math.random() * 55,
              sat: 45 + Math.random() * 35,
              lum: 30 + Math.random() * 25,
              opacity: 0.6 + Math.random() * 0.35,
              depth: depth + 1,
              delay: delay + segCount * 0.08 + 0.15 + l * 0.05,
              jitterPhase: Math.random() * Math.PI * 2,
            });
          }
        }

        // Sub-branches (staggered delay) — always branch generously
        const branchCount = 2 + Math.floor(density * 3);
        for (let b = 0; b < branchCount; b++) {
          if (Math.random() > 0.75 + density * 0.2) continue;
          const splitSeg = Math.floor(Math.random() * segCount);
          const splitPt = segments[segments.length - segCount + splitSeg];
          if (!splitPt) continue;
          const branchAngle = curAngle + (Math.random() - 0.5) * spreadAngle * 2.5;
          const branchLen = len * (0.35 + Math.random() * 0.3);
          const branchDelay = delay + splitSeg * 0.08 + 0.1;
          grow(splitPt.x2, splitPt.y2, branchAngle, branchLen,
               depth + 1, segments.length - segCount + splitSeg, branchDelay);
        }
      }

      // Main stems — lush but compact
      const stemCount = 2 + Math.floor(density * 2.5);
      for (let i = 0; i < stemCount; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadAngle;
        const len = 25 + spread * 40 + Math.random() * 15; // compact: 25-80px
        grow(rootX, rootY, angle, len, 0, -1, i * 0.06);
      }

      // Normalize delays so total growth fits within ~1s window
      let maxDelay = 0;
      for (const s of segments) maxDelay = Math.max(maxDelay, s.delay);
      for (const l of leaves) maxDelay = Math.max(maxDelay, l.delay);
      if (maxDelay > 0) {
        const targetDuration = 0.7; // raw delay range maps to 0-0.7
        const scale = targetDuration / maxDelay;
        for (const s of segments) s.delay *= scale;
        for (const l of leaves) l.delay *= scale;
      }

      return { segments, leaves, rootX, rootY };
    }

    // ── Per-element growth canvas ──
    function createGrowthCanvas(el) {
      const rect = el.getBoundingClientRect();
      const pad = 90; // extra space so plants aren't clipped
      const canvas = document.createElement("canvas");
      canvas.className = "__sg_growth_canvas";
      const w = rect.width + pad * 2;
      const h = rect.height + pad * 2;
      canvas.width = Math.ceil(w * pDpr);
      canvas.height = Math.ceil(h * pDpr);
      Object.assign(canvas.style, {
        position: "absolute",
        top: -pad + "px",
        left: -pad + "px",
        width: w + "px",
        height: h + "px",
        pointerEvents: "none",
        zIndex: "1",
      });

      // Ensure parent allows overflow + positioning
      const pos = getComputedStyle(el).position;
      if (pos === "static") el.style.position = "relative";
      el.style.overflow = "visible";
      el.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      ctx.scale(pDpr, pDpr);
      return { canvas, ctx, pad, w, h };
    }

    // ── Draw a plant onto its canvas ──
    function drawPlant(g, windPhase) {
      const { ctx, pad, w, h, plant } = g;
      const { segments, leaves, rootY } = plant;

      ctx.save();
      ctx.setTransform(pDpr, 0, 0, pDpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Shadow under root
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(plant.rootX + pad, plant.rootY + pad + 2, 8, 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fill();
      ctx.restore();

      // Max depth for wind scaling
      let maxTotalDepth = 1;
      for (const s of segments) maxTotalDepth = Math.max(maxTotalDepth, s.totalDepth + 1);

      // Draw segments
      for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        // Growth progress for this segment
        const segProgress = Math.max(0, Math.min((g.progress - s.delay) / 0.2, 1));
        if (segProgress <= 0) continue;
        const ep = segProgress * segProgress * (3 - 2 * segProgress); // smoothstep

        // Wind: amplitude scales with depth from root. Root=0, tips=max.
        const windFactor = s.totalDepth / maxTotalDepth;
        const windAmp = windFactor * windFactor * 3.5;
        const windX = Math.sin(windPhase * 1.3 + s.totalDepth * 0.8 + i * 0.3) * windAmp;
        const windY = Math.cos(windPhase * 1.7 + s.totalDepth * 0.5) * windAmp * 0.3;

        // Offset: root points stay fixed, tips get full wind
        const startWF = (s.totalDepth > 0.5) ? (s.totalDepth - 0.5) / maxTotalDepth : 0;
        const endWF = windFactor;
        const swx1 = windX * startWF * startWF;
        const swy1 = windY * startWF * startWF;
        const swx2 = windX * endWF * endWF;
        const swy2 = windY * endWF * endWF;

        // Interpolate drawn portion (progressive growth)
        const x1 = s.x1 + pad + swx1;
        const y1 = s.y1 + pad + swy1;
        const x2 = s.x1 + (s.x2 - s.x1) * ep + pad + swx2 * ep;
        const y2 = s.y1 + (s.y2 - s.y1) * ep + pad + swy2 * ep;
        const cx1 = s.x1 + (s.cp1x - s.x1) * ep + pad + swx1 + (swx2 - swx1) * 0.33;
        const cy1 = s.y1 + (s.cp1y - s.y1) * ep + pad + swy1 + (swy2 - swy1) * 0.33;
        const cx2 = s.x1 + (s.cp2x - s.x1) * ep + pad + swx1 + (swx2 - swx1) * 0.66;
        const cy2 = s.y1 + (s.cp2y - s.y1) * ep + pad + swy1 + (swy2 - swy1) * 0.66;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        ctx.strokeStyle = `hsla(${s.hue}, ${s.sat}%, ${s.lum}%, ${s.opacity * ep})`;
        ctx.lineWidth = s.thickness * (0.5 + ep * 0.5);
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Draw leaves
      for (const lf of leaves) {
        const lfProgress = Math.max(0, Math.min((g.progress - lf.delay) / 0.2, 1));
        if (lfProgress <= 0) continue;
        const ep = lfProgress * lfProgress;

        const windFactor = lf.depth / maxTotalDepth;
        const windAmp = windFactor * windFactor * 4;
        const wX = Math.sin(windPhase * 1.3 + lf.depth * 0.8 + lf.jitterPhase) * windAmp;
        const wY = Math.cos(windPhase * 1.7 + lf.depth * 0.5) * windAmp * 0.3;
        // Micro jitter
        const jX = Math.sin(windPhase * 5 + lf.jitterPhase * 3) * 0.6;
        const jY = Math.cos(windPhase * 6 + lf.jitterPhase * 2) * 0.4;

        const lx = lf.x + pad + wX + jX;
        const ly = lf.y + pad + wY + jY;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate((lf.angle + Math.sin(windPhase * 2 + lf.jitterPhase) * 5) * Math.PI / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, lf.rx * ep, lf.ry * ep, 0, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${lf.hue}, ${lf.sat}%, ${lf.lum}%, ${lf.opacity * ep})`;
        ctx.fill();
        // Leaf vein
        if (ep > 0.5) {
          ctx.beginPath();
          ctx.moveTo(0, -lf.ry * ep * 0.7);
          ctx.lineTo(0, lf.ry * ep * 0.7);
          ctx.strokeStyle = `hsla(${lf.hue}, ${lf.sat - 10}%, ${lf.lum - 8}%, ${0.3 * ep})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
    }

    function spawnPollen(x, y, count) {
      for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 5 + Math.random() * 25;
        const life = 0.8 + Math.random() * 1.5;
        particles.push({
          x, y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd - 5 - Math.random() * 10,
          life, maxLife: life,
          size: 1 + Math.random() * 2.5,
          hue: 50 + Math.random() * 70,
        });
      }
    }

    function createFallingSeed(x, y) {
      const seed = document.createElement("div");
      seed.className = "__sg_seed";
      Object.assign(seed.style, {
        position: "fixed",
        left: x + "px", top: y + "px",
        width: "6px", height: "8px",
        borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
        background: "radial-gradient(ellipse at 40% 30%, #8B7332, #5D4E1A)",
        pointerEvents: "none",
        zIndex: "2147483646",
        transform: "translate(-50%, -50%)",
      });
      document.body.appendChild(seed);
      return seed;
    }

    // Spawn scattered seed particles on click (visual feedback)
    function spawnSeedScatter(x, y) {
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 30 + Math.random() * 60;
        const life = 0.3 + Math.random() * 0.4;
        particles.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y - 5 + (Math.random() - 0.5) * 8,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd - 20,
          life, maxLife: life,
          size: 1.5 + Math.random() * 2,
          hue: 30 + Math.random() * 20, // brown/tan seed color
        });
      }
    }

    function dropSeed(viewX, viewY) {
      // Recycle oldest plants if at soft cap
      while (growths.length >= MAX_GROWTHS) {
        const oldest = growths.shift();
        if (oldest.canvas.parentNode) oldest.canvas.remove();
      }

      const elUnder = document.elementFromPoint(viewX, viewY);
      if (!elUnder || elUnder.closest("[id^='__html_shader']") ||
          elUnder.classList.contains("__sg_seed") ||
          elUnder.classList.contains("__sg_growth_canvas")) return;

      // Click feedback: cursor pulse + seed scatter
      clickPulse = 1.0;
      spawnSeedScatter(viewX, viewY);

      // Multiple falling seeds for visual richness
      const seedCount = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < seedCount; s++) {
        const sx = viewX + (Math.random() - 0.5) * 16;
        const seed = createFallingSeed(sx, viewY);
        const targetRect = elUnder.getBoundingClientRect();
        const landY = Math.min(viewY + 12 + Math.random() * 20, targetRect.bottom - 3);

        const delay = s * 40;
        setTimeout(() => {
          requestAnimationFrame(() => {
            seed.style.transition = "top 0.35s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.2s 0.4s";
            seed.style.top = landY + "px";
            setTimeout(() => {
              seed.style.opacity = "0";
              setTimeout(() => seed.remove(), 200);
            }, 350);
          });
        }, delay);
      }

      // Delay growth until seed lands — pollen burst at landing
      const landY2 = Math.min(viewY + 15, elUnder.getBoundingClientRect().bottom - 3);
      setTimeout(() => {
        spawnPollen(viewX, landY2, 8 + Math.floor(state.density * 8));
        startGrowth(elUnder, viewX, landY2);
      }, 300);
    }

    function startGrowth(el, viewX, viewY) {
      const rect = el.getBoundingClientRect();
      const localX = viewX - rect.left;
      const localY = viewY - rect.top;

      const plant = generatePlant(localX, localY, state.density, state.spread);
      const { canvas, ctx, pad, w, h } = createGrowthCanvas(el);

      // Compute total growth duration from max delay
      let maxDelay = 0;
      for (const s of plant.segments) maxDelay = Math.max(maxDelay, s.delay);
      for (const l of plant.leaves) maxDelay = Math.max(maxDelay, l.delay);

      growths.push({
        el, canvas, ctx, pad, w, h, plant,
        progress: 0,
        totalDuration: maxDelay + 0.3, // segments + leaf fade-in time
        done: false,
      });
    }

    // ── Main loop ──
    let running = true;
    let raf = 0;
    let lastTime = performance.now();
    let windPhase = 0;

    function tick() {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      windPhase += dt;

      // Cursor with bobbing seeds + click pulse
      swingPhase += dt * 3;
      clickPulse *= 0.88;
      const cursorScale = 1 + clickPulse * 0.15;
      cursorEl.style.left = state.cursorX + "px";
      cursorEl.style.top = state.cursorY + "px";
      cursorEl.style.transform =
        `translate(-50%, -100%) rotate(${Math.sin(swingPhase) * 3}deg) scale(${cursorScale.toFixed(3)})`;
      // Floating seed animation inside the bag
      for (let i = 0; i < bobSeeds.length; i++) {
        const bob = Math.sin(swingPhase * 1.5 + i * 1.1) * 0.8;
        bobSeeds[i].setAttribute("cy", String(bobBaseCY[i] + bob));
      }

      // Grow + redraw plants (speed maps to ~0.8s–1.5s total duration)
      const speed = 0.7 + state.growthSpeed * 0.8; // progress units per second
      for (const g of growths) {
        if (!g.done) {
          g.progress = Math.min(g.progress + speed * dt, g.totalDuration);
          if (g.progress >= g.totalDuration) g.done = true;
        }
        drawPlant(g, windPhase);
      }

      // Particles
      pCtx.save();
      pCtx.setTransform(1, 0, 0, 1, 0, 0);
      pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      pCtx.restore();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const t = p.life / p.maxLife;
        p.vy -= 8 * dt;
        p.x += p.vx * dt + Math.sin(windPhase * 3 + i) * 0.3;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size * (0.5 + t * 0.5), 0, Math.PI * 2);
        pCtx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${t * 0.7})`;
        pCtx.fill();
        if (t > 0.5) {
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          pCtx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${t * 0.1})`;
          pCtx.fill();
        }
      }

      raf = requestAnimationFrame(tick);
    }

    return {
      state, dropSeed,
      start() { running = true; lastTime = performance.now(); tick(); },
      update(nc) {
        if ("sgGrowthSpeed" in nc) state.growthSpeed = clampUnit(Number(nc.sgGrowthSpeed));
        if ("sgDensity" in nc) state.density = clampUnit(Number(nc.sgDensity));
        if ("sgSpread" in nc) state.spread = clampUnit(Number(nc.sgSpread));
      },
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        for (const g of growths) { if (g.canvas.parentNode) g.canvas.remove(); }
        growths.length = 0;
        document.querySelectorAll(".__sg_seed").forEach((s) => s.remove());
        particleCanvas.remove();
        cursorEl.remove();
      },
    };
  }

  // ── Liquid UI DOM engine ────────────────────────────────────────
  // No-persistence model: displacement is computed each frame from
  // cursor position. No velocity accumulation. Elements relax via
  // spring damping when cursor is away. Includes a cursor ring
  // indicator showing the interaction radius.
  function createLiquidEngine(config) {
    const state = {
      cursorX: -9999,
      cursorY: -9999,
      smoothX: -9999,
      smoothY: -9999,
      prevSmoothX: -9999,
      prevSmoothY: -9999,
      active: false,
      force: clampUnit(Number(config.lqForce ?? 0.5)),
      radius: clampUnit(Number(config.lqRadius ?? 0.5)),
      tension: clampUnit(Number(config.lqTension ?? 0.4)),
      damping: clampUnit(Number(config.lqDamping ?? 0.5)),
      nearCount: 0, // how many elements are currently affected
    };

    const getRadiusPx = () => 60 + state.radius * 250;

    // Per-element: current smoothed displacement + deformation
    // No velocity stored — displacement is target-driven, not force-driven
    const tracked = new Map(); // el → { tx, ty, rot, sx, sy }

    const SKIP_SELECTOR = "[id^='__html_shader']";

    function getTargetElements() {
      const all = document.body.querySelectorAll(
        "h1,h2,h3,h4,h5,h6,p,a,button,img,li,span," +
          "div,section,nav,article,header,footer,ul,ol," +
          "input,textarea,select,label,code,pre,blockquote," +
          "table,tr,td,th,figure,figcaption,svg",
      );
      const results = [];
      for (const el of all) {
        if (el.closest(SKIP_SELECTOR)) continue;
        const hasChild = el.querySelector(
          "h1,h2,h3,p,a,button,img,li,span,code,pre",
        );
        if (!hasChild || el.tagName === "LI" || el.tagName === "A") {
          results.push(el);
        }
      }
      return results;
    }

    function ensureTracked(el) {
      if (tracked.has(el)) return tracked.get(el);
      const t = { tx: 0, ty: 0, rot: 0, sx: 1, sy: 1 };
      tracked.set(el, t);
      return t;
    }

    // ── Cursor ring indicator ──
    const ring = document.createElement("div");
    ring.id = "__html_shader_lq_ring__";
    Object.assign(ring.style, {
      position: "fixed",
      pointerEvents: "none",
      zIndex: "2147483647",
      borderRadius: "50%",
      border: "1.5px solid rgba(120, 180, 255, 0.25)",
      boxShadow: "0 0 15px 2px rgba(100, 160, 255, 0.08), inset 0 0 10px rgba(100, 160, 255, 0.04)",
      transform: "translate(-50%, -50%)",
      opacity: "0",
      transition: "opacity 0.3s",
    });
    document.body.appendChild(ring);

    let running = true;
    let raf = 0;
    let lastTime = performance.now();
    let pulsePhase = 0;

    function tick() {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      pulsePhase += dt;

      const isOnPage = state.cursorX > -999 && state.active;
      const radiusPx = getRadiusPx();

      // Smooth cursor position (slight lag for premium feel)
      if (isOnPage) {
        const lr = 0.15 + state.damping * 0.1;
        state.smoothX += (state.cursorX - state.smoothX) * lr;
        state.smoothY += (state.cursorY - state.smoothY) * lr;
      }

      const cx = state.smoothX;
      const cy = state.smoothY;

      // Cursor velocity (for directional bias)
      const cvx = cx - state.prevSmoothX;
      const cvy = cy - state.prevSmoothY;
      const cspeed = Math.sqrt(cvx * cvx + cvy * cvy);
      state.prevSmoothX = cx;
      state.prevSmoothY = cy;

      // Physics params
      const maxDisp = 12 + state.force * 28; // max displacement 12-40px
      const relaxSpeed = 5 + state.tension * 15; // spring rate for return
      const dampRate = 0.1 + state.damping * 0.25;
      const neighborRange = 150 + state.radius * 100;
      const neighborStr = 0.12;

      const elements = getTargetElements();

      // ── Phase 1: compute target displacement for each element ──
      const frameData = []; // { el, t, targetTx, targetTy, ecx, ecy }
      let nearCount = 0;

      for (const el of elements) {
        const t = ensureTracked(el);
        const rect = el.getBoundingClientRect();
        const ecx = rect.left + rect.width / 2;
        const ecy = rect.top + rect.height / 2;

        let targetTx = 0;
        let targetTy = 0;

        if (isOnPage) {
          const dx = ecx - cx;
          const dy = ecy - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radiusPx && dist > 1) {
            nearCount++;
            const norm = 1 - dist / radiusPx;
            const influence = norm * norm * norm; // cubic falloff: very soft at edges

            const dirX = dx / dist;
            const dirY = dy / dist;

            // Push: radial + velocity bias
            const moveBias = Math.min(cspeed * 0.1, 0.6);
            targetTx = (dirX * maxDisp * (0.5 + moveBias * 0.5) +
                         cvx * influence * 0.4) * influence;
            targetTy = (dirY * maxDisp * (0.5 + moveBias * 0.5) +
                         cvy * influence * 0.4) * influence;
          }
        }

        frameData.push({ el, t, targetTx, targetTy, ecx, ecy });
      }
      state.nearCount = nearCount;

      // ── Phase 2: neighbor influence (soft ripple) ──
      for (let i = 0; i < frameData.length; i++) {
        const a = frameData[i];
        if (Math.abs(a.targetTx) < 0.1 && Math.abs(a.targetTy) < 0.1) continue;

        for (let j = i + 1; j < frameData.length; j++) {
          const b = frameData[j];
          const ndx = a.ecx - b.ecx;
          const ndy = a.ecy - b.ecy;
          const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
          if (ndist > neighborRange || ndist < 1) continue;

          const nInf = (1 - ndist / neighborRange) * neighborStr;
          b.targetTx += a.targetTx * nInf;
          b.targetTy += a.targetTy * nInf;
          // Slight counter-push on source
          a.targetTx -= b.targetTx * nInf * 0.3;
          a.targetTy -= b.targetTy * nInf * 0.3;
        }
      }

      // ── Phase 3: lerp current toward target, apply transforms ──
      for (const { el, t, targetTx, targetTy } of frameData) {
        // Spring toward target (or toward 0 if no target)
        const lerpRate = Math.min(relaxSpeed * dt, 0.5);
        t.tx += (targetTx - t.tx) * lerpRate;
        t.ty += (targetTy - t.ty) * lerpRate;

        // Dampen toward zero when very close
        if (Math.abs(targetTx) < 0.01 && Math.abs(targetTy) < 0.01) {
          t.tx *= (1 - dampRate);
          t.ty *= (1 - dampRate);
        }

        // Rotation from displacement direction (very subtle)
        const targetRot = t.tx * 0.08 - t.ty * 0.04;
        t.rot += (targetRot - t.rot) * lerpRate;

        // Squash/stretch from displacement magnitude
        const disp = Math.sqrt(t.tx * t.tx + t.ty * t.ty);
        const squash = Math.min(disp * 0.002, 0.04);
        const targetSx = 1 + squash;
        const targetSy = 1 - squash * 0.4;
        t.sx += (targetSx - t.sx) * lerpRate;
        t.sy += (targetSy - t.sy) * lerpRate;

        const isMoving = Math.abs(t.tx) > 0.03 || Math.abs(t.ty) > 0.03 ||
                          Math.abs(t.rot) > 0.01 ||
                          Math.abs(t.sx - 1) > 0.0005;

        if (isMoving) {
          el.style.transition = "none";
          el.style.transform =
            `translate(${t.tx.toFixed(2)}px, ${t.ty.toFixed(2)}px) ` +
            `rotate(${t.rot.toFixed(2)}deg) ` +
            `scale(${t.sx.toFixed(4)}, ${t.sy.toFixed(4)})`;
        } else {
          if (el.style.transform) el.style.transform = "";
          t.tx = 0; t.ty = 0; t.rot = 0; t.sx = 1; t.sy = 1;
        }
      }

      // ── Cursor ring indicator ──
      if (isOnPage) {
        ring.style.opacity = "1";
        const pulse = 1 + Math.sin(pulsePhase * 2.5) * 0.02;
        // Feedback: brighter + slightly larger when affecting elements
        const feedback = nearCount > 0 ? 1 : 0;
        const ringScale = pulse + feedback * 0.03;
        const ringSize = radiusPx * 2 * ringScale;
        ring.style.left = cx + "px";
        ring.style.top = cy + "px";
        ring.style.width = ringSize + "px";
        ring.style.height = ringSize + "px";
        const glowAlpha = 0.08 + feedback * 0.08;
        const borderAlpha = 0.25 + feedback * 0.15;
        ring.style.border = `1.5px solid rgba(120, 180, 255, ${borderAlpha})`;
        ring.style.boxShadow =
          `0 0 ${15 + feedback * 10}px 2px rgba(100, 160, 255, ${glowAlpha}), ` +
          `inset 0 0 10px rgba(100, 160, 255, ${glowAlpha * 0.5})`;
      } else {
        ring.style.opacity = "0";
      }

      raf = requestAnimationFrame(tick);
    }

    return {
      state,
      start() {
        running = true;
        lastTime = performance.now();
        tick();
      },
      update(nextConfig) {
        if ("lqForce" in nextConfig) state.force = clampUnit(Number(nextConfig.lqForce));
        if ("lqRadius" in nextConfig) state.radius = clampUnit(Number(nextConfig.lqRadius));
        if ("lqTension" in nextConfig) state.tension = clampUnit(Number(nextConfig.lqTension));
        if ("lqDamping" in nextConfig) state.damping = clampUnit(Number(nextConfig.lqDamping));
      },
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        for (const [el] of tracked) {
          el.style.transform = "";
          el.style.transition = "";
        }
        tracked.clear();
        ring.remove();
      },
    };
  }

  // ── Storm / Flow Field engine ───────────────────────────────────
  // Cursor = wind source. Elements are pushed cumulatively (NO return).
  // Includes storm overlay (wind streaks + vignette + lightning + debris)
  // and a Three.js tornado cursor.
  function createStormEngine(config) {
    const state = {
      cursorX: -9999, cursorY: -9999,
      smoothX: -9999, smoothY: -9999,
      prevSX: -9999, prevSY: -9999,
      active: false,
      wind: clampUnit(Number(config.stWind ?? 0.5)),
      radius: clampUnit(Number(config.stRadius ?? 0.5)),
      chaos: clampUnit(Number(config.stChaos ?? 0.4)),
    };

    const getRadiusPx = () => 80 + state.radius * 300;
    const pDpr = Math.min(window.devicePixelRatio || 1, 2);

    // Per-element: cumulative displacement + velocity (NO spring-back)
    const tracked = new Map(); // el → { tx, ty, vx, vy, rot }

    const SKIP_SELECTOR = "[id^='__html_shader']";

    function getTargetElements() {
      const all = document.body.querySelectorAll(
        "h1,h2,h3,h4,h5,h6,p,a,button,img,li,span," +
          "div,section,nav,article,header,footer,ul,ol," +
          "input,textarea,select,label,code,pre,blockquote," +
          "table,tr,td,th,figure,figcaption,svg",
      );
      const results = [];
      for (const el of all) {
        if (el.closest(SKIP_SELECTOR)) continue;
        const hasChild = el.querySelector("h1,h2,h3,p,a,button,img,li,span,code,pre");
        if (!hasChild || el.tagName === "LI" || el.tagName === "A") results.push(el);
      }
      return results;
    }

    function ensureTracked(el) {
      if (tracked.has(el)) return tracked.get(el);
      const t = { tx: 0, ty: 0, vx: 0, vy: 0, rot: 0 };
      tracked.set(el, t);
      return t;
    }

    // ── Storm overlay canvas (wind streaks + debris + lightning) ──
    const overlayCanvas = document.createElement("canvas");
    overlayCanvas.id = "__html_shader_storm_overlay__";
    Object.assign(overlayCanvas.style, {
      position: "fixed", inset: "0",
      width: "100vw", height: "100vh",
      pointerEvents: "none", zIndex: "2147483646",
    });
    overlayCanvas.width = Math.floor(innerWidth * pDpr);
    overlayCanvas.height = Math.floor(innerHeight * pDpr);
    document.body.appendChild(overlayCanvas);
    const oCtx = overlayCanvas.getContext("2d");
    oCtx.scale(pDpr, pDpr);

    // ── Vignette overlay ──
    const vignette = document.createElement("div");
    vignette.id = "__html_shader_storm_vignette__";
    Object.assign(vignette.style, {
      position: "fixed", inset: "0",
      width: "100vw", height: "100vh",
      pointerEvents: "none", zIndex: "2147483645",
      background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)",
    });
    document.body.appendChild(vignette);

    // Wind streaks
    const streaks = [];
    const MAX_STREAKS = 60;
    // Debris particles
    const debris = [];
    const MAX_DEBRIS = 80;
    // Lightning state
    let lightningTimer = 2 + Math.random() * 4;
    let lightningFlash = 0;
    let lightningBolts = [];

    function spawnStreak(windDx, windDy) {
      if (streaks.length >= MAX_STREAKS) return;
      const speed = 200 + Math.random() * 400;
      const len = 20 + Math.random() * 60;
      streaks.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: windDx * speed + (Math.random() - 0.5) * 50,
        vy: windDy * speed + (Math.random() - 0.5) * 50,
        len, life: 0.3 + Math.random() * 0.5, maxLife: 0.3 + Math.random() * 0.5,
        alpha: 0.1 + Math.random() * 0.15,
      });
    }

    function spawnDebris(x, y, windDx, windDy) {
      if (debris.length >= MAX_DEBRIS) return;
      debris.push({
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100,
        vx: windDx * (80 + Math.random() * 120) + (Math.random() - 0.5) * 40,
        vy: windDy * (80 + Math.random() * 120) + (Math.random() - 0.5) * 40 - 20,
        rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 300,
        size: 1.5 + Math.random() * 3,
        life: 1 + Math.random() * 2, maxLife: 1 + Math.random() * 2,
        hue: Math.random() > 0.5 ? 30 + Math.random() * 20 : 100 + Math.random() * 40,
      });
    }

    function generateLightningBolt(x1, y1, x2, y2, depth) {
      const bolts = [];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const segments = 6 + Math.floor(Math.random() * 6);
      let cx = x1, cy = y1;
      const points = [{ x: cx, y: cy }];

      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        cx = x1 + dx * t + (Math.random() - 0.5) * 80 * (1 - depth * 0.3);
        cy = y1 + dy * t + (Math.random() - 0.5) * 40;
        points.push({ x: cx, y: cy });

        // Branch
        if (depth < 2 && Math.random() > 0.6) {
          const bx = cx + (Math.random() - 0.5) * 120;
          const by = cy + 30 + Math.random() * 80;
          bolts.push(...generateLightningBolt(cx, cy, bx, by, depth + 1));
        }
      }

      bolts.push({ points, width: Math.max(0.5, 2.5 - depth * 0.8), alpha: 1 - depth * 0.3 });
      return bolts;
    }

    function triggerLightning() {
      const x = Math.random() * innerWidth;
      lightningBolts = generateLightningBolt(
        x, -10, x + (Math.random() - 0.5) * 200, innerHeight * (0.5 + Math.random() * 0.4), 0,
      );
      lightningFlash = 1;
    }

    let running = true;
    let raf = 0;
    let lastTime = performance.now();

    function tick() {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const isOnPage = state.cursorX > -999 && state.active;

      // Smooth cursor
      if (isOnPage) {
        state.smoothX += (state.cursorX - state.smoothX) * 0.12;
        state.smoothY += (state.cursorY - state.smoothY) * 0.12;
      }
      const cx = state.smoothX;
      const cy = state.smoothY;
      const cvx = cx - state.prevSX;
      const cvy = cy - state.prevSY;
      state.prevSX = cx;
      state.prevSY = cy;
      const cspeed = Math.sqrt(cvx * cvx + cvy * cvy);
      const radiusPx = getRadiusPx();

      // Normalized wind direction
      const windMag = Math.min(cspeed, 30);
      const windDx = windMag > 0.5 ? cvx / cspeed : 0;
      const windDy = windMag > 0.5 ? cvy / cspeed : 0;

      const maxVel = 8 + state.wind * 20;
      const dampFactor = 0.02 + (1 - state.chaos) * 0.06;
      const forceMag = 5 + state.wind * 30;

      // ── Push DOM elements (cumulative, NO return) ──
      if (isOnPage && cspeed > 1) {
        const elements = getTargetElements();
        for (const el of elements) {
          const t = ensureTracked(el);
          const rect = el.getBoundingClientRect();
          const ecx = rect.left + rect.width / 2;
          const ecy = rect.top + rect.height / 2;
          const dx = ecx - cx;
          const dy = ecy - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radiusPx && dist > 1) {
            const norm = 1 - dist / radiusPx;
            const influence = norm * norm;

            // Wind push (directional) + radial push (away from cursor)
            const radX = dx / dist;
            const radY = dy / dist;
            const fx = (windDx * 0.7 + radX * 0.3) * influence * forceMag;
            const fy = (windDy * 0.7 + radY * 0.3) * influence * forceMag;

            // Chaos: add random perturbation
            const chaosX = (Math.random() - 0.5) * state.chaos * 8 * influence;
            const chaosY = (Math.random() - 0.5) * state.chaos * 8 * influence;

            t.vx += (fx + chaosX) * dt;
            t.vy += (fy + chaosY) * dt;
          }
        }
      }

      // Integrate all tracked elements
      for (const [el, t] of tracked) {
        // Clamp velocity
        const speed = Math.sqrt(t.vx * t.vx + t.vy * t.vy);
        if (speed > maxVel) {
          t.vx = (t.vx / speed) * maxVel;
          t.vy = (t.vy / speed) * maxVel;
        }

        // Damping (natural friction, NOT spring-back)
        t.vx *= (1 - dampFactor);
        t.vy *= (1 - dampFactor);

        // Integrate position (cumulative)
        t.tx += t.vx;
        t.ty += t.vy;

        // Rotation from velocity
        const targetRot = t.vx * 0.3 + (Math.random() - 0.5) * state.chaos * 0.5;
        t.rot += (targetRot - t.rot) * 0.08;

        if (Math.abs(t.vx) > 0.01 || Math.abs(t.vy) > 0.01 ||
            Math.abs(t.tx) > 0.1 || Math.abs(t.ty) > 0.1) {
          el.style.transition = "none";
          el.style.transform =
            `translate(${t.tx.toFixed(1)}px, ${t.ty.toFixed(1)}px) rotate(${t.rot.toFixed(1)}deg)`;
        }
      }

      // ── Spawn wind streaks + debris ──
      if (isOnPage && cspeed > 2) {
        for (let i = 0; i < Math.floor(cspeed * 0.3); i++) spawnStreak(windDx, windDy);
        if (Math.random() < 0.3) spawnDebris(cx, cy, windDx, windDy);
      }

      // ── Lightning timer ──
      lightningTimer -= dt;
      if (lightningTimer <= 0) {
        triggerLightning();
        lightningTimer = 3 + Math.random() * 6;
      }
      lightningFlash *= 0.85;

      // ── Draw overlay ──
      oCtx.save();
      oCtx.setTransform(1, 0, 0, 1, 0, 0);
      oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      oCtx.restore();

      // Lightning flash
      if (lightningFlash > 0.05) {
        oCtx.save();
        oCtx.setTransform(1, 0, 0, 1, 0, 0);
        oCtx.fillStyle = `rgba(200, 210, 255, ${lightningFlash * 0.15})`;
        oCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        oCtx.restore();
      }

      // Lightning bolts
      if (lightningFlash > 0.1) {
        for (const bolt of lightningBolts) {
          if (bolt.points.length < 2) continue;
          oCtx.beginPath();
          oCtx.moveTo(bolt.points[0].x, bolt.points[0].y);
          for (let i = 1; i < bolt.points.length; i++) {
            oCtx.lineTo(bolt.points[i].x, bolt.points[i].y);
          }
          oCtx.strokeStyle = `rgba(180, 200, 255, ${bolt.alpha * lightningFlash})`;
          oCtx.lineWidth = bolt.width;
          oCtx.lineCap = "round";
          oCtx.lineJoin = "round";
          oCtx.stroke();
          // Glow
          oCtx.strokeStyle = `rgba(150, 180, 255, ${bolt.alpha * lightningFlash * 0.3})`;
          oCtx.lineWidth = bolt.width * 4;
          oCtx.stroke();
        }
      }

      // Wind streaks
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.life -= dt;
        if (s.life <= 0) { streaks.splice(i, 1); continue; }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const t = s.life / s.maxLife;
        const sLen = s.len * t;
        const angle = Math.atan2(s.vy, s.vx);
        oCtx.beginPath();
        oCtx.moveTo(s.x, s.y);
        oCtx.lineTo(s.x - Math.cos(angle) * sLen, s.y - Math.sin(angle) * sLen);
        oCtx.strokeStyle = `rgba(200, 210, 220, ${s.alpha * t})`;
        oCtx.lineWidth = 0.8;
        oCtx.stroke();
      }

      // Debris
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.life -= dt;
        if (d.life <= 0) { debris.splice(i, 1); continue; }
        d.vy += 15 * dt; // gravity
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.rot += d.rotSpeed * dt;
        const t = d.life / d.maxLife;
        oCtx.save();
        oCtx.translate(d.x, d.y);
        oCtx.rotate(d.rot * Math.PI / 180);
        oCtx.fillStyle = `hsla(${d.hue}, 40%, 45%, ${t * 0.6})`;
        oCtx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size * 0.6);
        oCtx.restore();
      }

      raf = requestAnimationFrame(tick);
    }

    return {
      state,
      start() { running = true; lastTime = performance.now(); tick(); },
      update(nc) {
        if ("stWind" in nc) state.wind = clampUnit(Number(nc.stWind));
        if ("stRadius" in nc) state.radius = clampUnit(Number(nc.stRadius));
        if ("stChaos" in nc) state.chaos = clampUnit(Number(nc.stChaos));
      },
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        for (const [el] of tracked) {
          el.style.transform = "";
          el.style.transition = "";
        }
        tracked.clear();
        overlayCanvas.remove();
        vignette.remove();
      },
    };
  }

  // ── Three.js tornado cursor ───────────────────────────────────
  function createTornadoCursor() {
    const container = document.createElement("canvas");
    container.id = "__html_shader_storm_tornado__";
    const size = 200;
    container.width = size * (window.devicePixelRatio || 1);
    container.height = size * (window.devicePixelRatio || 1);
    Object.assign(container.style, {
      position: "fixed",
      width: size + "px", height: size + "px",
      pointerEvents: "none", zIndex: "2147483647",
      transform: "translate(-50%, -50%)",
      top: "50%", left: "50%",
    });
    document.body.appendChild(container);

    let THREE = null;
    let scene, camera, rendererTjs, vortexGroup;
    let ready = false;

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => { THREE = window.THREE; initScene(); };
    document.head.appendChild(script);

    function initScene() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 4;
      camera.position.y = 0.5;

      rendererTjs = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
      rendererTjs.setSize(size, size);
      rendererTjs.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererTjs.setClearColor(0x000000, 0);

      vortexGroup = new THREE.Group();
      scene.add(vortexGroup);

      // Spiral particle rings at different heights
      for (let ring = 0; ring < 6; ring++) {
        const y = -1.2 + ring * 0.45;
        const radius = 0.15 + ring * 0.12;
        const count = 20 + ring * 8;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          pos[i * 3] = Math.cos(a) * radius + (Math.random() - 0.5) * 0.05;
          pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.15;
          pos[i * 3 + 2] = Math.sin(a) * radius + (Math.random() - 0.5) * 0.05;
        }
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
          color: ring < 3 ? 0x667788 : 0x8899aa,
          size: 0.025 + ring * 0.005,
          transparent: true,
          opacity: 0.5 + ring * 0.05,
        });
        const points = new THREE.Points(geo, mat);
        points.userData.ringY = y;
        points.userData.ringSpeed = 2 + ring * 0.5;
        vortexGroup.add(points);
      }

      // Central funnel cone
      const coneGeo = new THREE.ConeGeometry(0.08, 2.4, 12, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x556677, transparent: true, opacity: 0.15, side: THREE.DoubleSide,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = -0.1;
      vortexGroup.add(cone);

      ready = true;
    }

    return {
      update(mouseX, mouseY, intensity, time) {
        container.style.left = mouseX + "px";
        container.style.top = mouseY + "px";
        const s = 0.7 + intensity * 0.5;
        container.style.width = size * s + "px";
        container.style.height = size * s + "px";

        if (!ready) return;

        // Rotate each ring at its own speed
        for (const child of vortexGroup.children) {
          if (child.userData.ringSpeed) {
            child.rotation.y = time * child.userData.ringSpeed;
          }
        }
        vortexGroup.rotation.y = time * 0.3;

        rendererTjs.render(scene, camera);
      },
      destroy() {
        if (rendererTjs) rendererTjs.dispose();
        container.remove();
        const s = document.querySelector('script[src*="three.min.js"]');
        if (s) s.remove();
      },
    };
  }

  // ── UI Fighter engine ──────────────────────────────────────────
  // State machine: intro → select → countdown → fight → end.
  // Selection uses DOM hover highlights. Enemy is a cloneNode of the
  // selected element, rendered as actual DOM inside the arena.
  // ESC returns to selection for replay.
  function createFightingEngine(config) {
    const difficulty = clampUnit(Number(config.ftDifficulty ?? 0.4));
    const W = innerWidth;
    const H = innerHeight;
    const GROUND_Y = H - 100;
    const GRAVITY = 1200;
    const MOVE_SPEED = 250;
    const JUMP_VEL = -500;
    const ATTACK_RANGE = 70;
    const ATTACK_DMG = 8 + Math.floor(difficulty * 7);

    let phase = "intro"; // intro | select | countdown | fight | end
    let running = true;
    let raf = 0;
    let lastTime = performance.now();
    let phaseTimer = 0;
    let countdownVal = 3;
    let endMessage = "";
    let player = null;
    let enemy = null;
    let enemyClone = null; // actual DOM clone

    // ── Arena container (DOM-based, covers full screen) ──
    const arena = document.createElement("div");
    arena.id = "__html_shader_fight_arena__";
    Object.assign(arena.style, {
      position: "fixed", inset: "0", width: "100vw", height: "100vh",
      zIndex: "2147483647", overflow: "hidden",
      fontFamily: "monospace",
    });
    document.body.appendChild(arena);

    // Arena canvas for background + player + HUD
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    Object.assign(canvas.style, {
      position: "absolute", inset: "0", width: "100%", height: "100%",
      pointerEvents: "none",
    });
    arena.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // ── Top bar (for select text) ──
    const topBar = document.createElement("div");
    Object.assign(topBar.style, {
      position: "absolute", top: "0", left: "0", right: "0",
      padding: "14px 0", textAlign: "center",
      background: "rgba(0,0,0,0.85)", color: "#fff",
      fontSize: "18px", fontWeight: "bold", letterSpacing: "2px",
      fontFamily: "monospace", zIndex: "5",
      display: "none",
    });
    topBar.textContent = "SELECT YOUR OPPONENT";
    arena.appendChild(topBar);

    // ── Highlight style for hovered elements ──
    const highlightStyle = document.createElement("style");
    highlightStyle.id = "__html_shader_fight_hl__";
    highlightStyle.textContent = "";
    document.head.appendChild(highlightStyle);

    // ── Damage floats + hit effects ──
    const floats = []; // { x, y, text, color, life, maxLife }
    const impacts = []; // { x, y, life }

    function spawnFloat(x, y, text, color) {
      floats.push({ x, y, text, color, life: 0.8, maxLife: 0.8 });
    }
    function spawnImpact(x, y) {
      impacts.push({ x, y, life: 0.2 });
    }

    // ── Control legend (DOM, bottom HUD) ──
    const legend = document.createElement("div");
    Object.assign(legend.style, {
      position: "absolute", bottom: "0", left: "0", right: "0",
      display: "flex", justifyContent: "center", gap: "18px",
      paddingTop: "32px", paddingBottom: "12px",
      background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
      fontFamily: "monospace", fontSize: "11px", color: "#aaa",
      zIndex: "6", pointerEvents: "none",
      visibility: "hidden",
    });
    const controls = [
      ["A", "Move Left"], ["D", "Move Right"],
      ["Space", "Jump"], ["Click", "Attack"], ["ESC", "Exit"],
    ];
    for (const [key, label] of controls) {
      const item = document.createElement("span");
      item.innerHTML =
        `<span style="background:#333;color:#fff;padding:2px 6px;border-radius:3px;margin-right:4px;font-size:10px;">${key}</span>${label}`;
      legend.appendChild(item);
    }
    arena.appendChild(legend);

    // ── ESC confirmation modal ──
    const modal = document.createElement("div");
    Object.assign(modal.style, {
      position: "absolute", inset: "0",
      display: "none", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)",
      zIndex: "10", fontFamily: "monospace",
    });
    modal.innerHTML = `
      <div style="background:#1a1a2a;border:1px solid #444;border-radius:8px;padding:30px 40px;text-align:center;">
        <div style="color:#fff;font-size:16px;font-weight:bold;margin-bottom:20px;">ARE YOU SURE YOU WANT TO QUIT?</div>
        <div style="display:flex;gap:16px;justify-content:center;">
          <button id="__fight_quit_yes" style="background:#c44;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:13px;">YES</button>
          <button id="__fight_quit_no" style="background:#444;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:13px;">NO</button>
        </div>
      </div>`;
    arena.appendChild(modal);
    let paused = false;

    modal.querySelector("#__fight_quit_yes").addEventListener("click", (e) => {
      e.stopPropagation();
      modal.style.display = "none";
      paused = false;
      enterEnd("YOU LOSE!");
    });
    modal.querySelector("#__fight_quit_no").addEventListener("click", (e) => {
      e.stopPropagation();
      modal.style.display = "none";
      paused = false;
    });

    let hoveredEl = null;
    let hoverHandler = null;

    // ── Unified input ──
    const keys = { a: false, d: false, space: false };
    let attackQueued = false;

    function onKeyDown(e) {
      if (e.key === "a" || e.key === "A") keys.a = true;
      if (e.key === "d" || e.key === "D") keys.d = true;
      if (e.key === " ") { keys.space = true; e.preventDefault(); }
      if (e.key === "Escape") {
        e.preventDefault();
        if (phase === "fight" && !paused) {
          paused = true;
          modal.style.display = "flex";
        } else if (phase === "end" || phase === "countdown") {
          cleanupFight();
          enterSelect();
        }
      }
    }
    function onKeyUp(e) {
      if (e.key === "a" || e.key === "A") keys.a = false;
      if (e.key === "d" || e.key === "D") keys.d = false;
      if (e.key === " ") keys.space = false;
    }

    // ── Single click handler — behavior depends on phase ──
    function onGlobalClick(e) {
      // SELECT: click picks an opponent
      if (phase === "select") {
        const el = e.target;
        if (el.closest("[id^='__html_shader']")) return;
        e.preventDefault();
        e.stopPropagation();
        selectOpponent(el);
        return;
      }
      // FIGHT: click triggers attack
      if (phase === "fight") {
        attackQueued = true;
        return;
      }
      // COUNTDOWN / END / INTRO: ignore clicks
    }

    addEventListener("keydown", onKeyDown);
    addEventListener("keyup", onKeyUp);
    document.addEventListener("click", onGlobalClick, true);

    // ── Intro phase ──
    function enterIntro() {
      phase = "intro";
      phaseTimer = 0;
      arena.style.background = "rgba(0,0,0,0.4)";
      arena.style.pointerEvents = "none";
      canvas.style.display = "none";
      topBar.style.display = "none";
    }

    // ── Select phase ──
    function enterSelect() {
      phase = "select";
      phaseTimer = 0;
      arena.style.background = "transparent";
      arena.style.pointerEvents = "none";
      canvas.style.display = "none";
      topBar.style.display = "";

      // Hover highlight
      highlightStyle.textContent =
        ".__fight_hover { outline: 3px solid #4af !important; outline-offset: 2px; cursor: crosshair !important; }";

      hoverHandler = (e) => {
        if (phase !== "select") return;
        const el = e.target;
        if (el.closest("[id^='__html_shader']")) return;
        if (hoveredEl) hoveredEl.classList.remove("__fight_hover");
        hoveredEl = el;
        el.classList.add("__fight_hover");
      };

      document.addEventListener("mouseover", hoverHandler, true);
    }

    function cleanupSelect() {
      if (hoveredEl) hoveredEl.classList.remove("__fight_hover");
      hoveredEl = null;
      highlightStyle.textContent = "";
      if (hoverHandler) document.removeEventListener("mouseover", hoverHandler, true);
      hoverHandler = null;
    }

    // ── Opponent selected ──
    function selectOpponent(el) {
      cleanupSelect();
      topBar.style.display = "none";

      // Clone the DOM element
      enemyClone = el.cloneNode(true);
      enemyClone.classList.remove("__fight_hover");
      Object.assign(enemyClone.style, {
        position: "absolute",
        pointerEvents: "none",
        maxWidth: "200px",
        maxHeight: "120px",
        overflow: "hidden",
        zIndex: "3",
        transition: "none",
        boxShadow: "0 0 20px rgba(255,60,60,0.3)",
        border: "2px solid rgba(255,80,80,0.4)",
      });
      arena.appendChild(enemyClone);

      // Get enemy name
      let eName = el.tagName.toLowerCase();
      const txt = el.textContent.trim();
      if (txt.length > 0 && txt.length < 20) eName = txt.slice(0, 15);

      // Fighter data
      const cloneRect = { w: Math.min(el.offsetWidth, 200), h: Math.min(el.offsetHeight, 120) };
      player = {
        x: W * 0.25, y: GROUND_Y, w: 50, h: 70,
        vx: 0, vy: 0, hp: 100, maxHp: 100,
        grounded: true, attacking: false,
        attackTimer: 0, attackCooldown: 0, hitTimer: 0, facing: 1,
        name: "Player", color: "#4af",
      };
      enemy = {
        x: W * 0.72, y: GROUND_Y,
        w: cloneRect.w, h: cloneRect.h,
        vx: 0, vy: 0, hp: 100, maxHp: 100,
        grounded: true, attacking: false,
        attackTimer: 0, attackCooldown: 0, hitTimer: 0, facing: -1,
        name: eName, color: "#e44",
        aiTimer: 0, aiAction: "idle",
      };

      enterCountdown();
    }

    // ── Countdown ──
    function enterCountdown() {
      phase = "countdown";
      countdownVal = 3;
      phaseTimer = 0;
      arena.style.background = "";
      arena.style.pointerEvents = "auto";
      canvas.style.display = "";
    }

    function enterFight() {
      phase = "fight";
      attackQueued = false;
    }

    function enterEnd(msg) {
      phase = "end";
      endMessage = msg;
      phaseTimer = 0;
    }

    function cleanupFight() {
      if (enemyClone && enemyClone.parentNode) enemyClone.remove();
      enemyClone = null;
      player = null;
      enemy = null;
      keys.a = false; keys.d = false; keys.space = false;
      attackQueued = false;
    }

    // ── AI ──
    function updateAI(dt) {
      if (!enemy) return;
      enemy.aiTimer -= dt;
      if (enemy.aiTimer <= 0) {
        const r = Math.random();
        const ag = 0.3 + difficulty * 0.5;
        if (r < ag * 0.4) enemy.aiAction = "attack";
        else if (r < ag * 0.7) enemy.aiAction = "approach";
        else if (r < 0.85) enemy.aiAction = "retreat";
        else enemy.aiAction = "jump";
        enemy.aiTimer = 0.3 + Math.random() * 0.5;
      }

      const dx = player.x - enemy.x;
      const dist = Math.abs(dx);
      enemy.facing = dx > 0 ? 1 : -1;

      if (enemy.aiAction === "approach") {
        enemy.vx = enemy.facing * MOVE_SPEED * (0.4 + difficulty * 0.4);
      } else if (enemy.aiAction === "retreat") {
        enemy.vx = -enemy.facing * MOVE_SPEED * 0.35;
      } else if (enemy.aiAction === "attack" && dist < ATTACK_RANGE * 1.8) {
        if (enemy.attackCooldown <= 0) {
          enemy.attacking = true;
          enemy.attackTimer = 0.15;
          enemy.attackCooldown = 0.4 + (1 - difficulty) * 0.3;
        }
        enemy.vx *= 0.5;
      } else if (enemy.aiAction === "jump" && enemy.grounded) {
        enemy.vy = JUMP_VEL * 0.7;
        enemy.grounded = false;
      } else {
        enemy.vx *= 0.8;
      }
    }

    // ── Physics ──
    function updateFighter(f, dt) {
      if (!f.grounded) f.vy += GRAVITY * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.y >= GROUND_Y) { f.y = GROUND_Y; f.vy = 0; f.grounded = true; }
      f.x = Math.max(f.w / 2, Math.min(W - f.w / 2, f.x));
      if (f.attackTimer > 0) { f.attackTimer -= dt; if (f.attackTimer <= 0) f.attacking = false; }
      if (f.attackCooldown > 0) f.attackCooldown -= dt;
      if (f.hitTimer > 0) f.hitTimer -= dt;
    }

    function checkAttack(a, d) {
      if (!a.attacking || a.attackTimer < 0.1) return;
      const ax = a.x + a.facing * 35;
      if (Math.abs(ax - d.x) < ATTACK_RANGE && Math.abs(a.y - d.y) < 80) {
        const dmg = ATTACK_DMG + Math.floor(Math.random() * 5);
        d.hp = Math.max(0, d.hp - dmg);
        d.hitTimer = 0.2;
        d.vx += a.facing * 150;
        a.attackTimer = 0;
        // Damage float + impact burst
        const hitX = d.x + (Math.random() - 0.5) * 20;
        const hitY = d.y - d.h * 0.6;
        spawnFloat(hitX, hitY, (a === player ? "+" : "-") + dmg, a === player ? "#fff" : "#f55");
        spawnImpact(hitX, hitY);
      }
    }

    // ── Draw ──
    function drawArena() {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0a0a1a");
      grad.addColorStop(1, "#1a1020");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.fillStyle = "#1a1a22";
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();
    }

    function drawPlayer() {
      if (!player) return;
      ctx.save();
      const sx = player.hitTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
      const sy = player.hitTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
      ctx.translate(player.x + sx, player.y + sy);

      const c = player.hitTimer > 0 ? "#fff" : player.color;
      ctx.fillStyle = c;
      ctx.fillRect(-player.w / 2, -player.h, player.w, player.h);
      const ex = player.facing > 0 ? 8 : -18;
      ctx.fillStyle = "#111";
      ctx.fillRect(ex, -player.h + 15, 6, 6);
      ctx.fillRect(ex + 12, -player.h + 15, 6, 6);
      ctx.fillRect(ex + 2, -player.h + 28, 14, 3);

      if (player.attacking) {
        ctx.fillStyle = c;
        ctx.fillRect(player.facing * 25, -player.h + 25, player.facing * 30, 10);
        ctx.fillStyle = "#ff0";
        ctx.fillRect(player.facing * 50, -player.h + 22, 12, 16);
      }
      ctx.restore();
    }

    function positionEnemyClone() {
      if (!enemy || !enemyClone) return;
      const sx = enemy.hitTimer > 0 ? (Math.random() - 0.5) * 8 : 0;
      const sy = enemy.hitTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
      enemyClone.style.left = (enemy.x - enemy.w / 2 + sx) + "px";
      enemyClone.style.top = (enemy.y - enemy.h + sy) + "px";
      enemyClone.style.opacity = enemy.hitTimer > 0 ? "0.6" : "1";
      enemyClone.style.filter = enemy.hp < 30 ? "sepia(0.5) brightness(0.7)" : "";
    }

    function drawHUD() {
      if (!player || !enemy) return;
      const barW = Math.min(220, W * 0.22);
      const barH = 16;
      const barY = 18;

      for (const [f, bx, align] of [[player, 20, "left"], [enemy, W - 20, "right"]]) {
        const x = align === "left" ? bx : bx - barW;
        const pct = f.hp / f.maxHp;
        ctx.fillStyle = "#222";
        ctx.fillRect(x, barY, barW, barH);
        ctx.fillStyle = pct > 0.5 ? "#4c4" : pct > 0.25 ? "#cc4" : "#c44";
        ctx.fillRect(x, barY, barW * pct, barH);
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, barY, barW, barH);
        // Name
        ctx.fillStyle = "#ddd";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = align;
        ctx.fillText(
          f.name.toUpperCase(),
          align === "left" ? x : x + barW,
          barY - 4,
        );
        // HP percentage inside bar
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          Math.round(pct * 100) + "%",
          x + barW / 2,
          barY + barH - 4,
        );
      }
      ctx.fillStyle = "#555";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("VS", W / 2, barY + 12);
    }

    // ── Main loop ──
    function tick() {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      phaseTimer += dt;

      // ── INTRO ──
      if (phase === "intro") {
        // Dark flash with centered text
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        canvas.style.display = "";
        ctx.fillStyle = `rgba(0,0,0,${Math.min(phaseTimer * 2, 0.4)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 32px monospace";
        ctx.textAlign = "center";
        ctx.fillText("SELECT YOUR OPPONENT", W / 2, H / 2);
        ctx.font = "14px monospace";
        ctx.fillStyle = "#888";
        ctx.fillText("Click any element on the page", W / 2, H / 2 + 30);

        if (phaseTimer > 1.2) {
          enterSelect();
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      // ── SELECT ──
      if (phase === "select") {
        // No canvas drawing — page is visible, top bar shows
        raf = requestAnimationFrame(tick);
        return;
      }

      // ── COUNTDOWN ──
      if (phase === "countdown") {
        if (phaseTimer >= 1) { phaseTimer = 0; countdownVal--; }
        if (countdownVal <= 0 && phaseTimer >= 0.5) enterFight();

        drawArena();
        drawPlayer();
        positionEnemyClone();
        drawHUD();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 72px monospace";
        ctx.textAlign = "center";
        const label = countdownVal > 0 ? String(countdownVal) : "FIGHT!";
        const scale = 1 + Math.max(0, 0.3 - phaseTimer) * 2;
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.scale(scale, scale);
        ctx.fillText(label, 0, 0);
        ctx.restore();

        raf = requestAnimationFrame(tick);
        return;
      }

      // ── FIGHT ──
      if (phase === "fight" && !paused) {
        player.vx = 0;
        if (keys.a) player.vx = -MOVE_SPEED;
        if (keys.d) player.vx = MOVE_SPEED;
        if (keys.space && player.grounded) { player.vy = JUMP_VEL; player.grounded = false; }
        if (attackQueued && player.attackCooldown <= 0) {
          player.attacking = true;
          player.attackTimer = 0.15;
          player.attackCooldown = 0.25;
        }
        attackQueued = false;
        player.facing = enemy.x > player.x ? 1 : -1;

        updateAI(dt);
        updateFighter(player, dt);
        updateFighter(enemy, dt);
        checkAttack(player, enemy);
        checkAttack(enemy, player);

        if (enemy.hp <= 0) enterEnd("YOU WIN!");
        if (player.hp <= 0) enterEnd("YOU LOSE!");
      }

      // Draw (fight + end)
      drawArena();
      drawPlayer();
      positionEnemyClone();
      drawHUD();

      // ── Damage floats ──
      for (let i = floats.length - 1; i >= 0; i--) {
        const f = floats[i];
        f.life -= dt;
        if (f.life <= 0) { floats.splice(i, 1); continue; }
        const t = f.life / f.maxLife;
        f.y -= 40 * dt;
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = f.color.replace(")", `, ${t})`).replace("rgb", "rgba").replace("#", "");
        // Handle hex colors
        const alpha = t;
        ctx.globalAlpha = alpha;
        ctx.fillText(f.text, f.x, f.y);
        ctx.globalAlpha = 1;
      }

      // ── Impact bursts ──
      for (let i = impacts.length - 1; i >= 0; i--) {
        const imp = impacts[i];
        imp.life -= dt;
        if (imp.life <= 0) { impacts.splice(i, 1); continue; }
        const t = imp.life / 0.2;
        const r = 15 * (1 - t) + 5;
        ctx.beginPath();
        ctx.arc(imp.x, imp.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${t * 0.5})`;
        ctx.fill();
        // Rays
        for (let j = 0; j < 6; j++) {
          const a = (j / 6) * Math.PI * 2 + t * 2;
          const rx = imp.x + Math.cos(a) * r * 1.5;
          const ry = imp.y + Math.sin(a) * r * 1.5;
          ctx.beginPath();
          ctx.moveTo(imp.x, imp.y);
          ctx.lineTo(rx, ry);
          ctx.strokeStyle = `rgba(255, 220, 100, ${t * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // ── Control legend visibility ──
      legend.style.visibility = (phase === "fight" || phase === "countdown") ? "visible" : "hidden";

      if (phase === "end") {
        ctx.fillStyle = `rgba(0,0,0,${Math.min(phaseTimer * 0.5, 0.55)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = endMessage.includes("WIN") ? "#4f4" : "#f44";
        ctx.font = "bold 56px monospace";
        ctx.textAlign = "center";
        ctx.fillText(endMessage, W / 2, H / 2 - 10);
        if (phaseTimer > 1) {
          ctx.font = "14px monospace";
          ctx.fillStyle = "#aaa";
          ctx.fillText("Press ESC to select a new opponent", W / 2, H / 2 + 35);
        }
      }

      raf = requestAnimationFrame(tick);
    }

    return {
      state: { difficulty },
      start() { running = true; lastTime = performance.now(); enterIntro(); tick(); },
      update() {},
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        removeEventListener("keydown", onKeyDown);
        removeEventListener("keyup", onKeyUp);
        document.removeEventListener("click", onGlobalClick, true);
        cleanupSelect();
        cleanupFight();
        highlightStyle.remove();
        arena.remove();
      },
    };
  }

  // ── Three.js horseshoe magnet cursor ──────────────────────────
  function createMagnetCursor() {
    const container = document.createElement("canvas");
    container.id = "__html_shader_mg_cursor__";
    const size = 160;
    container.width = size * (window.devicePixelRatio || 1);
    container.height = size * (window.devicePixelRatio || 1);
    Object.assign(container.style, {
      position: "fixed",
      width: size + "px",
      height: size + "px",
      pointerEvents: "none",
      zIndex: "2147483647",
      transform: "translate(-50%, -50%)",
      top: "50%",
      left: "50%",
    });
    document.body.appendChild(container);

    let THREE = null;
    let scene, camera, rendererTjs, magnetGroup;
    let ready = false;
    let prevMX = 0;
    let prevMY = 0;
    let tiltX = 0;
    let tiltY = 0;

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => {
      THREE = window.THREE;
      initScene();
    };
    document.head.appendChild(script);

    function initScene() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.z = 4;

      rendererTjs = new THREE.WebGLRenderer({
        canvas: container, alpha: true, antialias: true,
      });
      rendererTjs.setSize(size, size);
      rendererTjs.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererTjs.setClearColor(0x000000, 0);

      magnetGroup = new THREE.Group();
      scene.add(magnetGroup);

      // ── Build horseshoe magnet from primitives ──

      // U-shape body: curved torus segment
      const bodyGeo = new THREE.TorusGeometry(0.6, 0.15, 16, 32, Math.PI);
      const bodyMat = new THREE.MeshBasicMaterial({
        color: 0x888888, transparent: true, opacity: 0.9,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.z = Math.PI; // open side down
      magnetGroup.add(body);

      // Red pole (left leg)
      const redGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.35, 16);
      const redMat = new THREE.MeshBasicMaterial({ color: 0xdd3333 });
      const redPole = new THREE.Mesh(redGeo, redMat);
      redPole.position.set(-0.6, -0.17, 0);
      magnetGroup.add(redPole);

      // Blue pole (right leg)
      const blueGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.35, 16);
      const blueMat = new THREE.MeshBasicMaterial({ color: 0x3355dd });
      const bluePole = new THREE.Mesh(blueGeo, blueMat);
      bluePole.position.set(0.6, -0.17, 0);
      magnetGroup.add(bluePole);

      // Glow ring (subtle halo)
      const glowGeo = new THREE.TorusGeometry(0.85, 0.03, 8, 48, Math.PI);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x6688ff, transparent: true, opacity: 0.3,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.rotation.z = Math.PI;
      magnetGroup.add(glow);

      // Field line particles around the poles
      const pCount = 40;
      const pGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        const a = (i / pCount) * Math.PI;
        const r = 0.7 + Math.random() * 0.4;
        positions[i * 3] = Math.cos(a + Math.PI) * r;
        positions[i * 3 + 1] = Math.sin(a + Math.PI) * r * 0.6 - 0.3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x88aaff, size: 0.03, transparent: true, opacity: 0.5,
      });
      const fieldParticles = new THREE.Points(pGeo, pMat);
      magnetGroup.add(fieldParticles);

      ready = true;
    }

    return {
      update(mouseX, mouseY, strength, mode, pulse, time, captureCount) {
        container.style.left = mouseX + "px";
        container.style.top = mouseY + "px";

        // Scale with strength + pulse + captured element count
        const captureBoost = Math.min((captureCount || 0) * 0.02, 0.3);
        const s = 0.8 + strength * 0.3 + pulse * 0.2 + captureBoost;
        container.style.width = size * s + "px";
        container.style.height = size * s + "px";

        if (!ready) return;

        // Tilt based on mouse movement direction
        const dmx = mouseX - prevMX;
        const dmy = mouseY - prevMY;
        prevMX = mouseX;
        prevMY = mouseY;
        tiltY += (dmx * 0.003 - tiltY) * 0.1;
        tiltX += (-dmy * 0.003 - tiltX) * 0.1;

        // Vibration when holding many elements
        const vibeAmp = Math.min((captureCount || 0) * 0.005, 0.06);
        const vibeX = Math.sin(time * 25) * vibeAmp;
        const vibeY = Math.cos(time * 31) * vibeAmp;

        magnetGroup.rotation.x = tiltX + Math.sin(time * 1.5) * 0.05 + vibeY;
        magnetGroup.rotation.y = tiltY + vibeX;
        magnetGroup.rotation.z = mode < 0 ? Math.PI : 0;

        // Glow brightens with captures
        if (magnetGroup.children[3]) {
          magnetGroup.children[3].material.opacity =
            0.3 + Math.min((captureCount || 0) * 0.05, 0.4) + pulse * 0.2;
        }

        rendererTjs.render(scene, camera);
      },
      destroy() {
        if (rendererTjs) rendererTjs.dispose();
        container.remove();
        const s = document.querySelector('script[src*="three.min.js"]');
        if (s) s.remove();
      },
    };
  }

  // ── Three.js black hole cursor overlay ─────────────────────────
  function createBlackholeCursor(getState) {
    const container = document.createElement("canvas");
    container.id = "__html_shader_bh_cursor__";
    const size = 200;
    container.width = size * (window.devicePixelRatio || 1);
    container.height = size * (window.devicePixelRatio || 1);
    Object.assign(container.style, {
      position: "fixed",
      width: size + "px",
      height: size + "px",
      pointerEvents: "none",
      zIndex: "2147483647",
      transform: "translate(-50%, -50%)",
      top: "50%",
      left: "50%",
    });
    document.body.appendChild(container);

    let THREE = null;
    let scene, camera, rendererTjs, ring, core, particles;
    let ready = false;

    // Load Three.js from CDN
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => {
      THREE = window.THREE;
      initScene();
    };
    document.head.appendChild(script);

    function initScene() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 3;

      rendererTjs = new THREE.WebGLRenderer({
        canvas: container,
        alpha: true,
        antialias: true,
      });
      rendererTjs.setSize(size, size);
      rendererTjs.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererTjs.setClearColor(0x000000, 0);

      // Event horizon — dark sphere
      const coreGeo = new THREE.SphereGeometry(0.35, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      core = new THREE.Mesh(coreGeo, coreMat);
      scene.add(core);

      // Accretion ring — torus
      const ringGeo = new THREE.TorusGeometry(0.7, 0.06, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff8833,
        transparent: true,
        opacity: 0.85,
      });
      ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.45;
      scene.add(ring);

      // Outer glow ring
      const glowGeo = new THREE.TorusGeometry(0.85, 0.03, 12, 64);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.4,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.rotation.x = Math.PI * 0.45;
      scene.add(glow);

      // Particles — small dots orbiting
      const particleCount = 60;
      const pGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const a = (i / particleCount) * Math.PI * 2;
        const r = 0.5 + Math.random() * 0.5;
        positions[i * 3] = Math.cos(a) * r;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
        positions[i * 3 + 2] = Math.sin(a) * r;
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xffaa44,
        size: 0.04,
        transparent: true,
        opacity: 0.7,
      });
      particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      ready = true;
    }

    return {
      update(mouseX, mouseY, strength, time, glowPulse) {
        // Position canvas at cursor
        container.style.left = mouseX + "px";
        container.style.top = mouseY + "px";

        // Scale based on strength + glow pulse
        const pulse = glowPulse || 0;
        const s = 0.7 + strength * 0.6 + pulse * 0.4;
        container.style.width = size * s + "px";
        container.style.height = size * s + "px";

        if (!ready) return;

        // Animate ring rotation
        ring.rotation.z = time * 0.8;
        particles.rotation.y = time * 0.6;
        particles.rotation.x = Math.sin(time * 0.3) * 0.1;

        // Glow pulse — brighten ring on absorption
        ring.material.opacity = 0.85 + pulse * 0.15;
        ring.material.color.setHex(
          pulse > 0.1 ? 0xffaa55 : 0xff8833,
        );

        rendererTjs.render(scene, camera);
      },
      destroy() {
        if (rendererTjs) rendererTjs.dispose();
        container.remove();
        // Clean up Three.js global if we loaded it
        const s = document.querySelector(
          'script[src*="three.min.js"]',
        );
        if (s) s.remove();
      },
    };
  }

  if (window.__htmlShaderStop) window.__htmlShaderStop();

  const engineKinds = ["fragment", "roll", "blackhole", "fireburn", "magnetic", "seedgrowth", "liquid", "storm", "fighting"];
  const config =
    typeof rawConfig === "string"
      ? { engine: "fragment", fragSrc: rawConfig, rollProgress: 1 }
      : {
          engine: engineKinds.includes(rawConfig?.engine)
            ? rawConfig.engine
            : "fragment",
          fragSrc: String(rawConfig?.fragSrc || ""),
          rollProgress: clampUnit(Number(rawConfig?.rollProgress ?? 1)),
          strength: clampUnit(Number(rawConfig?.strength ?? 0.5)),
          radius: clampUnit(Number(rawConfig?.radius ?? 0.4)),
          speed: clampUnit(Number(rawConfig?.speed ?? 0.5)),
          spin: clampUnit(Number(rawConfig?.spin ?? 0.3)),
          fbIntensity: clampUnit(Number(rawConfig?.fbIntensity ?? 0.6)),
          fbRadius: clampUnit(Number(rawConfig?.fbRadius ?? 0.4)),
          fbBurnspeed: clampUnit(Number(rawConfig?.fbBurnspeed ?? 0.5)),
          fbParticles: clampUnit(Number(rawConfig?.fbParticles ?? 0.6)),
          mgStrength: clampUnit(Number(rawConfig?.mgStrength ?? 0.5)),
          mgRadius: clampUnit(Number(rawConfig?.mgRadius ?? 0.5)),
          mgSmoothing: clampUnit(Number(rawConfig?.mgSmoothing ?? 0.5)),
          mgMode: rawConfig?.mgMode === "repel" ? "repel" : "attract",
          sgGrowthSpeed: clampUnit(Number(rawConfig?.sgGrowthSpeed ?? 0.5)),
          sgDensity: clampUnit(Number(rawConfig?.sgDensity ?? 0.5)),
          sgSpread: clampUnit(Number(rawConfig?.sgSpread ?? 0.5)),
          lqForce: clampUnit(Number(rawConfig?.lqForce ?? 0.5)),
          lqRadius: clampUnit(Number(rawConfig?.lqRadius ?? 0.5)),
          lqTension: clampUnit(Number(rawConfig?.lqTension ?? 0.4)),
          lqDamping: clampUnit(Number(rawConfig?.lqDamping ?? 0.5)),
          stWind: clampUnit(Number(rawConfig?.stWind ?? 0.5)),
          stRadius: clampUnit(Number(rawConfig?.stRadius ?? 0.5)),
          stChaos: clampUnit(Number(rawConfig?.stChaos ?? 0.4)),
          ftDifficulty: clampUnit(Number(rawConfig?.ftDifficulty ?? 0.4)),
        };

  // ════════════════════════════════════════════════════════════════
  // BLACK HOLE — DOM-based engine (no WebGL, no drawElement)
  // ════════════════════════════════════════════════════════════════
  if (config.engine === "blackhole") {
    const engine = createBlackholeEngine(config);
    const bhCursor = createBlackholeCursor(() => engine.state);

    // Hide native cursor
    const cursorStyle = document.createElement("style");
    cursorStyle.id = "__html_shader_bh_style__";
    cursorStyle.textContent = "* { cursor: none !important; }";
    document.head.appendChild(cursorStyle);

    const startTime = performance.now();

    const onMouse = (e) => {
      engine.state.cursorX = e.clientX;
      engine.state.cursorY = e.clientY;
    };
    addEventListener("mousemove", onMouse);

    // Animate the Three.js cursor in sync with the engine loop
    const bhFrame = () => {
      if (!engine.state) return;
      bhCursor.update(
        engine.state.smoothX,
        engine.state.smoothY,
        engine.state.strength,
        (performance.now() - startTime) / 1000,
        engine.state.glowPulse,
      );
      requestAnimationFrame(bhFrame);
    };

    engine.start();
    requestAnimationFrame(bhFrame);

    const stop = () => {
      removeEventListener("mousemove", onMouse);
      engine.destroy();
      bhCursor.destroy();
      cursorStyle.remove();
      delete window.__htmlShaderStop;
      delete window.__htmlShaderUpdate;
    };

    window.__htmlShaderStop = stop;
    window.__htmlShaderUpdate = (nextConfig) => {
      if (!nextConfig) return;
      engine.update(nextConfig);
    };
    return null;
  }

  // ════════════════════════════════════════════════════════════════
  // FIRE BURN — DOM-based engine (no WebGL, no drawElement)
  // ════════════════════════════════════════════════════════════════
  if (config.engine === "fireburn") {
    const engine = createFireBurnEngine(config);

    // Custom cursor
    const cursorStyle = document.createElement("style");
    cursorStyle.id = "__html_shader_fb_style__";
    cursorStyle.textContent = "* { cursor: none !important; }";
    document.head.appendChild(cursorStyle);

    // Hover-driven — no click required
    const onMouseMove = (e) => {
      if (!engine.state.active) {
        engine.state.active = true;
        engine.state.prevX = e.clientX;
        engine.state.prevY = e.clientY;
      }
      engine.state.cursorX = e.clientX;
      engine.state.cursorY = e.clientY;
    };
    const onMouseLeave = () => {
      engine.state.active = false;
      engine.state.cursorX = -9999;
      engine.state.cursorY = -9999;
    };
    addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    engine.start();

    const stop = () => {
      removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      engine.destroy();
      cursorStyle.remove();
      delete window.__htmlShaderStop;
      delete window.__htmlShaderUpdate;
    };

    window.__htmlShaderStop = stop;
    window.__htmlShaderUpdate = (nextConfig) => {
      if (!nextConfig) return;
      engine.update(nextConfig);
    };
    return null;
  }

  // ════════════════════════════════════════════════════════════════
  // MAGNETIC FIELD — DOM-based engine (no WebGL, no drawElement)
  // ════════════════════════════════════════════════════════════════
  if (config.engine === "magnetic") {
    const engine = createMagneticFieldEngine(config);
    const mgCursor = createMagnetCursor();

    const cursorStyle = document.createElement("style");
    cursorStyle.id = "__html_shader_mg_style__";
    cursorStyle.textContent = "* { cursor: none !important; }";
    document.head.appendChild(cursorStyle);

    const startTime = performance.now();

    const onMouseMove = (e) => {
      if (!engine.state.active) {
        engine.state.active = true;
        engine.state.smoothX = e.clientX;
        engine.state.smoothY = e.clientY;
      }
      engine.state.cursorX = e.clientX;
      engine.state.cursorY = e.clientY;
    };
    const onMouseLeave = () => {
      engine.state.active = false;
      engine.state.cursorX = -9999;
      engine.state.cursorY = -9999;
    };
    // Space to release all captured elements
    const onKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        engine.releaseAll();
      }
    };
    addEventListener("mousemove", onMouseMove);
    addEventListener("keydown", onKeyDown);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    engine.start();

    const mgFrame = () => {
      if (!engine.state) return;
      mgCursor.update(
        engine.state.smoothX,
        engine.state.smoothY,
        engine.state.strength,
        engine.state.mode,
        engine.state.pulseIntensity,
        (performance.now() - startTime) / 1000,
        engine.state.captureCount,
      );
      requestAnimationFrame(mgFrame);
    };
    requestAnimationFrame(mgFrame);

    const stop = () => {
      removeEventListener("mousemove", onMouseMove);
      removeEventListener("keydown", onKeyDown);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      engine.releaseAll();
      // Wait a frame for release springs to start, then destroy
      setTimeout(() => {
        engine.destroy();
        mgCursor.destroy();
        cursorStyle.remove();
      }, 50);
      delete window.__htmlShaderStop;
      delete window.__htmlShaderUpdate;
    };

    window.__htmlShaderStop = stop;
    window.__htmlShaderUpdate = (nextConfig) => {
      if (!nextConfig) return;
      engine.update(nextConfig);
    };
    return null;
  }

  // ════════════════════════════════════════════════════════════════
  // SEED GROWTH — DOM-based engine (no WebGL, no drawElement)
  // ════════════════════════════════════════════════════════════════
  if (config.engine === "seedgrowth") {
    const engine = createSeedGrowthEngine(config);

    const cursorStyle = document.createElement("style");
    cursorStyle.id = "__html_shader_sg_style__";
    cursorStyle.textContent = "* { cursor: none !important; }";
    document.head.appendChild(cursorStyle);

    const onMouseMove = (e) => {
      engine.state.cursorX = e.clientX;
      engine.state.cursorY = e.clientY;
    };
    const onClick = (e) => {
      engine.dropSeed(e.clientX, e.clientY);
    };
    addEventListener("mousemove", onMouseMove);
    addEventListener("click", onClick);

    engine.start();

    const stop = () => {
      removeEventListener("mousemove", onMouseMove);
      removeEventListener("click", onClick);
      engine.destroy();
      cursorStyle.remove();
      delete window.__htmlShaderStop;
      delete window.__htmlShaderUpdate;
    };

    window.__htmlShaderStop = stop;
    window.__htmlShaderUpdate = (nextConfig) => {
      if (!nextConfig) return;
      engine.update(nextConfig);
    };
    return null;
  }

  // ════════════════════════════════════════════════════════════════
  // LIQUID UI — DOM-based soft-body engine (no WebGL, no canvas)
  // ════════════════════════════════════════════════════════════════
  if (config.engine === "liquid") {
    const engine = createLiquidEngine(config);

    const onMouseMove = (e) => {
      if (!engine.state.active) {
        engine.state.active = true;
        engine.state.prevCursorX = e.clientX;
        engine.state.prevCursorY = e.clientY;
      }
      engine.state.cursorX = e.clientX;
      engine.state.cursorY = e.clientY;
    };
    const onMouseLeave = () => {
      engine.state.active = false;
      engine.state.cursorX = -9999;
      engine.state.cursorY = -9999;
    };
    addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    engine.start();

    const stop = () => {
      removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      engine.destroy();
      delete window.__htmlShaderStop;
      delete window.__htmlShaderUpdate;
    };

    window.__htmlShaderStop = stop;
    window.__htmlShaderUpdate = (nextConfig) => {
      if (!nextConfig) return;
      engine.update(nextConfig);
    };
    return null;
  }

  // ════════════════════════════════════════════════════════════════
  // STORM — DOM-based flow field + canvas overlay + Three.js tornado
  // ════════════════════════════════════════════════════════════════
  if (config.engine === "storm") {
    const engine = createStormEngine(config);
    const tornado = createTornadoCursor();

    const cursorStyle = document.createElement("style");
    cursorStyle.id = "__html_shader_storm_style__";
    cursorStyle.textContent = "* { cursor: none !important; }";
    document.head.appendChild(cursorStyle);

    const startTime = performance.now();

    const onMouseMove = (e) => {
      if (!engine.state.active) {
        engine.state.active = true;
        engine.state.smoothX = e.clientX;
        engine.state.smoothY = e.clientY;
        engine.state.prevSX = e.clientX;
        engine.state.prevSY = e.clientY;
      }
      engine.state.cursorX = e.clientX;
      engine.state.cursorY = e.clientY;
    };
    const onMouseLeave = () => {
      engine.state.active = false;
      engine.state.cursorX = -9999;
      engine.state.cursorY = -9999;
    };
    addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    engine.start();

    // Tornado animation loop
    const tornadoFrame = () => {
      if (!engine.state) return;
      tornado.update(
        engine.state.smoothX,
        engine.state.smoothY,
        engine.state.wind,
        (performance.now() - startTime) / 1000,
      );
      requestAnimationFrame(tornadoFrame);
    };
    requestAnimationFrame(tornadoFrame);

    const stop = () => {
      removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      engine.destroy();
      tornado.destroy();
      cursorStyle.remove();
      delete window.__htmlShaderStop;
      delete window.__htmlShaderUpdate;
    };

    window.__htmlShaderStop = stop;
    window.__htmlShaderUpdate = (nextConfig) => {
      if (!nextConfig) return;
      engine.update(nextConfig);
    };
    return null;
  }

  // ════════════════════════════════════════════════════════════════
  // UI FIGHTER — canvas-based game overlay
  // ════════════════════════════════════════════════════════════════
  if (config.engine === "fighting") {
    const engine = createFightingEngine(config);
    engine.start();

    const stop = () => {
      engine.destroy();
      delete window.__htmlShaderStop;
      delete window.__htmlShaderUpdate;
    };

    window.__htmlShaderStop = stop;
    window.__htmlShaderUpdate = () => {};
    return null;
  }

  // ════════════════════════════════════════════════════════════════
  // FRAGMENT / ROLL — drawElement + WebGL pipeline (unchanged)
  // ════════════════════════════════════════════════════════════════
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.id = "__html_shader_source__";
  sourceCanvas.setAttribute("layoutsubtree", "");
  Object.assign(sourceCanvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "0",
    opacity: "1",
    pointerEvents: "auto",
    layoutSubtree: "layout",
  });
  sourceCanvas.style.setProperty("layout-subtree", "layout");

  const wrapper = document.createElement("div");
  wrapper.id = "__html_shader_wrapper__";
  Object.assign(wrapper.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    overflow: "auto",
    pointerEvents: "auto",
    background: getComputedStyle(document.body).backgroundColor || "#fff",
  });

  const originalChildren = Array.from(document.body.childNodes);
  for (const node of originalChildren) wrapper.appendChild(node);
  sourceCanvas.appendChild(wrapper);
  document.body.appendChild(sourceCanvas);

  const occluder = document.createElement("div");
  occluder.id = "__html_shader_occluder__";
  Object.assign(occluder.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483646",
    pointerEvents: "none",
    backgroundColor: "#fdf6e3",
    backgroundImage:
      "linear-gradient(rgba(120, 106, 80, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(120, 106, 80, 0.06) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    backgroundPosition: "-1px -1px",
  });
  document.body.appendChild(occluder);

  const canvas = document.createElement("canvas");
  canvas.id = "__html_shader_root__";
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483647",
  });
  document.body.appendChild(canvas);

  const scrollState = { left: wrapper.scrollLeft, top: wrapper.scrollTop };
  let restored = false;

  const restoreDom = () => {
    if (restored) return;
    restored = true;
    scrollState.left = wrapper.scrollLeft;
    scrollState.top = wrapper.scrollTop;
    for (const node of Array.from(wrapper.childNodes))
      document.body.appendChild(node);
    canvas.remove();
    occluder.remove();
    sourceCanvas.remove();
    window.scrollTo(scrollState.left, scrollState.top);
  };

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const sctx = sourceCanvas.getContext("2d");
  if (!sctx) {
    restoreDom();
    return "2D canvas unavailable";
  }

  const gl = canvas.getContext("webgl2", {
    premultipliedAlpha: true,
    alpha: true,
  });
  if (!gl) {
    restoreDom();
    return "WebGL2 unavailable";
  }

  let renderer;
  try {
    if (config.engine === "roll") {
      renderer = createRollRenderer(gl, sourceCanvas, config);
    } else {
      renderer = createFragmentRenderer(gl, sourceCanvas, config);
    }
  } catch (e) {
    restoreDom();
    return `Shader error: ${e.message}`;
  }

  const getRollScrollMetrics = () => {
    const maxScrollTop = Math.max(
      wrapper.scrollHeight - wrapper.clientHeight,
      1,
    );
    return { maxScrollTop };
  };

  const getRollProgressFromScroll = () => {
    const { maxScrollTop } = getRollScrollMetrics();
    const ratio = Math.min(Math.max(wrapper.scrollTop / maxScrollTop, 0), 1);
    return 0.1 + ratio * 0.9;
  };

  const syncRollFromScroll = () => {
    if (config.engine !== "roll") return;
    renderer.update({ rollProgress: getRollProgressFromScroll() });
  };

  const setScrollFromRollProgress = (progress) => {
    if (config.engine !== "roll") {
      renderer.update({ rollProgress: progress });
      return;
    }
    const clamped = Math.min(Math.max(Number(progress) || 0, 0), 1);
    const { maxScrollTop } = getRollScrollMetrics();
    const ratio = clamped <= 0.1 ? 0 : (clamped - 0.1) / 0.9;
    wrapper.scrollTop = ratio * maxScrollTop;
    renderer.update({ rollProgress: getRollProgressFromScroll() });
  };

  const resize = () => {
    const width = Math.floor(innerWidth * dpr);
    const height = Math.floor(innerHeight * dpr);
    canvas.width = width;
    canvas.height = height;
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    renderer.resize(width, height);
    if (config.engine === "roll") {
      renderer.update({ rollProgress: getRollProgressFromScroll() });
    }
  };
  resize();
  addEventListener("resize", resize);

  if (config.engine === "roll") {
    renderer.update({
      rollProgress: config.rollProgress,
      animateFrom: 1,
      time: 0,
    });
  }
  setScrollFromRollProgress(config.rollProgress);

  const onWheel = (e) => {
    wrapper.scrollTop += e.deltaY;
    wrapper.scrollLeft += e.deltaX;
    syncRollFromScroll();
    e.preventDefault();
  };
  const onKey = (e) => {
    const step = 40;
    if (e.key === "ArrowDown") wrapper.scrollTop += step;
    else if (e.key === "ArrowUp") wrapper.scrollTop -= step;
    else if (e.key === "PageDown") wrapper.scrollTop += innerHeight * 0.9;
    else if (e.key === "PageUp") wrapper.scrollTop -= innerHeight * 0.9;
    else if (e.key === "Home") wrapper.scrollTop = 0;
    else if (e.key === "End") wrapper.scrollTop = wrapper.scrollHeight;
    else return;
    syncRollFromScroll();
    e.preventDefault();
  };
  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("keydown", onKey);
  wrapper.addEventListener("scroll", syncRollFromScroll, { passive: true });

  const start = performance.now();
  let raf = 0;
  let stopped = false;
  let warmupFrames = 2;
  let snapshotMisses = 0;

  const isPaintRecordMiss = (error) =>
    error instanceof DOMException &&
    error.name === "InvalidStateError" &&
    typeof error.message === "string" &&
    error.message.includes("No cached paint record");

  const captureSnapshot = () => {
    sctx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);

    if (sctx.drawElementImage) {
      try {
        sctx.drawElementImage(wrapper, 0, 0);
        snapshotMisses = 0;
        return true;
      } catch (error) {
        if (!isPaintRecordMiss(error) || !sctx.drawElement) throw error;
      }
    }

    if (sctx.drawElement) {
      try {
        sctx.drawElement(wrapper, 0, 0);
        snapshotMisses = 0;
        return true;
      } catch (error) {
        if (!isPaintRecordMiss(error)) throw error;
        snapshotMisses += 1;
        if (snapshotMisses <= 5) {
          console.warn(
            "[html-shader] paint record not ready yet, retrying",
            snapshotMisses,
          );
        }
        return false;
      }
    }

    return false;
  };

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    removeEventListener("resize", resize);
    removeEventListener("wheel", onWheel);
    removeEventListener("keydown", onKey);
    wrapper.removeEventListener("scroll", syncRollFromScroll);
    renderer.destroy();
    restoreDom();
    delete window.__htmlShaderStop;
    delete window.__htmlShaderUpdate;
  };

  const frame = () => {
    if (stopped) return;
    if (warmupFrames > 0) {
      warmupFrames -= 1;
      raf = requestAnimationFrame(frame);
      return;
    }

    try {
      if (!captureSnapshot()) {
        raf = requestAnimationFrame(frame);
        return;
      }
    } catch (e) {
      console.error("[html-shader] snapshot failed", e);
      stop();
      return;
    }

    renderer.render(
      (performance.now() - start) / 1000,
      canvas.width,
      canvas.height,
    );
    raf = requestAnimationFrame(frame);
  };

  window.__htmlShaderStop = stop;
  window.__htmlShaderUpdate = (nextConfig) => {
    if (!nextConfig) return;
    if ("rollProgress" in nextConfig) {
      setScrollFromRollProgress(nextConfig.rollProgress);
      return;
    }
    renderer.update(nextConfig);
  };
  raf = requestAnimationFrame(frame);
  return null;
}

function updateShaderConfigInPage(nextConfig) {
  if (window.__htmlShaderUpdate) window.__htmlShaderUpdate(nextConfig);
}

function removeShaderInPage() {
  if (window.__htmlShaderStop) window.__htmlShaderStop();
  const prev = document.getElementById("__html_shader_root__");
  if (prev) prev.remove();
}
