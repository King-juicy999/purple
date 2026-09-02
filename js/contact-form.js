/* ==========================================================================
   PURPLE RIBBONS BY AMY — Contact Form
   ========================================================================== */

import { isValidEmail } from './utils.js';

/**
 * Initialize contact form validation and submission
 */
export function initContactForm() {
  const form = document.querySelector('.contact__form');

  if (!form) return;

  const inputs = form.querySelectorAll('.form__input, .form__select, .form__textarea');

  // Validation functions
  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required check
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value && !isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }

    // Select validation
    if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'Please select an option';
    }

    // Update UI
    field.classList.toggle('form__input--invalid', !isValid);
    field.classList.toggle('form__input--valid', isValid && value !== '');

    // Remove existing error message
    const existingError = field.parentNode.querySelector('.form__error');
    if (existingError) {
      existingError.remove();
    }

    // Add error message if invalid
    if (!isValid && value !== '') {
      const errorEl = document.createElement('span');
      errorEl.className = 'form__error';
      errorEl.textContent = errorMessage;
      // Set initial state for entrance animation (since @starting-style doesn't work on dynamic insert)
      errorEl.style.opacity = '0';
      errorEl.style.transform = 'translateY(-4px)';
      field.parentNode.appendChild(errorEl);
      // Force reflow then animate in
      requestAnimationFrame(() => {
        errorEl.style.opacity = '';
        errorEl.style.transform = '';
      });
    }

    return isValid;
  }

  function clearValidation(field) {
    field.classList.remove('form__input--invalid', 'form__input--valid');
    const existingError = field.parentNode.querySelector('.form__error');
    if (existingError) {
      existingError.classList.add('is-exiting');
      setTimeout(() => existingError.remove(), 160); // matches --duration-fast
    }
  }

  // Real-time validation on blur
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('form__input--invalid')) {
        validateField(input);
      }
    });
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isFormValid = true;

    // Validate all fields
    inputs.forEach(input => {
      if (!validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.form__input--invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    submitBtn.style.opacity = '0.7';

    // Simulate API call (no backend yet)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Reset form
    form.reset();
    inputs.forEach(input => {
      input.classList.remove('form__input--valid');
    });

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form__success';
    successMessage.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A15C" stroke-width="2" style="margin-bottom: 8px;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <p style="color: var(--color-accent); font-weight: 500;">Thank you! Your inquiry has been received.</p>
      <p style="color: var(--color-text-dim); font-size: 0.875rem; margin-top: 4px;">We'll get back to you within 24 hours.</p>
    `;

    form.insertBefore(successMessage, form.firstChild);

    // Force reflow to trigger @starting-style entrance
    successMessage.offsetHeight;

    // Reset button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.style.opacity = '';

    // Remove success message after delay
    setTimeout(() => {
      successMessage.classList.add('is-exiting');
      setTimeout(() => successMessage.remove(), 160); // matches --duration-fast
    }, 5000);
  });

  // Cleanup
  return function cleanup() {
    inputs.forEach(input => {
      input.removeEventListener('blur', validateField);
      input.removeEventListener('input', validateField);
    });
    form.removeEventListener('submit', initContactForm);
  };
}