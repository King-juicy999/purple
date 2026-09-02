/* ==========================================================================
   PURPLE RIBBONS BY AMY — Scroll Reveal Animations
   ========================================================================== */

import { createScrollObserver } from './utils.js';

/**
 * Initialize scroll reveal animations
 */
export function initScrollReveal() {
  // Elements to reveal
  const revealElements = document.querySelectorAll('.reveal, .section__header, .about__paragraph, .pillar, .service-card, .portfolio__item, .testimonial, .contact__item, .contact__form');

  if (revealElements.length === 0) return;

  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Instantly reveal all elements
    revealElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  // Create observer
  const observer = createScrollObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Unobserve after revealing to save resources
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0% -5% 0%',
    threshold: 0.1,
  });

  // Observe all reveal elements
  revealElements.forEach(el => observer.observe(el));

  // Special handling for portfolio items - stagger them
  const portfolioItems = document.querySelectorAll('.portfolio__item');
  portfolioItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 80, 400)}ms`;
  });

  // Stagger pillars
  const pillars = document.querySelectorAll('.pillar');
  pillars.forEach((pillar, index) => {
    pillar.style.transitionDelay = `${index * 120}ms`;
  });

  // Stagger service cards
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 60}ms`;
  });
}

/**
 * Initialize counter animations for stats (if needed in future)
 * @param {NodeList} elements - Elements with data-count attribute
 */
export function initCounters(elements) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = createScrollObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = prefersReducedMotion ? 0 : 1500;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = progress * progress * (3 - 2 * progress); // smoothstep
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString();

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          }
        }

        requestAnimationFrame(updateCounter);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  elements.forEach(el => observer.observe(el));
}