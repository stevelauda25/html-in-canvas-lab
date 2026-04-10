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
  if (preset.kind === "roll") {
    presetHintEl.innerHTML =
      "Requires <code>chrome://flags/#canvas-draw-element</code>. This preset uses a built-in WebGL mesh pass with live <code>uProgress</code> control.";
  } else if (preset.kind === "blackhole") {
    presetHintEl.innerHTML =
      "Requires <code>chrome://flags/#canvas-draw-element</code>. Cursor becomes a gravitational singularity. Adjust <code>strength</code>, <code>radius</code>, <code>speed</code>, <code>spin</code> below.";
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

function buildApplyConfig() {
  const preset = getPreset();
  return {
    engine: preset.kind,
    fragSrc: shaderEl.value,
    rollProgress: getRollProgress(),
    ...getBhValues(),
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

  const engineKinds = ["fragment", "roll", "blackhole"];
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
