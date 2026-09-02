# 009 — Button Press Feedback (Scale on :active)

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: HIGH
- **Category**: Missed opportunity / Feedback
- **Estimated scope**: 1 file (css/main.css), ~3 lines

## Problem

All `.btn` elements have hover lift (`transform: translateY(-2px)` on primary, border/color changes on secondary) but **no press feedback**. The `:active` state only resets the hover lift on primary buttons (`transform: translateY(0)`), and does nothing on secondary buttons. Users get no tactile confirmation on click/tap — a systemic feedback gap across every CTA (hero, nav, form, testimonials controls).

**Current code** (`css/main.css:383-424`):
```css
.btn {
  /* ... */
  transition: background-color var(--duration-base) var(--ease-out),
              color var(--duration-base) var(--ease-out),
              transform var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out),
              border-color var(--duration-base) var(--ease-out);
}

.btn--primary:active {
  transform: translateY(0);  /* only resets hover, no press feedback */
}

.btn--secondary:active {
  /* nothing defined */
}
```

## Target

Add a subtle scale-down on `:active` for all buttons (160ms, ease-out), consistent with the repo's `--duration-fast` token. This is subtle enough for the "tens of times/day" frequency tier.

```css
/* css/main.css — ADD after .btn--primary:active (around line 424) */
.btn:active {
  transform: scale(0.97);
}

/* Keep primary's hover reset but combine with scale */
.btn--primary:active {
  transform: translateY(0) scale(0.97);
}
```

Note: The existing `transition: transform var(--duration-fast) var(--ease-out)` on `.btn` (line 397) already covers this — no new transition needed.

## Repo conventions to follow

- Duration/easing: `--duration-fast: 160ms`, `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` (from `css/main.css:93-100`)
- Transform-only animation (no layout thrash)
- Reduced motion handled globally (`css/main.css:116-147`) — transform transitions dropped, opacity/color only at 80ms
- Scale factor 0.97 is subtle (0.95–0.98 range per skill guidance for frequent actions)
- Works on both primary and secondary buttons

## Steps

1. **Add `.btn:active { transform: scale(0.97); }`** to `css/main.css` after `.btn--primary:active` (around line 424).
2. **Update `.btn--primary:active`** to combine `translateY(0) scale(0.97)`.
3. **Verify** all buttons (hero CTAs, form submit, testimonial controls, nav links if they use .btn) show press feedback.

## Boundaries

- Do NOT change hover states or other button styles.
- Do NOT add new tokens or keyframes.
- Do NOT touch `.nav__link` (they're not `.btn` elements — they have their own underline animation).
- This is a 3–4 line CSS addition only.

## Verification

- **Mechanical**: No CSS syntax errors.
- **Feel check**:
  - Click/tap any `.btn` (hero "Book a Consultation", "View Our Work", form "Send Inquiry", testimonial prev/next/dots/pause) → button scales to 0.97 over 160ms ease-out on press, returns on release.
  - Hold press → stays scaled; release → springs back.
  - DevTools Animations at 10%: confirm 160ms, ease-out curve.
  - Toggle `prefers-reduced-motion` → no scale transform (global CSS drops transform transitions), but color/background transitions remain at 80ms for feedback.
- **Done when**: All `.btn` elements have `:active` scale feedback using existing transition tokens.