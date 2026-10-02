/**
 * Handcrafted, Ultra-Professional Timetable Controller for JUIT Student Hub
 * Built to faithfully match and exceed the official JUIT timetable reference.
 */

const TimetableController = {
  data: {},
  activeSemesterId: 'odd_btech_1_sem',
  activeBatch: '26BT10', // Default to 26BT10 matching reference screenshot
  activeDay: 'TUE',
  viewMode: 'today', // 'today' | 'day' | 'week'
  searchQuery: '',
  simulatedMinutes: null, // null = live real time
  hidePastClasses: false,
  days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  timeSlots: [
    '09:00 AM - 09:55 AM',
    '10:00 AM - 10:55 AM',
    '11:00 AM - 11:55 AM',
    '12:00 PM - 12:55 PM',
    '01:00 PM - 02:00 PM', // Lunch
    '02:00 PM - 02:55 PM',
    '03:00 PM - 03:55 PM',
    '04:00 PM - 04:55 PM'
  ],
  dayFullNames: {
    'MON': 'Monday',
    'TUE': 'Tuesday',
    'WED': 'Wednesday',
    'THU': 'Thursday',
    'FRI': 'Friday',
    'SAT': 'Saturday'
  },

  init(timetableData) {
    this.data = timetableData || (window.JUIT_DATA && window.JUIT_DATA.timetable) || {};
    
    // Auto-detect current system day
    const dayIndex = new Date().getDay();
    const dayMap = ['MON', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    this.activeDay = dayMap[dayIndex] || 'TUE';

    // Restore saved preferences if valid
    const savedSem = localStorage.getItem('juit_selected_sem');
    if (savedSem && this.data[savedSem]) {
      this.activeSemesterId = savedSem;
    } else if (this.data['odd_btech_1_sem']) {
      this.activeSemesterId = 'odd_btech_1_sem';
    } else {
      this.activeSemesterId = Object.keys(this.data)[0];
    }

    const savedBatch = localStorage.getItem('juit_selected_batch');
    if (savedBatch) {
      this.activeBatch = savedBatch;
    } else {
      // Default to 26BT10 if available in BTech 1 sem
      this.activeBatch = '26BT10';
    }

    this.renderSemesterDropdown();
    this.populateBatchDropdown();
    this.renderQuickBatchChips();
    this.renderViewModeTabs();
    this.renderDayPills();
    this.renderSchedule();
    this.bindEvents();

    // Auto-refresh every 30 seconds for live period status
    setInterval(() => {
      if (this.simulatedMinutes === null) {
        this.updateTimeTracker();
      }
    }, 30000);
  },

  getCurrentMinutes() {
    if (this.simulatedMinutes !== null) {
      return this.simulatedMinutes;
    }
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  },

  parseTimeRange(rangeStr) {
    if (!rangeStr) return null;
    const parts = rangeStr.split(/[-–—]/);
    if (parts.length < 2) return null;

    const p1 = parts[1].trim();
    const endAmPmMatch = p1.match(/(AM|PM)/i);
    const inheritAmPm = endAmPmMatch ? endAmPmMatch[1].toUpperCase() : '';

    const parsePart = (str, fallbackAmPm = '') => {
      const cleaned = str.trim().replace(/\s+/g, ' ');
      const m = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!m) return null;
      let hrs = parseInt(m[1], 10);
      const mins = parseInt(m[2], 10);
      let ampm = (m[3] || fallbackAmPm).toUpperCase();

      // Smart daytime inference if ampm still missing
      if (!ampm) {
        if (hrs >= 8 && hrs <= 11) ampm = 'AM';
        else if (hrs === 12 || (hrs >= 1 && hrs <= 7)) ampm = 'PM';
      }

      if (ampm === 'PM' && hrs !== 12) hrs += 12;
      if (ampm === 'AM' && hrs === 12) hrs = 0;
      return hrs * 60 + mins;
    };

    const start = parsePart(parts[0], inheritAmPm);
    const end = parsePart(parts[1]);
    if (start === null || end === null) return null;
    return { start, end };
  },

  getCleanSubjectName(code, subject) {
    const c = (code || '').toUpperCase();
    if (c.includes('HS111')) return 'English';
    if (c.includes('CI112')) return 'SDF';
    if (c.includes('MA113') || c.includes('MA111') || c.includes('MA112')) return 'Mathematics';
    if (c.includes('PH111') || c.includes('PH112')) return 'Physics';
    if (c.includes('EC111') || c.includes('EC112')) return 'Basic Electronics';
    if (c.includes('GE171')) return 'Workshop Lab';
    if (c.includes('GE172')) return 'Engineering Drawing (CAD)';
    if (c.includes('CI172')) return 'SDF Lab';
    if (c.includes('PH171')) return 'Physics Lab';
    if (c.includes('EC171')) return 'Electronics Lab';
    if (c.includes('CI312') || c.includes('CI211')) return 'Data Structures (DSA)';
    if (c.includes('CI375')) return 'Data Structures Lab';
    if (c.includes('CI311')) return 'Object-Oriented Programming (OOP)';
    if (c.includes('CI313')) return 'Computer Organization (COA)';
    if (c.includes('CI514') || c.includes('CI411')) return 'Operating Systems';
    if (c.includes('CI517') || c.includes('CI612')) return 'Computer Networks';
    if (c.includes('CI611')) return 'Design & Analysis of Algorithms';
    if (c.includes('CI613')) return 'Software Engineering';
    if (c.includes('CI740')) return 'AI & Machine Learning';
    if (c.includes('CI742')) return 'Cyber Security';
    
    if (subject && subject.includes('(')) {
      return subject.split('(')[0].trim();
    }
    return subject || code;
  },

  resolveVaultResource(subject, code, type) {
    const cleanSubj = (subject || '').toUpperCase();
    const c = (code || '').toUpperCase();
    const combined = `${cleanSubj} ${c}`;

    // 1. SDF / Software Development Fundamentals / C Programming
    // Must explicitly match CI code prefix or SDF/C Programming terms
    if (
      c.includes('CI112') ||
      c.includes('CI172') ||
      cleanSubj.includes('SDF') ||
      cleanSubj.includes('SOFTWARE DEV') ||
      cleanSubj.includes('C PROG') ||
      cleanSubj.includes('C PROGRAMMING')
    ) {
      if (type === 'P' || c.includes('172') || combined.includes('LAB')) {
        return {
          title: 'SDF Laboratory Assignment Solutions Manual (CL01–CL52)',
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

    // 2. Engineering Physics / Optics / Electrodynamics
    // Must explicitly match PH department code or Physics keywords (never standalone numbers)
    if (
      c.includes('PH111') ||
      c.includes('PH171') ||
      c.includes('PH112') ||
      c.includes('PH172') ||
      cleanSubj.includes('PHYSIC') ||
      cleanSubj.includes('OPTIC') ||
      cleanSubj.includes('ELECTRODYNAMIC')
    ) {
      if (type === 'P' || c.includes('171') || c.includes('172') || combined.includes('LAB') || combined.includes('PHLAB')) {
        return {
          title: 'Engineering Physics Laboratory Manual (PHLAB1 & PHLAB2)',
          label: 'Physics Lab Manual',
          shortTitle: 'Physics Lab Manual',
          link: 'vault/Physics_Laboratory_Manual_PHLAB.pdf'
        };
      }
      return {
        title: 'Engineering Physics: Electrodynamics & Laser Optics Notes',
        label: 'Physics Notes',
        shortTitle: 'Physics Notes',
        link: 'vault/Physics_Electrodynamics_Optics_Notes.pdf'
      };
    }

    // 3. Technical English / Communication Skills
    // Must explicitly match HS department code or English/Communication keywords
    if (
      c.includes('HS111') ||
      c.includes('HS171') ||
      cleanSubj.includes('ENGLISH') ||
      cleanSubj.includes('COMMUNICATION') ||
      combined.includes('LANGULAB') ||
      combined.includes('GDROOM')
    ) {
      if (type === 'P' || c.includes('171') || combined.includes('LAB') || combined.includes('LANGULAB')) {
        return {
          title: 'English Language Lab Manual & GD Frameworks (LANGULAB)',
          label: 'English Lab Manual',
          shortTitle: 'English Lab Manual',
          link: 'vault/English_Language_Lab_Manual.pdf'
        };
      }
      return {
        title: 'Technical English: Communication Skills Lecture Notes',
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
      return {
        subjectType: 'electronics',
        title: 'Basic Electronics: Tutorial Sheets & Problem Sets (Tutorials 1–5)',
        dept: 'Department of ECE • 25B11EC111 • Verified Assignment Problem Sets',
        label: 'Electronics Tutorials (1–5)',
        shortTitle: 'Tutorial Sheets',
        link: 'vault/Basic_Electronics_All_Tutorials_Bundle.pdf',
        hasMultiple: true,
        tutorials: [
          { num: 1, title: 'Tutorial 1: Charge, Current, Voltage & Power', subtitle: 'Basic circuit concepts & Ohm\'s law', link: 'vault/Basic_Electronics_Tutorial_1.pdf' },
          { num: 2, title: 'Tutorial 2: Circuit Topology, KVL, KCL & Resistors', subtitle: 'Kirchhoff\'s laws & mesh topologies', link: 'vault/Basic_Electronics_Tutorial_2.pdf' },
          { num: 3, title: 'Tutorial 3: Nodal Analysis, Supernodes & Mesh', subtitle: 'Matrix nodal equations & supermeshes', link: 'vault/Basic_Electronics_Tutorial_3.pdf' },
          { num: 4, title: 'Tutorial 4: Superposition & Thévenin / Norton', subtitle: 'Network theorems & equivalent sources', link: 'vault/Basic_Electronics_Tutorial_4.pdf' },
          { num: 5, title: 'Tutorial 5: Diode Characteristics & Zener Regulators', subtitle: 'Semiconductor PN junction & diode models', link: 'vault/Basic_Electronics_Tutorial_5.pdf' },
          { num: 'Bundle', title: 'Complete Bundle (1–5) PDF (18 Pages)', subtitle: 'All 5 ECE tutorials with schematics', link: 'vault/Basic_Electronics_All_Tutorials_Bundle.pdf' }
        ]
      };
    }

    // 5. Mathematics I (25B11MA113 / MA111 / MA112 / MA113 / Calculus / Linear Algebra)
    if (
      c.includes('MA111') ||
      c.includes('MA112') ||
      c.includes('MA113') ||
      c.includes('25B11MA113') ||
      c.includes('25BC1MA111') ||
      cleanSubj.includes('MATH') ||
      cleanSubj.includes('CALCULUS')
    ) {
      return {
        subjectType: 'math',
        title: 'Mathematics I: Tutorial Sheets & Verified Solutions (Sheets 1–4)',
        dept: 'Department of Mathematics • 25B11MA113 • Verified Tutorial Problem Sets',
        label: 'Math Tutorials (1–4)',
        shortTitle: 'Math Tutorials',
        link: 'vault/Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf',
        hasMultiple: true,
        tutorials: [
          { num: 1, title: 'Tutorial Sheet 1: Limits, Continuity, Chain Rule & Jacobian', subtitle: 'Limits, Continuity, Partial Derivatives & Jacobians', link: 'vault/Math1_Tutorial_Sheet_1.pdf' },
          { num: 2, title: 'Tutorial Sheet 2: Taylor Series, Maxima-Minima & Lagrange Multiplier', subtitle: 'Multivariable Expansions & Optimization', link: 'vault/Math1_Tutorial_Sheet_2.pdf' },
          { num: 3, title: 'Tutorial Sheet 3: Double Integrals, Change of Order & Beta-Gamma Functions', subtitle: 'Double Integrals, Polar Form & Special Functions', link: 'vault/Math1_Tutorial_Sheet_3.pdf' },
          { num: 4, title: 'Tutorial Sheet 4: Applications of Double Integrals to Area & Volume', subtitle: 'Area, Volume, Signal Energy & Chip Heat', link: 'vault/Math1_Tutorial_Sheet_4.pdf' },
          { num: 'Bundle', title: 'Complete Bundle (1–4) PDF (8 Pages)', subtitle: 'All 4 Mathematics I tutorial sheets with verified answers', link: 'vault/Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf' }
        ]
      };
    }

    // 6. Any other subject without stored notes
    return null;
  },

  renderSemesterDropdown() {
    const semSelect = document.getElementById('timetable-sem-select');
    if (!semSelect) return;

    const oddKeys = Object.keys(this.data).filter(k => k.startsWith('odd_'));
    const evenKeys = Object.keys(this.data).filter(k => k.startsWith('even_'));
    const summerKeys = Object.keys(this.data).filter(k => k.startsWith('summer_'));

    let html = '';
    if (oddKeys.length) {
      html += '<optgroup label="ODD SEMESTER 2026 (ACTIVE)">';
      oddKeys.forEach(k => {
        const item = this.data[k];
        html += `<option value="${k}" ${k === this.activeSemesterId ? 'selected' : ''}>${item.title} (${item.term})</option>`;
      });
      html += '</optgroup>';
    }
    if (evenKeys.length) {
      html += '<optgroup label="EVEN SEMESTER 2026-27">';
      evenKeys.forEach(k => {
        const item = this.data[k];
        html += `<option value="${k}" ${k === this.activeSemesterId ? 'selected' : ''}>${item.title}</option>`;
      });
      html += '</optgroup>';
    }
    if (summerKeys.length) {
      html += '<optgroup label="SUMMER SEMESTER 2026">';
      summerKeys.forEach(k => {
        const item = this.data[k];
        html += `<option value="${k}" ${k === this.activeSemesterId ? 'selected' : ''}>${item.title}</option>`;
      });
      html += '</optgroup>';
    }

    semSelect.innerHTML = html;
  },

  populateBatchDropdown() {
    const batchSelect = document.getElementById('timetable-batch-select');
    if (!batchSelect) return;

    const currentSheet = this.data[this.activeSemesterId];
    if (!currentSheet || !currentSheet.batches || currentSheet.batches.length === 0) {
      batchSelect.innerHTML = '<option value="ALL">All Batches</option>';
      this.activeBatch = 'ALL';
      batchSelect.value = 'ALL';
      return;
    }

    if (this.activeBatch !== 'ALL' && !currentSheet.batches.includes(this.activeBatch)) {
      this.activeBatch = currentSheet.batches[0] || 'ALL';
      localStorage.setItem('juit_selected_batch', this.activeBatch);
    }

    let html = '<option value="ALL">All Batches</option>';
    currentSheet.batches.forEach(b => {
      html += `<option value="${b}" ${b === this.activeBatch ? 'selected' : ''}>Batch ${b}</option>`;
    });

    batchSelect.innerHTML = html;
    batchSelect.value = this.activeBatch || 'ALL';
  },

  renderQuickBatchChips() {
    const container = document.getElementById('quick-batch-container');
    if (!container) return;

    const currentSheet = this.data[this.activeSemesterId];
    const batches = (currentSheet && currentSheet.batches) ? currentSheet.batches : [];
    if (batches.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    const topBatches = batches.slice(0, 12);

    let html = `<span class="font-label-sm text-label-sm text-outline uppercase tracking-wider flex-shrink-0 mr-1">Quick Batches:</span>`;
    
    const isAllActive = (!this.activeBatch || this.activeBatch === 'ALL');
    html += `
      <button type="button" class="px-2.5 py-1 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${isAllActive ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'}" data-batch="ALL">
        All
      </button>
    `;

    topBatches.forEach(b => {
      const isActive = (this.activeBatch === b);
      html += `
        <button type="button" class="px-2.5 py-1 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${isActive ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'}" data-batch="${b}">
          ${b}${isActive ? ' (Active)' : ''}
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('button[data-batch]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeBatch = btn.dataset.batch;
        localStorage.setItem('juit_selected_batch', this.activeBatch);
        const batchSelect = document.getElementById('timetable-batch-select');
        if (batchSelect) batchSelect.value = this.activeBatch;
        this.renderQuickBatchChips();
        this.renderDayPills();
        this.renderSchedule();
        this.updateDashboardToday();
      });
    });
  },

  renderViewModeTabs() {
    const container = document.getElementById('timetable-view-mode-tabs');
    if (!container) return;

    container.innerHTML = `
      <button type="button" class="flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3.5 py-1.5 rounded-lg ${this.viewMode === 'today' ? 'bg-surface-container-high text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'} font-body-sm text-xs sm:text-body-sm transition-colors cursor-pointer" data-mode="today">
        <span class="material-symbols-outlined text-[15px] sm:text-[16px]">bolt</span>
        <span>Today</span>
      </button>
      <button type="button" class="flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3.5 py-1.5 rounded-lg ${this.viewMode === 'day' ? 'bg-surface-container-high text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'} font-body-sm text-xs sm:text-body-sm transition-colors cursor-pointer" data-mode="day">
        <span class="material-symbols-outlined text-[15px] sm:text-[16px]">calendar_today</span>
        <span>Day Flow</span>
      </button>
      <button type="button" class="flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3.5 py-1.5 rounded-lg ${this.viewMode === 'week' ? 'bg-surface-container-high text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'} font-body-sm text-xs sm:text-body-sm transition-colors cursor-pointer" data-mode="week">
        <span class="material-symbols-outlined text-[15px] sm:text-[16px]">view_column</span>
        <span>Week Matrix</span>
      </button>
    `;

    container.querySelectorAll('button[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.viewMode = btn.dataset.mode;
        if (this.viewMode === 'today') {
          const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
          this.activeDay = currentDayCode === 'SUN' ? 'MON' : currentDayCode;
        }
        this.renderViewModeTabs();
        this.renderDayPills();
        this.renderSchedule();
      });
    });
  },

  renderDayPills() {
    const container = document.getElementById('timetable-day-pills');
    if (!container) return;

    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];

    container.innerHTML = this.days.map(d => {
      const isToday = (d === currentDayCode);
      const isActive = (d === this.activeDay);
      const dayClasses = this.filterAndMergeEntries(d);
      const count = dayClasses.length;

      return `
        <div class="${isActive ? 'bg-surface-container-high ring-1 ring-primary shadow-md' : 'bg-surface-container-low hover:bg-surface-container'} p-1.5 sm:p-3 rounded-xl text-center cursor-pointer transition-colors border border-outline-variant/15 select-none" data-day="${d}">
          <div class="flex items-center justify-center gap-1">
            <p class="font-headline-sm text-xs sm:text-headline-sm font-bold ${isActive ? 'text-primary' : 'text-on-surface'}">${d}</p>
            ${isToday ? '<span class="w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></span>' : ''}
          </div>
          <p class="font-label-sm text-[10px] sm:text-label-sm ${isActive ? 'text-secondary font-medium' : 'text-outline'} mt-0.5 whitespace-nowrap"><span class="sm:hidden">${count} cls</span><span class="hidden sm:inline">${count} ${count === 1 ? 'class' : 'classes'}</span></p>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeDay = btn.dataset.day;
        this.renderDayPills();
        this.renderSchedule();
      });
    });
  },

  filterAndMergeEntries(day) {
    const currentSheet = this.data[this.activeSemesterId];
    if (!currentSheet || !currentSheet.entries) return [];

    let dayEntries = currentSheet.entries.filter(e => e.day === day);

    // Filter by batch with strict exact token matching
    if (this.activeBatch && this.activeBatch !== 'ALL') {
      const targetClean = this.activeBatch.trim().replace(/[.,;]+$/, '').toUpperCase();

      dayEntries = dayEntries.filter(e => {
        if (!e.batches || e.batches.length === 0) return false;
        if (e.batches.includes('ALL')) return true;

        for (const b of e.batches) {
          const bClean = (b || '').toString().trim().replace(/[.,;]+$/, '').toUpperCase();
          if (bClean === targetClean) return true;
        }

        if (e.batchesRaw) {
          const rawTokens = e.batchesRaw.split(/[\s,;\[\]\(\)\/]+/)
            .map(t => t.trim().replace(/[.,;]+$/, '').toUpperCase())
            .filter(Boolean);
          if (rawTokens.includes(targetClean) || rawTokens.includes('ALL')) {
            return true;
          }
        }

        return false;
      });
    }

    // Sort chronologically by start minutes
    dayEntries.sort((a, b) => {
      const rA = this.parseTimeRange(a.time);
      const rB = this.parseTimeRange(b.time);
      const tA = rA ? rA.start : ((a.colIndex || 0) * 60);
      const tB = rB ? rB.start : ((b.colIndex || 0) * 60);
      return tA - tB;
    });

    // Merge consecutive identical lab/lecture slots
    const merged = [];
    let i = 0;
    while (i < dayEntries.length) {
      const curr = { ...dayEntries[i] };
      let durationSlots = 1;
      let j = i + 1;

      while (j < dayEntries.length) {
        const next = dayEntries[j];
        if (
          next.code === curr.code &&
          next.venue === curr.venue &&
          next.type === curr.type &&
          next.faculty === curr.faculty
        ) {
          const rCurr = this.parseTimeRange(curr.time);
          const rNext = this.parseTimeRange(next.time);
          if (rCurr && rNext && Math.abs(rNext.start - rCurr.end) <= 10) {
            durationSlots++;
            const currParts = curr.time.split(/[-–—]/);
            const nextParts = next.time.split(/[-–—]/);
            curr.time = `${currParts[0].trim()} - ${nextParts[nextParts.length - 1].trim()}`;
            j++;
            continue;
          }
        }
        break;
      }

      curr.durationSlots = durationSlots;
      merged.push(curr);
      i = j;
    }

    return merged;
  },

  renderSchedule() {
    const container = document.getElementById('timetable-classes-list');
    const headerTitle = document.getElementById('schedule-day-title');
    const headerCount = document.getElementById('schedule-classes-count');
    const dayPillsWrap = document.getElementById('timetable-day-pills');
    if (!container) return;

    if (this.searchQuery) {
      if (dayPillsWrap) dayPillsWrap.style.display = 'none';
      if (headerTitle) headerTitle.textContent = `Search: "${this.searchQuery}"`;
      this.renderSearchResults(container);
      return;
    }

    if (this.viewMode === 'week') {
      if (dayPillsWrap) dayPillsWrap.style.display = 'none';
      if (headerTitle) headerTitle.textContent = 'Weekly Schedule Matrix';
      if (headerCount) headerCount.textContent = 'Mon – Sat';
      this.renderWeekView(container);
      return;
    } else {
      if (dayPillsWrap) dayPillsWrap.style.display = '';
    }

    const dayName = this.dayFullNames[this.activeDay] || this.activeDay;
    if (headerTitle) {
      headerTitle.textContent = `${dayName} Schedule`;
    }

    const classes = this.filterAndMergeEntries(this.activeDay);
    if (headerCount) {
      headerCount.textContent = `${classes.length} classes`;
    }

    // Render Live Period Tracker Scrubber
    this.renderPeriodTracker(classes);

    if (classes.length === 0) {
      container.innerHTML = `
        <div class="empty-schedule-card">
          <div class="empty-state-icon">🎉</div>
          <h3>No classes scheduled for ${dayName}</h3>
          <p>Relax, explore JUIT Solan campus, or head to LRC Library reading hall!</p>
        </div>
      `;
      return;
    }

    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
    const isToday = (this.activeDay === currentDayCode);
    const curMins = this.getCurrentMinutes();

    // Determine live status for classes
    let firstUpcomingFound = false;
    const enrichedClasses = classes.map((c, idx) => {
      const parsedRange = this.parseTimeRange(c.time);
      let status = 'NORMAL';
      let progress = 0;
      let timeDiff = 0;

      if (isToday && parsedRange) {
        if (curMins >= parsedRange.start && curMins <= parsedRange.end) {
          status = 'LIVE_NOW';
          progress = Math.min(100, Math.max(0, Math.round(((curMins - parsedRange.start) / (parsedRange.end - parsedRange.start)) * 100)));
          timeDiff = parsedRange.end - curMins;
        } else if (curMins < parsedRange.start) {
          if (!firstUpcomingFound) {
            status = 'NEXT_UP';
            firstUpcomingFound = true;
          } else {
            status = 'UPCOMING';
          }
          timeDiff = parsedRange.start - curMins;
        } else {
          status = 'COMPLETED';
        }
      }

      return {
        ...c,
        cleanSubject: this.getCleanSubjectName(c.code, c.subject),
        parsedRange,
        status,
        progress,
        timeDiff,
        uniqueId: `class_${this.activeSemesterId}_${this.activeDay}_${c.code}_${c.parsedRange ? c.parsedRange.start : idx}`
      };
    });

    // Build timeline items including breaks
    const scheduleItems = [];
    for (let k = 0; k < enrichedClasses.length; k++) {
      const curr = enrichedClasses[k];
      scheduleItems.push({ type: 'class', data: curr });

      // Check for gap to next class
      if (k < enrichedClasses.length - 1) {
        const next = enrichedClasses[k + 1];
        if (curr.parsedRange && next.parsedRange) {
          const gap = next.parsedRange.start - curr.parsedRange.end;
          if (gap >= 30) {
            const startH = Math.floor(curr.parsedRange.end / 60);
            const startM = curr.parsedRange.end % 60;
            const endH = Math.floor(next.parsedRange.start / 60);
            const endM = next.parsedRange.start % 60;
            
            const formatTime = (h, m) => {
              const ampm = h >= 12 ? 'PM' : 'AM';
              const h12 = h % 12 || 12;
              return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
            };

            const isLunchTime = (curr.parsedRange.end >= 700 && next.parsedRange.start <= 900);
            scheduleItems.push({
              type: 'break',
              isLunch: isLunchTime,
              durationMins: gap,
              timeLabel: `${formatTime(startH, startM)} – ${formatTime(endH, endM)}`
            });
          }
        }
      }
    }

    // Filter out past if toggle is active
    let displayItems = scheduleItems;
    if (isToday && this.hidePastClasses) {
      displayItems = scheduleItems.filter(item => {
        if (item.type === 'class') return item.data.status !== 'COMPLETED';
        return true;
      });
    }

    // Attendance records for today
    const dateKey = new Date().toISOString().slice(0, 10);
    const attendanceRecords = JSON.parse(localStorage.getItem(`juit_att_${dateKey}`) || '{}');

    container.innerHTML = displayItems.map(item => {
      if (item.type === 'break') {
        const isLunch = item.isLunch;
        const breakTitle = isLunch ? 'Lunch Break & Campus Leisure' : `Free Period (${item.durationMins >= 60 ? `${Math.round(item.durationMins/60)} hr` : `${item.durationMins} mins`})`;
        const breakSub = isLunch ? 'Annapurna Mess is serving fresh lunch' : 'LRC Library study cubicles available';
        const tagLabel = isLunch ? 'MESS ACTIVE' : 'FREE TIME';

        return `
          <div class="bg-surface-container-lowest/80 p-3 sm:p-space-md rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-space-md border border-outline-variant/20 shadow-sm w-full max-w-full">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-outline shrink-0">
                <span class="material-symbols-outlined text-[18px] sm:text-[20px]">${isLunch ? 'restaurant' : 'coffee'}</span>
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-body-md text-sm sm:text-body-md font-semibold text-on-surface truncate">${breakTitle}</p>
                  <span class="font-label-sm text-[10px] sm:text-label-sm px-1.5 py-0.5 rounded bg-surface-container-high ${isLunch ? 'text-secondary' : 'text-outline'} shrink-0">${tagLabel}</span>
                </div>
                <p class="font-label-sm text-[11px] sm:text-label-sm text-outline mt-0.5 truncate">${item.timeLabel} • ${breakSub}</p>
              </div>
            </div>
            ${isLunch
              ? `<a class="font-label-sm text-xs sm:text-label-sm text-secondary hover:underline flex items-center gap-1 font-medium whitespace-nowrap self-end sm:self-auto shrink-0" href="#mess" onclick="if(window.App) App.switchView('mess')"><span>View Mess Menu</span><span class="material-symbols-outlined text-[14px]">arrow_forward</span></a>`
              : `<a class="font-label-sm text-xs sm:text-label-sm text-secondary hover:underline flex items-center gap-1 font-medium whitespace-nowrap self-end sm:self-auto shrink-0" href="#resources" onclick="if(window.App) App.switchView('resources')"><span>Reserve Cubicle</span><span class="material-symbols-outlined text-[14px]">arrow_forward</span></a>`
            }
          </div>
        `;
      }

      const c = item.data;
      const durationBadge = c.durationSlots > 1 ? `<span class="font-code-sm text-[11px] sm:text-code-sm px-1.5 py-0.5 rounded bg-surface-container-lowest text-outline font-mono">${c.durationSlots} hrs</span>` : '';
      
      // Co-attending batches
      let coAttending = '';
      if (c.batches && c.batches.length > 0 && !c.batches.includes('ALL')) {
        const others = c.batches.filter(b => b !== this.activeBatch);
        if (others.length > 0) {
          coAttending = `Co-attending: ${others.join(', ')}`;
        }
      } else if (c.batchesRaw && this.activeBatch === 'ALL') {
        coAttending = `Batches: ${c.batchesRaw}`;
      }

      const attState = attendanceRecords[c.uniqueId];
      const isAttended = attState === 'attended';
      const isMissed = attState === 'missed';
      const attBtnLabel = isAttended ? '✓ Attended' : (isMissed ? '✕ Missed' : 'Mark Attended');
      const typeLabel = c.type === 'L' ? 'Lecture (L)' : (c.type === 'P' ? 'Lab (P)' : 'Tutorial (T)');
      const vaultRes = this.resolveVaultResource(c.cleanSubject || c.subject, c.code, c.type);

      return `
        <div class="class-schedule-card bg-surface-container-low hover:bg-surface-container p-3 sm:p-space-md rounded-xl shadow-sm transition-colors flex flex-col gap-2.5 sm:gap-3 border border-outline-variant/15 group ${c.status === 'LIVE_NOW' ? 'ring-1 ring-primary' : ''} cursor-pointer w-full max-w-full" id="${c.uniqueId}" data-unique-id="${c.uniqueId}">
          <!-- Top Row: Icon + Subject Details & Status Badges -->
          <div class="flex items-start gap-2.5 sm:gap-3.5 min-w-0 w-full">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${c.type === 'P' ? 'bg-secondary/20 text-secondary' : (c.type === 'T' ? 'bg-secondary-container/20 text-secondary-container' : 'bg-primary-container/20 text-primary')} flex items-center justify-center shrink-0 mt-0.5">
              <span class="material-symbols-outlined text-[20px] sm:text-[24px]">${c.type === 'P' ? 'science' : (c.type === 'T' ? 'groups' : 'school')}</span>
            </div>
            <div class="space-y-1 min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-1.5 sm:gap-space-xs">
                <span class="font-headline-sm text-sm sm:text-headline-sm font-semibold text-on-surface break-words">${c.cleanSubject}</span>
                <span class="font-code-sm text-[10px] sm:text-code-sm px-1.5 py-0.5 rounded bg-surface-container-lowest text-outline font-mono">${c.code}</span>
                <span class="font-label-sm text-[10px] sm:text-label-sm px-1.5 py-0.5 rounded ${c.type === 'P' ? 'bg-secondary text-on-secondary-fixed-variant font-semibold' : (c.type === 'T' ? 'bg-secondary-container text-on-secondary font-medium' : 'bg-primary-container text-on-primary font-medium')}">${typeLabel}</span>
                ${durationBadge}
                ${c.status === 'LIVE_NOW' ? '<span class="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-label-sm text-[10px] sm:text-label-sm font-semibold animate-pulse">● LIVE NOW</span>' : ''}
                ${c.status === 'NEXT_UP' ? '<span class="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-label-sm text-[10px] sm:text-label-sm font-medium">⏳ NEXT UP</span>' : ''}
              </div>
              <div class="flex items-center gap-x-3 gap-y-1 text-on-surface-variant font-label-sm text-[11px] sm:text-label-sm flex-wrap pt-0.5">
                <div class="flex items-center gap-1 text-on-surface font-medium">
                  <span class="material-symbols-outlined text-[14px] sm:text-[15px] text-primary">schedule</span>
                  <span>${c.time}</span>
                </div>
                ${c.faculty ? `
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px] sm:text-[15px] text-outline">person</span>
                    <span class="truncate max-w-[150px] sm:max-w-none">Faculty: ${c.faculty}</span>
                  </div>
                ` : ''}
                ${coAttending ? `
                  <div class="flex items-center gap-1 text-outline">
                    <span class="material-symbols-outlined text-[14px] sm:text-[15px]">group</span>
                    <span class="truncate max-w-[150px] sm:max-w-none">${coAttending}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Bottom Actions Bar: Wraps gracefully without expanding card width -->
          <div class="flex flex-wrap items-center gap-2 w-full pt-2 border-t border-white/[0.04]">
            <button type="button" class="btn-attendance-toggle px-2.5 sm:px-space-md py-1.5 rounded-lg font-body-sm text-xs sm:text-body-sm transition-colors cursor-pointer ${isAttended ? 'bg-secondary-container text-on-secondary font-semibold' : (isMissed ? 'bg-error-container text-on-error-container' : 'bg-surface-container-highest hover:bg-surface-bright text-on-surface')}" data-unique-id="${c.uniqueId}" title="Track your class attendance">
              ${attBtnLabel}
            </button>
            ${c.venue ? `
              <button type="button" class="venue-locator-pill flex items-center gap-1 px-2.5 sm:px-space-md py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-secondary font-label-md text-xs sm:text-label-md transition-colors shadow-sm cursor-pointer border border-outline-variant/30" data-venue="${c.venue}" title="Show location on campus map">
                <span class="material-symbols-outlined text-[15px] text-error">location_on</span>
                <span>Venue: ${c.venue}</span>
              </button>
            ` : `
              <div class="flex items-center gap-1 px-2.5 sm:px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-outline font-label-md text-xs sm:text-label-md">
                <span class="material-symbols-outlined text-[15px]">location_off</span>
                <span>Venue TBA</span>
              </div>
            `}
            ${vaultRes ? `
              ${vaultRes.hasMultiple ? `
                <button type="button" class="btn-tutorials-modal-trigger inline-flex items-center gap-1 px-2.5 sm:px-space-md py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-secondary font-label-md text-xs sm:text-label-md transition-colors border border-outline-variant/30 cursor-pointer" 
                  data-tutorials='${JSON.stringify(vaultRes.tutorials).replace(/'/g, "&apos;")}' 
                  data-meta='${JSON.stringify({ title: vaultRes.title, dept: vaultRes.dept || '', subjectType: vaultRes.subjectType || 'generic' }).replace(/'/g, "&apos;")}'>
                  <span class="material-symbols-outlined text-[15px]">folder_open</span>
                  <span>${vaultRes.shortTitle || 'Tutorials'}</span>
                </button>
              ` : `
                <a href="${vaultRes.link}" download class="inline-flex items-center gap-1 px-2.5 sm:px-space-md py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-secondary font-label-md text-xs sm:text-label-md transition-colors border border-outline-variant/30" title="Download Material">
                  <span class="material-symbols-outlined text-[15px]">download</span>
                  <span>${vaultRes.shortTitle || 'Notes'}</span>
                </a>
              `}
            ` : ''}
            <button type="button" class="btn-class-inspect ml-auto w-8 h-8 rounded-lg bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer border border-outline-variant/30 shrink-0" data-class-id="${c.uniqueId}" title="Class Details">
              <span class="material-symbols-outlined text-[17px]">info</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind Tutorial Picker Modal listeners (Electronics & Mathematics)
    container.querySelectorAll('.btn-tutorials-modal-trigger, .btn-elec-tutorials-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
          const list = JSON.parse(btn.dataset.tutorials);
          const meta = btn.dataset.meta ? JSON.parse(btn.dataset.meta) : { title: 'Tutorial Sheets', dept: 'JUIT Academic Vault' };
          this.openTutorialsPickerModal(list, meta);
        } catch (err) {
          console.error(err);
        }
      });
    });

    // Bind venue click listeners
    container.querySelectorAll('.venue-locator-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const venue = btn.dataset.venue;
        if (window.CampusMap && window.CampusMap.focusVenue) {
          window.CampusMap.focusVenue(venue);
        }
      });
    });

    // Bind Attendance Toggle listeners
    container.querySelectorAll('.btn-attendance-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uId = btn.dataset.uniqueId;
        const currentAtt = attendanceRecords[uId];
        let nextAtt = 'attended';
        if (currentAtt === 'attended') nextAtt = 'missed';
        else if (currentAtt === 'missed') nextAtt = null;

        if (nextAtt) {
          attendanceRecords[uId] = nextAtt;
        } else {
          delete attendanceRecords[uId];
        }
        localStorage.setItem(`juit_att_${dateKey}`, JSON.stringify(attendanceRecords));
        this.renderSchedule();
      });
    });

    // Bind Class Inspector Modal listeners (both inspect button and card body tap)
    container.querySelectorAll('.btn-class-inspect').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uId = btn.dataset.classId;
        const found = enrichedClasses.find(c => c.uniqueId === uId);
        if (found) {
          this.openClassInspector(found);
        }
      });
    });

    container.querySelectorAll('.class-schedule-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-attendance-toggle') || e.target.closest('a') || e.target.closest('.btn-class-inspect')) {
          return;
        }
        const uId = card.dataset.uniqueId || card.id;
        const found = enrichedClasses.find(c => c.uniqueId === uId);
        if (found) {
          this.openClassInspector(found);
        }
      });
    });
  },

  renderPeriodTracker(classes) {
    const trackerContainer = document.getElementById('timetable-live-tracker');
    if (!trackerContainer) return;

    const headingEl = document.getElementById('timetable-timeline-heading');
    if (headingEl) {
      headingEl.textContent = `Viewing Schedule for ${this.dayFullNames[this.activeDay] || this.activeDay}`;
    }

    const clockBadge = document.getElementById('timetable-live-clock-badge');
    if (clockBadge) {
      const now = new Date();
      clockBadge.textContent = `Clock: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
    const isToday = (this.activeDay === currentDayCode);
    const curMins = this.getCurrentMinutes();

    let liveClass = null;
    let nextClass = null;

    if (isToday) {
      for (const c of classes) {
        const range = this.parseTimeRange(c.time);
        if (range) {
          if (curMins >= range.start && curMins <= range.end) {
            liveClass = { ...c, range };
            break;
          } else if (curMins < range.start && !nextClass) {
            nextClass = { ...c, range };
          }
        }
      }
    }

    let statusText = '';
    if (!isToday) {
      statusText = `Viewing Schedule for ${this.dayFullNames[this.activeDay]}`;
    } else if (liveClass) {
      statusText = `🔴 IN PROGRESS: ${liveClass.cleanSubject || liveClass.subject} at ${liveClass.venue || 'Campus'} (${liveClass.range.end - curMins}m remaining)`;
    } else if (nextClass) {
      statusText = `⏳ NEXT UP: ${nextClass.cleanSubject || nextClass.subject} starts in ${nextClass.range.start - curMins}m at ${nextClass.venue || 'Campus'}`;
    } else if (curMins > 1020) {
      statusText = `✓ All classes for today have concluded! Next class tomorrow at 09:00 AM.`;
    } else if (curMins < 540) {
      statusText = `🌅 Good morning! Campus lectures begin at 09:00 AM.`;
    } else {
      statusText = `☕ Currently Free / Break • No scheduled class right now`;
    }

    // Day span: 9 AM (540m) to 6 PM (1080m) = 540m
    const dayStart = 540;
    const dayEnd = 1080;
    const dayTotal = 540;

    // Generate Gantt track segments
    let ganttSlotsHtml = '';
    let currentMarker = dayStart;

    const sortedClasses = [...classes].sort((a, b) => {
      const rA = this.parseTimeRange(a.time);
      const rB = this.parseTimeRange(b.time);
      return (rA ? rA.start : 0) - (rB ? rB.start : 0);
    });

    for (const c of sortedClasses) {
      const r = this.parseTimeRange(c.time);
      if (!r) continue;

      const cStart = Math.max(dayStart, Math.min(dayEnd, r.start));
      const cEnd = Math.max(dayStart, Math.min(dayEnd, r.end));

      if (cStart > currentMarker) {
        const gapMins = cStart - currentMarker;
        const gapPct = ((gapMins / dayTotal) * 100).toFixed(1);
        const isLunch = (currentMarker >= 760 && cStart <= 860);
        ganttSlotsHtml += `
          <div class="h-full ${isLunch ? 'bg-surface-container-high/60' : 'bg-surface-container/50 hover:bg-surface-container'} rounded flex items-center justify-center text-outline cursor-pointer transition-colors" style="width: ${gapPct}%;" title="${isLunch ? 'Lunch Break (01:00 - 02:00 PM)' : 'Free Period'}">
            <span class="font-label-sm text-label-sm truncate px-1">${isLunch ? 'Lunch' : 'Free'}</span>
          </div>
        `;
      }

      const durMins = Math.max(15, cEnd - cStart);
      const slotPct = ((durMins / dayTotal) * 100).toFixed(1);
      const bgClass = c.type === 'P' ? 'bg-secondary/80 hover:bg-secondary text-on-secondary-fixed-variant' : (c.type === 'T' ? 'bg-secondary-container/90 hover:bg-secondary-container text-on-secondary' : 'bg-primary-container hover:bg-primary text-on-primary');

      const slotLabel = (durMins <= 60 && c.cleanSubject) ? c.cleanSubject.split(' ')[0] : (c.code || c.cleanSubject || 'Class');
      ganttSlotsHtml += `
        <div class="h-full ${bgClass} rounded flex items-center justify-center font-semibold cursor-pointer transition-colors group relative" style="width: ${slotPct}%;" title="${c.cleanSubject || c.subject} • ${c.time} • Room ${c.venue || 'TBA'}">
          <span class="font-code-sm text-[10px] sm:text-code-sm truncate px-0.5 font-mono">${slotLabel}</span>
        </div>
      `;

      currentMarker = Math.max(currentMarker, cEnd);
    }

    if (currentMarker < dayEnd) {
      const remPct = (((dayEnd - currentMarker) / dayTotal) * 100).toFixed(1);
      ganttSlotsHtml += `
        <div class="h-full bg-surface-container/50 hover:bg-surface-container rounded flex items-center justify-center text-outline cursor-pointer transition-colors" style="width: ${remPct}%;" title="Campus Leisure">
          <span class="font-label-sm text-[10px] sm:text-label-sm truncate px-1">Free</span>
        </div>
      `;
    }

    trackerContainer.innerHTML = `
      <div class="space-y-1.5 pt-space-xs">
        <div class="flex justify-between font-mono text-[10px] sm:text-code-sm text-outline px-0.5 select-none">
          <span>9 AM</span>
          <span>11 AM</span>
          <span>1 PM</span>
          <span>3 PM</span>
          <span>5 PM</span>
          <span>6 PM</span>
        </div>
        <div class="h-8 w-full bg-surface-container-lowest rounded-lg p-1 flex gap-1 relative overflow-hidden border border-outline-variant/20">
          ${ganttSlotsHtml}
        </div>
      </div>
      <div class="flex items-center justify-between pt-1 gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2 h-2 rounded-full ${isToday ? (liveClass ? 'bg-primary animate-ping' : 'bg-secondary') : 'bg-outline'} shrink-0"></span>
          <span class="font-label-sm text-xs sm:text-label-sm text-on-surface truncate">${statusText}</span>
        </div>
        ${(liveClass || nextClass) ? `
          <button type="button" class="btn-micro px-2 sm:px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-bright text-primary font-label-sm text-[11px] sm:text-label-sm font-medium transition-colors cursor-pointer border border-outline-variant/30 shrink-0" id="btn-jump-period">
            Jump to Class →
          </button>
        ` : ''}
      </div>
    `;

    const jumpBtn = document.getElementById('btn-jump-period');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        const target = document.querySelector('.bg-surface-container-low.ring-1') || document.querySelector('[data-venue]');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  },

  updateTimeTracker() {
    const classes = this.filterAndMergeEntries(this.activeDay);
    this.renderPeriodTracker(classes);
  },

  openClassInspector(c) {
    const modal = document.getElementById('universal-modal');
    const content = document.getElementById('universal-modal-content');
    if (!modal || !content) return;

    const vaultRes = this.resolveVaultResource(c.cleanSubject || c.subject, c.code, c.type);
    const cleanTitle = encodeURIComponent(`${c.cleanSubject || c.subject} (${c.typeName})`);
    const cleanDetails = encodeURIComponent(`Faculty: ${c.faculty || 'JUIT Faculty'}\nVenue: ${c.venue}\nBatch: ${c.batchesRaw || 'All'}\nJaypee University of Information Technology (JUIT Waknaghat, Solan)`);
    const cleanLocation = encodeURIComponent(`${c.venue || 'Classroom'}, JUIT Solan`);
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${cleanTitle}&details=${cleanDetails}&location=${cleanLocation}`;

    content.innerHTML = `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="hub-badge" style="color: var(--color-${c.type === 'L' ? 'lecture' : (c.type === 'P' ? 'lab' : 'tutorial')});">
              ${c.typeName}
            </span>
            <span class="class-code-tag">${c.code}</span>
          </div>
          <h2 style="font-size: 1.4rem; margin-top: 6px;">${c.cleanSubject || c.subject}</h2>
        </div>
        <button type="button" class="btn-close-drawer" onclick="PortalsController.closeModal()">✕</button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
        <div class="floor-box">
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Time Slot</div>
          <div style="font-weight: 700; font-size: 1rem; margin-top: 2px;">🕒 ${c.time}</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">${c.durationSlots} Hour Period</div>
        </div>

        <div class="floor-box">
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Classroom / Lab</div>
          <div style="font-weight: 700; font-size: 1rem; margin-top: 2px;">📍 ${c.venue || 'Campus Venue'}</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">${c.venueDetails?.name || 'Classroom'}</div>
        </div>

        <div class="floor-box">
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Instructor</div>
          <div style="font-weight: 700; font-size: 1rem; margin-top: 2px;">👨‍🏫 ${c.faculty || 'Department Faculty'}</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">Faculty Cabin in AB1/AB3</div>
        </div>

        <div class="floor-box">
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Enrolled Batches</div>
          <div style="font-weight: 700; font-size: 0.92rem; margin-top: 2px;">👥 ${c.batches?.join(', ') || c.batchesRaw}</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">Jaypee University of IT</div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; margin-top: 14px;">
        ${vaultRes ? `
          ${vaultRes.hasMultiple ? `
            <button type="button" class="btn-class-download-banner btn-inspector-tutorials-trigger" 
              style="${vaultRes.subjectType === 'math' ? 'background: rgba(2, 132, 199, 0.15); color: #38bdf8; border: 1px solid rgba(2, 132, 199, 0.35);' : 'background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35);'} cursor: pointer; text-decoration: none; padding: 7px 14px; width: auto;">
              <span class="material-symbols-outlined" style="font-size: 16px;">${vaultRes.subjectType === 'math' ? 'functions' : 'folder_open'}</span>
              <span>${vaultRes.shortTitle || 'Tutorial Sheets'} (${vaultRes.tutorials.length - 1})</span>
            </button>
          ` : `
            <a href="${vaultRes.link}" download class="btn-class-download-banner" style="text-decoration: none; padding: 7px 14px; width: auto;" title="Download ${vaultRes.title}">
              <span class="material-symbols-outlined" style="font-size: 16px;">download</span>
              <span>Download ${vaultRes.shortTitle}</span>
            </a>
          `}
        ` : ''}
        <button type="button" class="venue-locator-pill" onclick="PortalsController.closeModal(); window.CampusMap.focusVenue('${c.venue}')">
          📍 Show Location on Campus Map
        </button>
        <a href="${gCalUrl}" target="_blank" rel="noopener noreferrer" class="btn-cmd-search" style="text-decoration: none;">
          📅 Add to Google Calendar ↗
        </a>
        <a href="https://lms.juit.ac.in/login/index.php" target="_blank" rel="noopener noreferrer" class="nav-tab-item active" style="text-decoration: none; padding: 6px 14px; font-size: 0.82rem;">
          🎓 Open in Moodle ↗
        </a>
      </div>
    `;

    // Bind inspector tutorials button
    if (vaultRes && vaultRes.hasMultiple) {
      content.querySelector('.btn-inspector-tutorials-trigger')?.addEventListener('click', () => {
        this.openTutorialsPickerModal(vaultRes.tutorials, {
          title: vaultRes.title,
          dept: vaultRes.dept || '',
          subjectType: vaultRes.subjectType || 'generic'
        });
      });
    }

    modal.classList.remove('hidden');
    modal.classList.add('open', 'active');
    if (!modal._boundBackdrop) {
      modal._boundBackdrop = true;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          window.PortalsController?.closeModal();
        }
      });
    }
  },

  openTutorialsPickerModal(tutorials, meta = {}) {
    const modal = document.getElementById('universal-modal');
    const content = document.getElementById('universal-modal-content');
    if (!modal || !content) return;

    const isMath = meta.subjectType === 'math' || (meta.title && meta.title.includes('Math'));
    const themeColor = isMath ? '#0284c7' : '#f59e0b';
    const themeBg = isMath ? 'rgba(2, 132, 199, 0.15)' : 'rgba(245, 158, 11, 0.15)';
    const headerIcon = isMath ? 'functions' : 'memory';
    const titleText = meta.title || (isMath ? 'Mathematics I: Tutorial Sheets (Sheets 1–4)' : 'Basic Electronics: Tutorial Sheets & Problem Sets (Tutorials 1–5)');
    const deptText = meta.dept || (isMath ? 'Department of Mathematics • 25B11MA113 • Verified Tutorial Problem Sets' : 'Department of ECE • 25B11EC111 • Verified Assignment Problem Sets');

    content.innerHTML = `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 42px; height: 42px; border-radius: 10px; background: ${themeBg}; color: ${themeColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="font-size: 24px;">${headerIcon}</span>
          </div>
          <div>
            <h3 style="font-size: 1.15rem; margin: 0; color: var(--text-primary); font-weight: 700;">${titleText}</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${deptText}</span>
          </div>
        </div>
        <button type="button" class="btn-close-drawer" onclick="PortalsController.closeModal()">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px;">
        ${tutorials.map(t => {
          const isBundle = (t.num === 'Bundle' || t.num === 'Master Bundle');
          const badgeBg = isBundle ? 'rgba(59, 130, 246, 0.2)' : themeBg;
          const badgeColor = isBundle ? '#3b82f6' : themeColor;
          const badgeText = isBundle ? (isMath ? 'ALL 8 PAGES' : 'ALL 18 PAGES') : (typeof t.num === 'number' ? `SHEET ${t.num}` : t.num);

          return `
            <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
              <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 240px;">
                <span style="font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: ${badgeBg}; color: ${badgeColor}; white-space: nowrap; margin-top: 2px;">
                  ${badgeText}
                </span>
                <div>
                  <span style="font-size: 0.92rem; font-weight: 700; color: var(--text-primary);">${t.title}</span>
                  ${t.subtitle ? `<div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">${t.subtitle}</div>` : ''}
                </div>
              </div>
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button type="button" class="btn-secondary btn-modal-preview-pdf" data-link="${t.link}" data-title="${t.title}" style="padding: 6px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
                  <span class="material-symbols-outlined" style="font-size: 15px;">visibility</span>
                  <span>View PDF</span>
                </button>
                <a href="${t.link}" download="${t.link.split('/').pop()}" class="btn-primary" style="padding: 6px 14px; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                  <span class="material-symbols-outlined" style="font-size: 15px;">download</span>
                  <span>Download</span>
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind preview triggers
    content.querySelectorAll('.btn-modal-preview-pdf').forEach(btn => {
      btn.addEventListener('click', () => {
        PortalsController.closeModal();
        if (window.ResourcesController && window.ResourcesController.previewDocument) {
          window.ResourcesController.previewDocument(btn.dataset.link, btn.dataset.title);
        }
      });
    });

    modal.classList.remove('hidden');
    modal.classList.add('open', 'active');
    if (!modal._boundBackdrop) {
      modal._boundBackdrop = true;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          window.PortalsController?.closeModal();
        }
      });
    }
  },

  bindEvents() {
    const semSelect = document.getElementById('timetable-sem-select');
    if (semSelect) {
      semSelect.addEventListener('change', (e) => {
        this.activeSemesterId = e.target.value;
        localStorage.setItem('juit_selected_sem', this.activeSemesterId);

        // Revalidate active batch for newly selected semester
        const currentSheet = this.data[this.activeSemesterId];
        if (currentSheet && currentSheet.batches && currentSheet.batches.length > 0) {
          if (this.activeBatch !== 'ALL' && !currentSheet.batches.includes(this.activeBatch)) {
            this.activeBatch = currentSheet.batches[0] || 'ALL';
            localStorage.setItem('juit_selected_batch', this.activeBatch);
          }
        } else {
          this.activeBatch = 'ALL';
          localStorage.setItem('juit_selected_batch', 'ALL');
        }

        this.populateBatchDropdown();
        this.renderQuickBatchChips();
        this.renderDayPills();
        this.renderSchedule();
        this.updateDashboardToday();
      });
    }

    const batchSelect = document.getElementById('timetable-batch-select');
    if (batchSelect) {
      batchSelect.addEventListener('change', (e) => {
        this.activeBatch = e.target.value;
        localStorage.setItem('juit_selected_batch', this.activeBatch);
        this.renderQuickBatchChips();
        this.renderDayPills();
        this.renderSchedule();
        this.updateDashboardToday();
      });
    }

    const searchInput = document.getElementById('timetable-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderSchedule();
      });
    }

    const btnClearSearch = document.getElementById('btn-clear-timetable-search');
    if (btnClearSearch && searchInput) {
      btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        this.renderSchedule();
      });
    }
  },

  renderWeekView(container) {
    const tracker = document.getElementById('timetable-live-tracker');
    if (tracker) tracker.innerHTML = '';

    const slots = [
      { label: '09:00 - 10:00', start: 540, end: 600 },
      { label: '10:00 - 11:00', start: 600, end: 660 },
      { label: '11:00 - 12:00', start: 660, end: 720 },
      { label: '12:00 - 01:00', start: 720, end: 780 },
      { label: '01:00 - 02:00', start: 780, end: 840, isLunch: true },
      { label: '02:00 - 03:00', start: 840, end: 900 },
      { label: '03:00 - 04:00', start: 900, end: 960 },
      { label: '04:00 - 05:00', start: 960, end: 1020 }
    ];

    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];

    let html = `
      <div class="dash-card week-matrix-card" style="padding: 14px; overflow-x: auto;">
        <table class="week-matrix-table" style="width: 100%; border-collapse: separate; border-spacing: 6px; min-width: 850px;">
          <thead>
            <tr>
              <th style="width: 70px; background: var(--bg-elevated); padding: 8px; border-radius: var(--radius-xs);">Day</th>
              ${slots.map(s => `
                <th style="padding: 8px; font-size: 0.76rem; background: ${s.isLunch ? 'rgba(249, 115, 22, 0.15)' : 'var(--bg-elevated)'}; border-radius: var(--radius-xs); text-align: center; color: ${s.isLunch ? '#f97316' : 'var(--text-secondary)'};">
                  ${s.isLunch ? '🍽️ LUNCH (1-2)' : s.label}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    this.days.forEach(d => {
      const isToday = (d === currentDayCode);
      const dayClasses = this.filterAndMergeEntries(d);

      html += `
        <tr class="${isToday ? 'week-matrix-today-row' : ''}">
          <td style="font-weight: 800; font-size: 0.88rem; text-align: center; background: ${isToday ? 'var(--accent-glow)' : 'var(--bg-elevated)'}; border-radius: var(--radius-xs); color: ${isToday ? 'var(--accent-primary)' : 'var(--text-primary)'}; padding: 10px 4px;">
            ${d}
            ${isToday ? '<div style="font-size: 0.65rem; color: var(--color-lab);">TODAY</div>' : ''}
          </td>
      `;

      slots.forEach(s => {
        if (s.isLunch) {
          html += `
            <td style="background: rgba(249, 115, 22, 0.06); border: 1px dashed rgba(249, 115, 22, 0.2); border-radius: var(--radius-xs); text-align: center; font-size: 0.72rem; color: #f97316; padding: 6px;">
              Annapurna
            </td>
          `;
          return;
        }

        const match = dayClasses.find(c => {
          const r = this.parseTimeRange(c.time);
          if (r) {
            return (r.start < s.end && r.end > s.start);
          }
          return false;
        });

        if (match) {
          const typeClass = match.type === 'P' ? 'lab' : (match.type === 'T' ? 'tutorial' : 'lecture');
          const cleanName = this.getCleanSubjectName(match.code, match.subject);

          html += `
            <td class="week-slot-cell cell-${typeClass}" data-venue="${match.venue}" style="border-radius: var(--radius-xs); padding: 8px 6px; cursor: pointer;">
              <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary); line-height: 1.2; margin-bottom: 2px;">
                ${cleanName}
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
                <span>📍 ${match.venue}</span>
                <span>${match.typeName ? match.typeName[0] : 'L'}</span>
              </div>
            </td>
          `;
        } else {
          html += `
            <td style="background: var(--bg-card); border-radius: var(--radius-xs); text-align: center; font-size: 0.7rem; color: var(--text-muted); opacity: 0.4;">
              —
            </td>
          `;
        }
      });

      html += '</tr>';
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.week-slot-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const venue = cell.dataset.venue;
        if (venue && window.CampusMap) {
          window.App.switchView('campus');
          window.CampusMap.focusVenue(venue);
        }
      });
    });
  },

  renderSearchResults(container) {
    const q = this.searchQuery.toLowerCase();
    const currentSheet = this.data[this.activeSemesterId];
    if (!currentSheet || !currentSheet.entries) return;

    const matched = currentSheet.entries.filter(e =>
      (e.subject && e.subject.toLowerCase().includes(q)) ||
      (e.code && e.code.toLowerCase().includes(q)) ||
      (e.faculty && e.faculty.toLowerCase().includes(q)) ||
      (e.venue && e.venue.toLowerCase().includes(q)) ||
      (e.batchesRaw && e.batchesRaw.toLowerCase().includes(q))
    );

    const headerCount = document.getElementById('schedule-classes-count');
    if (headerCount) headerCount.textContent = `${matched.length} matches`;

    if (matched.length === 0) {
      container.innerHTML = `
        <div class="empty-schedule-card">
          <div class="empty-state-icon">🔍</div>
          <h3>No matching classes found</h3>
          <p>No class matching "${this.searchQuery}" in ${currentSheet.title}. Try another keyword.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${matched.slice(0, 30).map(c => `
          <div class="class-card type-${c.type}" style="padding: 12px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
              <div>
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                  <span class="hub-badge">${c.day}</span>
                  <span class="hub-badge" style="background: rgba(59, 130, 246, 0.15); color: #38bdf8;">${c.time}</span>
                  <span class="badge-${c.type === 'P' ? 'lab' : (c.type === 'T' ? 'tutorial' : 'lecture')}">${c.typeName || 'Lecture'}</span>
                </div>
                <h4 style="font-size: 1.1rem; margin: 4px 0;">${this.getCleanSubjectName(c.code, c.subject)} (${c.code})</h4>
                <div style="font-size: 0.82rem; color: var(--text-secondary);">
                  👨‍🏫 Faculty: <strong>${c.faculty || 'Dept'}</strong> • Batches: <strong>${c.batchesRaw || 'All'}</strong>
                </div>
              </div>
              <button type="button" class="venue-locator-pill" data-venue="${c.venue}">
                📍 ${c.venue}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.venue-locator-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        window.App.switchView('campus');
        if (window.CampusMap) window.CampusMap.focusVenue(btn.dataset.venue);
      });
    });
  },

  updateDashboardToday() {
    const dayIndex = new Date().getDay();
    const isSunday = (dayIndex === 0);
    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dayIndex];
    const displayDay = isSunday ? 'MON' : currentDayCode;
    const todayClasses = this.filterAndMergeEntries(displayDay);
    const nowMins = this.getCurrentMinutes();

    const countBadge = document.getElementById('dash-today-classes-count');
    if (countBadge) {
      countBadge.textContent = isSunday ? 'Weekend' : `${todayClasses.length}`;
    }

    const previewContainer = document.getElementById('dash-upcoming-classes-preview');
    if (!previewContainer) return;

    if (isSunday) {
      previewContainer.innerHTML = `
        <div class="rounded-xl bg-surface-container-low p-space-xl text-center border border-outline-variant/20">
          <div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-space-sm text-secondary">
            <span class="material-symbols-outlined text-[24px]">weekend</span>
          </div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">Sunday • Campus Weekend Leisure</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto mb-space-sm">
            No regular lectures scheduled today. Annapurna mess is serving weekend meals and LRC reading room is open.
          </p>
          <div class="font-label-sm text-label-sm text-secondary font-medium">
            Next Lecture: Monday at 09:00 AM (${todayClasses[0] ? this.getCleanSubjectName(todayClasses[0].code, todayClasses[0].subject) : 'Campus Classes'})
          </div>
        </div>
      `;
      return;
    }

    if (todayClasses.length === 0) {
      previewContainer.innerHTML = `
        <div class="rounded-xl bg-surface-container-low p-space-xl text-center border border-outline-variant/20">
          <div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-space-sm text-secondary">
            <span class="material-symbols-outlined text-[24px]">celebration</span>
          </div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">No Classes Scheduled for Today</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
            Enjoy your free day or work on project assignments in LRC.
          </p>
        </div>
      `;
      return;
    }

    previewContainer.innerHTML = todayClasses.map(c => {
      const range = this.parseTimeRange(c.time);
      let isDone = false;
      let isLive = false;

      if (range) {
        if (nowMins > range.end) {
          isDone = true;
        } else if (nowMins >= range.start && nowMins <= range.end) {
          isLive = true;
        }
      }

      const subjName = this.getCleanSubjectName(c.code, c.subject);
      const typeLabel = c.type === 'P' ? 'Lab' : (c.type === 'T' ? 'Tutorial' : 'Lecture');
      const startTime = c.time.split(/[-–—]/)[0].trim();

      return `
        <div class="group rounded-xl bg-surface-container-low hover:bg-surface-container p-space-md flex items-center justify-between gap-space-md transition-all shadow-sm border border-outline-variant/15">
          <div class="flex items-center gap-space-md min-w-0">
            <div class="w-8 h-8 rounded-full ${isDone ? 'bg-surface-container-high text-secondary' : (isLive ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-outline')} flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[18px]">${isDone ? 'check' : (isLive ? 'play_arrow' : 'schedule')}</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-space-sm flex-wrap">
                <span class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">${subjName}</span>
                <span class="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">${typeLabel}</span>
              </div>
              <p class="font-label-sm text-label-sm text-on-surface-variant mt-0.5 truncate">${c.venue ? `Room ${c.venue}` : 'Campus Venue'} • ${c.venueDetails?.buildingName || 'Department Block'}</p>
            </div>
          </div>
          <div class="flex flex-col items-end flex-shrink-0">
            <span class="font-label-md text-label-md text-on-surface font-mono font-medium">${startTime}</span>
            <span class="font-label-sm text-label-sm ${isDone ? 'text-secondary' : (isLive ? 'text-primary font-semibold' : 'text-outline')}">${isDone ? 'Completed' : (isLive ? 'In Progress' : 'Upcoming')}</span>
          </div>
        </div>
      `;
    }).join('');

    previewContainer.querySelectorAll('.venue-locator-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.CampusMap && window.CampusMap.focusVenue) {
          window.CampusMap.focusVenue(btn.dataset.venue);
        }
      });
    });
  }
};

window.TimetableController = TimetableController;
