# 002 — Fix testimonials carousel interruptibility

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: HIGH
- **Category**: 4 (Interruptibility)
- **Estimated scope**: 2 files (js/testimonials.js, css/main.css)

## Problem

**1. `isAnimating` flag blocks all interaction** (`js/testimonials.js:28-31`):
```javascript
// js/testimonials.js:28-31 — current
function goToSlide(index, direction = 'next') {
  if (isAnimating) return;  // BLOCKS rapid clicks entirely
  // ...
}
```

Per AUDIT.md: "CSS transitions retarget from the current state mid-animation; keyframes restart from zero. Anything triggered rapidly or reversible mid-motion must use transitions or springs." The flag prevents retargeting — user clicks are ignored during animation.

**2. `setTimeout` cleanup is fragile** (`js/testimonials.js:66-80`):
```javascript
// js/testimonials.js:66-80 — current
setTimeout(() => {
  currentTestimonial.classList.remove('is-active');
  currentTestimonial.style.transform = '';
  currentTestimonial.style.opacity = '';
  currentTestimonial.style.transition = '';
  currentTestimonial.style.pointerEvents = '';

  newTestimonial.style.transform = '';
  newTestimonial.style.opacity = '';
  newTestimonial.style.transition = '';
  newTestimonial.style.pointerEvents = '';

  currentIndex = newIndex;
  isAnimating = false;
}, 400);  // Hardcoded — must match CSS transition duration
```

If CSS duration changes, cleanup runs at wrong time. `transitionend` event is the correct hook.

**3. Auto-play interval fires during animation** (`js/testimonials.js:130-133`):
```javascript
// js/testimonials.js:130-133 — current
function startAutoPlay() {
  if (prefersReducedMotion) return;
  autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);  // Fires even if animating
}
```

If user clicks during auto-play transition, `isAnimating` blocks but interval still ticks.

## Target

**JS logic** (`js/testimonials.js`):
```javascript
// target — remove isAnimating, use transitionend
function goToSlide(index, direction = 'next') {
  const newIndex = (index + testimonials.length) % testimonials.length;
  if (newIndex === currentIndex) return;

  const currentTestimonial = testimonials[currentIndex];
  const newTestimonial = testimonials[newIndex];

  // Set direction for CSS
  newTestimonial.dataset.direction = direction;

  // Activate new (CSS transition handles animation)
  newTestimonial.classList.add('is-active');

  // Deactivate current
  currentTestimonial.classList.remove('is-active');

  // Update dots immediately
  dots.forEach((dot, i) => {
    dot.classList.toggle('testimonials__dot--active', i === newIndex);
  });

  // Cleanup via transitionend on the OUTGOING element
  function onTransitionEnd(e) {
    if (e.propertyName !== 'opacity' && e.propertyName !== 'transform') return;
    currentTestimonial.removeEventListener('transitionend', onTransitionEnd);
    currentTestimonial.style.transform = '';
    currentTestimonial.style.opacity = '';
    currentTestimonial.style.pointerEvents = '';
    currentTestimonial.dataset.direction = '';

    newTestimonial.style.transform = '';
    newTestimonial.style.opacity = '';
    newTestimonial.style.pointerEvents = '';
    newTestimonial.dataset.direction = '';

    currentIndex = newIndex;
  }

  currentTestimonial.addEventListener('transitionend', onTransitionEnd);
}
```

**Auto-play** — pause during transition:
```javascript
// target
function nextSlide() {
  stopAutoPlay();  // Always stop before manual/auto navigation
  goToSlide(currentIndex + 1, 'next');
  // Auto-play restarts via transitionend or resetAutoPlay
}

function onTransitionEnd(...) {
  // ... existing cleanup ...
  if (!document.hidden && !prefersReducedMotion) {
    startAutoPlay();  // Resume after transition completes
  }
}
```

**CSS** — already handled in Plan 001 (`.testimonial` base + `.is-active` states with `transition` property).

## Repo conventions to follow

- `testimonials.js` already uses `dataset` for index (`data-index` on dots) — extend with `data-direction`
- Event cleanup pattern: `removeEventListener` in returned cleanup function
- `checkReducedMotion` imported from `utils.js` — respect it
- CSS transitions on `opacity` + `transform` only (GPU-accelerated)

## Steps

1. **Remove `isAnimating` variable** (`js/testimonials.js:20`)

2. **Refactor `goToSlide`** — remove early return, add `dataset.direction`, use `transitionend` for cleanup:
   - Set `newTestimonial.dataset.direction = direction`
   - Toggle `.is-active` on both elements
   - Attach one-time `transitionend` listener on `currentTestimonial`
   - In listener: clean up inline styles, update `currentIndex`

3. **Update `nextSlide`/`prevSlide`/`goToDot`** — call `stopAutoPlay()` first, then `goToSlide`

4. **Modify `startAutoPlay`** — only start if not currently transitioning (track via flag or check `currentTestimonial.classList.contains('is-active')`)

5. **Add `transitionend` handler to resume auto-play** after manual navigation completes

6. **Handle reduced motion toggle mid-animation** — in `handleReducedMotionChange`, force instant state:
   ```javascript
   function handleReducedMotionChange(e) {
     if (e.matches) {
       stopAutoPlay();
       // Force all to final state instantly
       testimonials.forEach(t => {
         t.style.transition = 'none';
         t.classList.remove('is-active');
       });
       testimonials[currentIndex].classList.add('is-active');
     } else {
       startAutoPlay();
     }
   }
   ```

## Boundaries

- Do NOT change HTML structure
- Do NOT modify `js/hero.js`, `js/scroll-reveal.js`, `js/navigation.js`
- CSS transitions defined in Plan 001 — this plan assumes those exist
- If Plan 001 not yet applied, this plan's CSS dependencies must be added first

## Verification

- **Mechanical**: No console errors. All event listeners cleaned up on `cleanup()`.
- **Feel check**:
  - Click next/prev rapidly (10 clicks in 2 seconds):
    - Carousel responds to every click (no ignored clicks)
    - Transitions retarget smoothly — no jump to start
    - Dots stay in sync
  - Click next, then immediately click prev:
    - Reverses direction mid-transition smoothly
  - Let auto-play run, click during transition:
    - Click takes priority, auto-play pauses
    - After transition, auto-play resumes
  - In DevTools Animations panel (10% speed):
    - Verify `transitionend` fires at correct moment
    - Verify no double-fire
  - Toggle `prefers-reduced-motion` while carousel animating:
    - Instantly jumps to correct slide, no partial state
- **Done when**:
  - `isAnimating` variable removed
  - `setTimeout` cleanup replaced with `transitionend`
  - Rapid clicks never ignored
  - Auto-play pauses during manual navigation
  - Reduced motion toggle forces instant state