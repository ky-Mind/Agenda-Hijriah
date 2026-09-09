/**
 * Islamic Calendar Icon Component
 * Komponen ikon kalender Islam dengan animasi floating dan interaktif
 * Konversi dari React ke Vanilla JavaScript + CSS Animations
 */

class IslamicCalendarIcon {
  constructor(options = {}) {
    this.size = options.size || 'md';
    this.className = options.className || '';
    this.onClick = options.onClick || null;
    this.sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-20 h-20',
      lg: 'w-36 h-36',
      custom: '',
    };

    this.iconSrc = 'assets/kisah-lillah-logo.png';
  }

  /**
   * Render the icon component
   * @returns {HTMLElement} The rendered icon element
   */
  render() {
    const container = document.createElement('div');
    container.className = `islamic-calendar-icon ${this.sizeClasses[this.size]} ${this.className}`;
    container.setAttribute('role', 'button');
    container.setAttribute('aria-label', 'Islamic Calendar Tracker Icon');
    container.setAttribute('tabindex', '0');

    // Glow effect background
    const glowEffect = document.createElement('div');
    glowEffect.className = 'islamic-calendar-icon-glow';
    
    // Use the shared branding asset so every app-level icon stays consistent.
    const svgContainer = document.createElement('div');
    svgContainer.className = 'islamic-calendar-icon-svg-container';
    const image = document.createElement('img');
    image.className = 'islamic-calendar-icon-svg';
    image.src = this.iconSrc;
    image.alt = 'Kisah Lillah';
    svgContainer.appendChild(image);

    container.appendChild(glowEffect);
    container.appendChild(svgContainer);

    // Add event listeners
    container.addEventListener('click', () => {
      if (this.onClick) {
        this.onClick();
      }
    });

    // Keyboard support
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.onClick) {
          this.onClick();
        }
      }
    });

    // Hover animations via CSS
    container.addEventListener('mouseenter', () => {
      container.classList.add('hovering');
    });

    container.addEventListener('mouseleave', () => {
      container.classList.remove('hovering');
    });

    return container;
  }

  /**
   * Mount icon to specified element
   * @param {string|HTMLElement} selector - CSS selector or HTML element
   */
  mount(selector) {
    let targetElement;
    
    if (typeof selector === 'string') {
      targetElement = document.querySelector(selector);
    } else {
      targetElement = selector;
    }

    if (!targetElement) {
      console.error('Target element not found:', selector);
      return;
    }

    targetElement.appendChild(this.render());
  }

  /**
   * Replace existing element with this icon
   * @param {string|HTMLElement} selector - CSS selector or HTML element to replace
   */
  replace(selector) {
    let targetElement;
    
    if (typeof selector === 'string') {
      targetElement = document.querySelector(selector);
    } else {
      targetElement = selector;
    }

    if (!targetElement) {
      console.error('Target element not found:', selector);
      return;
    }

    const iconElement = this.render();
    targetElement.replaceWith(iconElement);
  }
}

// Export untuk penggunaan di berbagai modul
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IslamicCalendarIcon;
}
