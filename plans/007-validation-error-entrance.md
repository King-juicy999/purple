# 007 — Validation Error Message Entrance

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: MEDIUM
- **Category**: Missed opportunity / Feedback
- **Estimated scope**: 1 file (contact-form.js), ~10 lines CSS + 5 lines JS

## Problem

Validation error messages (shown on blur/invalid input) are inserted into the DOM instantly with no entrance animation — they just "appear." This is a minor but noticeable jarring moment during form interaction.

**Current code** (`js/contact-form.js:52-63`):
```javascript
// Add error message if invalid
if (!isValid && value !== '') {
  const errorEl = document.createElement('span');
  errorEl.className = 'form__error';
  errorEl.textContent = errorMessage;
  errorEl.style.cssText = `
    display: block;
    margin-top: 4px;
    font-size: 0.75rem;
    color: #E8C77E;
  `;
  field.parentNode.appendChild(errorEl);
}
```

No transition, no `@starting-style` — instant pop-in.

## Target

Add a subtle entrance using `@starting-style` with fast tokens (this is a frequent interaction tier):

```css
/* css/main.css — ADD near .form__input styles (around line 1240) */
.form__error {
  display: block;
  margin-top: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-accent-bright);
  
  /* NEW: entrance animation */
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);
}

@starting-style {
  .form__error {
    opacity: 0;
    transform: translateY(-4px);
  }
}

/* Exit when validation passes */
.form__error.is-exiting {
  opacity: 0;
  transform: translateY(-4px);
}
```

JS change (`js/contact-form.js:52-63`):
```javascript
// Add error message if invalid
if (!isValid && value !== '') {
  const errorEl = document.createElement('span');
  errorEl.className = 'form__error';
  errorEl.textContent = errorMessage;
  // REMOVE inline style.cssText — use CSS class
  field.parentNode.appendChild(errorEl);
  // @starting-style triggers on insert; no extra JS needed
}
```

And update `clearValidation` (`js/contact-form.js:68-74`) to animate exit:
```javascript
function clearValidation(field) {
  field.classList.remove('form__input--invalid', 'form__input--valid');
  const existingError = field.parentNode.querySelector('.form__error');
  if (existingError) {
    existingError.classList.add('is-exiting');
    setTimeout(() => existingError.remove(), 160); // matches --duration-fast
  }
}
```

## Repo conventions to follow

- Easing/duration tokens: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--duration-fast: 160ms` (from `css/main.css:93-100`)
- `@starting-style` for entrance on DOM insert
- Reduced motion handled globally via `css/main.css:116-147` — transitions become 0.01ms, opacity/color only
- Color uses existing `var(--color-accent-bright)` (already in inline style)

## Steps

1. **Add `.form__error` CSS rules** to `css/main.css` near `.form__input:focus` styles (around line 1250), including `@starting-style` and `.is-exiting`.
2. **Update `js/contact-form.js:52-63`** — remove inline `style.cssText`, use CSS class only.
3. **Update `js/contact-form.js:68-74`** (`clearValidation`) — animate exit via `.is-exiting` class + timeout.
4. **Verify** reduced motion works (global CSS handles it).

## Boundaries

- Do NOT touch success message styles (Plan 006).
- Do NOT change validation logic or error messages.
- Do NOT add new dependencies.
- Error elements are short-lived — keep animation fast (160ms).

## Verification

- **Mechanical**: No console errors on validation.
- **Feel check**:
  - Tab through form with empty required fields → errors slide down from -4px with 160ms ease-out (not a pop).
  - Fix an error → error slides up + fades out in 160ms.
  - DevTools Animations at 10%: confirm `--ease-out` curve, 160ms duration.
  - Toggle `prefers-reduced-motion` → instant (opacity only).
- **Done when**: Error entrance/exit both use `--duration-fast` + `--ease-out`, no inline styles on error elements.