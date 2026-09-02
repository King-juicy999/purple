# 003 — Pause hero Three.js rAF loop when off-screen

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: HIGH
- **Category**: 5 (Performance)
- **Estimated scope**: 1 file (js/hero.js)

## Problem

**rAF loop runs continuously even when hero is not visible** (`js/hero.js:259-313`):
```javascript
// js/hero.js:259-313 — current
function animate(time) {
  requestAnimationFrame(animate);  // ALWAYS schedules next frame

  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  state.time += deltaTime;

  // ... all animation logic runs every frame ...

  renderer.render(scene, camera);  // GPU work every frame
}

requestAnimationFrame(animate);  // Starts immediately on load
```

The hero section is only visible at the top of the page. Once user scrolls down, the canvas is off-screen but:
- `requestAnimationFrame` keeps firing (60fps)
- `renderer.render()` submits GPU commands every frame
- Mouse/scroll handlers still update state
- Idle animation (lines 304-310) runs perpetually

This wastes CPU/GPU/battery, especially on mobile. Per AUDIT.md: "CSS (and WAAPI) beat rAF-based JS under load — use CSS for predetermined motion, JS/springs for dynamic and gesture-driven motion." While Three.js requires rAF, it should pause when not needed.

## Target

**Add IntersectionObserver to pause/resume loop** (`js/hero.js`):
```javascript
// target — add at top of initHero, after scene setup
let animationFrameId = null;
let isVisible = true;

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    isVisible = entry.isIntersecting;
    if (isVisible && !animationFrameId) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    }
    // If not visible, the current frame completes but doesn't schedule next
  });
}, { rootMargin: '100px', threshold: 0.01 });  // Start slightly before entering

heroObserver.observe(heroSection);

// Modify animate function:
function animate(time) {
  animationFrameId = null;  // Clear ID so observer can restart

  if (!isVisible) return;  // Exit early, don't schedule next

  animationFrameId = requestAnimationFrame(animate);
  // ... rest of animation logic ...
}
```

**Also pause on page visibility change** (already partially handled in `main.js:31-33` but hero doesn't listen):
```javascript
// target — add in initHero
function handleVisibilityChange() {
  if (document.hidden) {
    isVisible = false;
  } else if (isHeroInViewport()) {
    isVisible = true;
    if (!animationFrameId) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    }
  }
}
document.addEventListener('visibilitychange', handleVisibilityChange);
```

**Idle animation** (`js/hero.js:304-310`) — only run when visible AND user hasn't scrolled:
```javascript
// target
if (isVisible && scroll < 0.05 && !state.prefersReducedMotion) {
  // idle animation
}
```

## Repo conventions to follow

- `utils.js` exports `createScrollObserver` — can reuse for IntersectionObserver
- `main.js` already listens for `visibilitychange` on document — hero should too
- Cleanup pattern: returned function removes listeners/observers
- `prefersReducedMotion` already tracked in `state` — respect it

## Steps

1. **Add `isVisible` and `animationFrameId` state variables** in `initHero` (after `state` object, ~line 216)

2. **Create IntersectionObserver** for `heroSection` with `rootMargin: '100px'` (start rendering slightly before entering viewport)

3. **Modify `animate` function**:
   - Set `animationFrameId = null` at start
   - Early return if `!isVisible`
   - Schedule next frame at end only if visible

4. **Add `visibilitychange` listener** to pause when tab hidden

5. **Update `cleanup` function** to:
   - Disconnect `heroObserver`
   - Remove `visibilitychange` listener
   - Cancel pending `animationFrameId` if any

6. **Gate idle animation** behind `isVisible` check

## Boundaries

- Do NOT change Three.js scene setup, materials, or geometry
- Do NOT modify `js/main.js` (it handles page-level visibility for other purposes)
- Do NOT change scroll-driven animation logic — only gate the render loop
- Observer `rootMargin: '100px'` ensures smooth entry — no pop-in

## Verification

- **Mechanical**: No console errors. Memory stable over 5 minutes.
- **Feel check**:
  - Load page, wait for hero to render — confirm ribbon animates
  - Scroll down past hero (hero completely off-screen):
    - Open DevTools Performance tab, record 10 seconds
    - Confirm NO `requestAnimationFrame` frames from hero
    - Confirm GPU time drops to near zero for this tab
  - Scroll back up to hero:
    - Ribbon resumes smoothly (no jump)
    - Mouse parallax works immediately
  - Switch tab away, wait 5s, switch back:
    - Hero resumes (if in viewport)
  - Toggle `prefers-reduced-motion`:
    - Hero pauses idle animation (already works)
    - rAF loop still runs but with minimal work — verify it pauses when off-screen
  - Mobile test (or DevTools device toolbar):
    - Scroll off-screen, confirm no battery drain
- **Done when**:
  - `requestAnimationFrame` stops firing when hero off-screen
  - `renderer.render()` not called when off-screen
  - Resume is instant and smooth when scrolling back
  - Cleanup disposes observer and listeners
  - Page visibility change respected