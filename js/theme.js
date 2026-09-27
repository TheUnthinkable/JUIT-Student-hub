/**
 * Theme & Accent System for JUIT Student Hub
 * Supports:
 * - Theme Modes: Dark, Light, System
 * - Accent Colors: JUIT Blue, Purple, Emerald, Orange, Rose
 * Persists preferences in localStorage and responds to OS system preferences.
 */

const ThemeManager = {
  themeMode: 'dark', // 'dark' | 'light' | 'system'
  accentColor: 'blue', // 'blue' | 'purple' | 'emerald' | 'orange' | 'rose'

  accents: [
    { id: 'blue', name: 'JUIT Blue', color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)' },
    { id: 'purple', name: 'Purple', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' },
    { id: 'emerald', name: 'Emerald', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { id: 'orange', name: 'Orange', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' },
    { id: 'rose', name: 'Rose', color: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)' }
  ],

  init() {
    this.themeMode = localStorage.getItem('juit_theme_mode') || 'dark';
    this.accentColor = localStorage.getItem('juit_accent_color') || 'blue';

    this.applyTheme();
    this.applyAccent();
    this.bindSystemQuery();
    this.bindUI();
  },

  setThemeMode(mode) {
    if (!['dark', 'light', 'system'].includes(mode)) return;
    this.themeMode = mode;
    localStorage.setItem('juit_theme_mode', mode);
    this.applyTheme();
    this.updateControls();
  },

  setAccentColor(accentId) {
    if (!this.accents.some(a => a.id === accentId)) return;
    this.accentColor = accentId;
    localStorage.setItem('juit_accent_color', accentId);
    this.applyAccent();
    this.updateControls();
  },

  applyTheme() {
    let resolvedTheme = this.themeMode;
    if (this.themeMode === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-theme-mode', this.themeMode);

    // Update label or toggle icon
    const themeLabel = document.getElementById('current-theme-label');
    if (themeLabel) {
      themeLabel.textContent = this.themeMode.charAt(0).toUpperCase() + this.themeMode.slice(1);
    }

    // Update quick theme toggle button in header
    const btnToggle = document.getElementById('btn-quick-theme-toggle');
    if (btnToggle) {
      const iconSpan = btnToggle.querySelector('.material-symbols-outlined');
      if (iconSpan) {
        // If current active theme is dark, show sun (light_mode) to switch to light; if light, show moon (dark_mode)
        iconSpan.textContent = resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode';
      }
      btnToggle.title = resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      btnToggle.setAttribute('aria-label', btnToggle.title);
    }

    // Update meta theme-color for mobile browser address bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0f131d' : '#f8fafc');
    }
  },

  applyAccent() {
    document.documentElement.setAttribute('data-accent', this.accentColor);
    const accentObj = this.accents.find(a => a.id === this.accentColor);
    if (accentObj) {
      document.documentElement.style.setProperty('--accent-primary', accentObj.color);
      document.documentElement.style.setProperty('--accent-gradient', accentObj.gradient);
      document.documentElement.style.setProperty('--accent-glow', `${accentObj.color}40`);
      document.documentElement.style.setProperty('--border-active', accentObj.color);
    }
  },

  bindSystemQuery() {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.themeMode === 'system') {
          this.applyTheme();
        }
      });
    } catch(e) {
      console.warn('System color scheme listener not supported', e);
    }
  },

  bindUI() {
    // Quick theme toggle button in header
    const btnToggle = document.getElementById('btn-quick-theme-toggle');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        const curTheme = document.documentElement.getAttribute('data-theme') || this.themeMode;
        const nextMode = curTheme === 'dark' ? 'light' : 'dark';
        this.setThemeMode(nextMode);
      });
    }

    // Modal or Dropdown selectors
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setThemeMode(btn.dataset.setTheme);
      });
    });

    document.querySelectorAll('[data-set-accent]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setAccentColor(btn.dataset.setAccent);
      });
    });

    this.updateControls();
  },

  updateControls() {
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.setTheme === this.themeMode);
    });
    document.querySelectorAll('[data-set-accent]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.setAccent === this.accentColor);
    });
  }
};

window.ThemeManager = ThemeManager;
