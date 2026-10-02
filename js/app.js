/**
 * Master Application Orchestrator for JUIT Student Hub
 * "Your campus, organized."
 */

const App = {
  activeView: 'dash',
  realTimeCountdownInterval: null,

  init() {
    console.log('Initializing JUIT Student Hub...');

    // 1. Initialize Theme & Accent Engine
    if (window.ThemeManager) {
      window.ThemeManager.init();
    }

    // 2. Data verification
    const data = window.JUIT_DATA || {};

    // 3. Initialize Controllers
    if (window.TimetableController) {
      window.TimetableController.init(data.timetable);
    }
    if (window.MessController) {
      window.MessController.init(data.mess);
    }
    if (window.CampusMap) {
      window.CampusMap.init(data.campus);
    }
    if (window.CalendarController) {
      window.CalendarController.init(data.calendar);
    }
    if (window.AcademicsController) {
      window.AcademicsController.init();
    }
    if (window.ResourcesController) {
      window.ResourcesController.init();
    }
    if (window.AnnouncementsController) {
      window.AnnouncementsController.init();
    }
    if (window.EventsClubsController) {
      window.EventsClubsController.init();
    }
    if (window.UtilitiesController) {
      window.UtilitiesController.init();
    }
    if (window.PortalsController) {
      window.PortalsController.init();
    }
    if (window.AdminController) {
      window.AdminController.init();
    }
    if (window.BusGuideController) {
      window.BusGuideController.init();
    }

    // 4. Bind UI Shell
    this.bindNavigation();
    this.startLiveClock();
    this.bindSearchModal();
    this.bindOnboardingModal();
    this.bindMobileDrawer();
    this.initPWA();

    // 5. Check URL Hash or Initial View
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      this.switchView(hash);
    } else {
      this.switchView('dash');
    }

    // 6. Refresh Dashboard Highlights & Real-time Live Class Countdown
    this.refreshDashboard();
    this.startRealTimeCountdowns();

    // 7. Check if first time onboarding prompt needed
    if (!localStorage.getItem('juit_onboarded_v1')) {
      setTimeout(() => {
        this.openOnboardingModal();
      }, 600);
    }

    console.log('JUIT Student Hub ready.');
  },

  switchView(viewId) {
    this.activeView = viewId;
    window.location.hash = viewId;

    // Update active state in desktop sidebar, top tabs, and mobile bottom HUD dock
    document.querySelectorAll('.nav-link, .nav-tab-item, .mobile-nav-item, .mobile-hud-item').forEach(btn => {
      const match = (btn.dataset.view === viewId);
      btn.classList.toggle('active', match);
    });

    // Synchronize bottom HUD dock: if active view is a secondary module, illuminate 'More'
    const directDockViews = ['dash', 'timetable', 'academics', 'mess', 'resources'];
    const hudMoreBtn = document.getElementById('btn-mobile-hud-more');
    if (hudMoreBtn) {
      const isSecondary = !directDockViews.includes(viewId);
      hudMoreBtn.classList.toggle('active', isSecondary);
      let dot = hudMoreBtn.querySelector('.hud-active-dot');
      if (isSecondary) {
        if (!dot) {
          dot = document.createElement('span');
          dot.className = 'hud-active-dot';
          hudMoreBtn.appendChild(dot);
        }
      } else if (dot) {
        dot.remove();
      }
    }

    // Toggle panels
    document.querySelectorAll('.app-view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`view-${viewId}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    // Module-specific hooks
    if (viewId === 'dash') {
      this.refreshDashboard();
    } else if (viewId === 'campus' && window.CampusMap) {
      window.CampusMap.renderSVGMap();
    } else if (viewId === 'timetable' && window.TimetableController) {
      window.TimetableController.renderSchedule();
    } else if (viewId === 'mess' && window.MessController) {
      window.MessController.renderMeals();
    } else if (viewId === 'calendar' && window.CalendarController) {
      if (typeof window.CalendarController.renderCalendarContent === 'function') {
        window.CalendarController.renderCalendarContent();
      } else if (typeof window.CalendarController.renderTimeline === 'function') {
        window.CalendarController.renderTimeline();
      }
    } else if (viewId === 'academics' && window.AcademicsController) {
      if (typeof window.AcademicsController.onViewActivated === 'function') {
        window.AcademicsController.onViewActivated();
      }
    } else if (viewId === 'bus' && window.BusGuideController) {
      window.BusGuideController.init();
    } else if (viewId === 'admin' && window.AdminController) {
      window.AdminController.checkAdminStatus();
    }

    window.scrollTo(0, 0);
  },

  bindNavigation() {
    // Desktop sidebar and general navigation links
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.dataset.view;
        if (view) {
          this.switchView(view);
          this.closeMobileDrawer();
        }
      });
    });

    // Quick action triggers in dashboard
    document.querySelectorAll('[data-action-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.dataset.actionView;
        if (view) {
          this.switchView(view);
        }
      });
    });

    // Brand logo returns to dashboard
    document.getElementById('brand-logo-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchView('dash');
    });

    // Profile & Settings quick access
    document.getElementById('btn-open-profile-settings')?.addEventListener('click', () => {
      this.openOnboardingModal();
    });
    document.getElementById('sidebar-user-card')?.addEventListener('click', () => {
      this.openOnboardingModal();
    });
    document.getElementById('mobile-sidebar-user-card')?.addEventListener('click', () => {
      this.closeMobileDrawer();
      this.openOnboardingModal();
    });
  },

  /* ================= REAL-TIME CLOCK & CLASS COUNTDOWN ================= */
  startLiveClock() {
    const timeDisplay = document.getElementById('live-clock-time');
    const dateDisplay = document.getElementById('live-clock-date');
    const dashDateDisplay = document.getElementById('dash-current-date-heading');
    const greetingDisplay = document.getElementById('dash-live-greeting');

    const update = () => {
      const now = new Date();
      const hrs = now.getHours();

      // Greeting
      let greet = 'Good evening 👋';
      if (hrs < 12) greet = 'Good morning 👋';
      else if (hrs < 17) greet = 'Good afternoon 👋';

      const scholarName = window.JUIT_PROFILE?.name || 'Scholar';
      if (greetingDisplay) {
        greetingDisplay.textContent = `${greet} ${scholarName}`;
      }

      // Live Time
      if (timeDisplay) {
        timeDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }

      // Date Format: "Tuesday, 22 September"
      const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      if (dateDisplay) {
        dateDisplay.textContent = dateStr;
      }
      if (dashDateDisplay) {
        dashDateDisplay.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
      }
    };

    update();
    setInterval(update, 1000);
  },

  startRealTimeCountdowns() {
    if (this.realTimeCountdownInterval) clearInterval(this.realTimeCountdownInterval);
    this.realTimeCountdownInterval = setInterval(() => {
      if (this.activeView === 'dash') {
        this.updateDashboardLiveClassCard();
      }
      if (window.TimetableController) {
        window.TimetableController.updateTimeTracker();
      }
    }, 10000); // Check every 10 seconds
  },

  /* ================= DASHBOARD AGGREGATOR ================= */
  refreshDashboard() {
    this.updateDashboardLiveClassCard();
    this.updateDashboardTodaySchedule();
    this.updateDashboardMessSnapshot();
    this.updateDashboardAnnouncements();
    this.updateDashboardMilestone();
    this.updateDashboardFastDownloads();
    this.updateUserProfileBadges();
  },

  getVaultResourceForClass(subjectOrCode, code, type) {
    if (!subjectOrCode && !code) return null;
    if (window.TimetableController && typeof window.TimetableController.resolveVaultResource === 'function') {
      return window.TimetableController.resolveVaultResource(subjectOrCode, code || subjectOrCode, type);
    }
    const cleanSubj = String(subjectOrCode || '').toUpperCase();
    const c = String(code || subjectOrCode || '').toUpperCase();
    const combined = `${cleanSubj} ${c}`;

    // 1. SDF / C Programming
    if (
      c.includes('CI112') ||
      c.includes('CI172') ||
      cleanSubj.includes('SDF') ||
      cleanSubj.includes('SOFTWARE DEV') ||
      cleanSubj.includes('C PROG')
    ) {
      if (type === 'P' || c.includes('172') || combined.includes('LAB')) {
        return {
          title: 'SDF Laboratory Assignment Solutions Manual',
          label: 'SDF Lab Manual',
          shortTitle: 'SDF Lab Manual',
          link: 'vault/SDF_Lab_Assignment_Solutions_Manual.pdf'
        };
      }
      return {
        title: 'SDF Lecture 1: Introduction to C',
        label: 'SDF C Notes',
        shortTitle: 'SDF Notes',
        link: 'vault/SDF_Lecture_1_Introduction_to_C.pdf'
      };
    }

    // 2. Physics
    if (
      c.includes('PH111') ||
      c.includes('PH171') ||
      c.includes('PH112') ||
      c.includes('PH172') ||
      cleanSubj.includes('PHYSIC') ||
      cleanSubj.includes('OPTIC') ||
      cleanSubj.includes('ELECTRO')
    ) {
      if (type === 'P' || c.includes('171') || c.includes('172') || combined.includes('LAB') || combined.includes('PHLAB')) {
        return {
          title: 'Physics Laboratory Manual (PHLAB)',
          label: 'Physics Lab Manual',
          shortTitle: 'Physics Lab Manual',
          link: 'vault/Physics_Laboratory_Manual_PHLAB.pdf'
        };
      }
      return {
        title: 'Physics Notes & Formulas',
        label: 'Physics Notes',
        shortTitle: 'Physics Notes',
        link: 'vault/Physics_Electrodynamics_Optics_Notes.pdf'
      };
    }

    // 3. English
    if (
      c.includes('HS111') ||
      c.includes('HS171') ||
      cleanSubj.includes('ENGLISH') ||
      cleanSubj.includes('COMMUNICATION') ||
      combined.includes('LANGULAB')
    ) {
      if (type === 'P' || c.includes('171') || combined.includes('LAB') || combined.includes('LANGULAB')) {
        return {
          title: 'English Language Lab Manual',
          label: 'English Lab Manual',
          shortTitle: 'English Lab Manual',
          link: 'vault/English_Language_Lab_Manual.pdf'
        };
      }
      return {
        title: 'English Notes & Lab Manual',
        label: 'English Notes',
        shortTitle: 'English Notes',
        link: 'vault/English_Communication_Skills_Lecture_Notes.pdf'
      };
    }

    // 4. Basic Electronics / EC
    if (
      c.includes('EC111') ||
      c.includes('EC112') ||
      c.includes('EC171') ||
      cleanSubj.includes('ELECTRONIC')
    ) {
      if (type === 'P' || c.includes('171') || combined.includes('LAB') || combined.includes('ECLAB')) {
        return {
          title: 'Basic Electronics: All Tutorials Problem Sets Bundle (1–5)',
          label: 'Electronics Tutorial Pack',
          shortTitle: 'Electronics Tutorials',
          link: 'vault/Basic_Electronics_All_Tutorials_Bundle.pdf'
        };
      }
      return {
        title: 'Basic Electronics Tutorial 1: Charge, Current, Voltage & Power',
        label: 'Electronics Tutorial 1',
        shortTitle: 'Electronics Tutorial',
        link: 'vault/Basic_Electronics_Tutorial_1.pdf'
      };
    }

    // 5. Any other subject with no notes data: keep empty
    return null;
  },

  updateDashboardFastDownloads() {
    const container = document.getElementById('dash-fast-downloads-carousel');
    if (!container) return;

    const featuredDownloads = [
      {
        id: 'feat-math-all',
        title: 'Mathematics I: Complete Tutorial Sheets Bundle (1–4)',
        code: '25B11MA113',
        subject: 'Mathematics',
        type: 'Tutorial Pack',
        size: '1.5 MB',
        scope: 'Double Integrals, Limits & Continuity, Taylor Series, Area & Volume (Original Official PDF)',
        link: 'vault/Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf',
        color: '#00e5ff'
      },
      {
        id: 'feat-ec-all',
        title: 'Basic Electronics: All Tutorials Bundle (1–5)',
        code: '25B11EC111',
        subject: 'Electronics',
        type: 'Tutorial Pack',
        size: '772 KB',
        scope: 'KVL/KCL, Nodal & Mesh Analysis, Thévenin / Norton Theorems, Diode & Zener Models',
        link: 'vault/Basic_Electronics_All_Tutorials_Bundle.pdf',
        color: '#38bdf8'
      },
      {
        id: 'feat-sdf-lab',
        title: 'SDF C Programming Complete Solved Lab Manual',
        code: '25B17CI172',
        subject: 'Computing',
        type: 'Lab Manual',
        size: '410 KB',
        scope: 'CL01–CL52 Solved Sessions, Dry Run Traces, Control Flow, Pointers & Structures',
        link: 'vault/SDF_Lab_Assignment_Solutions_Manual.pdf',
        color: '#10b981'
      },
      {
        id: 'feat-physics-handbook',
        title: 'Engineering Physics: Formula & Derivation Handbook',
        code: '25B11PH111',
        subject: 'Physics',
        type: 'Handbook',
        size: '275 KB',
        scope: 'Maxwell Equations, Ruby / He-Ne Lasers, Optical Fiber & Quantum Wave Equations',
        link: 'vault/Physics_Formula_and_Derivation_Handbook.pdf',
        color: '#f59e0b'
      }
    ];

    container.innerHTML = featuredDownloads.map(item => `
      <div class="rounded-xl bg-surface-container-high hover:bg-surface-bright p-space-md flex flex-col justify-between transition-all shadow-sm border border-outline-variant/20 group">
        <div>
          <div class="flex items-center justify-between gap-space-xs mb-space-sm">
            <span class="px-space-xs py-0.5 rounded font-label-sm text-label-sm font-semibold" style="background: ${item.color}20; color: ${item.color};">
              ${item.subject} • ${item.type}
            </span>
            <span class="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant">
              ${item.size}
            </span>
          </div>
          <h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-space-xs">
            ${item.title}
          </h4>
          <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-space-md">
            ${item.scope}
          </p>
        </div>
        <div class="pt-space-sm flex items-center justify-between border-t border-outline-variant/20 -mx-space-md -mb-space-md px-space-md py-space-sm rounded-b-xl bg-surface-container-lowest/40">
          <button type="button" class="btn-preview-fast-doc inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-link="${item.link}" data-title="${item.title}">
            <span class="material-symbols-outlined text-[16px]">visibility</span>
            <span>View</span>
          </button>
          <a href="${item.link}" download class="inline-flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-secondary-fixed transition-colors font-medium">
            <span>Download</span>
            <span class="material-symbols-outlined text-[16px]">download</span>
          </a>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-preview-fast-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.ResourcesController && typeof window.ResourcesController.previewDocument === 'function') {
          window.ResourcesController.previewDocument(btn.dataset.link, btn.dataset.title);
        } else {
          window.open(btn.dataset.link, '_blank');
        }
      });
    });
  },

  updateUserProfileBadges() {
    const p = window.JUIT_PROFILE || { programme: 'B.Tech', branch: 'CSE', semester: '1', batch: '26BT16' };
    const label = document.getElementById('sidebar-user-batch-label');
    if (label) {
      label.textContent = `${p.programme || 'B.Tech'} Sem ${p.semester || '1'} • ${p.batch || p.branch || '26BT16'}`;
    }
    const nameEl = document.getElementById('sidebar-user-name');
    if (nameEl) {
      nameEl.textContent = p.name || 'JUIT Scholar';
    }
  },

  updateDashboardLiveClassCard() {
    const heroCard = document.getElementById('dash-next-class-hero');
    if (!heroCard || !window.TimetableController) return;

    const dayIndex = new Date().getDay();
    const isSunday = (dayIndex === 0);
    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dayIndex];
    const dayClasses = window.TimetableController.filterAndMergeEntries(isSunday ? 'MON' : currentDayCode);
    const nowMins = window.TimetableController.getCurrentMinutes();

    if (isSunday) {
      heroCard.innerHTML = `
        <div class="rounded-xl bg-surface-container-low p-space-xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden min-h-[340px] border border-outline-variant/20">
          <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-space-md text-secondary shadow-inner">
            <span class="material-symbols-outlined text-[32px]">weekend</span>
          </div>
          <h3 class="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">Sunday • Campus Weekend</h3>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
            No regular lectures scheduled today. Annapurna dining hall is serving weekend specials and LRC study halls are open.
          </p>
          <div class="w-full max-w-sm rounded-lg bg-surface-container p-space-sm flex items-center justify-around text-center">
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Dining Halls</p>
              <p class="font-headline-sm text-headline-sm text-on-surface font-semibold">Annapurna Open</p>
            </div>
            <div class="h-6 w-px bg-surface-container-high"></div>
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">LRC Library</p>
              <p class="font-headline-sm text-headline-sm text-primary font-semibold">24x7 Reading</p>
            </div>
            <div class="h-6 w-px bg-surface-container-high"></div>
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">First Class</p>
              <p class="font-headline-sm text-headline-sm text-secondary font-semibold">Mon 09:00 AM</p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (dayClasses.length === 0) {
      heroCard.innerHTML = `
        <div class="rounded-xl bg-surface-container-low p-space-xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden min-h-[340px] border border-outline-variant/20">
          <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-space-md text-secondary shadow-inner">
            <span class="material-symbols-outlined text-[32px]">celebration</span>
          </div>
          <h3 class="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">No Classes Scheduled Today</h3>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
            Enjoy your free academic day or study at LRC Central Library.
          </p>
        </div>
      `;
      return;
    }

    let activeClass = null;
    let nextClass = null;

    for (const c of dayClasses) {
      const range = window.TimetableController.parseTimeRange(c.time);
      if (!range) continue;

      if (nowMins >= range.start && nowMins < range.end) {
        activeClass = { ...c, range };
        break;
      }
      if (nowMins < range.start) {
        if (!nextClass || range.start < nextClass.range.start) {
          nextClass = { ...c, range };
        }
      }
    }

    if (activeClass) {
      const minsLeft = activeClass.range.end - nowMins;
      heroCard.innerHTML = `
        <div class="rounded-xl bg-surface-container-low p-space-lg flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[340px] border border-primary/40">
          <div class="space-y-space-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-space-xs">
                <span class="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-primary/20 text-primary font-label-sm text-label-sm font-semibold">
                  <span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  LIVE NOW
                </span>
                <span class="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  ${activeClass.typeName || 'Lecture'}
                </span>
              </div>
              <span class="font-code-sm text-code-sm text-primary font-medium">Ends in ${minsLeft}m</span>
            </div>

            <div class="pt-2">
              <div class="font-label-sm text-label-sm text-outline font-mono mb-1">${activeClass.code || ''}</div>
              <h3 class="font-headline-md text-headline-md text-on-surface font-bold leading-tight">
                ${window.TimetableController.getCleanSubjectName(activeClass.code, activeClass.subject)}
              </h3>
            </div>

            <div class="grid grid-cols-2 gap-space-xs pt-2">
              <div class="p-space-sm rounded bg-surface-container">
                <span class="font-label-sm text-label-sm text-on-surface-variant block">Timing</span>
                <span class="font-body-sm text-body-sm text-on-surface font-semibold">${activeClass.time}</span>
              </div>
              <div class="p-space-sm rounded bg-surface-container">
                <span class="font-label-sm text-label-sm text-on-surface-variant block">Venue</span>
                <span class="font-body-sm text-body-sm text-secondary font-semibold">${activeClass.venue}</span>
              </div>
              <div class="p-space-sm rounded bg-surface-container col-span-2">
                <span class="font-label-sm text-label-sm text-on-surface-variant block">Faculty</span>
                <span class="font-body-sm text-body-sm text-on-surface font-medium">${activeClass.faculty || 'Department Faculty'}</span>
              </div>
            </div>
          </div>

          <div class="pt-space-md flex flex-wrap items-center gap-space-sm">
            <button type="button" class="btn-locate-room px-space-md py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-body-sm text-body-sm font-medium transition-colors flex items-center gap-1.5" data-room="${activeClass.venue}">
              <span class="material-symbols-outlined text-[16px]">location_on</span>
              <span>Locate Classroom</span>
            </button>
            <button type="button" class="btn-room-directions px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-colors flex items-center gap-1.5" data-room="${activeClass.venue}">
              <span class="material-symbols-outlined text-[16px]">directions_walk</span>
              <span>Walking Guide</span>
            </button>
            ${(() => {
              const res = this.getVaultResourceForClass(activeClass.subject, activeClass.code, activeClass.type);
              return res ? `
                <a href="${res.link}" download class="inline-flex items-center gap-1 px-space-md py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-secondary font-label-md text-label-md transition-colors border border-outline-variant/30" title="Download ${res.title}">
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  <span>${res.shortTitle || res.title}</span>
                </a>
              ` : '';
            })()}
          </div>
        </div>
      `;
    } else if (nextClass) {
      const minsUntil = nextClass.range.start - nowMins;
      const hrs = Math.floor(minsUntil / 60);
      const remMins = minsUntil % 60;
      const timeStr = (hrs > 0) ? `${hrs}h ${remMins}m` : `${remMins}m`;

      heroCard.innerHTML = `
        <div class="rounded-xl bg-surface-container-low p-space-lg flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[340px] border border-secondary/30">
          <div class="space-y-space-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-space-xs">
                <span class="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-secondary/20 text-secondary font-label-sm text-label-sm font-semibold">
                  NEXT UP
                </span>
                <span class="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  ${nextClass.typeName || 'Lecture'}
                </span>
              </div>
              <span class="font-code-sm text-code-sm text-secondary font-medium">Starts in ${timeStr}</span>
            </div>

            <div class="pt-2">
              <div class="font-label-sm text-label-sm text-outline font-mono mb-1">${nextClass.code || ''}</div>
              <h3 class="font-headline-md text-headline-md text-on-surface font-bold leading-tight">
                ${window.TimetableController.getCleanSubjectName(nextClass.code, nextClass.subject)}
              </h3>
            </div>

            <div class="grid grid-cols-2 gap-space-xs pt-2">
              <div class="p-space-sm rounded bg-surface-container">
                <span class="font-label-sm text-label-sm text-on-surface-variant block">Timing</span>
                <span class="font-body-sm text-body-sm text-on-surface font-semibold">${nextClass.time}</span>
              </div>
              <div class="p-space-sm rounded bg-surface-container">
                <span class="font-label-sm text-label-sm text-on-surface-variant block">Venue</span>
                <span class="font-body-sm text-body-sm text-secondary font-semibold">${nextClass.venue}</span>
              </div>
              <div class="p-space-sm rounded bg-surface-container col-span-2">
                <span class="font-label-sm text-label-sm text-on-surface-variant block">Faculty</span>
                <span class="font-body-sm text-body-sm text-on-surface font-medium">${nextClass.faculty || 'Department Faculty'}</span>
              </div>
            </div>
          </div>

          <div class="pt-space-md flex flex-wrap items-center gap-space-sm">
            <button type="button" class="btn-locate-room px-space-md py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-body-sm text-body-sm font-medium transition-colors flex items-center gap-1.5" data-room="${nextClass.venue}">
              <span class="material-symbols-outlined text-[16px]">location_on</span>
              <span>Locate Classroom</span>
            </button>
            <button type="button" class="btn-room-directions px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-colors flex items-center gap-1.5" data-room="${nextClass.venue}">
              <span class="material-symbols-outlined text-[16px]">directions_walk</span>
              <span>Walking Guide</span>
            </button>
            ${(() => {
              const res = this.getVaultResourceForClass(nextClass.subject, nextClass.code, nextClass.type);
              return res ? `
                <a href="${res.link}" download class="inline-flex items-center gap-1 px-space-md py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-secondary font-label-md text-label-md transition-colors border border-outline-variant/30" title="Download ${res.title}">
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  <span>${res.shortTitle || res.title}</span>
                </a>
              ` : '';
            })()}
          </div>
        </div>
      `;
    } else {
      const dateKey = new Date().toISOString().slice(0, 10);
      const attRecords = JSON.parse(localStorage.getItem(`juit_att_${dateKey}`) || '{}');
      const attendedCount = dayClasses.filter(c => attRecords[`class_${window.TimetableController?.activeSemesterId}_${currentDayCode}_${c.code}_${c.parsedRange ? c.parsedRange.start : ''}`] === 'attended').length || dayClasses.length;
      
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const nextDayIdx = (dayIndex + 1) % 7;
      const nextDayCode = dayNames[nextDayIdx === 0 ? 1 : nextDayIdx];
      const nextDayClasses = window.TimetableController ? window.TimetableController.filterAndMergeEntries(nextDayCode) : [];
      const nextFirstTime = nextDayClasses[0]?.time ? nextDayClasses[0].time.split(/[-–—]/)[0].trim() : '09:00 AM';
      const nextFirstSubj = nextDayClasses[0] ? window.TimetableController.getCleanSubjectName(nextDayClasses[0].code, nextDayClasses[0].subject) : 'Operating Sys';
      const firstSubjShort = nextFirstSubj.length > 13 ? nextFirstSubj.slice(0, 13) + '...' : nextFirstSubj;

      heroCard.innerHTML = `
        <div class="rounded-xl bg-surface-container-low p-space-xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden min-h-[340px] border border-outline-variant/20">
          <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-space-md text-secondary shadow-inner">
            <span class="material-symbols-outlined text-[32px]">auto_awesome</span>
          </div>
          <h3 class="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">All Classes Completed Today</h3>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
            Great job! You have completed all scheduled lectures and laboratory sessions for today.
          </p>
          <div class="w-full max-w-sm rounded-lg bg-surface-container p-space-sm flex items-center justify-around text-center border border-outline-variant/10">
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Attended</p>
              <p class="font-headline-sm text-headline-sm text-on-surface font-semibold">${attendedCount} / ${dayClasses.length}</p>
            </div>
            <div class="h-6 w-px bg-surface-container-high"></div>
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Up Next</p>
              <p class="font-headline-sm text-headline-sm text-primary font-semibold">${nextDayCode} ${nextFirstTime}</p>
            </div>
            <div class="h-6 w-px bg-surface-container-high"></div>
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">First Lecture</p>
              <p class="font-headline-sm text-headline-sm text-secondary font-semibold" title="${nextFirstSubj}">${firstSubjShort}</p>
            </div>
          </div>
        </div>
      `;
    }

    heroCard.querySelectorAll('.btn-locate-room').forEach(b => {
      b.addEventListener('click', () => {
        const room = b.dataset.room;
        App.switchView('campus');
        if (window.CampusMap) window.CampusMap.focusVenue(room);
      });
    });

    heroCard.querySelectorAll('.btn-room-directions').forEach(b => {
      b.addEventListener('click', () => {
        const room = b.dataset.room;
        App.switchView('campus');
        if (window.CampusMap) window.CampusMap.showDirections(room);
      });
    });
  },

  updateDashboardTodaySchedule() {
    if (window.TimetableController && window.TimetableController.updateDashboardToday) {
      window.TimetableController.updateDashboardToday();
    }
  },

  updateDashboardMessSnapshot() {
    const container = document.getElementById('dash-next-meal-preview');
    if (!container) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()] || 'Tuesday';
    const mess = window.JUIT_DATA?.mess?.weeklyMenu?.[todayName];

    if (!mess) {
      container.innerHTML = `<div style="padding: 16px; color: var(--text-muted);">Menu unavailable.</div>`;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="dash-mess-meal-pill">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.88rem; color: var(--color-breakfast); margin-bottom: 2px;">
            <span>🍳 Breakfast (07:30 – 09:30 AM)</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
            ${(mess.breakfast?.items || []).slice(0, 4).join(', ')}...
          </div>
        </div>

        <div class="dash-mess-meal-pill">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.88rem; color: var(--color-lunch); margin-bottom: 2px;">
            <span>🍛 Lunch (12:00 – 02:00 PM)</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
            ${(mess.lunch?.items || []).slice(0, 4).join(', ')}...
          </div>
        </div>

        <div class="dash-mess-meal-pill">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.88rem; color: var(--color-dinner); margin-bottom: 2px;">
            <span>🍲 Dinner (07:30 – 09:00 PM)</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
            ${(mess.dinner?.items || []).slice(0, 3).join(', ')} • <strong>Sweet: ${mess.dinner?.sweetDish?.split(',')[0] || 'Dessert'}</strong>
          </div>
        </div>
      </div>
    `;
  },

  updateDashboardAnnouncements() {
    const container = document.getElementById('dash-announcements-preview');
    if (!container) return;

    const items = (window.JUIT_DATA?.announcements || []).slice(0, 3);
    container.innerHTML = items.map(a => `
      <div style="border-bottom: 1px solid var(--border-subtle); padding: 8px 0;">
        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 2px;">
          ${a.pinned ? '<span class="pinned-tag">📌 Pinned</span>' : ''}
          <span class="hub-badge" style="font-size: 0.7rem;">${a.category}</span>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${a.date}</span>
        </div>
        <div style="font-weight: 700; font-size: 0.9rem; line-height: 1.3;">${a.title}</div>
      </div>
    `).join('');
  },

  updateDashboardMilestone() {
    const banner = document.getElementById('dash-milestone-countdown');
    if (!banner) return;

    banner.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div class="flex items-center gap-space-md min-w-0">
          <div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary flex-shrink-0">
            <span class="material-symbols-outlined text-[24px]">crisis_alert</span>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-space-xs flex-wrap">
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Next University Milestone: T-2 Mid-Semester Examinations</span>
              <span class="px-space-xs py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-secondary font-medium">18 Days Left</span>
            </div>
            <p class="font-label-sm text-label-sm text-on-surface-variant mt-0.5 truncate">Academic Session 2026–27 • Solan Campus Examination Halls &amp; Centers</p>
          </div>
        </div>
        <a class="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-fixed font-medium whitespace-nowrap group" href="#calendar" onclick="if(window.App) App.switchView('calendar')">
          <span>Academic Calendar</span>
          <span class="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
        </a>
      </div>
    `;
  },

  /* ================= STUDENT ONBOARDING MODAL ================= */
  bindOnboardingModal() {
    const modal = document.getElementById('onboarding-modal-backdrop');
    const form = document.getElementById('onboarding-profile-form');
    const closeBtn = document.getElementById('btn-close-onboarding-modal');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        localStorage.setItem('juit_onboarded_v1', 'true');
      });
    }

    const progSelect = document.getElementById('onboard-programme-select');
    const branchSelect = document.getElementById('onboard-branch-select');
    const semSelect = document.getElementById('onboard-sem-select');
    const batchSelect = document.getElementById('onboard-batch-select');

    // Dynamic batch updater
    const updateBatches = () => {
      if (!batchSelect) return;
      const sem = semSelect ? semSelect.value : '1';
      let prefix = '26BT';
      if (sem === '3' || sem === '4') prefix = '25BT';
      if (sem === '5' || sem === '6') prefix = '24BT';
      if (sem === '7' || sem === '8') prefix = '23BT';

      let html = '';
      for (let i = 1; i <= 30; i++) {
        const code = `${prefix}${String(i).padStart(2, '0')}`;
        html += `<option value="${code}">${code}</option>`;
      }
      batchSelect.innerHTML = html;
      if (window.JUIT_PROFILE?.batch) {
        batchSelect.value = window.JUIT_PROFILE.batch;
      }
    };

    if (semSelect) semSelect.addEventListener('change', updateBatches);
    if (progSelect) progSelect.addEventListener('change', updateBatches);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const p = window.JUIT_PROFILE || {};
        p.name = document.getElementById('onboard-name-input')?.value || 'Scholar';
        p.programme = progSelect?.value || 'B.Tech';
        p.branch = branchSelect?.value || 'CSE';
        p.semester = semSelect?.value || '1';
        p.batch = batchSelect?.value || '26BT16';
        p.role = document.getElementById('onboard-role-select')?.value || 'Student';

        window.JUIT_PROFILE = p;
        localStorage.setItem('juit_student_profile', JSON.stringify(p));
        localStorage.setItem('juit_selected_batch', p.batch);
        localStorage.setItem('juit_onboarded_v1', 'true');

        if (modal) modal.classList.remove('open');

        // Re-sync Timetable controller with chosen semester and batch
        if (window.TimetableController) {
          let semKey = 'odd_btech_1_sem';
          if (p.semester === '3') semKey = 'odd_btech_3_sem';
          else if (p.semester === '5') semKey = 'odd_btech_5_sem';
          else if (p.semester === '7') semKey = 'odd_btech_7_sem';
          else if (p.semester === '2') semKey = 'even_btech_2_sem';
          else if (p.semester === '4') semKey = 'even_btech_4_sem';
          else if (p.semester === '6') semKey = 'even_btech_6_sem';
          else if (p.semester === '8') semKey = 'even_btech_8_sem';

          window.TimetableController.activeSemesterId = semKey;
          window.TimetableController.activeBatch = p.batch;
          window.TimetableController.renderSemesterDropdown();
          window.TimetableController.populateBatchDropdown();
          window.TimetableController.renderQuickBatchChips();
          window.TimetableController.renderDayPills();
          window.TimetableController.renderSchedule();
        }

        this.refreshDashboard();
      });
    }
  },

  openOnboardingModal() {
    const modal = document.getElementById('onboarding-modal-backdrop');
    if (!modal) return;

    const p = window.JUIT_PROFILE || {};
    const nameInput = document.getElementById('onboard-name-input');
    const progSelect = document.getElementById('onboard-programme-select');
    const branchSelect = document.getElementById('onboard-branch-select');
    const semSelect = document.getElementById('onboard-sem-select');
    const batchSelect = document.getElementById('onboard-batch-select');
    const roleSelect = document.getElementById('onboard-role-select');

    if (nameInput) nameInput.value = p.name || '';
    if (progSelect && p.programme) progSelect.value = p.programme;
    if (branchSelect && p.branch) branchSelect.value = p.branch;
    if (semSelect && p.semester) semSelect.value = p.semester;
    if (roleSelect && p.role) roleSelect.value = p.role;

    if (batchSelect) {
      const sem = semSelect ? semSelect.value : (p.semester || '1');
      let prefix = '26BT';
      if (sem === '3' || sem === '4') prefix = '25BT';
      if (sem === '5' || sem === '6') prefix = '24BT';
      if (sem === '7' || sem === '8') prefix = '23BT';

      let html = '';
      for (let i = 1; i <= 30; i++) {
        const code = `${prefix}${String(i).padStart(2, '0')}`;
        html += `<option value="${code}">${code}</option>`;
      }
      batchSelect.innerHTML = html;
      batchSelect.value = p.batch || (prefix + '16');
    }

    modal.classList.add('open');
  },

  /* ================= MOBILE NAVIGATION DRAWER & HUD DOCK ================= */
  bindMobileDrawer() {
    const toggleBtn = document.getElementById('btn-mobile-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    const closeBtn = document.getElementById('btn-close-mobile-drawer');
    const hudMoreBtn = document.getElementById('btn-mobile-hud-more');

    const openDrawer = () => {
      if (drawer) drawer.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('mobile-drawer-open');
    };

    const closeDrawer = () => {
      if (drawer) drawer.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('mobile-drawer-open');
    };

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (drawer && drawer.classList.contains('active')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (hudMoreBtn) {
      hudMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (drawer && drawer.classList.contains('active')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }
  },

  closeMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('mobile-drawer-open');
  },

  /* ================= PWA & SERVICE WORKER ================= */
  initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
          console.log('[PWA] Service Worker registered successfully', reg.scope);
        }).catch(err => {
          console.warn('[PWA] Service Worker registration failed', err);
        });
      });
    }

    // Offline / Online detection banner
    const offlineBanner = document.getElementById('offline-status-banner');
    const updateOnlineStatus = () => {
      if (offlineBanner) {
        if (!navigator.onLine) {
          offlineBanner.style.display = 'block';
        } else {
          offlineBanner.style.display = 'none';
        }
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  },

  /* ================= UNIVERSAL SEARCH (CTRL + K) ================= */
  bindSearchModal() {
    const btnOpen = document.getElementById('btn-open-search');
    const modal = document.getElementById('search-modal-backdrop');
    const input = document.getElementById('search-modal-input');
    const resultsContainer = document.getElementById('search-modal-results');
    const btnClose = document.getElementById('btn-close-search-modal');

    const openSearch = () => {
      if (modal) {
        modal.classList.add('open');
        setTimeout(() => input && input.focus(), 50);
      }
    };

    const closeSearch = () => {
      if (modal) modal.classList.remove('open');
    };

    if (btnOpen) btnOpen.addEventListener('click', openSearch);
    if (btnClose) btnClose.addEventListener('click', closeSearch);

    // Ctrl + K keyboard shortcut
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      } else if (e.key === 'Escape') {
        if (modal && modal.classList.contains('open')) closeSearch();
        const obModal = document.getElementById('onboarding-modal-backdrop');
        if (obModal && obModal.classList.contains('open')) obModal.classList.remove('open');
      }
    });

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSearch();
      });
    }

    if (input && resultsContainer) {
      input.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (!q) {
          resultsContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">Type to search across timetable, rooms, mess menu, calendar, and clubs...</div>';
          return;
        }

        const hits = [];

        // 1. Timetable classes
        const tt = window.JUIT_DATA?.timetable?.odd_btech_1_sem?.entries || [];
        const seenCodes = new Set();
        tt.forEach(entry => {
          if ((entry.subject?.toLowerCase().includes(q) || entry.code?.toLowerCase().includes(q)) && !seenCodes.has(entry.code)) {
            seenCodes.add(entry.code);
            hits.push({
              category: 'Timetable',
              icon: '📅',
              title: `${entry.subject} (${entry.code})`,
              sub: `Venue: ${entry.venue} • Faculty: ${entry.faculty || 'Dept'}`,
              action: () => {
                closeSearch();
                App.switchView('timetable');
              }
            });
          }
        });

        // 2. Campus Rooms & Venues
        const buildings = window.JUIT_DATA?.campus?.buildings || [];
        buildings.forEach(b => {
          if (b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)) {
            hits.push({
              category: 'Campus Map',
              icon: '📍',
              title: `${b.name} (${b.code})`,
              sub: `Category: ${b.category.toUpperCase()} • Solan Campus`,
              action: () => {
                closeSearch();
                App.switchView('campus');
                if (window.CampusMap) window.CampusMap.focusVenue(b.code);
              }
            });
          }
          if (b.floors) {
            b.floors.forEach(fl => {
              fl.facilities?.forEach(fac => {
                if (fac.toLowerCase().includes(q)) {
                  hits.push({
                    category: 'Classroom / Lab',
                    icon: '🚪',
                    title: fac,
                    sub: `${b.name} • ${fl.level}`,
                    action: () => {
                      closeSearch();
                      App.switchView('campus');
                      if (window.CampusMap) window.CampusMap.focusVenue(fac.split(' ')[0]);
                    }
                  });
                }
              });
            });
          }
        });

        // 3. Mess Menu Dishes
        const weeklyMenu = window.JUIT_DATA?.mess?.weeklyMenu || {};
        Object.entries(weeklyMenu).forEach(([day, meals]) => {
          ['breakfast', 'lunch', 'dinner'].forEach(mType => {
            const m = meals[mType];
            if (m?.items) {
              m.items.forEach(dish => {
                if (dish.toLowerCase().includes(q)) {
                  hits.push({
                    category: 'Mess Menu',
                    icon: '🍲',
                    title: dish,
                    sub: `Annapurna Mess • ${day} ${mType.toUpperCase()}`,
                    action: () => {
                      closeSearch();
                      App.switchView('mess');
                      if (window.MessController) {
                        window.MessController.activeDay = day;
                        window.MessController.renderDayTabs();
                        window.MessController.renderMeals();
                      }
                    }
                  });
                }
              });
            }
          });
        });

        // 4. Clubs
        const clubs = window.JUIT_DATA?.clubs || [];
        clubs.forEach(c => {
          if (c.name.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)) {
            hits.push({
              category: 'Clubs & Societies',
              icon: '🏛️',
              title: c.name,
              sub: `Hub: ${c.meetingVenue}`,
              action: () => {
                closeSearch();
                App.switchView('events-clubs');
                if (window.EventsClubsController) {
                  window.EventsClubsController.activeTab = 'clubs';
                  window.EventsClubsController.renderTabs();
                  window.EventsClubsController.renderContent();
                }
              }
            });
          }
        });

        // 5. Announcements
        const anns = window.JUIT_DATA?.announcements || [];
        anns.forEach(a => {
          if (a.title.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q)) {
            hits.push({
              category: 'Notices',
              icon: '📢',
              title: a.title,
              sub: `Issued: ${a.date} • ${a.category}`,
              action: () => {
                closeSearch();
                App.switchView('announcements');
              }
            });
          }
        });

        // 6. Bus Travel Guide Routes
        const busRoutes = window.BusGuideController?.routes || [];
        busRoutes.forEach(r => {
          if (r.name.toLowerCase().includes(q) || r.tagline.toLowerCase().includes(q) || r.tags.some(t => t.includes(q)) || 'bus travel route transit waknaghat hrtc'.includes(q)) {
            hits.push({
              category: 'Bus Travel Guide',
              icon: '🚌',
              title: `${r.name} (${r.directionLabel.split('/')[0].trim()})`,
              sub: `${r.approxTime} • ${r.transfers === 0 ? 'Direct Bus' : 'Change at ' + r.transferPoint} • ${r.approxFare}`,
              action: () => {
                closeSearch();
                App.switchView('bus');
                if (window.BusGuideController) {
                  window.BusGuideController.openRouteGuide(r.id);
                }
              }
            });
          }
        });

        if (hits.length === 0) {
          resultsContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">No results found for "' + q + '".</div>';
        } else {
          resultsContainer.innerHTML = hits.slice(0, 10).map((h, i) => `
            <div class="search-result-row" data-idx="${i}">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.4rem;">${h.icon}</span>
                <div>
                  <div style="font-weight: 700; font-size: 0.95rem;">${h.title}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">${h.category} • ${h.sub}</div>
                </div>
              </div>
              <span style="font-size: 1.1rem; color: var(--accent-primary);">→</span>
            </div>
          `).join('');

          resultsContainer.querySelectorAll('.search-result-row').forEach(row => {
            row.addEventListener('click', () => {
              const idx = parseInt(row.dataset.idx, 10);
              if (hits[idx] && hits[idx].action) hits[idx].action();
            });
          });
        }
      });
    }
  }
};

window.App = App;

// Bootstrap on DOM ready or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}

