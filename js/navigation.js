/* ==========================================================================
   PURPLE RIBBONS BY AMY — Navigation
   ========================================================================== */

import { smoothScrollTo } from './utils.js';

/**
 * Initialize navigation functionality
 */
export function initNavigation() {
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!nav) return;

  // Scroll effect on nav
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNav() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          smoothScrollTo(target, 80); // Offset for fixed nav
        }
      }
    });
  });

  // Active link highlighting based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    rootMargin: '-100px 0px -66% 0px',
    threshold: 0,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // Cleanup
  return function cleanup() {
    window.removeEventListener('scroll', onScroll);
    navLinks.forEach(link => link.removeEventListener('click', smoothScrollTo));
    sections.forEach(section => sectionObserver.unobserve(section));
  };
}