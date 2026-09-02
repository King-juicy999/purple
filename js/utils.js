/* ==========================================================================
   PURPLE RIBBONS BY AMY — Utility Functions
   ========================================================================== */

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function checkReducedMotion() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function}
 */
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {number}
 */
export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Map value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range min
 * @param {number} inMax - Input range max
 * @param {number} outMin - Output range min
 * @param {number} outMax - Output range max
 * @returns {number}
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Smooth scroll to element
 * @param {string|HTMLElement} target - Target selector or element
 * @param {number} offset - Offset in pixels
 */
export function smoothScrollTo(target, offset = 0) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} threshold - Threshold (0-1)
 * @returns {boolean}
 */
export function isInViewport(element, threshold = 0.1) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const vertInView = (rect.top <= windowHeight * (1 - threshold)) && (rect.bottom >= windowHeight * threshold);
  const horInView = (rect.left <= windowWidth * (1 - threshold)) && (rect.right >= windowWidth * threshold);

  return vertInView && horInView;
}

/**
 * Get scroll progress through an element
 * @param {HTMLElement} element - Element to measure
 * @returns {number} - Progress 0-1
 */
export function getScrollProgress(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const elementHeight = rect.height;
  const totalDistance = windowHeight + elementHeight;
  const scrolled = windowHeight - rect.top;
  return clamp(scrolled / totalDistance, 0, 1);
}

/**
 * Create intersection observer for scroll animations
 * @param {Function} callback - Callback when elements intersect
 * @param {Object} options - IntersectionObserver options
 * @returns {IntersectionObserver}
 */
export function createScrollObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '0px 0% -10% 0%',
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
  };

  const observer = new IntersectionObserver(callback, { ...defaultOptions, ...options });
  return observer;
}

/**
 * Format phone number for tel: links
 * @param {string} phone - Phone number
 * @returns {string}
 */
export function formatPhoneForTel(phone) {
  return phone.replace(/[\s\-\(\)]/g, '');
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}