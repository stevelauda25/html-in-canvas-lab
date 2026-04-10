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
    source: `// Built-in Black Hole preset.
// The cursor acts as a gravitational singularity.
// The page is pulled toward it with radial distortion and spiral twist.
// A 3D black hole with accretion ring follows the cursor.
//
// Engine uniforms:
//   uCursor     cursor position in UV space
//   uStrength   gravitational pull intensity
//   uRadius     area of influence
//   uSpin       spiral/vortex twist amount
//   uTex        live drawElement() page snapshot
//   uTime       elapsed time
//   uResolution viewport size in device pixels`,
  },
  fireburn: {
    kind: "fireburn",
    source: `// Built-in Fire Burn preset.
// Click and drag to emit fire from the cursor.
// Elements under fire take progressive burn damage and disintegrate.
// No WebGL — pure DOM + Canvas 2D particle system.
//
// Controls:
//   Intensity    fire particle brightness and size
//   Spread       area of effect around cursor
//   Burn speed   how fast elements take damage
//   Particles    particle density multiplier`,
  },
  magnetic: {
    kind: "magnetic",
    source: `// Built-in Magnetic Field preset.
// The cursor acts as a magnet — DOM elements are attracted or repelled.
// No elements are removed. Layout deforms smoothly and springs back.
// A 3D horseshoe magnet follows the cursor.
//
// Controls:
//   Strength    pull/push force
//   Radius      area of influence
//   Smoothing   easing speed
//   Mode        attract / repel`,
  },
  seedgrowth: {
    kind: "seedgrowth",
    source: `// Built-in Seed Growth preset.
// Click to drop seeds. Seeds land on DOM elements and grow
// organic vine/branch structures via animated SVG paths.
// Growth wraps around elements and stays attached.
//
// Controls:
//   Growth speed   how fast vines extend
//   Density        branching complexity
//   Spread         how far vines reach`,
  },
};

const DEFAULT_PRESET = "blur";
const ROLL_DEFAULT_PROGRESS = 0.1;

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const shaderEl = $("shader");
const presetEl = $("preset");
const presetHintEl = $("preset_hint");
const rollControlsEl = $("roll_controls");
const rollProgressEl = $("roll_progress");
const rollProgressValueEl = $("roll_progress_value");
const bhControlsEl = $("blackhole_controls");
const bhStrengthEl = $("bh_strength");
const bhStrengthValueEl = $("bh_strength_value");
const bhRadiusEl = $("bh_radius");
const bhRadiusValueEl = $("bh_radius_value");
const bhSpeedEl = $("bh_speed");
const bhSpeedValueEl = $("bh_speed_value");
const bhSpinEl = $("bh_spin");
const bhSpinValueEl = $("bh_spin_value");
const mgControlsEl = $("magnetic_controls");
const mgStrengthEl = $("mg_strength");
const mgStrengthValueEl = $("mg_strength_value");
const mgRadiusEl = $("mg_radius");
const mgRadiusValueEl = $("mg_radius_value");
const mgSmoothingEl = $("mg_smoothing");
const mgSmoothingValueEl = $("mg_smoothing_value");
const mgModeEl = $("mg_mode");
const mgModeValueEl = $("mg_mode_value");
const sgControlsEl = $("seedgrowth_controls");
const sgGrowthSpeedEl = $("sg_growth_speed");
const sgGrowthSpeedValueEl = $("sg_growth_speed_value");
const sgDensityEl = $("sg_density");
const sgDensityValueEl = $("sg_density_value");
const sgSpreadEl = $("sg_spread");
const sgSpreadValueEl = $("sg_spread_value");
const fbControlsEl = $("fireburn_controls");
const fbIntensityEl = $("fb_intensity");
const fbIntensityValueEl = $("fb_intensity_value");
const fbRadiusEl = $("fb_radius");
const fbRadiusValueEl = $("fb_radius_value");
const fbBurnspeedEl = $("fb_burnspeed");
const fbBurnspeedValueEl = $("fb_burnspeed_value");
const fbParticlesEl = $("fb_particles");
const fbParticlesValueEl = $("fb_particles_value");
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

function getRollProgress() {
  return clamp01(Number(rollProgressEl.value));
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function setStatus(message) {
  statusEl.textContent = message || "";
}

function setRollProgressLabel() {
  rollProgressValueEl.textContent = getRollProgress().toFixed(2);
}

function syncPresetUi() {
  const preset = getPreset();
  shaderEl.value = preset.source;
  shaderEl.readOnly = preset.kind !== "fragment";
  editorEl.classList.toggle("is-readonly", preset.kind !== "fragment");
  rollControlsEl.hidden = preset.kind !== "roll";
  bhControlsEl.hidden = preset.kind !== "blackhole";
  fbControlsEl.hidden = preset.kind !== "fireburn";
  mgControlsEl.hidden = preset.kind !== "magnetic";
  sgControlsEl.hidden = preset.kind !== "seedgrowth";
  if (preset.kind === "roll") {
    presetHintEl.innerHTML =
      "Requires <code>chrome://flags/#canvas-draw-element</code>. This preset uses a built-in WebGL mesh pass with live <code>uProgress</code> control.";
  } else if (preset.kind === "blackhole") {
    presetHintEl.innerHTML =
      "Requires <code>chrome://flags/#canvas-draw-element</code>. Cursor becomes a gravitational singularity. Adjust <code>strength</code>, <code>radius</code>, <code>speed</code>, <code>spin</code> below.";
  } else if (preset.kind === "fireburn") {
    presetHintEl.innerHTML =
      "Click and drag to shoot fire. Elements burn progressively and disintegrate. Adjust <code>intensity</code>, <code>radius</code>, <code>burn speed</code>, <code>particles</code> below.";
  } else if (preset.kind === "magnetic") {
    presetHintEl.innerHTML =
      "Cursor acts as a magnet. Elements are attracted or repelled smoothly. Adjust <code>strength</code>, <code>radius</code>, <code>smoothing</code>, and toggle <code>attract/repel</code> below.";
  } else if (preset.kind === "seedgrowth") {
    presetHintEl.innerHTML =
      "Click to drop seeds. Organic vines grow on elements where seeds land. Adjust <code>growth speed</code>, <code>density</code>, <code>spread</code> below.";
  } else {
    presetHintEl.innerHTML =
      "Requires <code>chrome://flags/#canvas-draw-element</code>. Fragment presets expose <code>uTex</code>, <code>uTime</code>, <code>uResolution</code>, <code>vUv</code>.";
  }
  syncHighlight();
}

function getBhValues() {
  return {
    strength: clamp01(Number(bhStrengthEl.value)),
    radius: clamp01(Number(bhRadiusEl.value)),
    speed: clamp01(Number(bhSpeedEl.value)),
    spin: clamp01(Number(bhSpinEl.value)),
  };
}

function getFbValues() {
  return {
    fbIntensity: clamp01(Number(fbIntensityEl.value)),
    fbRadius: clamp01(Number(fbRadiusEl.value)),
    fbBurnspeed: clamp01(Number(fbBurnspeedEl.value)),
    fbParticles: clamp01(Number(fbParticlesEl.value)),
  };
}

function getMgValues() {
  return {
    mgStrength: clamp01(Number(mgStrengthEl.value)),
    mgRadius: clamp01(Number(mgRadiusEl.value)),
    mgSmoothing: clamp01(Number(mgSmoothingEl.value)),
    mgMode: mgModeEl.value === "repel" ? "repel" : "attract",
  };
}

function getSgValues() {
  return {
    sgGrowthSpeed: clamp01(Number(sgGrowthSpeedEl.value)),
    sgDensity: clamp01(Number(sgDensityEl.value)),
    sgSpread: clamp01(Number(sgSpreadEl.value)),
  };
}

function buildApplyConfig() {
  const preset = getPreset();
  return {
    engine: preset.kind,
    fragSrc: shaderEl.value,
    rollProgress: getRollProgress(),
    ...getBhValues(),
    ...getFbValues(),
    ...getMgValues(),
    ...getSgValues(),
  };
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
rollProgressEl.value = String(ROLL_DEFAULT_PROGRESS);
setRollProgressLabel();
syncPresetUi();

presetEl.addEventListener("change", () => {
  setStatus("");
  syncPresetUi();
});

rollProgressEl.addEventListener("input", async () => {
  setRollProgressLabel();
  if (getPreset().kind !== "roll" || appState.appliedEngine !== "roll") return;
  try {
    await inject(updateShaderConfigInPage, [
      { rollProgress: getRollProgress() },
    ]);
    setStatus("");
  } catch (e) {
    setStatus(String(e));
  }
});

function syncBhLabels() {
  bhStrengthValueEl.textContent = clamp01(Number(bhStrengthEl.value)).toFixed(2);
  bhRadiusValueEl.textContent = clamp01(Number(bhRadiusEl.value)).toFixed(2);
  bhSpeedValueEl.textContent = clamp01(Number(bhSpeedEl.value)).toFixed(2);
  bhSpinValueEl.textContent = clamp01(Number(bhSpinEl.value)).toFixed(2);
}

for (const el of [bhStrengthEl, bhRadiusEl, bhSpeedEl, bhSpinEl]) {
  el.addEventListener("input", async () => {
    syncBhLabels();
    if (
      getPreset().kind !== "blackhole" ||
      appState.appliedEngine !== "blackhole"
    )
      return;
    try {
      await inject(updateShaderConfigInPage, [getBhValues()]);
      setStatus("");
    } catch (e) {
      setStatus(String(e));
    }
  });
}
syncBhLabels();

function syncFbLabels() {
  fbIntensityValueEl.textContent = clamp01(Number(fbIntensityEl.value)).toFixed(2);
  fbRadiusValueEl.textContent = clamp01(Number(fbRadiusEl.value)).toFixed(2);
  fbBurnspeedValueEl.textContent = clamp01(Number(fbBurnspeedEl.value)).toFixed(2);
  fbParticlesValueEl.textContent = clamp01(Number(fbParticlesEl.value)).toFixed(2);
}

for (const el of [fbIntensityEl, fbRadiusEl, fbBurnspeedEl, fbParticlesEl]) {
  el.addEventListener("input", async () => {
    syncFbLabels();
    if (
      getPreset().kind !== "fireburn" ||
      appState.appliedEngine !== "fireburn"
    )
      return;
    try {
      await inject(updateShaderConfigInPage, [getFbValues()]);
      setStatus("");
    } catch (e) {
      setStatus(String(e));
    }
  });
}
syncFbLabels();

function syncMgLabels() {
  mgStrengthValueEl.textContent = clamp01(Number(mgStrengthEl.value)).toFixed(2);
  mgRadiusValueEl.textContent = clamp01(Number(mgRadiusEl.value)).toFixed(2);
  mgSmoothingValueEl.textContent = clamp01(Number(mgSmoothingEl.value)).toFixed(2);
  mgModeValueEl.textContent = mgModeEl.value;
}

for (const el of [mgStrengthEl, mgRadiusEl, mgSmoothingEl, mgModeEl]) {
  el.addEventListener(el.tagName === "SELECT" ? "change" : "input", async () => {
    syncMgLabels();
    if (
      getPreset().kind !== "magnetic" ||
      appState.appliedEngine !== "magnetic"
    )
      return;
    try {
      await inject(updateShaderConfigInPage, [getMgValues()]);
      setStatus("");
    } catch (e) {
      setStatus(String(e));
    }
  });
}
syncMgLabels();

function syncSgLabels() {
  sgGrowthSpeedValueEl.textContent = clamp01(Number(sgGrowthSpeedEl.value)).toFixed(2);
  sgDensityValueEl.textContent = clamp01(Number(sgDensityEl.value)).toFixed(2);
  sgSpreadValueEl.textContent = clamp01(Number(sgSpreadEl.value)).toFixed(2);
}

for (const el of [sgGrowthSpeedEl, sgDensityEl, sgSpreadEl]) {
  el.addEventListener("input", async () => {
    syncSgLabels();
    if (
      getPreset().kind !== "seedgrowth" ||
      appState.appliedEngine !== "seedgrowth"
    )
      return;
    try {
      await inject(updateShaderConfigInPage, [getSgValues()]);
      setStatus("");
    } catch (e) {
      setStatus(String(e));
    }
  });
}
syncSgLabels();

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

  const engineKinds = ["fragment", "roll", "blackhole", "fireburn", "magnetic", "seedgrowth"];
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
