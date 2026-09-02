/* ==========================================================================
   PURPLE RIBBONS BY AMY — Main Application Entry Point (Vanilla ES Modules)
   ========================================================================== */

import { initHero } from './hero.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initTestimonials } from './testimonials.js';
import { initNavigation } from './navigation.js';
import { initContactForm } from './contact-form.js';
import { checkReducedMotion } from './utils.js';

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check reduced motion preference once
  const prefersReducedMotion = checkReducedMotion();

  // Initialize core modules
  initNavigation();
  initScrollReveal();
  initTestimonials();
  initContactForm();

  // Initialize hero with Three.js
  initHero(prefersReducedMotion);

  // Add loaded class for any CSS-triggered animations
  document.documentElement.classList.add('loaded');
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('page-hidden', document.hidden);
});