# HTML in Canvas Exploration

> Notes on the experimental `CanvasRenderingContext2D.drawElement()` API, based on [tomasferrerasdev/try-html-in-canvas](https://github.com/tomasferrerasdev/try-html-in-canvas).

---

## What is it

`drawElement()` is an experimental Chrome Canvas API that rasterizes a live DOM subtree into a `<canvas>` bitmap. Once the DOM is a bitmap, you can bind it as a WebGL texture and run arbitrary shaders over it — turning any web page into a post-processable surface while keeping the underlying DOM interactive.

The reference project is a Chrome extension that snapshots the current page and applies built-in presets (blur, swirl, invert, chromatic aberration, wave, pixelate, 3D roll) or custom GLSL fragment shaders.

**Status:** experimental, Chrome-only, behind `chrome://flags/#canvas-draw-element`. Not in any shipping spec. API shape may change.

---

## How it works

1. **Wrap the DOM.** A content script moves all `<body>` children into a `<canvas layoutsubtree>` wrapper. The `layoutsubtree` attribute lets the canvas lay out and render real DOM as its content.
2. **Rasterize per frame.** Each `requestAnimationFrame`, call `ctx.drawElement(wrapper)` — the browser paints the current DOM (animations, video, hover states, form values and all) into the canvas bitmap.
3. **Upload to WebGL2.** The 2D canvas is bound as a texture in a WebGL2 program.
4. **Run a shader.** Either a fullscreen-triangle fragment shader or a subdivided mesh with vertex deformation. Standard uniforms: `uTex`, `vUv`, `uTime`, `uResolution`.
5. **Forward input.** Because `<body>` is now empty, scroll and keyboard events must be re-routed to the wrapper so the page stays interactive underneath the effect.

**How it differs from normal DOM rendering**

| Normal DOM | `drawElement()` in canvas |
|---|---|
| Browser paints DOM straight to the screen via the compositor. | Browser paints the DOM into a canvas bitmap you control. |
| You can't intercept pixels — CSS filters/transforms are the only knob. | You get the bitmap as a GPU texture and can run arbitrary shaders on it. |
| Layout, hit-testing, and input "just work." | Reparenting breaks `position: fixed`, viewport scroll, and code reading `document.body.children`. |
| Updates are continuous and free. | You re-rasterize each frame — heavier than normal rendering, but still live. |
| `html2canvas` / `foreignObject` are static, lossy, and CORS-tainted. | `drawElement()` is pixel-accurate, live, and same-origin clean. |

---

## Possibilities

**Page-level visual effects.** Real post-processing on live, interactive pages: bloom, depth-of-field, film grain, CRT, chromatic aberration, color grading via LUTs, dithering, halftone. "Liquid glass" backdrops that *actually* sample what's behind them at full quality, instead of approximating with `backdrop-filter: blur()`.

**Transitions and route changes.** Page-peel, page-curl, paper-tear, ink-bleed, dissolve, liquid morph between routes — using the *current* page as a texture, not a pre-captured screenshot. Shader-based View Transitions with arbitrary GLSL.

**3D and spatial UI.** Map a real, scrolling, interactive web page onto a 3D mesh: a curved monitor, a book page, a folding card. WebXR surfaces that are actual DOM (forms, video, charts) rather than rasterized screenshots.

**Data-driven and generative.** Heatmap or x-ray overlays on dashboards without touching the component tree. Audio-reactive UIs feeding an analyser node into a uniform. Scroll-driven cinematic effects on a normal React app.

**Tooling and dev experience.** Live shader playgrounds where the "canvas" is your actual app. Accessibility simulators (color blindness, low vision, motion blur) layered over a real page. Visual diff debugging by shader-diffing two DOM textures.

**Game-like and creative.** "Break the page" Easter eggs: shatter, melt, suck-into-a-black-hole. Marketing microsites with motion that today require Three.js + a baked screenshot.

**Capture / export.** Higher-fidelity "save as image / video" of a live page than `html2canvas` can produce, because the bitmap is the browser's own paint.

---

## Constraints

**Availability**
- Chrome-only, behind a flag. Zero Safari/Firefox today.
- API shape may change before it ships. Unusable in production for a general audience without a hard fallback.

**DOM semantics break**
- Reparenting `<body>` children breaks `position: fixed`, `100vh`, sticky headers, viewport-based intersection observers, and any script iterating `document.body.children`.
- Scroll, wheel, and keyboard events must be manually forwarded.
- Focus management, text selection, drag-and-drop, and IME composition can misbehave because visible pixels and hit-test targets diverge.

**Accessibility**
- Screen readers read the DOM, not the canvas — fine *if* you don't break the tree, dangerous if the shader visually reorders or hides content.
- Shader effects bypass `prefers-reduced-motion` unless you explicitly check it.
- A shader can silently destroy WCAG color-contrast ratios that your CSS carefully met.
- Hit-testing under a 3D-deformed page is wrong: clicks land where the *flat* DOM is, not where the *visually deformed* pixel is. Anything beyond a flat fullscreen shader needs custom raycasting.

**Performance**
- Every frame does a full layout + paint + raster + GPU upload + shader pass — strictly more work than normal rendering.
- Cost scales with viewport size and DPR. 4K at 2× DPR is ~33M pixels per frame.
- Janks the main thread; can't be offloaded to a worker.
- Battery and thermals on laptops/phones — continuous rAF + WebGL is a known drain.

**Cross-origin and security**
- Cross-origin iframes likely taint the canvas or are skipped, same as `drawImage` rules.
- Third-party widgets (Stripe Elements, reCAPTCHA, embedded YouTube) may break or be excluded.
- Pixel readback (`readPixels`, `toDataURL`) inherits all canvas-tainting rules.

**Correctness gaps**
- Native UI not in the DOM (PDF viewer, native scrollbars, autofill dropdowns) won't appear.
- Compositor-driven CSS (`will-change`, certain `backdrop-filter` combos, cross-context `mix-blend-mode`) may render differently than on screen.
- Compositor-interpolated animations get sampled once per rAF — micro-stutter is possible.

**Developer ergonomics**
- DevTools' element picker points at DOM that is no longer where you see it.
- E2E tests (Playwright, Cypress) clicking by visible coordinates will miss.
- No standard React/Vue integration — wire rAF, WebGL, and DOM reparenting by hand.

**Rule of thumb:** ship the normal DOM, feature-detect `ctx.drawElement`, enable the shader path only as a progressive enhancement. Treat the shader as decoration, not as your rendering strategy.

---

## Experiment Ideas

### Micro-interactions

- **Liquid button press.** On `:active`, the button and a small radius around it deform like a water droplet — pulled into a meniscus, snap back with a spring. Radial displacement shader with a `uPressure` uniform. The `<button>` still works normally; the shader sells the squish.
- **Magnetic link hover.** Links bend nearby text toward the cursor like iron filings around a magnet. The shader samples a vector field centered on `uMouse` and warps `vUv`. Falls off with distance. No DOM mutation — underline, focus ring, and click target stay put.
- **Ink-bleed form validation.** On invalid submit, the field's pixels bleed red into the surrounding paper like ink on a napkin. Noise-modulated diffusion shader with a `uBleed` uniform animating 0→1 over ~600ms.
- **Toast that condenses out of the page.** New toasts don't slide in — pixels in the corner "boil" and coalesce into the toast shape, like condensation forming. Noise + threshold shader masked to the toast's bounding box. Dismissal evaporates upward.
- **Tab switch as a paper-fold.** Tab content swaps via a fold along the seam between old and new tab. Two snapshots, a hinged mesh, perspective deform, ~250ms. The DOM has already swapped underneath.

### Experimental UI

- **Shader-driven dark mode.** Run a color-grading LUT shader over the whole page. Ship "sepia," "high-contrast," "night," "color-blind sim," and "1995 CRT" as user preferences without touching a single component. Toggle is instant — only the post-process pipeline changes.
- **X-ray dashboard layer.** Hold a modifier key and the dashboard becomes a heatmap of values that exceed thresholds. The shader receives a small data texture (one pixel per metric) and tints regions accordingly. No need to rewrite every chart to add an "anomaly" mode.
- **Focus spotlight.** Everything except a small radius around the focused element is desaturated and dimmed. Spotlight animates between bounding rects as Tab moves focus. Great for screencasts, onboarding tours, and focus-ring debugging.
- **Time-scrub debugging overlay.** Dev-only: record the last N seconds of `drawElement()` snapshots into a ring buffer of textures. Drag a timeline to scrub *visually* through recent DOM states — a flight recorder for UI bugs.

### Cursor-based

- **Cursor as a lens.** The cursor carries a circular region that runs a different shader: magnifier, blur, eyedropper, "what would this look like in dark mode" preview, real-time contrast-ratio readout. Follows the pointer with a spring lag.
- **Drag-to-tear.** Click and drag on a card and the pixels tear along the drag path like wet paper, revealing what's underneath. SDF shader cuts the texture along the path and curls the torn edges. The card leaves the DOM only when the tear completes — accidental tears spring back.
- **Gravity well cursor.** The cursor is a small black hole. Pixels within a radius are pulled radially inward and compressed; far pixels are untouched. Mass-based easing so dense regions resist more than whitespace.
- **Brush-reveal.** The page loads in a stylized state (low-poly, posterized, blurred). The cursor is a brush that paints the real page back in wherever it moves. Persistent mask texture; final shader lerps between stylized and real snapshots.

### Immersive

- **The page as a curved monitor.** Map the entire app onto a slightly curved cylindrical surface, ~5° of curvature, with a faint vignette and scanline shader. Scrolling still works via input forwarding. Pure ambience — but a SaaS dashboard suddenly feels like a cockpit.
- **Page-as-poster, peel to navigate.** Routes stacked like posters on a wall. Navigation isn't a router push — you grab a corner and peel the current page off, revealing the next underneath. The route swap happens at 50% peel. Beautiful on touch.
- **Underwater mode.** Toggle "underwater" and the app gets slow caustics, blue-green grading, gentle wave displacement, bubbles drifting up. Pointer movement creates ripples. Useless. Delightful.
- **WebXR spatial workspace.** Place multiple live web pages as floating panels in 3D space — not screenshots, *actual interactive DOM* sampled per frame and textured onto quads. A real spatial browser for dashboards, docs, and chat side-by-side. The use case where the trade-offs are most worth it.
- **Memory fog.** Sections of a long article get progressively hazier and desaturated as you scroll past, like memories fading. A scroll-position-driven mask feeds the shader. Scrolling back up "remembers" them sharply again.
- **Shatter on error.** On a catastrophic client error, the current page literally shatters into glass shards that fall off the bottom of the viewport, then the error boundary fades in underneath. Voronoi shader + simple shard physics. Turns your worst UX moment into something memorable.
- **Audio-reactive landing page.** Background music feeds an analyser node into a `uAudio` uniform. The hero section breathes, ripples, and color-shifts in time. Unlike a `<canvas>` hero, the *real* hero text and CTA are doing the dancing — fully selectable, fully accessible, fully clickable.

---

**The pattern across all of these:** the DOM remains the source of truth and stays interactive; the shader is a *lens* over it. That's the sweet spot for `drawElement()` — anywhere you'd otherwise have reached for a baked screenshot, a parallel `<canvas>`, or "we can't do that on the web."

## Recommended Direction

Based on exploration, the most promising directions are:

1. Snow / Sand wipe interaction
- Strong visual feedback
- Simple but impactful
- Good starting experiment

2. Distortion / Lens interaction
- Unique and futuristic
- High micro-interaction value

3. Particle-based UI
- Aligns with previous experiments (sphere, fireball)
- Scalable into system design

---

## Suggested First Prototype

Start with:

**Snow wipe interaction**

Reason:
- Easy to validate html-in-canvas capability
- Strong visual payoff
- Low complexity compared to others