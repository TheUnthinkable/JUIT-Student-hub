/**
 * Theme & Accent System for JUIT Student Hub
 * Supports:
 * - Theme Modes: Dark, Light, System
 * - Distinct Color Palettes: Shivalik Amber, Himalayan Pines, Sunset Solan, Cyber Solan, Alpine Twilight, Crimson Scholar, Stealth OLED, Alpine Frost
 * - Accent Colors with high-contrast gradients
 * Persists preferences in localStorage and responds to OS system preferences.
 */

const ThemeManager = {
  themeMode: 'dark', // 'dark' | 'light' | 'system'
  accentColor: 'blue',
  palette: 'amber',

  palettes: [
    {
      id: 'amber',
      name: 'Shivalik Amber',
      mode: 'dark',
      color: '#ffc174',
      badgeBg: 'rgba(255, 193, 116, 0.15)',
      gradient: 'linear-gradient(135deg, #ffc174 0%, #f59e0b 100%)',
      description: 'Official JUIT Warm Amber & Deep Obsidian'
    },
    {
      id: 'emerald',
      name: 'Himalayan Pines',
      mode: 'dark',
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: 'Lush Pine Needle Green & Alpine Mint'
    },
    {
      id: 'sunset',
      name: 'Sunset Solan',
      mode: 'dark',
      color: '#f97316',
      badgeBg: 'rgba(249, 115, 22, 0.15)',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      description: 'Golden Ridge Sunset & Terracotta Glow'
    },
    {
      id: 'cyan',
      name: 'Cyber Solan',
      mode: 'dark',
      color: '#00e5ff',
      badgeBg: 'rgba(0, 229, 255, 0.15)',
      gradient: 'linear-gradient(135deg, #00e5ff 0%, #0284c7 100%)',
      description: 'Electric Neon Cyan & Digital Alpine Tech'
    },
    {
      id: 'violet',
      name: 'Alpine Twilight',
      mode: 'dark',
      color: '#a855f7',
      badgeBg: 'rgba(168, 85, 247, 0.15)',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
      description: 'Waknaghat Mountain Twilight & Amethyst'
    },
    {
      id: 'crimson',
      name: 'Crimson Scholar',
      mode: 'dark',
      color: '#f43f5e',
      badgeBg: 'rgba(244, 63, 94, 0.15)',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      description: 'Prestigious Academic Crimson & Ruby'
    },
    {
      id: 'oled',
      name: 'Stealth OLED',
      mode: 'dark',
      color: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
      description: 'Pure 100% True Black with Neon Highlights'
    },
    {
      id: 'frost',
      name: 'Alpine Frost',
      mode: 'light',
      color: '#0284c7',
      badgeBg: 'rgba(2, 132, 199, 0.15)',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
      description: 'Crisp Daylight Himalayan Snow White'
    }
  ],

  accents: [
    { id: 'blue', name: 'JUIT Blue', color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)' },
    { id: 'cyan', name: 'Cyber Cyan', color: '#00e5ff', gradient: 'linear-gradient(135deg, #00e5ff 0%, #0284c7 100%)' },
    { id: 'purple', name: 'Purple', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' },
    { id: 'emerald', name: 'Emerald', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { id: 'orange', name: 'Orange', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' },
    { id: 'rose', name: 'Rose', color: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)' }
  ],

  init() {
    this.themeMode = localStorage.getItem('juit_theme_mode') || 'dark';
    this.accentColor = localStorage.getItem('juit_accent_color') || 'blue';
    this.palette = localStorage.getItem('juit_theme_palette') || 'amber';

    this.applyTheme();
    this.applyAccent();
    this.applyPalette();
    this.bindSystemQuery();
    this.bindUI();
    this.renderThemePickerInModal();
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

  setPalette(paletteId) {
    const pal = this.palettes.find(p => p.id === paletteId);
    if (!pal) return;
    this.palette = paletteId;
    localStorage.setItem('juit_theme_palette', paletteId);
    
    // Auto sync dark/light if palette demands light mode (e.g. frost)
    if (pal.mode === 'light' && this.themeMode !== 'light') {
      this.themeMode = 'light';
      localStorage.setItem('juit_theme_mode', 'light');
    } else if (pal.mode === 'dark' && this.themeMode === 'light') {
      this.themeMode = 'dark';
      localStorage.setItem('juit_theme_mode', 'dark');
    }

    this.applyTheme();
    this.applyPalette();
    this.updateControls();
  },

  applyPalette() {
    document.documentElement.setAttribute('data-palette', this.palette);
    const pal = this.palettes.find(p => p.id === this.palette);
    if (pal) {
      document.documentElement.style.setProperty('--color-primary', pal.color);
      document.documentElement.style.setProperty('--accent-primary', pal.color);
      document.documentElement.style.setProperty('--accent-gradient', pal.gradient);
      document.documentElement.style.setProperty('--border-active', pal.color);
      document.documentElement.style.setProperty('--accent-glow', `${pal.color}40`);

      const themeNameEl = document.getElementById('account-theme-name');
      if (themeNameEl) {
        themeNameEl.textContent = pal.name;
      }
    }
  },

  applyTheme() {
    let resolvedTheme = this.themeMode;
    if (this.themeMode === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-theme-mode', this.themeMode);

    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

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
        iconSpan.textContent = resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode';
      }
      btnToggle.title = resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      btnToggle.setAttribute('aria-label', btnToggle.title);
    }

    // Update meta theme-color for mobile browser address bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? (this.palette === 'oled' ? '#000000' : '#0f131d') : '#f8fafc');
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

    document.querySelectorAll('[data-set-palette]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setPalette(btn.dataset.setPalette);
      });
    });

    // Modal quick theme cycle
    const btnModalTheme = document.getElementById('btn-modal-theme-toggle');
    if (btnModalTheme) {
      btnModalTheme.addEventListener('click', () => {
        const palIdx = this.palettes.findIndex(p => p.id === this.palette);
        const nextPal = this.palettes[(palIdx + 1) % this.palettes.length];
        this.setPalette(nextPal.id);
      });
    }

    this.updateControls();
  },

  renderThemePickerInModal() {
    const container = document.getElementById('theme-palette-picker-container');
    if (!container) return;

    container.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        ${this.palettes.map(p => `
          <button type="button" 
                  class="palette-chip-btn p-2 rounded-xl border flex flex-col items-start gap-1 transition-all cursor-pointer ${this.palette === p.id ? 'border-primary ring-2 ring-primary/30 bg-surface-container-high' : 'border-white/[0.06] bg-surface-container hover:bg-surface-container-high'}"
                  data-set-palette="${p.id}">
            <div class="flex items-center gap-1.5 w-full">
              <span class="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style="background: ${p.color};"></span>
              <span class="text-[11px] font-bold text-on-surface truncate">${p.name}</span>
            </div>
            <span class="text-[9.5px] text-on-surface-variant truncate w-full">${p.mode === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('[data-set-palette]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setPalette(btn.dataset.setPalette);
        this.renderThemePickerInModal();
      });
    });
  },

  updateControls() {
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.setTheme === this.themeMode);
    });
    document.querySelectorAll('[data-set-accent]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.setAccent === this.accentColor);
    });
    document.querySelectorAll('[data-set-palette]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.setPalette === this.palette);
    });
    this.renderThemePickerInModal();
  }
};

window.ThemeManager = ThemeManager;
