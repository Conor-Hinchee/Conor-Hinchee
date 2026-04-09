/**
 * Pretext Framework - Interactive Text Effects System
 *
 * A performant, data-attribute-driven framework for controlling
 * interactive text effects including fade-ins, slides, and color transitions.
 *
 * Usage:
 * - Add data-pretext="effect-name" to elements
 * - Add data-pretext-delay="ms" for staggered animations
 * - Add data-pretext-hover="hover-effect" for interactive hover states
 * - For staggered lists, use data-pretext="stagger-in" on parent and data-pretext-item on children
 */

class PretextFramework {
  constructor(options = {}) {
    this.options = {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1,
      ...options
    };

    this.observer = null;
    this.elements = new Set();
    this.initialized = false;
  }

  /**
   * Initialize the framework
   */
  init() {
    if (this.initialized) {
      console.warn('Pretext framework already initialized');
      return;
    }

    // Check for Intersection Observer support
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, activating all elements immediately');
      this.activateAllElements();
      return;
    }

    // Create observer
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );

    // Find and observe all elements
    this.discoverElements();
    this.observeElements();

    this.initialized = true;
    console.log(`Pretext framework initialized with ${this.elements.size} elements`);
  }

  /**
   * Discover all elements with Pretext data-attributes
   */
  discoverElements() {
    const elements = document.querySelectorAll('[data-pretext]');
    elements.forEach(el => this.elements.add(el));
  }

  /**
   * Observe all discovered elements
   */
  observeElements() {
    this.elements.forEach(el => {
      this.observer.observe(el);
    });
  }

  /**
   * Handle intersection events
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.activateElement(entry.target);
      }
    });
  }

  /**
   * Activate an element with its configured effect
   */
  activateElement(element) {
    const delay = parseInt(element.getAttribute('data-pretext-delay')) || 0;
    const effect = element.getAttribute('data-pretext');

    setTimeout(() => {
      // Handle staggered animations
      if (effect === 'stagger-in') {
        this.activateStaggered(element);
      } else {
        element.classList.add('pretext-active');
      }

      // Stop observing once activated
      if (this.observer) {
        this.observer.unobserve(element);
      }
    }, delay);
  }

  /**
   * Activate staggered child elements
   */
  activateStaggered(parent) {
    const items = parent.querySelectorAll('[data-pretext-item]');
    const baseDelay = parseInt(parent.getAttribute('data-pretext-delay')) || 0;

    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('pretext-active');
      }, index * 100); // 100ms stagger between items
    });

    // Mark parent as active
    parent.classList.add('pretext-active');
  }

  /**
   * Activate all elements immediately (fallback for no IntersectionObserver)
   */
  activateAllElements() {
    this.elements.forEach(el => {
      el.classList.add('pretext-active');

      if (el.getAttribute('data-pretext') === 'stagger-in') {
        const items = el.querySelectorAll('[data-pretext-item]');
        items.forEach(item => item.classList.add('pretext-active'));
      }
    });
  }

  /**
   * Manually add an element to be managed by Pretext
   */
  addElement(element) {
    if (this.elements.has(element)) {
      return;
    }

    this.elements.add(element);

    if (this.observer) {
      this.observer.observe(element);
    } else {
      element.classList.add('pretext-active');
    }
  }

  /**
   * Destroy the framework and clean up
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.elements.clear();
    this.initialized = false;
  }

  /**
   * Refresh - rediscover elements and observe new ones
   */
  refresh() {
    this.discoverElements();
    this.observeElements();
  }
}

// Export factory function
export default function initPretext(options) {
  const pretext = new PretextFramework(options);

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      pretext.init();
    });
  } else {
    // DOM already loaded
    pretext.init();
  }

  // Expose globally for debugging
  window.Pretext = pretext;

  return pretext;
}
