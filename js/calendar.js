/**
 * Academic Calendar Controller for JUIT Student Hub
 * Sourced from official notification Ref: JUIT/WKG/REGR/2026-27/050
 * Features:
 * - Real-time Day Countdown Statuses (In X Days, Happening Today, Concluded)
 * - Live Search Filter across all milestones, exams, fests, and holidays
 * - Category Filters with Vibrant Badges (Exams, Fests, Vacations, Holidays, Personal)
 * - 1-Tap Google Calendar Export & .ICS Sync
 * - Dual Agenda Timeline View and Interactive Month Grid View
 * - Personal Scholar Event Planner stored in localStorage
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
    this.renderViewSwitcher();
    this.renderCalendarContent();
    this.bindEvents();
  },

  renderTimeline() {
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
      btnOdd.classList.toggle('active', this.activeTerm === 'odd2026');
      btnEven.classList.toggle('active', this.activeTerm === 'even2027');
    }

    if (termPill) {
      termPill.innerHTML = this.activeTerm === 'odd2026'
        ? '<span class="pulse-indicator"></span><span>ODD Sem 2026 Active</span>'
        : '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#8b5cf6;"></span><span>EVEN Sem 2027</span>';
    }
  },

  renderViewSwitcher() {
    const container = document.getElementById('calendar-view-switcher');
    if (!container) return;

    container.innerHTML = `
      <div class="calendar-view-mode-bar">
        <div class="term-switcher">
          <button type="button" class="term-btn ${this.activeViewMode === 'agenda' ? 'active' : ''}" data-cal-view="agenda">
            📑 Agenda Timeline
          </button>
          <button type="button" class="term-btn ${this.activeViewMode === 'month' ? 'active' : ''}" data-cal-view="month">
            📆 Month Grid
          </button>
        </div>
      </div>
    `;

    container.querySelectorAll('.term-btn').forEach(btn => {
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
      return { statusText: '', pillClass: '', pillColor: 'var(--text-muted)', isPast: false };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const { startDate, endDate } = parsedDates;
    const msPerDay = 1000 * 60 * 60 * 24;

    if (today >= startDate && today <= endDate) {
      return {
        statusText: '🔴 Active Today',
        pillClass: 'active',
        pillColor: '#10b981',
        isCurrent: true
      };
    }

    if (today > endDate) {
      return {
        statusText: '✓ Concluded',
        pillClass: 'concluded',
        pillColor: 'var(--text-muted)',
        isPast: true
      };
    }

    const diffDays = Math.ceil((startDate - today) / msPerDay);
    if (diffDays === 1) {
      return {
        statusText: '⚡ Starts Tomorrow',
        pillClass: 'urgent',
        pillColor: '#f59e0b',
        isUpcoming: true
      };
    }

    return {
      statusText: `⏳ Starts in ${diffDays} days`,
      pillClass: diffDays <= 7 ? 'urgent' : 'upcoming',
      pillColor: diffDays <= 7 ? '#f59e0b' : 'var(--accent-primary)',
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
        <div class="empty-state-card" style="padding: 40px; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📆</div>
          <h3 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 6px;">No Calendar Events Found</h3>
          <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto 16px;">
            ${this.searchQuery ? `No milestones matching search query "<strong>${this.searchQuery}</strong>".` : `No milestones recorded under category "<strong>${this.activeCategory}</strong>".`}
          </p>
          <button type="button" class="btn-primary" onclick="CalendarController.resetFilters()">
            Clear Filters & Search
          </button>
        </div>
      `;
      return;
    }

    const categoryMap = {
      'exam': { color: '#ef4444', label: 'Examination', icon: 'quiz', bg: 'rgba(239, 68, 68, 0.12)' },
      'fest': { color: '#f59e0b', label: 'Fest / Hackathon', icon: 'celebration', bg: 'rgba(245, 158, 11, 0.12)' },
      'sports': { color: '#10b981', label: 'Sports Meet', icon: 'sports_soccer', bg: 'rgba(16, 185, 129, 0.12)' },
      'cultural': { color: '#ec4899', label: 'Cultural Fest', icon: 'theater_comedy', bg: 'rgba(236, 72, 153, 0.12)' },
      'vacation': { color: '#8b5cf6', label: 'Vacation Break', icon: 'flight_takeoff', bg: 'rgba(139, 92, 246, 0.12)' },
      'holiday': { color: '#10b981', label: 'Gazetted Holiday', icon: 'account_balance', bg: 'rgba(16, 185, 129, 0.12)' },
      'academic': { color: '#3b82f6', label: 'Academic Milestone', icon: 'school', bg: 'rgba(59, 130, 246, 0.12)' },
      'registration': { color: '#06b6d4', label: 'Registration', icon: 'how_to_reg', bg: 'rgba(6, 182, 212, 0.12)' },
      'commencement': { color: '#00e5ff', label: 'Semester Start', icon: 'play_circle', bg: 'rgba(0, 229, 255, 0.12)' },
      'personal': { color: '#f43f5e', label: 'Personal Note', icon: 'star', bg: 'rgba(244, 63, 94, 0.12)' }
    };

    container.innerHTML = `
      <!-- Agenda Subheader Count -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div style="font-size: 0.88rem; color: var(--text-secondary);">
          Showing <strong>${items.length}</strong> official schedule milestones
        </div>
        <div style="display: flex; gap: 6px;">
          <span class="hub-pill-tag" style="background: rgba(0, 229, 255, 0.08); color: var(--accent-primary);">
            Ref: JUIT/WKG/REGR
          </span>
        </div>
      </div>

      <!-- Events List -->
      <div class="calendar-agenda-stack">
        ${items.map(ev => {
          const cat = categoryMap[ev.category] || { color: '#3b82f6', label: 'Event', icon: 'event', bg: 'rgba(59, 130, 246, 0.12)' };
          const parsed = this.parseEventDates(ev.dates);
          const countdown = this.getCountdownStatus(parsed);
          const gCalUrl = this.getGCalUrl(ev, parsed);

          const monthName = parsed ? parsed.monthStr : 'DATE';
          const dayDisplay = parsed ? (parsed.startDay === parsed.endDay ? `${parsed.startDay}` : `${parsed.startDay}–${parsed.endDay}`) : ev.dates;

          return `
            <div class="cal-event-card ${countdown.isCurrent ? 'active-event' : ''} ${countdown.isPast ? 'concluded-event' : ''}">
              <!-- Left: Date Box Pill -->
              <div class="cal-date-pill-box" style="border-left: 3px solid ${cat.color};">
                <span class="cal-date-month" style="color: ${cat.color};">${monthName}</span>
                <span class="cal-date-day">${dayDisplay}</span>
              </div>

              <!-- Center: Event Info & Badges -->
              <div class="cal-event-main-content">
                <div class="cal-event-tags-row">
                  <span class="cal-cat-badge" style="background: ${cat.bg}; color: ${cat.color}; border: 1px solid ${cat.color}35;">
                    <span class="material-symbols-outlined text-[13px]">${cat.icon}</span>
                    <span>${cat.label}</span>
                  </span>

                  ${countdown.statusText ? `
                    <span class="cal-countdown-badge ${countdown.pillClass}" style="color: ${countdown.pillColor};">
                      ${countdown.statusText}
                    </span>
                  ` : ''}
                </div>

                <h4 class="cal-event-title">${ev.title}</h4>
                <div class="cal-event-audience">${ev.target}</div>
                <div class="cal-event-raw-dates">🗓 ${ev.dates}</div>
              </div>

              <!-- Right: Quick Actions (Google Calendar, Copy, Delete) -->
              <div class="cal-event-action-group">
                <a href="${gCalUrl}" target="_blank" rel="noopener noreferrer" class="btn-cal-gcal" title="Sync this milestone to your Google Calendar">
                  <span>+ GCal</span>
                  <span class="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
                <button type="button" class="btn-cal-copy" onclick="CalendarController.copyEvent('${ev.title.replace(/'/g, "\\'")}', '${ev.dates}', '${(ev.target || '').replace(/'/g, "\\'")}')" title="Copy event details to clipboard">
                  <span class="material-symbols-outlined text-[15px]">content_copy</span>
                </button>
                ${ev.isPersonal ? `
                  <button type="button" class="btn-cal-del btn-del-personal-ev" data-id="${ev.id}" title="Delete personal note">
                    <span class="material-symbols-outlined text-[15px]">delete</span>
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
      <div class="dash-card calendar-month-container">
        <!-- Month Bar Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <button type="button" class="btn-secondary" id="btn-month-prev" style="padding: 6px 14px;">
            ← Prev Month
          </button>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0;">
            ${monthName}
          </h3>
          <button type="button" class="btn-secondary" id="btn-month-next" style="padding: 6px 14px;">
            Next Month →
          </button>
        </div>

        <!-- Weekday Headers -->
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; margin-bottom: 8px;">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `
            <div style="font-size: 0.76rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; padding: 4px;">
              ${d}
            </div>
          `).join('')}
        </div>

        <!-- Days Grid -->
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
    `;

    // Blank cells before month start
    for (let i = 0; i < firstDayIndex; i++) {
      gridHtml += `<div class="month-day-cell empty" style="height: 80px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-xs); border: 1px dashed rgba(255, 255, 255, 0.05);"></div>`;
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
        <div class="month-day-cell ${hasEvents ? 'has-events' : ''} ${isToday ? 'is-today' : ''}" style="min-height: 80px; background: var(--bg-elevated); border: 1px solid ${isToday ? 'var(--accent-primary)' : 'var(--border-subtle)'}; border-radius: var(--radius-xs); padding: 5px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            ${isToday ? '<span style="font-size: 0.6rem; color: var(--accent-primary); font-weight: 800;">TODAY</span>' : '<span></span>'}
            <span style="font-weight: 700; font-size: 0.78rem; color: ${isToday ? 'var(--accent-primary)' : 'var(--text-secondary)'};">${day}</span>
          </div>
          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 3px;">
            ${dayEvents.slice(0, 2).map(ev => `
              <div class="month-mini-event" style="font-size: 0.68rem; background: rgba(0, 229, 255, 0.12); color: var(--accent-primary); border-radius: 3px; padding: 2px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 2px solid var(--accent-primary);" title="${ev.title}">
                ${ev.title}
              </div>
            `).join('')}
            ${dayEvents.length > 2 ? `
              <div style="font-size: 0.64rem; color: var(--text-muted); text-align: center;">+${dayEvents.length - 2} more</div>
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

    document.querySelectorAll('.cal-filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === 'all');
    });

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
    this.renderCalendarContent();
  },

  copyEvent(title, dates, target) {
    const text = `📅 JUIT Calendar Event: ${title}\n🗓 Dates: ${dates}\n📌 Note: ${target}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert(`✓ Copied milestone details to clipboard:\n${title} (${dates})`);
      }).catch(() => {
        prompt('Copy milestone details:', text);
      });
    } else {
      prompt('Copy milestone details:', text);
    }
  },

  exportICSFile(events) {
    const termData = this.data.semesters && this.data.semesters[this.activeTerm];
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

    alert(`✓ JUIT Academic Calendar (.ics) downloaded. You can now import it directly into Apple Calendar, Google Calendar, or Outlook.`);
  },

  bindEvents() {
    const btnOdd = document.getElementById('btn-cal-odd');
    const btnEven = document.getElementById('btn-cal-even');

    if (btnOdd) {
      btnOdd.addEventListener('click', () => {
        this.activeTerm = 'odd2026';
        this.renderTermSwitcher();
        this.renderCalendarContent();
      });
    }

    if (btnEven) {
      btnEven.addEventListener('click', () => {
        this.activeTerm = 'even2027';
        this.renderTermSwitcher();
        this.renderCalendarContent();
      });
    }

    document.querySelectorAll('.cal-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cal-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.filter;
        this.renderCalendarContent();
      });
    });

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
