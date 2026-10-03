/**
 * Master Application Orchestrator for JUIT Student Hub
 * "Your campus, organized."
 */

const App = {
  activeView: 'dash',
  realTimeCountdownInterval: null,

  init() {
    console.log('Initializing JUIT Student Hub...');

    // 0. Load student academic identity & profile from storage
    this.loadStudentProfile();

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
    if (hash && (document.getElementById(`view-${hash}`) || hash === 'events')) {
      this.switchView(hash);
    } else {
      this.switchView('dash');
    }

    // Listen to hash changes (back/forward or external links)
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (h && (document.getElementById(`view-${h}`) || h === 'events')) {
        this.switchView(h);
      }
    });

    // 6. Refresh Dashboard Highlights & Real-time Live Class Countdown
    this.refreshDashboard();
    this.startRealTimeCountdowns();

    // 7. Check if student needs to be prompted for profile info first
    const profileConfigured = localStorage.getItem('juit_profile_configured');
    const scholarName = (window.JUIT_PROFILE?.name || '').trim();
    const hasCustomName = scholarName !== '' && 
      scholarName.toLowerCase() !== 'scholar' && 
      scholarName.toLowerCase() !== 'juit scholar' && 
      !scholarName.toLowerCase().startsWith('aarav');

    // Prompt for profile info first if not yet configured by the student
    if (profileConfigured !== 'true' && profileConfigured !== 'guest' && !hasCustomName) {
      setTimeout(() => {
        this.openAccountModal(true);
      }, 300);
    }

    console.log('JUIT Student Hub ready.');
  },

  switchView(viewId) {
    if (viewId === 'events') viewId = 'events-clubs';
    this.activeView = viewId;
    window.location.hash = viewId;

    // Update active state in desktop sidebar, top tabs, and mobile bottom HUD dock
    document.querySelectorAll('.nav-link, .nav-tab-item, .mobile-nav-item, .mobile-hud-item, .mobile-hud-dock a, .mobile-hud-dock button').forEach(btn => {
      const match = (btn.dataset.view === viewId || (btn.dataset.view === 'events' && viewId === 'events-clubs') || (btn.dataset.view === 'events-clubs' && viewId === 'events'));
      btn.classList.toggle('active', match);
    });

    // Synchronize bottom HUD dock: if active view is a secondary module, illuminate 'More'
    const directDockViews = ['dash', 'timetable', 'campus', 'mess', 'resources'];
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

    // Update desktop header breadcrumb dynamically
    const viewMetadata = {
      'dash': { section: 'Campus Core', title: 'Dashboard' },
      'timetable': { section: 'Campus Core', title: 'Classes & Timetable' },
      'campus': { section: 'Campus Core', title: '3D Campus Wayfinder' },
      'mess': { section: 'Campus Core', title: 'Annapurna Dining' },
      'resources': { section: 'Campus Core', title: 'Academic Vault' },
      'utilities': { section: 'Student Logistics', title: 'Student Utilities' },
      'announcements': { section: 'Student Logistics', title: 'Campus Notices' },
      'events-clubs': { section: 'Student Logistics', title: 'Life & Events' },
      'bus': { section: 'Student Logistics', title: 'NH-5 Bus Transit' },
      'calendar': { section: 'Student Logistics', title: 'Academic Calendar' },
      'academics': { section: 'Student Logistics', title: 'Attendance Tracker' },
      'portals': { section: 'Student Logistics', title: 'Campus Portals' },
      'settings': { section: 'Preferences', title: 'Hub Settings' },
      'admin': { section: 'System', title: 'Admin Controls' }
    };
    const meta = viewMetadata[viewId] || { section: 'JUIT Hub', title: 'Campus' };
    const dtTitle = document.getElementById('desktop-view-title');
    const dtSub = document.getElementById('desktop-view-subtitle');
    if (dtTitle) dtTitle.textContent = meta.section;
    if (dtSub) dtSub.textContent = meta.title;

    // Module-specific hooks
    if (viewId === 'dash') {
      this.refreshDashboard();
    } else if (viewId === 'campus' && window.CampusMap) {
      if (typeof window.CampusMap.set3DMode === 'function') {
        window.CampusMap.set3DMode(window.CampusMap.is3DMode !== false);
      } else {
        window.CampusMap.renderSVGMap();
      }
    } else if (viewId === 'timetable' && window.TimetableController) {
      window.TimetableController.renderSchedule();
    } else if (viewId === 'mess' && window.MessController) {
      window.MessController.renderMeals();
    } else if (viewId === 'resources' && window.ResourcesController) {
      window.ResourcesController.renderResources();
    } else if (viewId === 'utilities' && window.UtilitiesController) {
      if (typeof window.UtilitiesController.initPomodoro === 'function') {
        window.UtilitiesController.initPomodoro();
      }
      if (typeof window.UtilitiesController.renderActiveTab === 'function') {
        window.UtilitiesController.renderActiveTab();
      }
    } else if (viewId === 'announcements' && window.AnnouncementsController) {
      window.AnnouncementsController.renderAnnouncements();
    } else if (viewId === 'events-clubs' && window.EventsClubsController) {
      window.EventsClubsController.renderContent();
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
    } else if (viewId === 'portals' && window.PortalsController) {
      window.PortalsController.renderCategoryFilters();
      window.PortalsController.renderPortals();
    } else if (viewId === 'admin' && window.AdminController) {
      window.AdminController.checkAdminStatus();
    } else if (viewId === 'settings') {
      this.syncSettingsView();
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
      this.openAccountModal();
    });
    document.getElementById('sidebar-user-card')?.addEventListener('click', () => {
      this.openAccountModal();
    });
    document.getElementById('mobile-sidebar-user-card')?.addEventListener('click', () => {
      this.closeMobileDrawer();
      this.openAccountModal();
    });
    document.getElementById('dash-quick-batch-badge')?.addEventListener('click', () => {
      this.openAccountModal();
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
      let greet = 'Good evening';
      if (hrs < 12) greet = 'Good morning';
      else if (hrs < 17) greet = 'Good afternoon';

      const scholarName = (window.JUIT_PROFILE?.name || '').trim();
      const isGeneric = !scholarName || scholarName.toLowerCase() === 'scholar' || scholarName.toLowerCase() === 'juit scholar' || scholarName.toLowerCase().startsWith('aarav');
      const firstName = isGeneric ? 'Scholar' : scholarName.split(' ')[0];
      if (greetingDisplay) {
        greetingDisplay.textContent = `${greet}, ${firstName} 👋`;
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
    this.updateDashboardGreetingSub();
    this.updateDashboardStats();
    this.updateDashboardLiveClassCard();
    this.updateDashboardTodaySchedule();
    this.updateDashboardMessSnapshot();
    this.updateDashboardAnnouncements();
    this.updateDashboardMilestone();
    this.updateDashboardFastDownloads();
    this.updateUserProfileBadges();
  },

  updateDashboardGreetingSub() {
    const subEl = document.getElementById('dash-greeting-sub');
    if (!subEl) return;

    const now = new Date();
    const hrs = now.getHours();
    const dayIndex = now.getDay();
    const isSunday = (dayIndex === 0);
    const batch = window.JUIT_PROFILE?.batch || '26BT10';
    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dayIndex];
    const todayClasses = window.TimetableController ? window.TimetableController.filterAndMergeEntries(isSunday ? 'MON' : currentDayCode) : [];

    if (isSunday) {
      subEl.textContent = 'Sunday campus leisure in Waknaghat pine hills. Annapurna dining serving weekend meals; LRC library open.';
      return;
    }

    if (hrs < 9) {
      if (todayClasses.length > 0) {
        const firstTime = todayClasses[0].time?.split(/[-–—]/)[0]?.trim() || '09:00 AM';
        subEl.textContent = `Lectures begin at ${firstTime} for Batch ${batch}. Check your classroom venues and tutorial materials below.`;
      } else {
        subEl.textContent = `No classes scheduled today for Batch ${batch}. Enjoy a productive self-study day at LRC library.`;
      }
    } else if (hrs < 17) {
      if (todayClasses.length > 0) {
        subEl.textContent = `Academic day in progress. You have ${todayClasses.length} lectures & laboratory sessions scheduled today for Batch ${batch}.`;
      } else {
        subEl.textContent = `Free academic day for Batch ${batch}. LRC library and study rooms are open.`;
      }
    } else if (hrs < 21) {
      subEl.textContent = `Lectures concluded for today. Grab tea at Peach Tree, head to the sports complex, or relax before evening dining.`;
    } else {
      subEl.textContent = `Night hours at JUIT. Annapurna dining hall open; night milk counter at Dining Hall 1. Rest up for tomorrow!`;
    }
  },

  updateDashboardStats() {
    const countEl = document.getElementById('dash-stat-classes-today');
    const countSubEl = document.getElementById('dash-stat-classes-sub');
    const venueEl = document.getElementById('dash-stat-next-venue');
    const venueSubEl = document.getElementById('dash-stat-next-venue-sub');
    const mealEl = document.getElementById('dash-stat-meal-now');
    const mealSubEl = document.getElementById('dash-stat-meal-sub');
    const attEl = document.getElementById('dash-stat-att-target');
    const attStatusEl = document.getElementById('dash-stat-att-status');

    const now = new Date();
    const dayIndex = now.getDay();
    const isSunday = (dayIndex === 0);
    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dayIndex];
    const todayClasses = window.TimetableController ? window.TimetableController.filterAndMergeEntries(isSunday ? 'MON' : currentDayCode) : [];
    const nowMins = window.TimetableController ? window.TimetableController.getCurrentMinutes() : (now.getHours() * 60 + now.getMinutes());

    // 1. Classes count
    if (countEl) {
      countEl.textContent = isSunday ? 'Weekend' : `${todayClasses.length} Classes`;
    }
    if (countSubEl) {
      countSubEl.textContent = isSunday ? 'No regular lectures' : `Batch ${window.JUIT_PROFILE?.batch || '26BT10'}`;
    }

    // 2. Next Venue
    if (venueEl) {
      if (isSunday) {
        venueEl.textContent = 'LRC Reading';
        if (venueSubEl) venueSubEl.textContent = 'Open 24x7 till midnight';
      } else {
        let upcoming = null;
        for (const c of todayClasses) {
          const r = window.TimetableController?.parseTimeRange(c.time);
          if (r && nowMins <= r.end) {
            upcoming = c;
            break;
          }
        }
        if (upcoming) {
          venueEl.textContent = upcoming.venue ? `Room ${upcoming.venue}` : 'Campus LT';
          if (venueSubEl) venueSubEl.textContent = `${upcoming.time.split(/[-–—]/)[0].trim()} • ${upcoming.typeName || 'Class'}`;
        } else if (todayClasses.length > 0) {
          venueEl.textContent = 'Done for Today';
          if (venueSubEl) venueSubEl.textContent = 'All lectures concluded';
        } else {
          venueEl.textContent = 'No Lectures';
          if (venueSubEl) venueSubEl.textContent = 'Campus leisure / self study';
        }
      }
    }

    // 3. Active Meal
    const hrs = now.getHours();
    let mealName = 'Dinner';
    let mealTime = '07:30 – 09:00 PM';
    if (hrs < 10) {
      mealName = 'Breakfast';
      mealTime = '07:30 – 09:30 AM';
    } else if (hrs < 15) {
      mealName = 'Lunch';
      mealTime = '12:00 – 02:00 PM';
    }
    if (mealEl) mealEl.textContent = mealName;
    if (mealSubEl) mealSubEl.textContent = mealTime;

    // 4. Attendance Target
    const goal = window.JUIT_PROFILE?.attendanceGoal || '80';
    if (attEl) attEl.textContent = `${goal}% Target`;
    if (attStatusEl) attStatusEl.textContent = 'Safe Academic Standing';
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
    const p = window.JUIT_PROFILE || { programme: 'B.Tech', branch: 'CSE', semester: '1', batch: '26BT10' };
    const rawName = (p.name || '').trim();
    const isGeneric = !rawName || rawName.toLowerCase() === 'scholar' || rawName.toLowerCase() === 'juit scholar' || rawName.toLowerCase().startsWith('aarav');
    const nameStr = isGeneric ? 'Scholar' : rawName;
    const rollStr = p.rollNo || 'Not Assigned';
    const progStr = p.programme || 'B.Tech';
    const semStr = p.semester || '1';
    const batchStr = p.batch || '26BT10';
    const hostelStr = p.hostel || 'Hostel Resident';

    // 1. Desktop sidebar
    const deskBatch = document.getElementById('sidebar-user-batch-label');
    if (deskBatch) deskBatch.textContent = `${progStr} Sem ${semStr} • Batch ${batchStr}`;
    const deskName = document.getElementById('sidebar-user-name');
    if (deskName) deskName.textContent = nameStr;

    // 2. Mobile drawer
    const mobCard = document.getElementById('mobile-sidebar-user-card');
    if (mobCard) {
      const pName = mobCard.querySelector('.font-label-md');
      if (pName) pName.textContent = nameStr;
      const pBatch = mobCard.querySelector('.font-label-sm');
      if (pBatch) pBatch.textContent = `Batch ${batchStr} • Sem ${semStr} · Solan Hills`;
    }

    // 3. Dashboard telemetry & personalization banner
    const dashBatch = document.getElementById('dash-telemetry-batch');
    if (dashBatch) dashBatch.textContent = `Batch ${batchStr} · Sem ${semStr}`;
    const dashAtt = document.getElementById('dash-telemetry-att');
    if (dashAtt) {
      const attGoal = p.attendanceGoal || '80';
      dashAtt.textContent = `Attendance Target: ${attGoal}%`;
    }

    const bannerName = document.getElementById('dash-banner-student-name');
    if (bannerName) bannerName.textContent = nameStr;
    const bannerBatch = document.getElementById('dash-banner-batch-pill');
    if (bannerBatch) bannerBatch.textContent = `Batch ${batchStr}`;
    const bannerAcad = document.getElementById('dash-banner-acad-pill');
    if (bannerAcad) bannerAcad.textContent = `${progStr} ${p.branch || 'CSE'} • Sem ${semStr}`;

    // 4. Settings view card display
    const setDisplay = document.getElementById('settings-display-name');
    if (setDisplay) setDisplay.textContent = nameStr;
    const setRoll = document.getElementById('settings-display-roll');
    if (setRoll) setRoll.textContent = p.rollNo ? `Roll No: ${rollStr}` : 'Roll No: Not Assigned';
    const setPill = document.getElementById('settings-display-academic-pill');
    if (setPill) setPill.textContent = `${progStr} ${p.branch || 'CSE'} • Sem ${semStr} • Batch ${batchStr}`;
    const setResidence = document.getElementById('settings-display-residence-label');
    if (setResidence) setResidence.textContent = hostelStr;

    // 5. Live greeting update
    const greetingDisplay = document.getElementById('dash-live-greeting');
    if (greetingDisplay) {
      const hrs = new Date().getHours();
      let greet = 'Good evening';
      if (hrs < 12) greet = 'Good morning';
      else if (hrs < 17) greet = 'Good afternoon';
      const firstName = isGeneric ? 'Scholar' : nameStr.split(' ')[0];
      greetingDisplay.textContent = `${greet}, ${firstName} 👋`;
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

  updateDashboardMessSnapshot(selectedMeal = null) {
    const container = document.getElementById('dash-next-meal-preview');
    if (!container) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const todayName = days[now.getDay()] || 'Tuesday';
    const mess = window.JUIT_DATA?.mess?.weeklyMenu?.[todayName];

    if (!mess) {
      container.innerHTML = `<div class="p-3 text-xs text-on-surface-variant">Menu unavailable.</div>`;
      return;
    }

    const hrs = now.getHours();
    let currentMealKey = selectedMeal;
    if (!currentMealKey) {
      if (hrs < 10) currentMealKey = 'breakfast';
      else if (hrs < 15) currentMealKey = 'lunch';
      else currentMealKey = 'dinner';
    }

    const mealConfig = {
      breakfast: { label: 'Breakfast', icon: 'bakery_dining', time: '07:30 – 09:30 AM', color: 'primary' },
      lunch: { label: 'Lunch', icon: 'lunch_dining', time: '12:00 – 02:00 PM', color: 'secondary' },
      dinner: { label: 'Dinner', icon: 'dinner_dining', time: '07:30 – 09:00 PM', color: 'tertiary' }
    };

    const mealData = mess[currentMealKey] || mess.dinner;
    const activeCfg = mealConfig[currentMealKey] || mealConfig.dinner;
    const items = mealData?.items || [];
    const sweet = mealData?.sweetDish || mealData?.sweet;
    const fruit = mealData?.fruit;

    // Status label
    const statusEl = document.getElementById('dash-mess-meal-status');
    if (statusEl) {
      statusEl.textContent = `${activeCfg.label} Service (${activeCfg.time})`;
    }

    container.innerHTML = `
      <div class="space-y-3">
        <!-- Meal Switcher Tabs -->
        <div class="flex gap-1.5 p-1 rounded-xl bg-surface-container-high border border-white/[0.06]">
          ${['breakfast', 'lunch', 'dinner'].map(m => `
            <button type="button" class="btn-dash-meal-tab flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${m === currentMealKey ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-meal="${m}">
              ${mealConfig[m].label}
            </button>
          `).join('')}
        </div>

        <!-- Meal Content Card -->
        <div class="p-3.5 rounded-xl bg-surface-container border border-white/[0.06] space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono text-primary font-semibold flex items-center gap-1" id="dash-mess-meal-name">
              <span class="material-symbols-outlined text-[15px]">${activeCfg.icon}</span>
              <span>${activeCfg.label} Menu</span>
            </span>
            <span class="text-[11px] font-mono text-on-surface-variant">${activeCfg.time}</span>
          </div>

          <!-- Dishes Pill Grid -->
          <div class="flex flex-wrap gap-1.5" id="dash-mess-dishes">
            ${items.map(dish => `
              <span class="px-2 py-0.5 rounded-md bg-surface-container-high text-xs text-on-surface border border-white/[0.04] font-medium">
                ${dish}
              </span>
            `).join('')}
          </div>

          ${sweet || fruit ? `
            <div class="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs flex-wrap gap-1">
              ${sweet ? `<span class="text-secondary font-medium">✨ Sweet: ${sweet.split(',')[0]}</span>` : ''}
              ${fruit ? `<span class="text-tertiary font-medium">🍎 Fruit: ${fruit}</span>` : ''}
              <span class="text-[11px] text-on-surface-variant italic">Annapurna Halls 1 & 2</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-dash-meal-tab').forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        this.updateDashboardMessSnapshot(b.dataset.meal);
      });
    });
  },

  updateDashboardAnnouncements() {
    const container = document.getElementById('dash-announcements-preview');
    if (!container) return;

    const items = (window.JUIT_DATA?.announcements || []).slice(0, 3);
    container.innerHTML = items.map(a => `
      <div class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-white/[0.06] transition-colors cursor-pointer group" onclick="if(window.App) App.switchView('announcements')">
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <div class="flex items-center gap-1.5">
            ${a.pinned ? '<span class="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-semibold font-mono">📌 PINNED</span>' : ''}
            <span class="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-mono">${a.category || 'Notice'}</span>
          </div>
          <span class="text-[11px] font-mono text-on-surface-variant">${a.date || ''}</span>
        </div>
        <div class="font-headline-sm text-sm text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-2 leading-snug">${a.title}</div>
      </div>
    `).join('');
  },

  updateDashboardMilestone() {
    const banner = document.getElementById('dash-milestone-countdown');
    if (!banner) return;

    banner.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
              <span class="material-symbols-outlined text-[20px]">crisis_alert</span>
            </div>
            <div>
              <span class="font-headline-sm text-sm text-on-surface font-semibold">T-2 Examinations</span>
              <span class="font-label-sm text-[11px] text-secondary font-mono block">18 Days Remaining</span>
            </div>
          </div>
          <a class="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-fixed font-medium group" href="#calendar" onclick="if(window.App) App.switchView('calendar')">
            <span>Calendar</span>
            <span class="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
          </a>
        </div>
        <p class="font-body-sm text-xs text-on-surface-variant leading-relaxed">
          Academic Session 2026–27 • Solan Campus Examination Halls &amp; Centers. Revision and tutorial archives available on Vault.
        </p>
      </div>
    `;
  },

  /* ================= STUDENT ACCOUNT & PROFILE MANAGEMENT ================= */
  getSemesterKey(programme, semester) {
    const prog = (programme || 'B.Tech').toUpperCase();
    const sem = String(semester || '1');
    if (prog.includes('M.TECH') || prog.includes('MSC') || prog.includes('M.SC')) {
      if (sem === '1') return 'odd_mtech-msc_1_sem';
      if (sem === '2') return 'even_mtech-msc_2_sem';
      if (sem === '3') return 'odd_mtech-msc_3_sem_phd2';
      if (sem === '4') return 'even_mtech-msc_4_sem_phd2';
      return 'odd_mtech-msc_1_sem';
    }
    const map = {
      '1': 'odd_btech_1_sem',
      '2': 'even_btech_2_sem',
      '3': 'odd_btech_3_sem',
      '4': 'even_btech_4_sem',
      '5': 'odd_btech_5_sem',
      '6': 'even_btech_6_sem',
      '7': 'odd_btech_7_sem',
      '8': 'even_btech_8_sem'
    };
    return map[sem] || 'odd_btech_1_sem';
  },

  getAvailableBatchesForSemester(programme, semester) {
    const semKey = this.getSemesterKey(programme, semester);
    const timetableData = window.JUIT_DATA?.timetable || window.TimetableController?.data || {};
    const sheet = timetableData[semKey];
    if (sheet && Array.isArray(sheet.batches) && sheet.batches.length > 0) {
      return sheet.batches;
    }
    return ['26BT10', '26BT01', 'ALL'];
  },

  populateBatchesSelect(selectEl, programme, semester, currentBatch) {
    if (!selectEl) return;
    const batches = this.getAvailableBatchesForSemester(programme, semester);
    let html = '<option value="ALL">All Batches (Combined Schedule)</option>';
    const regularBatches = batches.filter(b => !['ALL', 'BACK'].includes(b) && !b.startsWith('PHD_') && !b.startsWith('/'));
    const specialBatches = batches.filter(b => ['BACK'].includes(b) || b.startsWith('PHD_') || b.startsWith('/'));

    regularBatches.forEach(b => {
      html += `<option value="${b}">Batch ${b}</option>`;
    });

    if (specialBatches.length > 0) {
      html += '<optgroup label="Special / Ph.D / Backlog Groups">';
      specialBatches.forEach(b => {
        html += `<option value="${b}">${b}</option>`;
      });
      html += '</optgroup>';
    }

    selectEl.innerHTML = html;

    if (currentBatch && batches.includes(currentBatch)) {
      selectEl.value = currentBatch;
    } else if (regularBatches.length > 0) {
      if (regularBatches.includes('26BT10')) {
        selectEl.value = '26BT10';
      } else {
        selectEl.value = regularBatches[0];
      }
    } else {
      selectEl.value = 'ALL';
    }
  },

  updateModalCardPreview() {
    const nameInput = document.getElementById('account-name-input');
    const rollInput = document.getElementById('account-roll-input');
    const progSelect = document.getElementById('account-prog-select');
    const branchSelect = document.getElementById('account-branch-select');
    const semSelect = document.getElementById('account-sem-select');
    const batchSelect = document.getElementById('account-batch-select');
    const hostelSelect = document.getElementById('account-hostel-select');

    const cardName = document.getElementById('account-display-name');
    const cardRoll = document.getElementById('account-display-roll');
    const cardAcademic = document.getElementById('account-display-academic');
    const cardResidence = document.getElementById('account-display-residence');

    const typedName = (nameInput?.value || '').trim();
    const isGeneric = !typedName || typedName.toLowerCase() === 'scholar' || typedName.toLowerCase() === 'juit scholar' || typedName.toLowerCase().startsWith('aarav');
    const displayName = isGeneric ? 'Scholar' : typedName;
    const roll = rollInput?.value?.trim() || 'Not Assigned';
    const prog = progSelect?.value || 'B.Tech';
    const branch = branchSelect?.value || 'CSE';
    const sem = semSelect?.value || '1';
    const batch = batchSelect?.value || '26BT10';
    const hostel = hostelSelect?.value || 'Hostel Resident';

    if (cardName) cardName.textContent = displayName;
    if (cardRoll) cardRoll.textContent = roll === 'Not Assigned' ? 'Roll No: Not Assigned' : `Roll No: ${roll}`;
    if (cardAcademic) cardAcademic.textContent = `${prog} ${branch} • Sem ${sem} • Batch ${batch}`;
    if (cardResidence) cardResidence.textContent = hostel;
  },

  saveProfileAndSync(p) {
    const semKey = this.getSemesterKey(p.programme, p.semester);
    const validBatches = this.getAvailableBatchesForSemester(p.programme, p.semester);
    if (!validBatches.includes(p.batch)) {
      p.batch = validBatches.includes('26BT10') ? '26BT10' : (validBatches[0] || 'ALL');
    }

    window.JUIT_PROFILE = Object.assign({}, window.JUIT_PROFILE || {}, p);
    localStorage.setItem('juit_student_profile', JSON.stringify(window.JUIT_PROFILE));
    localStorage.setItem('juit_selected_sem', semKey);
    localStorage.setItem('juit_selected_batch', p.batch);
    localStorage.setItem('juit_onboarded_v1', 'true');
    localStorage.setItem('juit_profile_configured', 'true');

    this.applyProfileToTimetable(window.JUIT_PROFILE);
    this.updateUserProfileBadges();
    this.refreshDashboard();
    this.syncSettingsView();
  },

  bindOnboardingModal() {
    this.bindAccountModal();
  },

  bindAccountModal() {
    const modal = document.getElementById('student-account-modal') || document.getElementById('onboarding-modal-backdrop');
    const form = document.getElementById('student-account-form') || document.getElementById('onboarding-profile-form');
    const closeBtn = document.getElementById('btn-close-account-modal') || document.getElementById('btn-close-onboarding-modal');
    const cancelBtn = document.getElementById('btn-cancel-account-modal');
    const resetBtn = document.getElementById('btn-reset-account-data');
    const modalThemeBtn = document.getElementById('btn-modal-theme-toggle');

    // Close handlers
    const closeModal = () => {
      if (localStorage.getItem('juit_profile_configured') !== 'true') {
        localStorage.setItem('juit_profile_configured', 'guest');
      }
      this.closeAccountModal();
    };
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Modal elements
    const nameInput = document.getElementById('account-name-input');
    const rollInput = document.getElementById('account-roll-input');
    const progSelect = document.getElementById('account-prog-select') || document.getElementById('onboard-programme-select');
    const branchSelect = document.getElementById('account-branch-select') || document.getElementById('onboard-branch-select');
    const semSelect = document.getElementById('account-sem-select') || document.getElementById('onboard-sem-select');
    const batchSelect = document.getElementById('account-batch-select') || document.getElementById('onboard-batch-select');
    const hostelSelect = document.getElementById('account-hostel-select');
    const attGoalSelect = document.getElementById('account-att-goal-select');

    if (progSelect) {
      progSelect.addEventListener('change', () => {
        const isMtech = progSelect.value.includes('M.Tech');
        if (semSelect) {
          semSelect.innerHTML = isMtech
            ? '<option value="1">Semester 1</option><option value="2">Semester 2</option><option value="3">Semester 3</option><option value="4">Semester 4</option>'
            : '<option value="1">Semester 1</option><option value="2">Semester 2</option><option value="3">Semester 3</option><option value="4">Semester 4</option><option value="5">Semester 5</option><option value="6">Semester 6</option><option value="7">Semester 7</option><option value="8">Semester 8</option>';
        }
        this.populateBatchesSelect(batchSelect, progSelect.value, semSelect?.value || '1', batchSelect?.value);
        this.updateModalCardPreview();
      });
    }

    if (semSelect) {
      semSelect.addEventListener('change', () => {
        this.populateBatchesSelect(batchSelect, progSelect?.value || 'B.Tech', semSelect.value, batchSelect?.value);
        this.updateModalCardPreview();
      });
    }

    if (branchSelect) branchSelect.addEventListener('change', () => this.updateModalCardPreview());
    if (nameInput) nameInput.addEventListener('input', () => this.updateModalCardPreview());
    if (rollInput) rollInput.addEventListener('input', () => this.updateModalCardPreview());
    if (hostelSelect) hostelSelect.addEventListener('change', () => this.updateModalCardPreview());
    if (batchSelect) batchSelect.addEventListener('change', () => this.updateModalCardPreview());

    // Modal theme toggle button
    if (modalThemeBtn) {
      modalThemeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('frost-light');
        if (isDark) {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('frost-light');
          const tName = document.getElementById('account-theme-name');
          if (tName) tName.textContent = 'Frost Light';
          const tIcon = document.getElementById('modal-theme-icon');
          if (tIcon) tIcon.textContent = 'light_mode';
        } else {
          document.documentElement.classList.remove('frost-light');
          document.documentElement.classList.add('dark');
          const tName = document.getElementById('account-theme-name');
          if (tName) tName.textContent = 'Dark Obsidian';
          const tIcon = document.getElementById('modal-theme-icon');
          if (tIcon) tIcon.textContent = 'dark_mode';
        }
      });
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset profile to default JUIT Scholar details (Sem 1, Batch 26BT10)?')) {
          localStorage.removeItem('juit_profile_configured');
          const defaultProfile = {
            name: '',
            rollNo: '',
            programme: 'B.Tech',
            branch: 'CSE',
            semester: '1',
            batch: '26BT10',
            hostel: 'Hostel Resident',
            attendanceGoal: '80',
            attendance: {}
          };
          this.saveProfileAndSync(defaultProfile);
          localStorage.removeItem('juit_profile_configured');
          this.closeAccountModal();
        }
      });
    }

    // Submit handler
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const p = {
          name: nameInput?.value?.trim() || '',
          rollNo: rollInput?.value?.trim() || '',
          programme: progSelect?.value || 'B.Tech',
          branch: branchSelect?.value || 'CSE',
          semester: semSelect?.value || '1',
          batch: batchSelect?.value || '26BT10',
          hostel: hostelSelect?.value || 'Hostel Resident',
          attendanceGoal: attGoalSelect?.value || '80'
        };

        this.saveProfileAndSync(p);

        const feedback = document.getElementById('account-feedback-msg');
        if (feedback) {
          feedback.classList.remove('hidden');
          setTimeout(() => {
            feedback.classList.add('hidden');
            this.closeAccountModal();
          }, 800);
        } else {
          this.closeAccountModal();
        }
      });
    }

    // Also wire Settings view handlers
    this.bindSettingsView();
  },

  loadStudentProfile() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('juit_student_profile') || 'null');
    } catch (e) {
      saved = null;
    }

    // Cleanse old mock defaults if present in user storage
    if (saved) {
      if (saved.name === 'Aarav Sharma' || saved.name === 'Aarav') {
        saved.name = '';
      }
      if (saved.batch === 'B1') {
        saved.batch = '26BT10';
      }
    }

    const defaultProfile = {
      name: '',
      rollNo: '',
      programme: 'B.Tech',
      branch: 'CSE',
      semester: '1',
      batch: '26BT10',
      hostel: 'Hostel Resident',
      attendanceGoal: '80',
      attendance: {}
    };

    window.JUIT_PROFILE = Object.assign({}, defaultProfile, window.JUIT_PROFILE || {}, saved || {});

    // Ensure semester & batch keys in localStorage are properly set
    const semKey = this.getSemesterKey(window.JUIT_PROFILE.programme, window.JUIT_PROFILE.semester);
    if (!localStorage.getItem('juit_selected_sem')) {
      localStorage.setItem('juit_selected_sem', semKey);
    }
    if (!localStorage.getItem('juit_selected_batch') && window.JUIT_PROFILE.batch) {
      localStorage.setItem('juit_selected_batch', window.JUIT_PROFILE.batch);
    }
    const storedBatch = localStorage.getItem('juit_selected_batch');
    if (storedBatch && (!saved || !saved.batch)) {
      window.JUIT_PROFILE.batch = storedBatch;
    }

    if (window.TimetableController) {
      this.applyProfileToTimetable(window.JUIT_PROFILE);
    }
  },

  syncSettingsView() {
    const p = window.JUIT_PROFILE || {};
    const sName = document.getElementById('settings-name-input');
    const sRoll = document.getElementById('settings-roll-input');
    const sProg = document.getElementById('settings-prog-select');
    const sBranch = document.getElementById('settings-branch-select');
    const sSem = document.getElementById('settings-sem-select');
    const sBatch = document.getElementById('settings-batch-select');
    const sHostel = document.getElementById('settings-hostel-select');
    const sGoal = document.getElementById('settings-att-goal-select');

    const scholarName = (p.name || '').trim();
    const isGeneric = !scholarName || scholarName.toLowerCase() === 'scholar' || scholarName.toLowerCase() === 'juit scholar' || scholarName.toLowerCase().startsWith('aarav');
    const displayName = isGeneric ? 'Scholar' : scholarName;

    if (sName) sName.value = isGeneric ? '' : scholarName;
    if (sRoll) sRoll.value = p.rollNo || '';
    if (sProg && p.programme) sProg.value = p.programme;
    if (sBranch && p.branch) sBranch.value = p.branch;
    if (sSem && p.semester) sSem.value = p.semester;

    // Populate batches for active semester
    if (sBatch) {
      this.populateBatchesSelect(sBatch, sProg?.value || p.programme, sSem?.value || p.semester, p.batch);
    }

    if (sHostel && p.hostel) sHostel.value = p.hostel;
    if (sGoal && p.attendanceGoal) sGoal.value = p.attendanceGoal;

    // Digital pass card inside settings
    const setDisplay = document.getElementById('settings-display-name');
    if (setDisplay) setDisplay.textContent = displayName;
    const setRoll = document.getElementById('settings-display-roll');
    if (setRoll) setRoll.textContent = p.rollNo ? `Roll No: ${p.rollNo}` : 'Roll No: Not Assigned';
    const setPill = document.getElementById('settings-display-academic-pill');
    if (setPill) setPill.textContent = `${p.programme || 'B.Tech'} ${p.branch || 'CSE'} • Sem ${p.semester || '1'} • Batch ${p.batch || '26BT10'}`;
    const setResidence = document.getElementById('settings-display-residence-label');
    if (setResidence) setResidence.textContent = p.hostel || 'Hostel Resident';

    // Scholar scratchpad notes
    const notesArea = document.getElementById('scholar-notes-textarea');
    if (notesArea && !notesArea.value) {
      notesArea.value = localStorage.getItem('juit_scholar_notes') || '';
    }
  },

  bindSettingsView() {
    this.syncSettingsView();

    const sName = document.getElementById('settings-name-input');
    const sRoll = document.getElementById('settings-roll-input');
    const sProg = document.getElementById('settings-prog-select');
    const sBranch = document.getElementById('settings-branch-select');
    const sSem = document.getElementById('settings-sem-select');
    const sBatch = document.getElementById('settings-batch-select');
    const sHostel = document.getElementById('settings-hostel-select');
    const sGoal = document.getElementById('settings-att-goal-select');
    const btnSave = document.getElementById('btn-save-settings-profile');
    const feedback = document.getElementById('settings-save-feedback');
    const themeBtn = document.getElementById('btn-settings-theme-toggle');
    const clearCacheBtn = document.getElementById('btn-settings-clear-cache');
    const resetProfileBtn = document.getElementById('btn-settings-reset-profile');
    const notesArea = document.getElementById('scholar-notes-textarea');
    const btnSaveNotes = document.getElementById('btn-save-notes');
    const notesStatus = document.getElementById('notes-save-status');

    const updateSettingsPassPreview = () => {
      const typedName = (sName?.value || '').trim();
      const isGeneric = !typedName || typedName.toLowerCase() === 'scholar' || typedName.toLowerCase() === 'juit scholar' || typedName.toLowerCase().startsWith('aarav');
      const name = isGeneric ? 'Scholar' : typedName;
      const roll = sRoll?.value?.trim() || 'Not Assigned';
      const prog = sProg?.value || 'B.Tech';
      const branch = sBranch?.value || 'CSE';
      const sem = sSem?.value || '1';
      const batch = sBatch?.value || '26BT10';
      const hostel = sHostel?.value || 'Hostel Resident';

      const setDisplay = document.getElementById('settings-display-name');
      if (setDisplay) setDisplay.textContent = name;
      const setRoll = document.getElementById('settings-display-roll');
      if (setRoll) setRoll.textContent = roll === 'Not Assigned' ? 'Roll No: Not Assigned' : `Roll No: ${roll}`;
      const setPill = document.getElementById('settings-display-academic-pill');
      if (setPill) setPill.textContent = `${prog} ${branch} • Sem ${sem} • Batch ${batch}`;
      const setResidence = document.getElementById('settings-display-residence-label');
      if (setResidence) setResidence.textContent = hostel;
    };

    if (sSem) {
      sSem.addEventListener('change', () => {
        this.populateBatchesSelect(sBatch, sProg?.value || 'B.Tech', sSem.value, sBatch?.value);
        updateSettingsPassPreview();
      });
    }

    if (sProg) {
      sProg.addEventListener('change', () => {
        const isMtech = sProg.value.includes('M.Tech');
        if (sSem) {
          sSem.innerHTML = isMtech
            ? '<option value="1">Semester 1</option><option value="2">Semester 2</option><option value="3">Semester 3</option><option value="4">Semester 4</option>'
            : '<option value="1">Semester 1</option><option value="2">Semester 2</option><option value="3">Semester 3</option><option value="4">Semester 4</option><option value="5">Semester 5</option><option value="6">Semester 6</option><option value="7">Semester 7</option><option value="8">Semester 8</option>';
        }
        this.populateBatchesSelect(sBatch, sProg.value, sSem?.value || '1', sBatch?.value);
        updateSettingsPassPreview();
      });
    }

    [sName, sRoll].forEach(el => el?.addEventListener('input', updateSettingsPassPreview));
    [sBranch, sBatch, sHostel, sGoal].forEach(el => el?.addEventListener('change', updateSettingsPassPreview));

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const p = {
          name: sName?.value?.trim() || '',
          rollNo: sRoll?.value?.trim() || '',
          programme: sProg?.value || 'B.Tech',
          branch: sBranch?.value || 'CSE',
          semester: sSem?.value || '1',
          batch: sBatch?.value || '26BT10',
          hostel: sHostel?.value || 'Hostel Resident',
          attendanceGoal: sGoal?.value || '80'
        };

        this.saveProfileAndSync(p);

        if (feedback) {
          feedback.textContent = '✓ Profile saved & timetable updated!';
          setTimeout(() => { feedback.textContent = ''; }, 3000);
        }
      });
    }

    // Scholar scratchpad autosave
    if (notesArea) {
      let autosaveTimer = null;
      notesArea.addEventListener('input', () => {
        if (notesStatus) notesStatus.textContent = 'Saving...';
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => {
          localStorage.setItem('juit_scholar_notes', notesArea.value);
          if (notesStatus) {
            notesStatus.textContent = 'Auto-saved ✓';
            setTimeout(() => { if (notesStatus.textContent === 'Auto-saved ✓') notesStatus.textContent = ''; }, 2000);
          }
        }, 600);
      });
    }

    if (btnSaveNotes && notesArea) {
      btnSaveNotes.addEventListener('click', () => {
        localStorage.setItem('juit_scholar_notes', notesArea.value);
        if (notesStatus) {
          notesStatus.textContent = 'Saved ✓';
          setTimeout(() => { notesStatus.textContent = ''; }, 2000);
        }
      });
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('frost-light');
        if (isDark) {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('frost-light');
          const tLabel = document.getElementById('settings-theme-label');
          if (tLabel) tLabel.textContent = 'Frost Light Theme';
        } else {
          document.documentElement.classList.remove('frost-light');
          document.documentElement.classList.add('dark');
          const tLabel = document.getElementById('settings-theme-label');
          if (tLabel) tLabel.textContent = 'Dark Obsidian Theme';
        }
      });
    }

    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', async () => {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        alert('Offline cache cleared successfully.');
      });
    }

    if (resetProfileBtn) {
      resetProfileBtn.addEventListener('click', () => {
        if (confirm('Reset profile to default JUIT Scholar details (Sem 1, Batch 26BT10)?')) {
          localStorage.removeItem('juit_student_profile');
          localStorage.removeItem('juit_selected_batch');
          localStorage.removeItem('juit_selected_sem');
          localStorage.removeItem('juit_profile_configured');
          localStorage.removeItem('juit_onboarded_v1');
          location.reload();
        }
      });
    }
  },

  applyProfileToTimetable(p) {
    if (!window.TimetableController) return;
    const semKey = this.getSemesterKey(p.programme, p.semester);
    const validBatches = this.getAvailableBatchesForSemester(p.programme, p.semester);
    let chosenBatch = p.batch;
    if (!chosenBatch || !validBatches.includes(chosenBatch)) {
      chosenBatch = validBatches.includes('26BT10') ? '26BT10' : (validBatches[0] || 'ALL');
      p.batch = chosenBatch;
    }

    window.TimetableController.activeSemesterId = semKey;
    window.TimetableController.activeBatch = chosenBatch;
    localStorage.setItem('juit_selected_sem', semKey);
    localStorage.setItem('juit_selected_batch', chosenBatch);

    if (window.AcademicsController) {
      window.AcademicsController.activeBatch = chosenBatch;
      window.AcademicsController.initActiveBatch?.();
      window.AcademicsController.renderBatchAttendanceIndicator?.();
    }
    window.TimetableController.renderSemesterDropdown?.();
    window.TimetableController.populateBatchDropdown?.();
    window.TimetableController.renderQuickBatchChips?.();
    window.TimetableController.renderDayPills?.();
    window.TimetableController.renderSchedule?.();
    window.TimetableController.updateDashboardToday?.();
  },

  openAccountModal(isFirstTime = false) {
    const modal = document.getElementById('student-account-modal') || document.getElementById('onboarding-modal-backdrop');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('open', 'active');

    // Onboarding vs Edit Profile UI Adaptation
    const obBanner = document.getElementById('account-onboarding-banner');
    const modalTitle = document.getElementById('account-modal-title');
    const modalSub = document.getElementById('account-modal-subtitle');
    const modalIcon = document.getElementById('account-modal-header-icon');
    const cancelBtn = document.getElementById('btn-cancel-account-modal');
    const saveBtnText = document.getElementById('btn-save-account-text');
    const saveBtnIcon = document.getElementById('btn-save-account-icon');
    const resetBtn = document.getElementById('btn-reset-account-data');

    if (isFirstTime) {
      if (obBanner) obBanner.classList.remove('hidden');
      if (modalTitle) modalTitle.textContent = 'Welcome to JUIT Hub 🏔️';
      if (modalSub) modalSub.textContent = 'Quick setup to personalize your batch, timetable & campus services';
      if (modalIcon) modalIcon.innerHTML = '<span class="material-symbols-outlined text-[22px]">auto_awesome</span>';
      if (cancelBtn) cancelBtn.textContent = 'Skip & Explore as Guest';
      if (saveBtnText) saveBtnText.textContent = 'Personalize & Launch Hub →';
      if (saveBtnIcon) saveBtnIcon.textContent = 'rocket_launch';
      if (resetBtn) resetBtn.classList.add('hidden');
    } else {
      if (obBanner) obBanner.classList.add('hidden');
      if (modalTitle) modalTitle.textContent = 'Student Account & Profile';
      if (modalSub) modalSub.textContent = 'JUIT Academic Identity & Preferences';
      if (modalIcon) modalIcon.innerHTML = '<span class="material-symbols-outlined text-[22px]">manage_accounts</span>';
      if (cancelBtn) cancelBtn.textContent = 'Cancel';
      if (saveBtnText) saveBtnText.textContent = 'Save Changes';
      if (saveBtnIcon) saveBtnIcon.textContent = 'save';
      if (resetBtn) resetBtn.classList.remove('hidden');
    }

    const p = window.JUIT_PROFILE || {};
    const nameInput = document.getElementById('account-name-input');
    const rollInput = document.getElementById('account-roll-input');
    const progSelect = document.getElementById('account-prog-select');
    const branchSelect = document.getElementById('account-branch-select');
    const semSelect = document.getElementById('account-sem-select');
    const batchSelect = document.getElementById('account-batch-select');
    const hostelSelect = document.getElementById('account-hostel-select');
    const attGoalSelect = document.getElementById('account-att-goal-select');

    const typedName = (p.name || '').trim();
    const isGeneric = !typedName || typedName.toLowerCase() === 'scholar' || typedName.toLowerCase() === 'juit scholar' || typedName.toLowerCase().startsWith('aarav');
    if (nameInput) {
      nameInput.value = isGeneric ? '' : typedName;
      nameInput.placeholder = 'e.g. Rahul Verma, Priya Sharma';
      if (isFirstTime) {
        setTimeout(() => nameInput.focus(), 150);
      }
    }
    if (rollInput) rollInput.value = p.rollNo || '';
    if (progSelect && p.programme) progSelect.value = p.programme;
    if (branchSelect && p.branch) branchSelect.value = p.branch;
    if (semSelect && p.semester) semSelect.value = p.semester;
    
    // Dynamically populate batch options matching current programme and semester
    this.populateBatchesSelect(batchSelect, progSelect?.value || p.programme, semSelect?.value || p.semester, p.batch);

    if (hostelSelect && p.hostel) hostelSelect.value = p.hostel;
    if (attGoalSelect && p.attendanceGoal) attGoalSelect.value = p.attendanceGoal;

    // Digital pass card
    this.updateModalCardPreview();
  },

  closeAccountModal() {
    const modal = document.getElementById('student-account-modal') || document.getElementById('onboarding-modal-backdrop');
    if (modal) {
      modal.classList.remove('open', 'active');
      modal.classList.add('hidden');
    }
  },

  openOnboardingModal() {
    this.openAccountModal(true);
  },

  /* ================= MOBILE NAVIGATION DRAWER & HUD DOCK ================= */
  bindMobileDrawer() {
    const toggleBtn = document.getElementById('btn-mobile-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    const closeBtn = document.getElementById('btn-close-mobile-drawer');
    const hudMoreBtn = document.getElementById('btn-mobile-hud-more');
    const moreSheet = document.getElementById('mobile-more-sheet');
    const moreBackdrop = document.getElementById('mobile-more-backdrop');
    const closeMoreBtn = document.getElementById('btn-close-mobile-more');

    const openDrawer = () => {
      this.closeMobileDrawer();
      if (drawer) {
        drawer.classList.remove('-translate-x-full');
        drawer.classList.add('translate-x-0', 'active');
      }
      if (backdrop) {
        backdrop.classList.remove('hidden');
        backdrop.classList.add('active');
      }
      document.body.classList.add('mobile-drawer-open');
    };

    const openMoreSheet = () => {
      this.closeMobileDrawer();
      if (moreSheet) {
        moreSheet.classList.remove('translate-y-full');
        moreSheet.classList.add('translate-y-0', 'active');
      }
      if (moreBackdrop) {
        moreBackdrop.classList.remove('hidden');
        moreBackdrop.classList.add('active');
      }
      document.body.classList.add('mobile-drawer-open');
    };

    const closeDrawer = () => {
      if (drawer) {
        drawer.classList.remove('active', 'translate-x-0');
        drawer.classList.add('-translate-x-full');
      }
      if (backdrop) {
        backdrop.classList.remove('active');
        backdrop.classList.add('hidden');
      }
      document.body.classList.remove('mobile-drawer-open');
    };

    const closeMoreSheet = () => {
      if (moreSheet) {
        moreSheet.classList.remove('active', 'translate-y-0');
        moreSheet.classList.add('translate-y-full');
      }
      if (moreBackdrop) {
        moreBackdrop.classList.remove('active');
        moreBackdrop.classList.add('hidden');
      }
      document.body.classList.remove('mobile-drawer-open');
    };

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
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
        if (moreSheet && moreSheet.classList.contains('active')) {
          closeMoreSheet();
        } else {
          openMoreSheet();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
      });
    }

    if (closeMoreBtn) {
      closeMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeMoreSheet();
      });
    }

    if (moreBackdrop) {
      moreBackdrop.addEventListener('click', (e) => {
        e.preventDefault();
        closeMoreSheet();
      });
    }
  },

  closeMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    const moreSheet = document.getElementById('mobile-more-sheet');
    const moreBackdrop = document.getElementById('mobile-more-backdrop');

    if (drawer) {
      drawer.classList.remove('active', 'translate-x-0');
      drawer.classList.add('-translate-x-full');
    }
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.classList.add('hidden');
    }
    if (moreSheet) {
      moreSheet.classList.remove('active', 'translate-y-0');
      moreSheet.classList.add('translate-y-full');
    }
    if (moreBackdrop) {
      moreBackdrop.classList.remove('active');
      moreBackdrop.classList.add('hidden');
    }
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

    // Offline / Online detection banner & telemetry pill
    const offlineBanner = document.getElementById('offline-status-banner');
    const connPill = document.getElementById('connection-status-pill');
    const connDot = document.getElementById('connection-status-dot');
    const connText = document.getElementById('connection-status-text');

    const updateOnlineStatus = (forcedOffline = null) => {
      const isOnline = (forcedOffline !== null) ? !forcedOffline : navigator.onLine;

      if (offlineBanner) {
        if (!isOnline) {
          offlineBanner.classList.remove('hidden');
        } else {
          offlineBanner.classList.add('hidden');
        }
      }

      if (connPill && connDot && connText) {
        if (isOnline) {
          connPill.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0 shadow-xs';
          connDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-emerald-500';
          connText.textContent = '.online';
        } else {
          connPill.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 shadow-xs';
          connDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-amber-400 animate-pulse';
          connText.textContent = '.offline (cached)';
        }
      }

      if (forcedOffline !== null && typeof this.showToast === 'function') {
        if (!isOnline) {
          this.showToast('⚠️ Offline Mode Active • Hub serving from local device cache.', 4000);
        } else {
          this.showToast('✓ Connection restored! Synced with campus network.', 3000);
        }
      }
    };

    window.addEventListener('online', () => updateOnlineStatus(false));
    window.addEventListener('offline', () => updateOnlineStatus(true));
    updateOnlineStatus();

    // Settings Offline Cache Action Buttons
    document.getElementById('btn-settings-update-cache')?.addEventListener('click', async () => {
      try {
        if ('caches' in window) {
          const cache = await caches.open('juit-hub-stitch-v3');
          const urls = [
            './', './index.html', './css/styles.css', './css/stitch-theme.css',
            './data/timetable_data.json', './data/mess_data.json', './data/campus_data.json', './data/calendar_data.json',
            './js/app.js', './js/timetable.js', './js/mess.js', './js/map.js', './js/calendar.js', './js/portals.js', './js/resources.js'
          ];
          for (const u of urls) {
            try { await cache.add(u); } catch(e) {}
          }
          if (typeof this.showToast === 'function') {
            this.showToast('✓ Complete Hub re-cached successfully for offline use!', 3500);
          } else {
            alert('✓ Complete Hub re-cached successfully for offline use!');
          }
        } else {
          alert('Local browser storage is ready and cached.');
        }
      } catch (err) {
        if (typeof this.showToast === 'function') this.showToast('Cache update complete.', 2500);
      }
    });

    document.getElementById('btn-settings-clear-cache')?.addEventListener('click', async () => {
      if (confirm('Clear local offline cache? Pages will be re-downloaded next time you connect.')) {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        if (typeof this.showToast === 'function') {
          this.showToast('Offline cache cleared.', 2500);
        } else {
          alert('Offline cache cleared.');
        }
      }
    });
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
        if (obModal && obModal.classList.contains('open')) obModal.classList.remove('open', 'active');
        window.ResourcesController?.closePreviewModal();
        window.PortalsController?.closeModal();
        const routeModal = document.getElementById('map-route-modal');
        if (routeModal) routeModal.classList.remove('open', 'active');
        window.CampusMap?.closeBuildingDrawer();
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

