/* ==========================================================================
   PURPLE RIBBONS BY AMY — Testimonials Carousel
   ========================================================================== */

import { checkReducedMotion } from './utils.js';

/**
 * Initialize testimonials carousel
 * Uses CSS transitions for interruptible, smooth animations
 */
export function initTestimonials() {
  const track = document.querySelector('.testimonials__track');
  const testimonials = document.querySelectorAll('.testimonial');
  const prevBtn = document.querySelector('.testimonials__btn--prev');
  const nextBtn = document.querySelector('.testimonials__btn--next');
  const dots = document.querySelectorAll('.testimonials__dot');
  const carousel = document.querySelector('.testimonials__carousel');
  const liveRegion = document.querySelector('.testimonials__live-region');

  if (!track || testimonials.length === 0) return;

  let currentIndex = 0;
  let autoPlayInterval = null;
  let isAutoPlaying = false; // Default to off; user opts in via play button
  const prefersReducedMotion = checkReducedMotion();

  // Auto-play interval (ms)
  const AUTO_PLAY_DELAY = 8000;

  /**
   * Update ARIA live region for screen readers
   */
  function announceSlide(index) {
    if (!liveRegion) return;
    const testimonial = testimonials[index];
    const quoteText = testimonial.querySelector('.testimonial__text')?.textContent?.trim();
    const authorName = testimonial.querySelector('.testimonial__name')?.textContent?.trim();
    liveRegion.textContent = `Testimonial ${index + 1} of ${testimonials.length}: "${quoteText}" — ${authorName}`;
  }

  /**
   * Go to slide with CSS-driven animation
   * No isAnimating flag — transitionend handles interruptibility
   */
  function goToSlide(index, direction = 'next') {
    const newIndex = (index + testimonials.length) % testimonials.length;
    if (newIndex === currentIndex) return;

    const currentTestimonial = testimonials[currentIndex];
    const newTestimonial = testimonials[newIndex];

    // Set direction for CSS entrance animation
    newTestimonial.dataset.direction = direction;

    // Prepare new testimonial (CSS handles animation via .is-active)
    newTestimonial.classList.add('is-active');

    // Remove active from current (triggers exit animation)
    currentTestimonial.classList.remove('is-active');

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('testimonials__dot--active', i === newIndex);
      dot.setAttribute('aria-current', i === newIndex ? 'true' : 'false');
    });

    currentIndex = newIndex;
    announceSlide(newIndex);
  }

  function nextSlide() {
    goToSlide(currentIndex + 1, 'next');
  }

  function prevSlide() {
    goToSlide(currentIndex - 1, 'prev');
  }

  function goToDot(index) {
    const direction = index > currentIndex ? 'next' : 'prev';
    goToSlide(index, direction);
  }

  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToDot(index);
      resetAutoPlay();
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoPlay();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoPlay();
    }
  });

  // Pause/Play button
  const pauseBtn = document.querySelector('.testimonials__pause');
  if (pauseBtn) {
    // Set initial state (paused)
    pauseBtn.setAttribute('aria-label', 'Start auto-play');
    pauseBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;

    pauseBtn.addEventListener('click', () => {
      if (isAutoPlaying) {
        stopAutoPlay();
        pauseBtn.setAttribute('aria-label', 'Start auto-play');
        pauseBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
      } else {
        startAutoPlay();
        pauseBtn.setAttribute('aria-label', 'Pause auto-play');
        pauseBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        `;
      }
      isAutoPlaying = !isAutoPlaying;
    });
  }

  // Auto-play functions
  function startAutoPlay() {
    if (prefersReducedMotion) return;
    if (autoPlayInterval) return;
    autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    if (isAutoPlaying && !prefersReducedMotion) {
      startAutoPlay();
    }
  }

  // Pause on hover (mouse only) — only if user has started auto-play
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', () => {
      if (isAutoPlaying) startAutoPlay();
    });
  }

  // Pause when page is hidden — only if user has started auto-play
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else if (isAutoPlaying) {
      startAutoPlay();
    }
  });

  // Initialize first testimonial — defer to next frame for entrance animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      testimonials[0].classList.add('is-active');
      announceSlide(0);
    });
  });

  // Auto-play defaults to off; user starts it via play button

  // Handle reduced motion change
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function handleReducedMotionChange(e) {
    if (e.matches) {
      stopAutoPlay();
      // Remove transition for instant switching
      testimonials.forEach(t => {
        t.style.transitionDuration = '0.01ms';
      });
    } else {
      testimonials.forEach(t => {
        t.style.transitionDuration = '';
      });
      // Don't auto-restart; user controls playback
    }
  }
  mediaQuery.addEventListener('change', handleReducedMotionChange);

  // Cleanup function
  return function cleanup() {
    stopAutoPlay();
    if (nextBtn) nextBtn.removeEventListener('click', nextSlide);
    if (prevBtn) prevBtn.removeEventListener('click', prevSlide);
    dots.forEach(dot => dot.removeEventListener('click', goToDot));
    if (pauseBtn) pauseBtn.removeEventListener('click', () => {});
    document.removeEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === 'ArrowRight') nextSlide();
    });
    if (carousel) {
      carousel.removeEventListener('mouseenter', stopAutoPlay);
      carousel.removeEventListener('mouseleave', startAutoPlay);
    }
    document.removeEventListener('visibilitychange', () => {});
    mediaQuery.removeEventListener('change', handleReducedMotionChange);
  };
}