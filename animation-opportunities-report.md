# Animation Opportunities Report — Purple Ribbons by Amy

Generated via `find-animation-opportunities` skill on 2026-09-02.

---

## Part 1 — Opportunities Table

| # | Location | Today | Purpose | Frequency | Suggested Motion |
|---|---|---|---|---|---|
| 1 | `contact-form.js:129-148` | Form success message inserted instantly into DOM, then fades out with transition | **Feedback** + **Preventing a jarring change** | Occasional (form submissions) | Enter via `@starting-style`: `opacity: 0; transform: scale(0.95)` → settled, `transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)`; exit same (already implemented) |
| 2 | `contact-form.js:52-63` | Validation error messages inserted instantly with no entrance animation | **Feedback** | Occasional (validation errors only) | `@starting-style { opacity: 0; transform: translateY(-4px); }` → `transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)`; gate hover with `@media (hover: hover) and (pointer: fine)` |
| 3 | `testimonials.js:181` | First testimonial snaps in instantly on init (`.is-active` added immediately) | **Preventing a jarring change** | Rare (first load only) | Add `opacity: 0; transform: translateX(40px);` initial state, then `transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out);` — set `.is-active` after a microtask (`requestAnimationFrame` ×2) to trigger entrance |
| 4 | `css/main.css:383-424` (`.btn`) | Buttons have hover lift but no press feedback (`:active` only resets hover on primary) | **Feedback** | Tens/day (CTA clicks, nav, form submit) | Add `.btn:active { transform: scale(0.97); }` with existing `transition: transform var(--duration-fast) var(--ease-out)` — subtle enough for frequency tier |
| 5 | `css/main.css:279` | Nav scrolled transition uses undefined `--transition-duration` token (should be `--duration-base` or `--duration-slow`) | **State indication** | Tens/day (scroll) | Fix token: `transition: background-color var(--duration-base) var(--ease-out), backdrop-filter var(--duration-base) var(--ease-out);` — this is a bug fix, not new motion |

---

## Part 2 — Rejected Candidates

- `hero.js:222-232` — Hero ribbon mouse parallax. **Rejected: already implemented with proper lerp smoothing (0.05 factor), respects `prefers-reduced-motion`, pauses when offscreen via IntersectionObserver.**
- `hero.js:328-345` — Hero ribbon scroll-driven unfurl/rotate/scale/drift. **Rejected: already implemented with smoothstep easing, respects reduced motion, runs only when hero is visible.**
- `css/main.css:475-533` — Hero content entrance keyframes (fadeUp, fadeIn, pulseLine). **Rejected: Rare/first-time frequency (once per session), purpose is delight/explanation — allowed at this tier. Already uses `--transition-spring` (should map to `--ease-out`).**
- `scroll-reveal.js:42-58` — Portfolio/service/pillar stagger entrances. **Rejected: Already implemented with `--stagger-delay` (60ms base), capped at 400ms, respects reduced motion (instant reveal).**
- `testimonials.js:45-69` — Carousel slide transitions with direction-aware entrance. **Rejected: Already implemented via CSS transitions (interruptible, no `isAnimating` flag), respects reduced motion (instant switch), has pause/play, keyboard nav, live region.**
- `css/main.css:770-787` / `871-888` — Service card & portfolio hover transforms. **Rejected: Already implemented with `@media (hover: hover) and (pointer: fine)` gating, proper `--ease-out` curves, transform-only (no layout thrash).**
- `navigation.js:43-53` — Nav link smooth scroll. **Rejected: Already uses `behavior: 'smooth'` — browser-native, no custom animation to add.**
- `css/main.css:328-351` — Nav link underline animation on hover. **Rejected: Already implemented with `transform: scaleX(0→1)`, `--duration-fast` + `--ease-out`, hover/focus gated.**

---

## Part 3 — Verdict

This interface is **already close to right** — the motion vocabulary (easing tokens, durations, stagger system, reduced-motion handling) is well-established and consistently applied. The Three.js hero ribbon is a standout: it's performant (pauses offscreen), accessible (respects reduced motion), and purposeful (spatial story via scroll + mouse).

The five surviving opportunities are all **low-effort, high-leverage polish**:

1. **Form success entrance** (#1) — highest leverage; users submit once per visit, the "thank you" moment deserves to feel intentional, not popped in.
2. **Button press scale** (#4) — fixes a systemic feedback gap across every CTA (hero, nav, form, testimonials).
3. **Nav transition token fix** (#5) — a bug masquerading as motion work; fixing it restores the intended scrolled-nav transition.
4. **First testimonial entrance** (#3) — a one-liner that eliminates a visible snap on the first paint of the carousel.
5. **Validation error entrance** (#2) — subtle but prevents the "where did that come from?" flash on error.

**Handoff:** Run `improve-animations plan "form success entrance"` to turn #1 into a self-contained implementation plan, or `improve-animations plan "button press feedback"` for #4. The tokens and reduced-motion infrastructure already exist — each suggestion is a 5–15 line change.

---

## Quick Prompt for `improve-animations`

```
/improve-animations plan "Implement all five opportunities from animation-opportunities-report.md: (1) form success message entrance with @starting-style, (2) validation error message entrance, (3) first testimonial entrance animation, (4) button press scale feedback, (5) fix nav scrolled transition token"
```

Or run each individually for finer control:
- `/improve-animations plan "form success entrance"`
- `/improve-animations plan "validation error entrance"`
- `/improve-animations plan "first testimonial entrance"`
- `/improve-animations plan "button press feedback"`
- `/improve-animations plan "nav scrolled transition token fix"`