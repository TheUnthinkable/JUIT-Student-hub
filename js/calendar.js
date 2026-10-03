/**
 * Academic Calendar Controller for JUIT Student Hub
 * Sourced from official notification Ref: JUIT/WKG/REGR/2026-27/050
 * Features:
 * - Next Milestone Spotlight Hero with Real-Time Countdown
 * - Category Filter Chips with Vibrant Badges (Exams, Fests, Breaks, Holidays, Personal)
 * - Dual Agenda Timeline View and Interactive Month Grid View
 * - 1-Tap Google Calendar & .ICS Sync
 * - Personal Scholar Event Planner stored in localStorage
 * - Seamless search & responsive layout
 */

const CalendarController = {
  data: {},
  activeTerm: 'odd2026',
  activeCategory: 'all',
  activeViewMode: 'agenda', // 'agenda' | 'month'
  searchQuery: '',
  currentMonthDate: new Date(2026, 8, 1), // September 2026 (0-indexed month 8)

  init(calendarData) {
    this.data = calendarData || (window.JUIT_DATA && window.JUIT_DATA.calendar) || {};

    this.renderTermSwitcher();
    this.renderCategoryFilters();
    this.renderSpotlightMilestone();
    this.renderViewSwitcher();
    this.renderCalendarContent();
    this.bindEvents();
  },

  renderTimeline() {
    this.renderSpotlightMilestone();
    this.renderCalendarContent();
  },

  getPersonalEvents() {
    try {
      const saved = localStorage.getItem('juit_personal_events');
      return saved ? JSON.parse(saved) : [];
    } catch(e) {
      return [];
    }
  },

  savePersonalEvents(events) {
    localStorage.setItem('juit_personal_events', JSON.stringify(events));
  },

  renderTermSwitcher() {
    const btnOdd = document.getElementById('btn-cal-odd');
    const btnEven = document.getElementById('btn-cal-even');
    const termPill = document.getElementById('calendar-active-term-pill');

    if (btnOdd && btnEven) {
      const isOdd = (this.activeTerm === 'odd2026');
      btnOdd.className = `px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
        isOdd
          ? 'bg-primary text-on-primary shadow-sm font-bold'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
      }`;
      btnEven.className = `px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
        !isOdd
          ? 'bg-primary text-on-primary shadow-sm font-bold'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
      }`;
    }

    if (termPill) {
      termPill.innerHTML = this.activeTerm === 'odd2026'
        ? '<span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>AY 2026-27 (Gazetted)</span></span>'
        : '<span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span><span>Even Term 2027</span></span>';
    }
  },

  renderCategoryFilters() {
    const container = document.getElementById('calendar-category-filters');
    if (!container) return;

    const allItems = this.getAllEvents();
    const categories = [
      { id: 'all', label: 'All Milestones', icon: 'event_note' },
      { id: 'exam', label: 'Exams & Tests', icon: 'quiz' },
      { id: 'holiday', label: 'Gazetted Holidays', icon: 'account_balance' },
      { id: 'vacation', label: 'Breaks & Vacations', icon: 'flight_takeoff' },
      { id: 'fest', label: 'Fests & Culture', icon: 'celebration' },
      { id: 'academic', label: 'Academics & Reg', icon: 'school' },
      { id: 'personal', label: 'Personal Notes', icon: 'bookmark' }
    ];

    container.innerHTML = categories.map(cat => {
      const isActive = (cat.id === this.activeCategory);
      let count = 0;
      if (cat.id === 'all') {
        count = allItems.length;
      } else if (cat.id === 'exam') {
        count = allItems.filter(x => x.category === 'exam').length;
      } else if (cat.id === 'holiday') {
        count = allItems.filter(x => x.category === 'holiday').length;
      } else if (cat.id === 'vacation') {
        count = allItems.filter(x => x.category === 'vacation').length;
      } else if (cat.id === 'fest') {
        count = allItems.filter(x => x.category === 'fest' || x.category === 'sports' || x.category === 'cultural').length;
      } else if (cat.id === 'academic') {
        count = allItems.filter(x => x.category === 'academic' || x.category === 'registration' || x.category === 'commencement').length;
      } else if (cat.id === 'personal') {
        count = allItems.filter(x => x.category === 'personal').length;
      }

      return `
        <button type="button" class="cal-category-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-xs transition-all flex-shrink-0 cursor-pointer ${
          isActive
            ? 'bg-primary text-on-primary font-bold shadow-sm'
            : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        }" data-category="${cat.id}">
          <span class="material-symbols-outlined text-[15px]">${cat.icon}</span>
          <span>${cat.label}</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-mono ${isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}">${count}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.cal-category-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.category;
        this.renderCategoryFilters();
        this.renderCalendarContent();
      });
    });
  },

  renderSpotlightMilestone() {
    const spotlightContainer = document.getElementById('calendar-spotlight-milestone');
    if (!spotlightContainer) return;

    const allEvents = this.getAllEvents();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // Find the nearest upcoming or currently active event
    let targetEvent = null;
    let minDiff = Infinity;

    for (const ev of allEvents) {
      const parsed = this.parseEventDates(ev.dates);
      if (!parsed) continue;

      if (today >= parsed.startDate && today <= parsed.endDate) {
        targetEvent = { ...ev, parsed, isActiveNow: true };
        break;
      }

      if (parsed.startDate > today) {
        const diff = parsed.startDate - today;
        if (diff < minDiff) {
          minDiff = diff;
          targetEvent = { ...ev, parsed, isActiveNow: false };
        }
      }
    }

    if (!targetEvent) {
      spotlightContainer.innerHTML = '';
      spotlightContainer.classList.add('hidden');
      return;
    }

    spotlightContainer.classList.remove('hidden');
    const countdown = this.getCountdownStatus(targetEvent.parsed);
    const gCalUrl = this.getGCalUrl(targetEvent, targetEvent.parsed);

    spotlightContainer.innerHTML = `
      <div class="relative rounded-2xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-4 sm:p-5 border border-white/[0.1] shadow-lg overflow-hidden">
        <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div class="flex items-start gap-3.5 min-w-0">
            <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${targetEvent.isActiveNow ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary/20 text-primary border border-primary/30'} flex items-center justify-center shrink-0 shadow-inner">
              <span class="material-symbols-outlined text-[24px] sm:text-[26px]">${targetEvent.isActiveNow ? 'crisis_alert' : 'upcoming'}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider ${targetEvent.isActiveNow ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-primary-container text-on-primary-container border border-primary/20'}">
                  ${targetEvent.isActiveNow ? '● Live Milestone' : 'Upcoming Next'}
                </span>
                <span class="text-xs font-semibold text-secondary">${countdown.statusText}</span>
              </div>
              <h3 class="font-headline-sm text-base sm:text-lg text-on-surface font-bold tracking-tight truncate">${targetEvent.title}</h3>
              <p class="font-body-sm text-xs text-on-surface-variant mt-0.5 line-clamp-2">${targetEvent.target} • <span class="font-mono text-primary font-medium">${targetEvent.dates}</span></p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <a href="${gCalUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 font-label-md text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm" title="Add this milestone to your Google Calendar">
              <span class="material-symbols-outlined text-[15px]">event</span>
              <span>Sync to Google Calendar</span>
            </a>
          </div>
        </div>
      </div>
    `;
  },

  renderViewSwitcher() {
    const container = document.getElementById('calendar-view-switcher');
    if (!container) return;

    container.className = 'flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-white/[0.06]';
    container.innerHTML = `
      <button type="button" class="view-mode-btn px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
        this.activeViewMode === 'agenda' ? 'bg-surface-container-high text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
      }" data-cal-view="agenda">
        <span class="material-symbols-outlined text-[15px]">view_timeline</span>
        <span class="hidden sm:inline">Timeline</span>
      </button>
      <button type="button" class="view-mode-btn px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
        this.activeViewMode === 'month' ? 'bg-surface-container-high text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
      }" data-cal-view="month">
        <span class="material-symbols-outlined text-[15px]">calendar_month</span>
        <span class="hidden sm:inline">Month Grid</span>
      </button>
    `;

    container.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeViewMode = btn.dataset.calView;
        this.renderViewSwitcher();
        this.renderCalendarContent();
      });
    });
  },

  parseEventDates(datesStr) {
    if (!datesStr) return null;
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const yearMatch = datesStr.match(/202[67]/);
    const defaultYear = yearMatch ? parseInt(yearMatch[0], 10) : 2026;

    const monthMatches = [...datesStr.matchAll(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/gi)];
    if (monthMatches.length === 0) return null;

    const startMonth = months[monthMatches[0][0].toLowerCase()];
    const endMonth = monthMatches.length > 1 ? months[monthMatches[1][0].toLowerCase()] : startMonth;

    const dayMatches = datesStr.match(/\b\d{1,2}\b/g);
    if (!dayMatches || dayMatches.length === 0) return null;

    const startDay = parseInt(dayMatches[0], 10);
    const endDay = dayMatches.length > 1 ? parseInt(dayMatches[dayMatches.length - 1], 10) : startDay;

    const startYear = defaultYear;
    const endYear = (endMonth < startMonth) ? startYear + 1 : defaultYear;

    const startDate = new Date(startYear, startMonth, startDay, 0, 0, 0);
    const endDate = new Date(endYear, endMonth, endDay, 23, 59, 59);

    return { startDate, endDate, startDay, endDay, startMonth, endMonth, startYear, endYear, monthStr: monthMatches[0][0].toUpperCase() };
  },

  getCountdownStatus(parsedDates) {
    if (!parsedDates) {
      return { statusText: '', pillClass: '', pillColor: 'text-on-surface-variant', isPast: false };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const { startDate, endDate } = parsedDates;
    const msPerDay = 1000 * 60 * 60 * 24;

    if (today >= startDate && today <= endDate) {
      return {
        statusText: '● Active Today',
        pillClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        pillColor: 'text-emerald-400',
        isCurrent: true
      };
    }

    if (today > endDate) {
      return {
        statusText: '✓ Concluded',
        pillClass: 'bg-surface-container-high text-on-surface-variant/70 border border-white/[0.04]',
        pillColor: 'text-on-surface-variant',
        isPast: true
      };
    }

    const diffDays = Math.ceil((startDate - today) / msPerDay);

    if (diffDays === 1) {
      return {
        statusText: '⚡ Starts Tomorrow',
        pillClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold',
        pillColor: 'text-amber-400',
        isUpcoming: true
      };
    }

    return {
      statusText: `⏳ Starts in ${diffDays} days`,
      pillClass: diffDays <= 7 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' : 'bg-primary/10 text-primary border border-primary/20',
      pillColor: diffDays <= 7 ? 'text-amber-400' : 'text-primary',
      isUpcoming: true
    };
  },

  getGCalUrl(ev, parsed) {
    const title = encodeURIComponent(ev.title);
    const details = encodeURIComponent(`${ev.target || ''} • Jaypee University of Information Technology Academic Schedule`);
    const location = encodeURIComponent('Jaypee University of Information Technology, Waknaghat, Solan (H.P.)');

    if (parsed) {
      const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}${m}${day}`;
      };
      const endPlusOne = new Date(parsed.endDate.getTime() + 86400000);
      const startStr = formatDate(parsed.startDate);
      const endStr = formatDate(endPlusOne);
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  },

  getAllEvents() {
    const termData = this.data.semesters && this.data.semesters[this.activeTerm];
    if (!termData) return [];

    let items = [...(termData.milestones || [])];

    // Include Gazetted Holidays
    if (termData.holidays) {
      termData.holidays.forEach(h => {
        items.push({
          category: 'holiday',
          title: h.name,
          target: `${h.day} • Gazetted Institutional Holiday (Off-day)`,
          dates: h.date,
          status: 'Gazetted Holiday'
        });
      });
    }

    // Include Personal Events
    const personal = this.getPersonalEvents();
    personal.forEach(p => {
      items.push({
        category: 'personal',
        title: p.title,
        target: p.note || 'Personal Scholar Note',
        dates: p.date,
        status: 'Personal Event',
        isPersonal: true,
        id: p.id
      });
    });

    return items;
  },

  renderCalendarContent() {
    const container = document.getElementById('calendar-timeline-container');
    if (!container) return;

    if (this.activeViewMode === 'month') {
      this.renderMonthView(container);
    } else {
      this.renderAgendaView(container);
    }
  },

  renderAgendaView(container) {
    let items = this.getAllEvents();

    // 1. Category Filter
    if (this.activeCategory !== 'all') {
      items = items.filter(m => {
        if (this.activeCategory === 'exam') return m.category === 'exam';
        if (this.activeCategory === 'fest') return m.category === 'fest' || m.category === 'sports' || m.category === 'cultural';
        if (this.activeCategory === 'vacation') return m.category === 'vacation';
        if (this.activeCategory === 'holiday') return m.category === 'holiday';
        if (this.activeCategory === 'personal') return m.category === 'personal';
        if (this.activeCategory === 'academic') return m.category === 'academic' || m.category === 'registration' || m.category === 'commencement';
        return m.category === this.activeCategory;
      });
    }

    // 2. Search Query Filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      items = items.filter(m =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.target && m.target.toLowerCase().includes(q)) ||
        (m.dates && m.dates.toLowerCase().includes(q)) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.status && m.status.toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-surface-container-low rounded-2xl border border-white/[0.06]">
          <div class="text-4xl mb-3">📆</div>
          <h3 class="font-headline-sm text-base text-on-surface font-semibold mb-1">No Calendar Events Found</h3>
          <p class="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
            ${this.searchQuery ? `No milestones matching "${this.searchQuery}".` : `No milestones recorded under category "${this.activeCategory}".`}
          </p>
          <button type="button" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer" onclick="CalendarController.resetFilters()">
            Clear Filters & Search
          </button>
        </div>
      `;
      return;
    }

    const categoryMap = {
      'exam': { color: '#ef4444', label: 'Examination', icon: 'quiz', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
      'fest': { color: '#f59e0b', label: 'Fest / Hackathon', icon: 'celebration', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
      'sports': { color: '#10b981', label: 'Sports Meet', icon: 'sports_soccer', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
      'cultural': { color: '#ec4899', label: 'Cultural Fest', icon: 'theater_comedy', bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.3)' },
      'vacation': { color: '#8b5cf6', label: 'Vacation Break', icon: 'flight_takeoff', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' },
      'holiday': { color: '#10b981', label: 'Gazetted Holiday', icon: 'account_balance', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
      'academic': { color: '#3b82f6', label: 'Academic Milestone', icon: 'school', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' },
      'registration': { color: '#06b6d4', label: 'Registration', icon: 'how_to_reg', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
      'commencement': { color: '#00e5ff', label: 'Semester Start', icon: 'play_circle', bg: 'rgba(0, 229, 255, 0.12)', border: 'rgba(0, 229, 255, 0.3)' },
      'personal': { color: '#f43f5e', label: 'Personal Note', icon: 'star', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)' }
    };

    container.innerHTML = `
      <!-- Agenda Subheader Count -->
      <div class="flex items-center justify-between gap-2 mb-3 px-1">
        <span class="font-label-sm text-xs text-on-surface-variant font-medium">
          Showing <strong class="text-on-surface">${items.length}</strong> official schedule milestones
        </span>
        <span class="font-mono text-[11px] text-secondary bg-surface-container px-2 py-0.5 rounded-full border border-white/[0.04]">
          Ref: JUIT/WKG/REGR/2026-27
        </span>
      </div>

      <!-- Events List -->
      <div class="flex flex-col space-y-3">
        ${items.map(ev => {
          const cat = categoryMap[ev.category] || { color: '#3b82f6', label: 'Milestone', icon: 'event', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' };
          const parsed = this.parseEventDates(ev.dates);
          const countdown = this.getCountdownStatus(parsed);
          const gCalUrl = this.getGCalUrl(ev, parsed);

          const monthName = parsed ? parsed.monthStr : 'DATE';
          const dayDisplay = parsed ? (parsed.startDay === parsed.endDay ? `${parsed.startDay}` : `${parsed.startDay}–${parsed.endDay}`) : ev.dates;
          const isMultiDay = (dayDisplay && (dayDisplay.includes('–') || dayDisplay.includes('-') || dayDisplay.length > 2));
          const dayFontSize = isMultiDay ? 'text-[11px] sm:text-xs font-bold tracking-tight' : 'text-base sm:text-lg font-extrabold';

          return `
            <div class="calendar-agenda-item group relative rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all duration-200 border border-white/[0.06] p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm ${
              countdown.isCurrent ? 'ring-1 ring-emerald-500/40 bg-emerald-500/[0.03]' : ''
            }">
              <div class="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
                <!-- Date Pill Block -->
                <div class="w-14 sm:w-16 h-14 sm:h-16 px-1 rounded-xl bg-surface-container flex flex-col items-center justify-center shrink-0 border border-white/[0.06] shadow-sm text-center" style="border-left: 3px solid ${cat.color};">
                  <span class="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none" style="color: ${cat.color};">${monthName}</span>
                  <span class="font-mono ${dayFontSize} text-on-surface mt-1 leading-none">${dayDisplay}</span>
                </div>

                <!-- Event Details -->
                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold" style="background: ${cat.bg}; color: ${cat.color}; border: 1px solid ${cat.border};">
                      <span class="material-symbols-outlined text-[13px]">${cat.icon}</span>
                      <span>${cat.label}</span>
                    </span>

                    ${countdown.statusText ? `
                      <span class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-medium ${countdown.pillClass}">
                        ${countdown.statusText}
                      </span>
                    ` : ''}
                  </div>

                  <h4 class="font-headline-sm text-sm sm:text-base text-on-surface font-semibold group-hover:text-primary transition-colors leading-snug truncate">${ev.title}</h4>
                  <p class="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed">${ev.target}</p>
                  <p class="font-mono text-[11px] text-primary/80 flex items-center gap-1.5 font-medium">
                    <span class="material-symbols-outlined text-[13px]">calendar_today</span>
                    <span>${ev.dates}</span>
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 shrink-0 self-end sm:self-center ml-auto pt-1 sm:pt-0">
                <a href="${gCalUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary font-label-md text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm" title="Add to Google Calendar">
                  <span class="material-symbols-outlined text-[14px]">event</span>
                  <span>+ GCal</span>
                </a>
                <button type="button" class="w-8 h-8 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer" onclick="CalendarController.copyEvent('${ev.title.replace(/'/g, "\\'")}', '${ev.dates}', '${(ev.target || '').replace(/'/g, "\\'")}')" title="Copy Details">
                  <span class="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
                ${ev.isPersonal ? `
                  <button type="button" class="w-8 h-8 rounded-xl bg-error/15 hover:bg-error text-error hover:text-white flex items-center justify-center transition-colors cursor-pointer btn-del-personal-ev" data-id="${ev.id}" title="Delete Personal Milestone">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-del-personal-ev').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const current = this.getPersonalEvents().filter(x => x.id !== id);
        this.savePersonalEvents(current);
        this.renderCategoryFilters();
        this.renderSpotlightMilestone();
        this.renderCalendarContent();
      });
    });
  },

  renderMonthView(container) {
    const year = this.currentMonthDate.getFullYear();
    const month = this.currentMonthDate.getMonth();
    const monthName = this.currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const allEvents = this.getAllEvents();

    let gridHtml = `
      <div class="rounded-2xl bg-surface-container-low p-4 sm:p-5 border border-white/[0.06] shadow-sm flex flex-col space-y-4">
        <!-- Month Navigation Bar -->
        <div class="flex items-center justify-between gap-3">
          <button type="button" class="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface transition-colors cursor-pointer flex items-center gap-1" id="btn-month-prev">
            <span class="material-symbols-outlined text-[16px]">chevron_left</span>
            <span>Prev</span>
          </button>
          <div class="text-center">
            <h3 class="font-headline-sm text-base sm:text-lg text-on-surface font-bold">${monthName}</h3>
            <span class="font-mono text-[10px] text-secondary">Academic Session 2026-27</span>
          </div>
          <button type="button" class="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface transition-colors cursor-pointer flex items-center gap-1" id="btn-month-next">
            <span>Next</span>
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-on-surface-variant uppercase tracking-wider py-1 border-b border-white/[0.04]">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div>${d}</div>`).join('')}
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-1 sm:gap-2">
    `;

    // Blank cells before month start
    for (let i = 0; i < firstDayIndex; i++) {
      gridHtml += `<div class="h-16 sm:h-24 rounded-xl bg-surface-container/20 border border-transparent"></div>`;
    }

    // Days in current month
    for (let day = 1; day <= totalDays; day++) {
      const currentCellDate = new Date(year, month, day, 12, 0, 0);

      // Find events matching this date
      const dayEvents = allEvents.filter(ev => {
        const parsed = this.parseEventDates(ev.dates);
        if (!parsed) return false;
        return currentCellDate >= parsed.startDate && currentCellDate <= parsed.endDate;
      });

      const hasEvents = dayEvents.length > 0;
      const isToday = (new Date().toDateString() === currentCellDate.toDateString());

      gridHtml += `
        <div class="min-h-16 sm:min-h-24 rounded-xl p-1.5 sm:p-2 flex flex-col justify-between transition-colors border ${
          isToday
            ? 'bg-primary/10 border-primary ring-1 ring-primary/40'
            : (hasEvents ? 'bg-surface-container border-white/[0.08] hover:border-primary/40 cursor-pointer' : 'bg-surface-container-lowest border-white/[0.02]')
        }">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs font-bold ${isToday ? 'text-primary' : (hasEvents ? 'text-on-surface' : 'text-on-surface-variant/60')}">${day}</span>
            ${isToday ? '<span class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>' : ''}
          </div>
          <div class="flex flex-col gap-1 overflow-hidden mt-1">
            ${dayEvents.slice(0, 2).map(ev => `
              <div class="px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${
                ev.category === 'exam' ? 'bg-error/20 text-error' : (ev.category === 'holiday' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-primary/20 text-primary')
              }" title="${ev.title}">
                ${ev.title}
              </div>
            `).join('')}
            ${dayEvents.length > 2 ? `
              <span class="font-mono text-[9px] text-secondary font-semibold">+${dayEvents.length - 2} more</span>
            ` : ''}
          </div>
        </div>
      `;
    }

    gridHtml += `
        </div>
      </div>
    `;

    container.innerHTML = gridHtml;

    document.getElementById('btn-month-prev')?.addEventListener('click', () => {
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() - 1);
      this.renderMonthView(container);
    });

    document.getElementById('btn-month-next')?.addEventListener('click', () => {
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + 1);
      this.renderMonthView(container);
    });
  },

  resetFilters() {
    this.searchQuery = '';
    this.activeCategory = 'all';
    const searchInput = document.getElementById('calendar-search-input');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('calendar-search-clear');
    if (clearBtn) clearBtn.style.display = 'none';

    this.renderCategoryFilters();
    this.renderCalendarContent();
  },

  promptAddPersonalEvent() {
    const title = prompt('Personal Milestone Title (e.g. SDF Viva Revision / Hackathon Submission):');
    if (!title) return;
    const date = prompt('Date / Schedule (e.g. 15 Oct 2026 or 20 - 22 Oct 2026):', '15 Oct 2026');
    const note = prompt('Optional details or venue (e.g. AB1 TR4 with batch):', 'Preparation in Central Library');

    const current = this.getPersonalEvents();
    current.push({
      id: `pe-${Date.now()}`,
      title,
      date: date || '15 Oct 2026',
      note: note || ''
    });
    this.savePersonalEvents(current);
    this.renderCategoryFilters();
    this.renderSpotlightMilestone();
    this.renderCalendarContent();
  },

  copyEvent(title, dates, target) {
    const text = `📅 JUIT Milestone: ${title}\n🗓 Dates: ${dates}\n📌 Cohort/Note: ${target}\n🏛 Jaypee University of Information Technology`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert(`✓ Copied milestone to clipboard:\n${title} (${dates})`);
      }).catch(() => {
        prompt('Copy milestone details:', text);
      });
    } else {
      prompt('Copy milestone details:', text);
    }
  },

  exportICSFile(events) {
    const items = events || this.getAllEvents();

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jaypee University of Information Technology//Academic Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:JUIT Academic Calendar 2026-27'
    ];

    items.forEach((ev, idx) => {
      const parsed = this.parseEventDates(ev.dates);
      let dtStart = '20260924';
      let dtEnd = '20260925';

      if (parsed) {
        const formatDate = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}${m}${day}`;
        };
        dtStart = formatDate(parsed.startDate);
        const endPlusOne = new Date(parsed.endDate.getTime() + 86400000);
        dtEnd = formatDate(endPlusOne);
      }

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:juit-${idx}-${Date.now()}@juit.ac.in`);
      icsContent.push(`SUMMARY:${ev.title.replace(/[,;]/g, ' ')}`);
      icsContent.push(`DESCRIPTION:${(ev.target || 'JUIT Milestone').replace(/[,;]/g, ' ')}`);
      icsContent.push(`LOCATION:Jaypee University of Information Technology, Waknaghat, Solan (H.P.)`);
      icsContent.push(`DTSTART;VALUE=DATE:${dtStart}`);
      icsContent.push(`DTEND;VALUE=DATE:${dtEnd}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JUIT_Academic_Calendar_${this.activeTerm}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`✓ JUIT Academic Calendar (.ics) downloaded. Import it directly into Apple Calendar, Google Calendar, or Outlook.`);
  },

  bindEvents() {
    const btnOdd = document.getElementById('btn-cal-odd');
    const btnEven = document.getElementById('btn-cal-even');

    if (btnOdd) {
      btnOdd.addEventListener('click', () => {
        this.activeTerm = 'odd2026';
        this.renderTermSwitcher();
        this.renderCategoryFilters();
        this.renderSpotlightMilestone();
        this.renderCalendarContent();
      });
    }

    if (btnEven) {
      btnEven.addEventListener('click', () => {
        this.activeTerm = 'even2027';
        this.renderTermSwitcher();
        this.renderCategoryFilters();
        this.renderSpotlightMilestone();
        this.renderCalendarContent();
      });
    }

    // Search Input Binding
    const searchInput = document.getElementById('calendar-search-input');
    const clearBtn = document.getElementById('calendar-search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (clearBtn) {
          clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        }
        this.renderCalendarContent();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchQuery = '';
        if (searchInput) searchInput.value = '';
        clearBtn.style.display = 'none';
        this.renderCalendarContent();
      });
    }

    // Top action buttons
    document.getElementById('btn-export-ics-main')?.addEventListener('click', () => {
      this.exportICSFile();
    });

    document.getElementById('btn-add-personal-main')?.addEventListener('click', () => {
      this.promptAddPersonalEvent();
    });
  }
};

window.CalendarController = CalendarController;
