# 006 — Form Success Message Entrance

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: HIGH
- **Category**: Missed opportunity / Feedback
- **Estimated scope**: 1 file (contact-form.js), ~15 lines CSS + 10 lines JS

## Problem

The form success message (shown after submission) is inserted into the DOM and immediately visible — no entrance animation. It only has an exit animation (fade/slide up after 5s). This creates a jarring "pop-in" that feels unintentional for a rare, high-emotion moment (user just submitted an inquiry).

**Current code** (`js/contact-form.js:129-148`):
```javascript
// Show success message
const successMessage = document.createElement('div');
successMessage.className = 'form__success';
successMessage.innerHTML = `...`;
successMessage.style.cssText = `
  text-align: center;
  padding: 24px;
  background: rgba(201, 161, 92, 0.1);
  border: 1px solid var(--color-accent);
  border-radius: 12px;
  margin-bottom: 16px;
`;

form.insertBefore(successMessage, form.firstChild);

// Remove success message after delay
setTimeout(() => {
  successMessage.style.opacity = '0';
  successMessage.style.transform = 'translateY(-10px)';
  successMessage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  setTimeout(() => successMessage.remove(), 300);
}, 5000);
```

No `@starting-style` or initial transition state exists — the element appears at full opacity/scale instantly.

## Target

Add a smooth entrance using `@starting-style` (modern CSS, no JS timing hacks) with the repo's standard tokens:

```css
/* css/main.css — ADD to form success styles */
.form__success {
  /* existing inline styles moved here */
  text-align: center;
  padding: 24px;
  background: rgba(201, 161, 92, 0.1);
  border: 1px solid var(--color-accent);
  border-radius: 12px;
  margin-bottom: 16px;
  
  /* NEW: entrance animation */
  opacity: 1;
  transform: scale(1);
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}

@starting-style {
  .form__success {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Exit animation (already works, but move to CSS for consistency) */
.form__success.is-exiting {
  opacity: 0;
  transform: translateY(-10px);
}
```

JS change (`js/contact-form.js`):
```javascript
// Show success message
const successMessage = document.createElement('div');
successMessage.className = 'form__success';
successMessage.innerHTML = `...`;
// REMOVE inline style.cssText — use CSS class instead

form.insertBefore(successMessage, form.firstChild);

// Force reflow to trigger @starting-style entrance
successMessage.offsetHeight; // microtask not needed; @starting-style works on insert

// Remove success message after delay
setTimeout(() => {
  successMessage.classList.add('is-exiting');
  setTimeout(() => successMessage.remove(), 400); // matches --duration-base (250ms) with buffer
}, 5000);
```

## Repo conventions to follow

- Easing/duration tokens from `css/main.css:93-102`: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--duration-base: 250ms`
- `@starting-style` for entrance animations (see `css/main.css:475-533` hero elements use keyframes, but this is the modern replacement)
- Reduced motion handled globally via `css/main.css:116-147` — zero-duration transitions when `prefers-reduced-motion: reduce`
- Hover/fine-pointer gating not needed (not a hover interaction)

## Steps

1. **Add `.form__success` CSS rules** to `css/main.css` after `.form__note` (around line 1280), including `@starting-style` block and `.is-exiting` state.
2. **Update `js/contact-form.js:129-161`** — remove inline `style.cssText`, use `className = 'form__success'` only, add `offsetHeight` read after insert, replace exit timeout with class toggle.
3. **Verify** reduced motion works (global CSS handles it — transitions become 0ms).

## Boundaries

- Do NOT touch other form validation/error styles (separate plan).
- Do NOT change HTML structure of success message content.
- Do NOT add new dependencies or JS animation libraries.
- If `offsetHeight` reflow doesn't trigger @starting-style in some browsers, fallback to `requestAnimationFrame(() => successMessage.classList.add('animate-in'))` with a separate `.animate-in` class — but @starting-style should work on direct DOM insertion.

## Verification

- **Mechanical**: `npm run lint` (if exists), no console errors on form submit.
- **Feel check**: 
  - Submit form → success message scales in from 0.95 with 250ms ease-out (not a pop).
  - Wait 5s → message slides up + fades out smoothly (250ms).
  - DevTools Animations panel at 10%: confirm ease-out curve (cubic-bezier 0.23, 1, 0.32, 1).
  - Toggle `prefers-reduced-motion` → entrance/exit instant (opacity only, no transform).
- **Done when**: Entrance and exit both use `--duration-base` + `--ease-out` tokens, no inline styles on success element.