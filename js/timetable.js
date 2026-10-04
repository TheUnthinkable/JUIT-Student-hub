/**
 * Handcrafted, Ultra-Professional Timetable Controller for JUIT Student Hub
 * Built to faithfully match and exceed the official JUIT timetable reference.
 */

const TimetableController = {
  data: {},
  activeSemesterId: 'odd_btech_1_sem',
  activeBatch: '26BT10', // Default to 26BT10 matching reference screenshot
  densityMode: 'compact', // 'compact' | 'expanded'
  activeDay: 'TUE',
  viewMode: 'today', // 'today' | 'day' | 'week'
  filterType: 'ALL', // 'ALL' | 'L' | 'P' | 'T'
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

    // Restore density preference
    this.densityMode = localStorage.getItem('juit_timetable_density') || 'compact';

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
    this.renderTypeFilterChips();
    this.updateDensityButtonUI();
    this.renderSchedule();
    this.bindEvents();

    // Auto-refresh every 30 seconds for live period status
    setInterval(() => {
      if (this.simulatedMinutes === null) {
        this.updateTimeTracker();
      }
    }, 30000);
  },

  exportToICal() {
    const currentSheet = this.data[this.activeSemesterId];
    if (!currentSheet) return;
    const batch = this.activeBatch || 'ALL';
    
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JUIT Student Hub//Academic Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:JUIT Timetable (${batch})`,
      'X-WR-TIMEZONE:Asia/Kolkata'
    ];
    
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() + mondayOffset);
    
    const dayMap = { 'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4, 'SAT': 5 };
    const rruleDays = { 'MON': 'MO', 'TUE': 'TU', 'WED': 'WE', 'THU': 'TH', 'FRI': 'FR', 'SAT': 'SA' };
    
    const formatIcalDate = (d, timeMins) => {
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      const hr = String(Math.floor(timeMins / 60)).padStart(2, '0');
      const mi = String(timeMins % 60).padStart(2, '0');
      return `${yr}${mo}${da}T${hr}${mi}00`;
    };

    let count = 0;
    this.days.forEach(day => {
      const classes = this.filterAndMergeEntries(day);
      const dayOffset = dayMap[day] || 0;
      const targetDate = new Date(mondayDate);
      targetDate.setDate(mondayDate.getDate() + dayOffset);
      
      classes.forEach((c) => {
        const parsedRange = this.parseTimeRange(c.time);
        if (!parsedRange) return;
        count++;
        
        const cleanSubj = this.getCleanSubjectName(c.code, c.subject);
        const dtStart = formatIcalDate(targetDate, parsedRange.start);
        const dtEnd = formatIcalDate(targetDate, parsedRange.end);
        const uid = `juit-${this.activeSemesterId}-${day}-${c.code}-${parsedRange.start}@juithub`;
        const desc = `Course: ${cleanSubj} (${c.code})\\nType: ${c.typeName || c.type}\\nFaculty: Prof. ${c.faculty || 'JUIT Faculty'}\\nBatch: ${c.batchesRaw || batch}\\nVenue: ${c.venue || 'Campus Room'}\\nJaypee University of Information Technology, Waknaghat, Solan`;
        
        ics.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${formatIcalDate(new Date(), now.getHours()*60 + now.getMinutes())}Z`,
          `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
          `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
          `RRULE:FREQ=WEEKLY;BYDAY=${rruleDays[day]};UNTIL=20261231T235959Z`,
          `SUMMARY:${cleanSubj} (${c.code}) - Room ${c.venue || 'Classroom'}`,
          `LOCATION:Room ${c.venue || 'Classroom'}, JUIT Waknaghat, Solan`,
          `DESCRIPTION:${desc}`,
          'END:VEVENT'
        );
      });
    });
    
    ics.push('END:VCALENDAR');
    
    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JUIT_Timetable_${batch}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.App && window.App.showNotification) {
      window.App.showNotification(`Exported ${count} weekly classes for Batch ${batch} as .ics! Import into Google or Apple Calendar.`);
    }
  },

  printTimetable() {
    window.print();
  },

  renderTypeFilterChips() {
    const container = document.getElementById('timetable-type-filters');
    if (!container) return;

    const dayClasses = this.filterAndMergeEntries(this.activeDay);
    const totalCount = dayClasses.length;
    const lecCount = dayClasses.filter(c => c.type === 'L' || !c.type).length;
    const labCount = dayClasses.filter(c => c.type === 'P').length;
    const tutCount = dayClasses.filter(c => c.type === 'T').length;

    const filters = [
      { key: 'ALL', label: 'All Sessions', count: totalCount },
      { key: 'L', label: 'Lectures', count: lecCount },
      { key: 'P', label: 'Labs', count: labCount },
      { key: 'T', label: 'Tutorials', count: tutCount }
    ];

    container.innerHTML = filters.map(f => {
      const isActive = (this.filterType === f.key);
      return `
        <button type="button" class="px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isActive ? 'bg-primary text-on-primary border-primary shadow-sm scale-[1.02]' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border-white/[0.06]'}" data-type-filter="${f.key}">
          <span>${f.label}</span>
          <span class="ml-1 text-[10px] opacity-75">(${f.count})</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('[data-type-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterType = btn.dataset.typeFilter;
        this.renderTypeFilterChips();
        this.renderSchedule();
      });
    });
  },

  renderVisualDayFlow(classes) {
    const container = document.getElementById('timetable-visual-day-flow');
    if (!container) return;

    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
    const isToday = (this.activeDay === currentDayCode);
    const curMins = this.getCurrentMinutes();

    const startDayMins = 540; // 9:00 AM
    const totalDayMins = 480; // 8 hours to 5:00 PM

    let blocksHtml = '';
    classes.forEach((c) => {
      const r = c.parsedRange;
      if (!r) return;
      const leftPercent = Math.max(0, Math.min(100, ((r.start - startDayMins) / totalDayMins) * 100));
      const widthPercent = Math.max(4, Math.min(100 - leftPercent, ((r.end - r.start) / totalDayMins) * 100));
      const typeClass = c.type === 'P' ? 'type-lab' : (c.type === 'T' ? 'type-tutorial' : 'type-lecture');
      const cleanSubj = c.cleanSubject || c.subject || c.code;

      const isFilteredOut = (this.filterType !== 'ALL' && c.type !== this.filterType);
      const opacityStyle = isFilteredOut ? 'opacity: 0.25; filter: grayscale(0.8);' : '';

      blocksHtml += `
        <div class="day-flow-session-block ${typeClass}" 
             style="left: ${leftPercent}%; width: ${widthPercent}%; ${opacityStyle}"
             title="${cleanSubj} (${c.code}) • ${c.time} • Room ${c.venue || 'TBA'}"
             onclick="var el = document.getElementById('${c.uniqueId}'); if (el) { el.scrollIntoView({behavior:'smooth', block:'center'}); el.classList.add('ring-2', 'ring-primary'); setTimeout(() => el.classList.remove('ring-2', 'ring-primary'), 1200); }">
          <div class="flex items-center justify-between gap-1 overflow-hidden leading-none">
            <span class="font-mono text-[10px] sm:text-[11px] font-bold truncate">${c.code}</span>
            <span class="text-[9px] font-bold opacity-80 shrink-0">${c.type === 'P' ? 'LAB' : (c.type === 'T' ? 'TUT' : 'LEC')}</span>
          </div>
          <span class="text-[9px] sm:text-[10px] truncate opacity-90 font-medium">${c.venue ? `Rm ${c.venue}` : cleanSubj}</span>
        </div>
      `;
    });

    // Lunch break block (01:00 PM to 02:00 PM = 780 to 840)
    const lunchLeft = ((780 - startDayMins) / totalDayMins) * 100;
    const lunchWidth = (60 / totalDayMins) * 100;
    blocksHtml += `
      <div class="day-flow-session-block type-lunch" style="left: ${lunchLeft}%; width: ${lunchWidth}%;" title="Annapurna Dining Lunch Break (01:00 PM - 02:00 PM)" onclick="if(window.App) App.switchView('mess')">
        <span class="font-mono text-[10px] font-bold text-center">🍽️ Lunch</span>
      </div>
    `;

    // Live "NOW" indicator line
    let nowIndicatorHtml = '';
    if (isToday && curMins >= startDayMins && curMins <= (startDayMins + totalDayMins)) {
      const nowPercent = ((curMins - startDayMins) / totalDayMins) * 100;
      nowIndicatorHtml = `
        <div class="day-flow-now-indicator" style="left: ${nowPercent}%;">
          <span class="day-flow-now-badge">NOW</span>
        </div>
      `;
    }

    const totalHours = (classes.reduce((acc, c) => acc + (c.parsedRange ? (c.parsedRange.end - c.parsedRange.start) : 55), 0) / 60).toFixed(1);
    const lecs = classes.filter(c => c.type === 'L' || !c.type).length;
    const labs = classes.filter(c => c.type === 'P').length;
    const tuts = classes.filter(c => c.type === 'T').length;

    container.innerHTML = `
      <div class="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px] text-primary">timeline</span>
          <span class="font-bold text-on-surface">Daily Schedule Flow</span>
          <span class="text-on-surface-variant font-mono text-[11px] hidden sm:inline">• 09:00 AM – 05:00 PM</span>
        </div>
        <div class="flex items-center gap-2 text-on-surface-variant text-[11px] font-medium flex-wrap">
          <span>${classes.length} Sessions (${totalHours} hrs)</span>
          <span class="text-outline/40">•</span>
          <span class="text-amber-300 font-semibold">${lecs} Lec</span>
          <span class="text-outline/40">•</span>
          <span class="text-emerald-300 font-semibold">${labs} Lab</span>
          <span class="text-outline/40">•</span>
          <span class="text-sky-300 font-semibold">${tuts} Tut</span>
        </div>
      </div>

      <!-- Timeline Gantt Track -->
      <div class="day-flow-timeline-track">
        <div class="day-flow-hour-marks">
          <div class="day-flow-hour-line" style="left: 0%;"></div>
          <div class="day-flow-hour-line" style="left: 12.5%;"></div>
          <div class="day-flow-hour-line" style="left: 25%;"></div>
          <div class="day-flow-hour-line" style="left: 37.5%;"></div>
          <div class="day-flow-hour-line" style="left: 50%;"></div>
          <div class="day-flow-hour-line" style="left: 62.5%;"></div>
          <div class="day-flow-hour-line" style="left: 75%;"></div>
          <div class="day-flow-hour-line" style="left: 87.5%;"></div>
          <div class="day-flow-hour-line" style="left: 100%;"></div>
        </div>
        ${blocksHtml}
        ${nowIndicatorHtml}
      </div>

      <div class="flex items-center justify-between text-[10px] font-mono text-outline px-1">
        <span>09:00 AM</span>
        <span>11:00 AM</span>
        <span>01:00 PM (Lunch)</span>
        <span>03:00 PM</span>
        <span>05:00 PM</span>
      </div>
    `;
  },

  updateDensityButtonUI() {
    const textEl = document.getElementById('text-timetable-density');
    const iconEl = document.getElementById('icon-timetable-density');
    const btn = document.getElementById('btn-timetable-density');
    if (!btn) return;
    if (this.densityMode === 'compact') {
      if (textEl) textEl.textContent = 'Compact View';
      if (iconEl) iconEl.textContent = 'table_rows';
      btn.classList.add('bg-primary/15', 'text-primary', 'border-primary/25');
      btn.classList.remove('bg-surface-container', 'text-on-surface-variant');
    } else {
      if (textEl) textEl.textContent = 'Detailed View';
      if (iconEl) iconEl.textContent = 'view_agenda';
      btn.classList.remove('bg-primary/15', 'text-primary', 'border-primary/25');
      btn.classList.add('bg-surface-container', 'text-on-surface-variant');
    }
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
    if (c.includes('HS111')) return 'Technical English & Communication';
    if (c.includes('CI112')) return 'Software Development Fundamentals (C)';
    if (c.includes('MA113') || c.includes('MA111') || c.includes('MA112')) return 'Mathematics I (Calculus & Matrices)';
    if (c.includes('PH111') || c.includes('PH112')) return 'Engineering Physics';
    if (c.includes('EC111') || c.includes('EC112')) return 'Basic Electronics Engineering';
    if (c.includes('GE171')) return 'Workshop Practice Lab';
    if (c.includes('GE172')) return 'Engineering Drawing & CAD';
    if (c.includes('CI172')) return 'SDF C Programming Lab';
    if (c.includes('PH171')) return 'Physics Laboratory';
    if (c.includes('EC171')) return 'Electronics Engineering Lab';
    if (c.includes('CI312') || c.includes('CI211')) return 'Data Structures & Algorithms';
    if (c.includes('CI375')) return 'Data Structures Lab';
    if (c.includes('CI311')) return 'Object-Oriented Programming (Java/C++)';
    if (c.includes('CI313')) return 'Computer Organization & Architecture';
    if (c.includes('CI514') || c.includes('CI411')) return 'Operating Systems';
    if (c.includes('CI517') || c.includes('CI612')) return 'Computer Networks';
    if (c.includes('CI611')) return 'Design & Analysis of Algorithms';
    if (c.includes('CI613')) return 'Software Engineering';
    if (c.includes('CI740')) return 'Artificial Intelligence & Machine Learning';
    if (c.includes('CI742')) return 'Cyber Security & Defense';
    
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

  updateBatchDisplayLabels() {
    const label = document.getElementById('timetable-batch-display-label');
    if (label) {
      label.textContent = (!this.activeBatch || this.activeBatch === 'ALL') ? 'All Batches' : `Batch ${this.activeBatch}`;
      const currentSheet = this.data[this.activeSemesterId];
      const semBadge = document.getElementById('timetable-sem-badge') || (label.parentElement && label.parentElement.querySelector('span:last-child'));
      if (semBadge && currentSheet) {
        semBadge.textContent = currentSheet.term || currentSheet.title || '1st Sem';
      }
    }
  },

  populateBatchDropdown() {
    const batchSelect = document.getElementById('timetable-batch-select');
    if (!batchSelect) return;

    const currentSheet = this.data[this.activeSemesterId];
    if (!currentSheet || !currentSheet.batches || currentSheet.batches.length === 0) {
      batchSelect.innerHTML = '<option value="ALL">All Batches</option>';
      this.activeBatch = 'ALL';
      batchSelect.value = 'ALL';
      this.updateBatchDisplayLabels();
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
    this.updateBatchDisplayLabels();
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
        this.updateBatchDisplayLabels();
        if (window.JUIT_PROFILE) {
          window.JUIT_PROFILE.batch = this.activeBatch;
          localStorage.setItem('juit_student_profile', JSON.stringify(window.JUIT_PROFILE));
        }
        if (window.App) {
          window.App.updateUserProfileBadges?.();
          window.App.refreshDashboard?.();
        }
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
      <button type="button" class="term-btn ${this.viewMode !== 'week' ? 'active' : ''} text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer" data-mode="day">
        <span class="material-symbols-outlined text-[15px]">view_agenda</span>
        <span>Day View</span>
      </button>
      <button type="button" class="term-btn ${this.viewMode === 'week' ? 'active' : ''} text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer text-on-surface-variant hover:text-on-surface" data-mode="week">
        <span class="material-symbols-outlined text-[15px]">grid_view</span>
        <span>Weekly Grid</span>
      </button>
    `;

    container.querySelectorAll('button[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.viewMode = btn.dataset.mode;
        this.renderViewModeTabs();
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
      const isActive = (d === this.activeDay && this.viewMode !== 'week');
      const dayClasses = this.filterAndMergeEntries(d);
      const count = dayClasses.length;
      const fullName = this.dayFullNames[d] || d;

      return `
        <button type="button" class="day-pill-card ${isActive ? 'is-active-day' : ''}" data-day="${d}" title="${fullName} (${count} classes scheduled)">
          <div class="flex items-center justify-between gap-1.5 w-full">
            <div class="flex items-center gap-1.5 min-w-0">
              ${isToday ? '<span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse shadow-sm" title="Today"></span>' : ''}
              <span class="font-headline-sm font-bold text-xs sm:text-sm ${isActive ? 'text-primary' : 'text-on-surface'}">${d}</span>
              ${isToday ? '<span class="hidden sm:inline text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-mono">TODAY</span>' : ''}
            </div>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${isActive ? 'bg-primary/25 text-primary border border-primary/40' : 'bg-surface-container-high text-on-surface-variant'}">${count}</span>
          </div>
          <div class="text-[11px] text-on-surface-variant/80 font-medium truncate mt-1 text-left hidden sm:block">${fullName}</div>
        </button>
      `;
    }).join('');

    container.querySelectorAll('[data-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeDay = btn.dataset.day;
        this.viewMode = 'day';
        this.renderViewModeTabs();
        this.renderDayPills();
        this.renderTypeFilterChips();
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
    const dayNavWrap = document.getElementById('timetable-day-nav-wrapper');
    const dayFlowWrap = document.getElementById('timetable-visual-day-flow');
    if (!container) return;

    if (this.searchQuery) {
      if (dayPillsWrap) dayPillsWrap.style.display = 'none';
      if (dayFlowWrap) dayFlowWrap.style.display = 'none';
      if (headerTitle) headerTitle.textContent = `Search: "${this.searchQuery}"`;
      this.renderSearchResults(container);
      return;
    }

    if (this.viewMode === 'week') {
      if (dayNavWrap) dayNavWrap.style.display = 'none';
      if (dayPillsWrap) dayPillsWrap.style.display = 'none';
      if (dayFlowWrap) dayFlowWrap.style.display = 'none';
      this.renderWeekView(container);
      return;
    } else {
      if (dayNavWrap) dayNavWrap.style.display = '';
      if (dayPillsWrap) dayPillsWrap.style.display = '';
      if (dayFlowWrap) dayFlowWrap.style.display = '';
    }

    const dayName = this.dayFullNames[this.activeDay] || this.activeDay;
    if (headerTitle) {
      headerTitle.textContent = `${dayName} Schedule`;
    }

    const rawClasses = this.filterAndMergeEntries(this.activeDay);

    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
    const isToday = (this.activeDay === currentDayCode);
    const curMins = this.getCurrentMinutes();

    // Determine live status for classes
    let firstUpcomingFound = false;
    const enrichedClasses = rawClasses.map((c, idx) => {
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

    // Render interactive Visual Day Flow (Mini-Gantt)
    this.renderVisualDayFlow(enrichedClasses);

    // Filter by Session Type (All, Lecture, Lab, Tutorial)
    let classes = enrichedClasses;
    if (this.filterType && this.filterType !== 'ALL') {
      classes = enrichedClasses.filter(c => (c.type === this.filterType) || (!c.type && this.filterType === 'L'));
    }

    if (headerCount) {
      headerCount.textContent = `${classes.length} ${classes.length === 1 ? 'class' : 'classes'}`;
    }

    // Render Live Period Tracker Scrubber
    this.renderPeriodTracker(enrichedClasses);

    if (rawClasses.length === 0) {
      container.innerHTML = `
        <div class="p-8 sm:p-10 rounded-2xl bg-surface-container-low border border-white/[0.06] text-center space-y-3.5 my-2">
          <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl shadow-inner border border-primary/20">
            🌿
          </div>
          <div>
            <h3 class="font-headline-sm text-base sm:text-lg font-bold text-on-surface">No Classes Scheduled for ${dayName}</h3>
            <p class="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto mt-1">
              No regular lectures, tutorials or laboratory sessions on ${dayName} for Batch ${this.activeBatch}. Review course materials in the Academic Vault or inspect the full week matrix.
            </p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-2">
            <button type="button" class="btn-goto-week inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer hover:brightness-110 shadow-sm transition-all">
              <span class="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Open Weekly Grid Matrix</span>
            </button>
          </div>
        </div>
      `;
      const gotoWeekBtn = container.querySelector('.btn-goto-week');
      if (gotoWeekBtn) {
        gotoWeekBtn.addEventListener('click', () => {
          this.viewMode = 'week';
          this.renderViewModeTabs();
          this.renderSchedule();
        });
      }
      return;
    }

    if (classes.length === 0) {
      const typeName = this.filterType === 'P' ? 'Laboratory (P)' : (this.filterType === 'T' ? 'Tutorial (T)' : 'Lecture (L)');
      container.innerHTML = `
        <div class="p-8 rounded-2xl bg-surface-container-low border border-white/[0.06] text-center space-y-3 my-2">
          <div class="w-12 h-12 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-[24px]">filter_list_off</span>
          </div>
          <h3 class="font-headline-sm text-base font-bold text-on-surface">No ${typeName} Sessions on ${dayName}</h3>
          <p class="text-xs text-on-surface-variant max-w-sm mx-auto">
            There are ${rawClasses.length} other sessions scheduled for ${dayName}.
          </p>
          <button type="button" class="btn-reset-filter inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-primary border border-white/[0.08] transition-all cursor-pointer">
            <span>Show All Sessions</span>
          </button>
        </div>
      `;
      container.querySelector('.btn-reset-filter')?.addEventListener('click', () => {
        this.filterType = 'ALL';
        this.renderTypeFilterChips();
        this.renderSchedule();
      });
      return;
    }

    // Build timeline items including breaks
    const scheduleItems = [];
    for (let k = 0; k < classes.length; k++) {
      const curr = classes[k];
      scheduleItems.push({ type: 'class', data: curr });

      // Check for gap to next class
      if (k < classes.length - 1) {
        const next = classes[k + 1];
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
        const breakSub = isLunch ? 'Annapurna Mess is serving fresh hot meals in Dining Halls A & B' : 'Quiet reading cubicles and study booths open in LRC Library';

        return `
          <div class="p-4 rounded-2xl bg-gradient-to-r from-surface-container-low/90 to-surface-container/70 border border-white/[0.06] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-11 h-11 rounded-2xl ${isLunch ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-sky-500/15 text-sky-300 border border-sky-500/25'} flex items-center justify-center shrink-0 shadow-inner">
                <span class="material-symbols-outlined text-[22px]">${isLunch ? 'restaurant' : 'local_library'}</span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-sm sm:text-base font-bold text-on-surface">${breakTitle}</span>
                  <span class="text-xs font-mono text-outline">• ${item.timeLabel}</span>
                </div>
                <p class="text-xs text-on-surface-variant/80 mt-0.5">${breakSub}</p>
              </div>
            </div>
            ${isLunch
              ? `<a class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-secondary hover:underline self-end sm:self-auto shrink-0 transition-all border border-white/[0.08]" href="#mess" onclick="if(window.App) App.switchView('mess')"><span>View Mess Menu</span><span class="material-symbols-outlined text-[15px]">arrow_forward</span></a>`
              : `<a class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-secondary hover:underline self-end sm:self-auto shrink-0 transition-all border border-white/[0.08]" href="#resources" onclick="if(window.App) App.switchView('resources')"><span>Explore Vault</span><span class="material-symbols-outlined text-[15px]">arrow_forward</span></a>`
            }
          </div>
        `;
      }

      const c = item.data;
      
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
      
      let attBtnClass = 'bg-surface-container-high hover:bg-surface-bright text-on-surface border border-white/[0.08]';
      let attIcon = 'how_to_reg';
      let attBtnLabel = 'Mark Attended';

      if (isAttended) {
        attBtnClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold';
        attIcon = 'check_circle';
        attBtnLabel = 'Attended';
      } else if (isMissed) {
        attBtnClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold';
        attIcon = 'cancel';
        attBtnLabel = 'Missed';
      }

      let typeClass = 'lecture';
      let typeBadgeStyle = 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      let typeIcon = 'school';
      let typeLabel = 'Lecture (L)';
      if (c.type === 'P') {
        typeClass = 'lab';
        typeBadgeStyle = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
        typeIcon = 'science';
        typeLabel = 'Lab (P)';
      } else if (c.type === 'T') {
        typeClass = 'tutorial';
        typeBadgeStyle = 'bg-sky-500/15 text-sky-300 border border-sky-500/30';
        typeIcon = 'groups';
        typeLabel = 'Tutorial (T)';
      }

      let liveStatusBadge = '';
      if (c.status === 'LIVE_NOW') {
        liveStatusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold animate-pulse"><span class="w-2 h-2 rounded-full bg-rose-400"></span>LIVE NOW (${c.timeDiff}m left)</span>`;
      } else if (c.status === 'NEXT_UP') {
        liveStatusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/40 text-[11px] font-semibold">⏳ NEXT UP (${c.timeDiff}m)</span>`;
      }

      const timeParts = (c.time || '').split(/[-–—]/).map(t => t.trim());
      const startTime = timeParts[0] || '09:00 AM';
      const endTime = timeParts[1] || '09:55 AM';
      const durSlots = c.durationSlots || 1;
      const durText = durSlots > 1 ? `${durSlots} hrs` : (c.parsedRange ? `${c.parsedRange.end - c.parsedRange.start}m` : '55m');

      const vaultRes = this.resolveVaultResource(c.cleanSubject || c.subject, c.code, c.type);
      let vaultBtn = '';
      if (vaultRes) {
        if (vaultRes.hasMultiple) {
          vaultBtn = `
            <button type="button" class="btn-tutorials-modal-trigger inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors cursor-pointer" 
              data-tutorials='${JSON.stringify(vaultRes.tutorials).replace(/'/g, "&apos;")}' 
              data-meta='${JSON.stringify({ title: vaultRes.title, dept: vaultRes.dept || '', subjectType: vaultRes.subjectType || 'generic' }).replace(/'/g, "&apos;")}' title="${vaultRes.title}">
              <span class="material-symbols-outlined text-[15px]">folder_open</span>
              <span>${vaultRes.shortTitle || 'Tutorials'}</span>
            </button>
          `;
        } else {
          vaultBtn = `
            <a href="${vaultRes.link}" download class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors" title="Download Material">
              <span class="material-symbols-outlined text-[15px]">download</span>
              <span>${vaultRes.shortTitle || 'Notes'}</span>
            </a>
          `;
        }
      }

      const isLive = c.status === 'LIVE_NOW';

      return `
        <div class="pro-timetable-card class-schedule-card type-${typeClass} ${isLive ? 'is-live-now' : ''} p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer w-full max-w-full" id="${c.uniqueId}" data-unique-id="${c.uniqueId}">
          
          <!-- Left Column: Time & Duration Pillar -->
          <div class="flex items-start sm:items-center gap-3.5 sm:gap-4.5 flex-1 min-w-0">
            
            <div class="time-pillar-box flex flex-col items-center justify-center shrink-0 w-24 sm:w-28 py-2.5 px-2 rounded-2xl text-center select-none shadow-sm">
              <span class="font-mono text-sm sm:text-base font-bold text-primary tracking-tight">${startTime}</span>
              <div class="flex items-center gap-1 my-0.5 text-on-surface-variant/60 text-[10px] font-semibold">
                <span class="material-symbols-outlined text-[13px]">arrow_downward</span>
              </div>
              <span class="font-mono text-xs sm:text-sm font-semibold text-on-surface-variant">${endTime}</span>
              <span class="mt-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-surface-container-high text-outline">${durText}</span>
            </div>

            <!-- Middle Column: Course Details -->
            <div class="space-y-1.5 min-w-0 flex-1">
              
              <!-- Meta Badges: Type Pill + Course Code + Status -->
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-bold ${typeBadgeStyle}">
                  <span class="material-symbols-outlined text-[14px]">${typeIcon}</span>
                  <span>${typeLabel}</span>
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-xl font-mono text-xs font-bold bg-surface-container-highest text-on-surface border border-white/[0.06]">
                  ${c.code}
                </span>
                ${c.durationSlots > 1 ? `<span class="inline-flex items-center px-2 py-0.5 rounded-lg font-mono text-[11px] bg-surface-container-highest text-on-surface-variant font-semibold">${c.durationSlots} hrs</span>` : ''}
                ${liveStatusBadge}
              </div>

              <!-- Prominent Subject Title -->
              <h3 class="font-headline-sm text-base sm:text-lg font-bold text-on-surface leading-snug tracking-tight">
                ${c.cleanSubject}
              </h3>

              <!-- Faculty, Venue & Batches -->
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant pt-0.5">
                ${c.faculty ? `
                  <div class="inline-flex items-center gap-1 text-on-surface-variant">
                    <span class="material-symbols-outlined text-[15px] text-primary">person</span>
                    <span class="font-semibold text-on-surface">Prof. ${c.faculty}</span>
                  </div>
                ` : ''}
                ${coAttending ? `
                  <div class="inline-flex items-center gap-1 text-outline">
                    <span class="material-symbols-outlined text-[15px]">groups</span>
                    <span class="truncate max-w-[240px] sm:max-w-none font-medium">${coAttending}</span>
                  </div>
                ` : ''}
              </div>

            </div>
          </div>

          <!-- Right Column: Venue Locator, Attendance & Resources -->
          <div class="flex flex-wrap md:flex-col items-center md:items-end justify-between md:justify-center gap-2.5 shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-white/[0.06]" onclick="event.stopPropagation()">
            
            <!-- Venue Locator Button -->
            ${c.venue ? `
              <button type="button" class="venue-locator-pill inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold text-xs transition-all border border-white/[0.08] shadow-sm cursor-pointer hover:border-primary/40" data-venue="${c.venue}" title="Show Room ${c.venue} on 3D Campus Map">
                <span class="material-symbols-outlined text-rose-400 text-[15px]">location_on</span>
                <span class="text-primary font-mono font-bold">Room ${c.venue}</span>
              </button>
            ` : `
              <div class="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container text-outline text-xs font-medium">
                <span class="material-symbols-outlined text-[15px]">location_off</span>
                <span>Venue TBA</span>
              </div>
            `}

            <!-- Actions Row: Attendance + Study Material + Details -->
            <div class="flex items-center gap-2">
              <button type="button" class="btn-attendance-toggle inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-label-md text-xs font-bold cursor-pointer transition-all ${attBtnClass}" data-unique-id="${c.uniqueId}" title="Track Attendance">
                <span class="material-symbols-outlined text-[15px]">${attIcon}</span>
                <span>${attBtnLabel}</span>
              </button>

              ${vaultBtn}

              <button type="button" class="btn-class-inspect w-8 h-8 rounded-xl bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer border border-white/[0.06] shrink-0" data-class-id="${c.uniqueId}" title="Class Details & Syllabus">
                <span class="material-symbols-outlined text-[16px]">info</span>
              </button>
            </div>

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
        if (window.App) window.App.switchView('campus');
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
        if (e.target.closest('.btn-attendance-toggle') || e.target.closest('a') || e.target.closest('.btn-class-inspect') || e.target.closest('.venue-locator-pill')) {
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
      headingEl.textContent = 'Waknaghat Academic Blocks • 1,550m Altitude';
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
      statusText = `Academic Day Flow (${classes.length} Sessions Scheduled)`;
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
        if (isLunch) {
          ganttSlotsHtml += `
            <div class="h-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl flex flex-col items-center justify-center p-1 sm:p-2 text-center text-amber-300 transition-all select-none shadow-sm" style="width: ${gapPct}%; min-width: 55px;" title="Lunch Break (01:00 PM – 02:00 PM)">
              <span class="font-extrabold text-[11px] sm:text-xs tracking-tight flex items-center gap-1 justify-center">
                <span>🍽️</span>
                <span class="hidden sm:inline">Lunch</span>
              </span>
              <span class="font-mono text-[9px] sm:text-[10px] text-amber-300/80 mt-0.5">1–2 PM</span>
            </div>
          `;
        } else {
          ganttSlotsHtml += `
            <div class="h-full bg-surface-container/50 hover:bg-surface-container/80 border border-white/[0.04] rounded-xl flex flex-col items-center justify-center p-1 sm:p-2 text-center text-on-surface-variant transition-all select-none" style="width: ${gapPct}%; min-width: 40px;" title="Free Break (${gapMins} mins)">
              <span class="font-bold text-[10px] sm:text-xs text-outline flex items-center gap-1 justify-center">
                <span>☕</span>
                <span class="hidden sm:inline">Free</span>
              </span>
              <span class="font-mono text-[9px] sm:text-[10px] text-outline/80 mt-0.5">${gapMins}m</span>
            </div>
          `;
        }
      }

      const durMins = Math.max(15, cEnd - cStart);
      const slotPct = ((durMins / dayTotal) * 100).toFixed(1);
      
      const typeLabel = c.type === 'P' ? 'Lab' : (c.type === 'T' ? 'Tut' : 'Lec');
      const bgClass = c.type === 'P'
        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400/40 shadow-emerald-500/15'
        : (c.type === 'T'
          ? 'bg-gradient-to-br from-sky-600 to-indigo-700 text-white border-sky-400/40 shadow-sky-500/15'
          : 'bg-gradient-to-br from-amber-600 to-orange-700 text-white border-amber-400/40 shadow-amber-500/15');

      const isCurrentClass = (liveClass && liveClass.uniqueId === c.uniqueId);

      const rTime = this.parseTimeRange(c.time);
      const startTimeFormatted = rTime ? `${Math.floor(rTime.start/60)%12 || 12}:${String(rTime.start%60).padStart(2,'0')}` : '';
      const endTimeFormatted = rTime ? `${Math.floor(rTime.end/60)%12 || 12}:${String(rTime.end%60).padStart(2,'0')}` : '';
      const timeSpanStr = (startTimeFormatted && endTimeFormatted) ? `${startTimeFormatted}–${endTimeFormatted}` : c.time;

      const subShort = c.cleanSubject ? c.cleanSubject.split('(')[0].trim() : (c.subject || 'Class');

      // Robust standard course code extraction (e.g. 25B11HS111 -> HS111, 25B17CI172 -> CI172)
      const rawCode = c.code || '';
      const deptCodeMatch = rawCode.match(/[A-Z]{2,4}[0-9]{3}/i);
      const displayCode = deptCodeMatch ? deptCodeMatch[0] : (rawCode || 'CLASS');

      ganttSlotsHtml += `
        <div class="class-gantt-slot h-full ${bgClass} rounded-xl p-1.5 flex flex-col justify-between cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] border shadow-sm select-none relative overflow-hidden group shrink-0 ${isCurrentClass ? 'ring-2 ring-white ring-offset-1 ring-offset-neutral-900 animate-pulse' : ''}"
             style="width: ${slotPct}%; min-width: 105px;"
             data-target-id="${c.uniqueId}"
             title="${c.cleanSubject || c.subject} • ${c.time} • Room ${c.venue || 'TBA'} (Click to jump to class)">
          
          <!-- Top Row: Clean Course Code & Type Badge -->
          <div class="flex items-center justify-between gap-1 leading-none">
            <span class="font-mono text-xs font-black tracking-tight text-white whitespace-nowrap">${displayCode}</span>
            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/35 text-white uppercase tracking-wider shrink-0">${typeLabel}</span>
          </div>

          <!-- Bottom Row: Time and Room Location -->
          <div class="flex items-center justify-between text-[10px] font-mono text-white/90 leading-none pt-0.5 border-t border-white/20">
            <span class="truncate">${timeSpanStr}</span>
            <span class="shrink-0 font-bold ml-1">${c.venue ? 'Rm ' + c.venue : ''}</span>
          </div>
        </div>
      `;

      currentMarker = Math.max(currentMarker, cEnd);
    }

    if (currentMarker < dayEnd) {
      const remMins = dayEnd - currentMarker;
      const remPct = (((remMins) / dayTotal) * 100).toFixed(1);
      ganttSlotsHtml += `
        <div class="h-full bg-surface-container/50 hover:bg-surface-container/80 border border-white/[0.04] rounded-xl flex flex-col items-center justify-center p-1.5 text-center text-on-surface-variant transition-all select-none shrink-0" style="width: ${remPct}%; min-width: 60px;" title="Free Evening (${remMins}m)">
          <span class="font-bold text-[11px] text-outline flex items-center gap-1 justify-center">
            <span>🌆</span>
            <span>Evening</span>
          </span>
          <span class="font-mono text-[9px] text-outline/80 mt-0.5">${remMins}m</span>
        </div>
      `;
    }

    trackerContainer.innerHTML = `
      <div class="bg-surface-container-low rounded-xl p-2.5 sm:p-3 border border-white/[0.06] shadow-sm space-y-1.5">
        
        <!-- Load Bar Header & Legend -->
        <div class="flex items-center justify-between gap-2 flex-wrap pb-0.5">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[17px]">view_timeline</span>
            <span class="font-label-md text-xs font-bold text-on-surface">Daily Period Tracker</span>
            <span class="hidden sm:inline-block text-[11px] text-on-surface-variant">· 09:00 AM to 06:00 PM</span>
          </div>
          <div class="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold">
            <span class="inline-flex items-center gap-1 text-amber-400"><span class="w-2 h-2 rounded bg-amber-500"></span> Lec</span>
            <span class="inline-flex items-center gap-1 text-sky-400"><span class="w-2 h-2 rounded bg-sky-500"></span> Tut</span>
            <span class="inline-flex items-center gap-1 text-emerald-400"><span class="w-2 h-2 rounded bg-emerald-500"></span> Lab</span>
          </div>
        </div>

        <!-- Hourly Timeline Ticks Scale (10 Hourly Markers) -->
        <div class="relative w-full h-3 font-mono text-[10px] sm:text-[11px] font-semibold text-on-surface-variant select-none hidden sm:block">
          <span class="absolute left-0">09:00 AM</span>
          <span class="absolute left-[11.1%] -translate-x-1/2">10:00</span>
          <span class="absolute left-[22.2%] -translate-x-1/2">11:00</span>
          <span class="absolute left-[33.3%] -translate-x-1/2">12:00 PM</span>
          <span class="absolute left-[44.4%] -translate-x-1/2">01:00</span>
          <span class="absolute left-[55.5%] -translate-x-1/2">02:00</span>
          <span class="absolute left-[66.7%] -translate-x-1/2">03:00</span>
          <span class="absolute left-[77.8%] -translate-x-1/2">04:00</span>
          <span class="absolute left-[88.9%] -translate-x-1/2">05:00</span>
          <span class="absolute right-0">06:00 PM</span>
        </div>
        <div class="flex sm:hidden justify-between font-mono text-[10px] font-bold text-on-surface-variant select-none px-1">
          <span>9 AM</span>
          <span>11 AM</span>
          <span>1 PM</span>
          <span>3 PM</span>
          <span>5 PM</span>
          <span>6 PM</span>
        </div>

        <!-- The Compact Interactive Load Bar -->
        <div class="h-11 sm:h-12 w-full bg-surface-container-lowest rounded-xl p-1 flex gap-1 relative overflow-x-auto overflow-y-hidden border border-white/[0.08] shadow-inner no-scrollbar">
          ${ganttSlotsHtml}
          ${(isToday && curMins >= dayStart && curMins <= dayEnd) ? `
            <div class="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(244,63,94,1)]" style="left: ${((curMins - dayStart) / dayTotal) * 100}%;">
              <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></div>
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 rounded bg-rose-600 text-white font-mono text-[8px] font-bold">NOW</div>
            </div>
          ` : ''}
        </div>

        <!-- Live Period Status Row -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-0.5 text-xs">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-2 h-2 rounded-full ${isToday ? (liveClass ? 'bg-emerald-400 animate-ping' : 'bg-primary') : 'bg-outline'} shrink-0"></span>
            <span class="font-medium text-on-surface truncate text-xs">${statusText}</span>
          </div>
          ${(liveClass || nextClass) ? `
            <button type="button" class="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-dark text-on-primary font-bold text-xs transition-colors cursor-pointer shadow-sm shrink-0 self-start sm:self-auto" id="btn-jump-period">
              <span>Jump to Class</span>
              <span class="material-symbols-outlined text-[14px]">arrow_downward</span>
            </button>
          ` : ''}
        </div>

      </div>
    `;

    // Click handler for Gantt slots to scroll directly to the class card below
    trackerContainer.querySelectorAll('.class-gantt-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = slot.dataset.targetId;
        if (!targetId) return;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.add('ring-4', 'ring-primary', 'transition-all');
          setTimeout(() => {
            targetEl.classList.remove('ring-4', 'ring-primary');
          }, 1500);
        }
      });
    });

    const triggerJump = () => {
      const liveTarget = document.querySelector('.class-schedule-card.ring-2') || document.querySelector('.class-schedule-card');
      if (liveTarget) {
        liveTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        liveTarget.classList.add('ring-4', 'ring-primary', 'transition-all');
        setTimeout(() => {
          liveTarget.classList.remove('ring-4', 'ring-primary');
        }, 1500);
      }
    };

    const jumpBtn = document.getElementById('btn-jump-period');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', triggerJump);
    }

    const jumpToNowBtn = document.getElementById('btn-jump-to-now');
    if (jumpToNowBtn && !jumpToNowBtn._bound) {
      jumpToNowBtn._bound = true;
      jumpToNowBtn.addEventListener('click', triggerJump);
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
    const cleanTitle = encodeURIComponent(`${c.cleanSubject || c.subject} (${c.typeName || c.type})`);
    const cleanDetails = encodeURIComponent(`Faculty: ${c.faculty || 'JUIT Faculty'}\nVenue: Room ${c.venue || 'Classroom'}\nBatch: ${c.batchesRaw || 'All'}\nJaypee University of Information Technology, Waknaghat, Solan`);
    const cleanLocation = encodeURIComponent(`Room ${c.venue || 'Classroom'}, JUIT Waknaghat, Solan`);
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${cleanTitle}&details=${cleanDetails}&location=${cleanLocation}`;

    let typeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    let typeIcon = 'school';
    if (c.type === 'P') {
      typeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      typeIcon = 'science';
    } else if (c.type === 'T') {
      typeColor = 'text-sky-400 bg-sky-500/15 border-sky-500/30';
      typeIcon = 'groups';
    }

    content.innerHTML = `
      <div class="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3 mb-4">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-bold border ${typeColor}">
              <span class="material-symbols-outlined text-[14px]">${typeIcon}</span>
              <span>${c.typeName || (c.type === 'P' ? 'Lab (P)' : (c.type === 'T' ? 'Tutorial (T)' : 'Lecture (L)'))}</span>
            </span>
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-xl bg-surface-container-highest text-on-surface border border-white/[0.06]">${c.code}</span>
            ${c.durationSlots > 1 ? `<span class="text-xs font-mono px-2 py-0.5 rounded-lg bg-surface-container-highest text-on-surface-variant">${c.durationSlots} hrs</span>` : ''}
          </div>
          <h2 class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface mt-2 tracking-tight">${c.cleanSubject || c.subject}</h2>
        </div>
        <button type="button" class="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border border-white/[0.06]" onclick="window.PortalsController?.closeModal()">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-white/[0.06] shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-outline">Time Slot</div>
          <div class="font-mono font-bold text-sm sm:text-base text-primary mt-1">🕒 ${c.time}</div>
          <div class="text-xs text-on-surface-variant mt-0.5">${c.durationSlots || 1} Hour Academic Period</div>
        </div>

        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-white/[0.06] shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-outline">Classroom / Lab</div>
          <div class="font-mono font-bold text-sm sm:text-base text-on-surface mt-1">📍 Room ${c.venue || 'TBA'}</div>
          <div class="text-xs text-on-surface-variant mt-0.5">${c.venueDetails?.name || 'Academic Block'}</div>
        </div>

        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-white/[0.06] shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-outline">Instructor</div>
          <div class="font-bold text-sm sm:text-base text-on-surface mt-1">👨‍🏫 Prof. ${c.faculty || 'JUIT Faculty'}</div>
          <div class="text-xs text-on-surface-variant mt-0.5">Faculty Cabins AB1 / AB3</div>
        </div>

        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-white/[0.06] shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-outline">Enrolled Batches</div>
          <div class="font-mono font-bold text-sm text-on-surface mt-1">👥 ${c.batches?.join(', ') || c.batchesRaw || 'All Batches'}</div>
          <div class="text-xs text-on-surface-variant mt-0.5">Waknaghat Campus, Solan</div>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap justify-end pt-3 border-t border-white/[0.06] mt-4">
        ${vaultRes ? `
          ${vaultRes.hasMultiple ? `
            <button type="button" class="btn-inspector-tutorials-trigger inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${vaultRes.subjectType === 'math' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/35 hover:bg-sky-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/35 hover:bg-amber-500/30'}">
              <span class="material-symbols-outlined text-[16px]">${vaultRes.subjectType === 'math' ? 'functions' : 'folder_open'}</span>
              <span>${vaultRes.shortTitle || 'Tutorial Sheets'} (${vaultRes.tutorials.length - 1})</span>
            </button>
          ` : `
            <a href="${vaultRes.link}" download class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/35 hover:bg-sky-500/30 text-xs font-bold transition-all" title="Download ${vaultRes.title}">
              <span class="material-symbols-outlined text-[16px]">download</span>
              <span>Download ${vaultRes.shortTitle}</span>
            </a>
          `}
        ` : ''}

        ${c.venue ? `
          <button type="button" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface border border-white/[0.08] hover:border-primary/40 text-xs font-bold transition-all cursor-pointer" onclick="window.PortalsController?.closeModal(); if (window.App) App.switchView('campus'); if (window.CampusMap && window.CampusMap.focusVenue) window.CampusMap.focusVenue('${c.venue}');">
            <span class="material-symbols-outlined text-rose-400 text-[16px]">location_on</span>
            <span>Locate on 3D Map</span>
          </button>
        ` : ''}

        <a href="${gCalUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary border border-primary/30 hover:border-primary text-xs font-bold transition-all" title="Add to Google Calendar">
          <span class="material-symbols-outlined text-[16px]">calendar_add_on</span>
          <span>Google Calendar ↗</span>
        </a>

        <a href="https://lms.juit.ac.in/login/index.php" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:brightness-110 text-xs font-bold transition-all shadow-sm" title="Open JUIT Moodle LMS">
          <span class="material-symbols-outlined text-[16px]">school</span>
          <span>Open Moodle ↗</span>
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
    const themeColor = isMath ? 'text-sky-300' : 'text-amber-400';
    const themeBg = isMath ? 'bg-sky-500/15 border-sky-500/30' : 'bg-amber-500/15 border-amber-500/30';
    const headerIcon = isMath ? 'functions' : 'memory';
    const titleText = meta.title || (isMath ? 'Mathematics I: Tutorial Sheets (Sheets 1–4)' : 'Basic Electronics: Tutorial Sheets & Problem Sets (Tutorials 1–5)');
    const deptText = meta.dept || (isMath ? 'Department of Mathematics • 25B11MA113 • Verified Tutorial Problem Sets' : 'Department of ECE • 25B11EC111 • Verified Assignment Problem Sets');

    content.innerHTML = `
      <div class="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl ${themeBg} ${themeColor} flex items-center justify-center shrink-0 border shadow-inner">
            <span class="material-symbols-outlined text-[24px]">${headerIcon}</span>
          </div>
          <div>
            <h3 class="font-headline-sm text-base sm:text-lg font-bold text-on-surface">${titleText}</h3>
            <span class="text-xs text-on-surface-variant block mt-0.5">${deptText}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border border-white/[0.06]" onclick="window.PortalsController?.closeModal()">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto no-scrollbar py-1">
        ${tutorials.map(t => {
          const isBundle = (t.num === 'Bundle' || t.num === 'Master Bundle');
          const badgeText = isBundle ? (isMath ? 'ALL 8 PAGES' : 'ALL 18 PAGES') : (typeof t.num === 'number' ? `SHEET ${t.num}` : t.num);

          return `
            <div class="p-3 sm:p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-white/[0.06] hover:border-white/15 flex items-center justify-between gap-3 transition-all flex-wrap sm:flex-nowrap">
              <div class="flex items-start gap-2.5 min-w-0 flex-1">
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${themeBg} ${themeColor} shrink-0 mt-0.5">
                  ${badgeText}
                </span>
                <div class="min-w-0">
                  <h4 class="font-headline-sm text-xs sm:text-sm font-bold text-on-surface truncate">${t.title}</h4>
                  ${t.subtitle ? `<p class="text-[11px] text-on-surface-variant truncate mt-0.5">${t.subtitle}</p>` : ''}
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button type="button" class="btn-modal-preview-pdf inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface border border-white/[0.06] transition-all cursor-pointer" data-link="${t.link}" data-title="${t.title}">
                  <span class="material-symbols-outlined text-[14px]">visibility</span>
                  <span>View</span>
                </button>
                <a href="${t.link}" download class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:brightness-110 text-xs font-bold transition-all shadow-sm">
                  <span class="material-symbols-outlined text-[14px]">download</span>
                  <span>PDF</span>
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
        window.PortalsController?.closeModal();
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

        if (window.JUIT_PROFILE) {
          const semNum = this.activeSemesterId.match(/(\d)_sem/)?.[1] || window.JUIT_PROFILE.semester || '1';
          const isMtech = this.activeSemesterId.includes('mtech');
          window.JUIT_PROFILE.programme = isMtech ? 'M.Tech' : 'B.Tech';
          window.JUIT_PROFILE.semester = semNum;
          window.JUIT_PROFILE.batch = this.activeBatch;
          localStorage.setItem('juit_student_profile', JSON.stringify(window.JUIT_PROFILE));
        }
        if (window.App) {
          window.App.updateUserProfileBadges?.();
          window.App.refreshDashboard?.();
        }

        this.populateBatchDropdown();
        this.renderQuickBatchChips();
        this.renderDayPills();
        this.renderTypeFilterChips();
        this.renderSchedule();
        this.updateDashboardToday();
      });
    }

    const batchSelect = document.getElementById('timetable-batch-select');
    if (batchSelect) {
      batchSelect.addEventListener('change', (e) => {
        this.activeBatch = e.target.value;
        localStorage.setItem('juit_selected_batch', this.activeBatch);
        this.updateBatchDisplayLabels();
        if (window.JUIT_PROFILE) {
          window.JUIT_PROFILE.batch = this.activeBatch;
          localStorage.setItem('juit_student_profile', JSON.stringify(window.JUIT_PROFILE));
        }
        if (window.App) {
          window.App.updateUserProfileBadges?.();
          window.App.refreshDashboard?.();
        }
        this.renderQuickBatchChips();
        this.renderDayPills();
        this.renderTypeFilterChips();
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

    const jumpBtn = document.getElementById('btn-jump-to-now');
    if (jumpBtn && !jumpBtn._bound) {
      jumpBtn._bound = true;
      jumpBtn.addEventListener('click', () => {
        const dayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
        this.activeDay = (dayCode === 'SUN') ? 'MON' : dayCode;
        this.viewMode = 'day';
        this.renderViewModeTabs();
        this.renderDayPills();
        this.renderTypeFilterChips();
        this.renderSchedule();

        setTimeout(() => {
          const liveEl = document.querySelector('.is-live-now') || document.querySelector('.pro-timetable-card');
          if (liveEl) {
            liveEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            liveEl.classList.add('ring-4', 'ring-primary');
            setTimeout(() => liveEl.classList.remove('ring-4', 'ring-primary'), 1500);
          }
        }, 150);
      });
    }

    // Bind Export to iCal button
    const btnExportIcal = document.getElementById('btn-export-ical');
    if (btnExportIcal && !btnExportIcal._bound) {
      btnExportIcal._bound = true;
      btnExportIcal.addEventListener('click', () => {
        this.exportToICal();
      });
    }

    // Bind Print button
    const btnPrint = document.getElementById('btn-print-timetable');
    if (btnPrint && !btnPrint._bound) {
      btnPrint._bound = true;
      btnPrint.addEventListener('click', () => {
        this.printTimetable();
      });
    }
  },

  renderWeekView(container) {
    const currentSheet = this.data[this.activeSemesterId];
    const batchLabel = (!this.activeBatch || this.activeBatch === 'ALL') ? 'All Batches' : `Batch ${this.activeBatch}`;

    let weekTotalClasses = 0;
    this.days.forEach(d => {
      weekTotalClasses += this.filterAndMergeEntries(d).length;
    });

    const slots = [
      { label: '09:00 - 09:55 AM', pNum: 'P1', start: 540, end: 595, colIndex: 1 },
      { label: '10:00 - 10:55 AM', pNum: 'P2', start: 600, end: 655, colIndex: 2 },
      { label: '11:00 - 11:55 AM', pNum: 'P3', start: 660, end: 715, colIndex: 3 },
      { label: '12:00 - 12:55 PM', pNum: 'P4', start: 720, end: 775, colIndex: 4 },
      { label: '01:00 - 02:00 PM', pNum: 'LUNCH', start: 780, end: 840, isLunch: true, colIndex: 5 },
      { label: '02:00 - 02:55 PM', pNum: 'P5', start: 840, end: 895, colIndex: 6 },
      { label: '03:00 - 03:55 PM', pNum: 'P6', start: 900, end: 955, colIndex: 7 },
      { label: '04:00 - 04:55 PM', pNum: 'P7', start: 960, end: 1015, colIndex: 8 }
    ];

    const currentDayCode = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];

    let html = `
      <div class="space-y-3">
        <!-- Week View Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-surface-container-low border border-white/[0.08] shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/25 shadow-inner">
              <span class="material-symbols-outlined text-[22px]">calendar_view_week</span>
            </div>
            <div>
              <span class="font-headline-sm text-sm sm:text-base font-bold text-on-surface">Weekly Academic Matrix</span>
              <span class="text-xs text-on-surface-variant block">${batchLabel} • ${currentSheet?.title || 'Academic Semester'}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn-matrix-switch-day inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-on-surface border border-white/[0.08] transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[15px]">view_agenda</span>
              <span>Back to Day View</span>
            </button>
            <span class="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
              ${weekTotalClasses} Classes (Mon – Sat)
            </span>
          </div>
        </div>

        <!-- Matrix Table Container -->
        <div class="week-matrix-wrapper overflow-x-auto no-scrollbar">
          <table class="week-matrix-table">
            <thead>
              <tr>
                <th class="th-sticky-day w-24">Day</th>
                ${slots.map(s => `
                  <th class="${s.isLunch ? 'text-amber-400' : ''}">
                    <span class="block">${s.pNum}</span>
                    <span class="text-[10px] text-outline font-normal font-mono block">${s.label.split(' ')[0]}</span>
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
        <tr class="${isToday ? 'bg-primary/5' : ''}">
          <td class="td-sticky-day text-center">
            <div class="font-headline-sm font-bold text-xs sm:text-sm ${isToday ? 'text-primary' : 'text-on-surface'}">${d}</div>
            <div class="text-[10px] text-outline mt-0.5">${dayClasses.length} cls</div>
            ${isToday ? '<span class="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-mono">TODAY</span>' : ''}
          </td>
      `;

      slots.forEach(s => {
        if (s.isLunch) {
          html += `
            <td class="p-1.5">
              <div class="week-lunch-cell">
                <span>🍽️</span>
                <span>Lunch</span>
              </div>
            </td>
          `;
          return;
        }

        const match = dayClasses.find(c => {
          const r = this.parseTimeRange(c.time);
          if (r) {
            return (r.start < s.end && r.end > s.start);
          }
          if (c.colIndex && c.colIndex === s.colIndex) return true;
          return false;
        });

        if (match) {
          const typeClass = match.type === 'P' ? 'lab' : (match.type === 'T' ? 'tutorial' : 'lecture');
          const typeLabel = match.type === 'P' ? 'Lab' : (match.type === 'T' ? 'Tut' : 'Lec');
          const cleanName = this.getCleanSubjectName(match.code, match.subject);
          const isFilteredOut = (this.filterType !== 'ALL' && match.type !== this.filterType);
          const filterStyle = isFilteredOut ? 'opacity: 0.25; filter: grayscale(0.8);' : '';

          html += `
            <td class="p-1.5">
              <div class="week-matrix-cell-card cell-${typeClass}" style="${filterStyle}" data-class-data='${JSON.stringify({ ...match, cleanSubject: cleanName }).replace(/'/g, "&apos;")}' title="${cleanName} (${match.code}) - Room ${match.venue || 'TBA'}">
                <div class="flex items-center justify-between gap-1 leading-tight">
                  <span class="font-mono text-[10px] font-bold text-on-surface truncate">${match.code}</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/40 text-white">${typeLabel}</span>
                </div>
                <div class="font-headline-sm text-xs font-bold text-on-surface line-clamp-1 my-1">
                  ${cleanName}
                </div>
                <div class="flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                  <span class="text-primary font-semibold">📍 ${match.venue || 'TBA'}</span>
                  ${match.faculty ? `<span class="truncate max-w-[70px]">Prof. ${match.faculty}</span>` : ''}
                </div>
              </div>
            </td>
          `;
        } else {
          html += `
            <td class="p-1.5 text-center">
              <div class="h-full min-h-[64px] flex items-center justify-center text-outline/30 text-xs font-mono">
                —
              </div>
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
      </div>
    `;

    container.innerHTML = html;

    // Bind matrix switch back to day view button
    container.querySelector('.btn-matrix-switch-day')?.addEventListener('click', () => {
      this.viewMode = 'day';
      this.renderViewModeTabs();
      this.renderDayPills();
      this.renderTypeFilterChips();
      this.renderSchedule();
    });

    // Bind click on matrix cells to open inspector modal
    container.querySelectorAll('.week-matrix-cell-card').forEach(cell => {
      cell.addEventListener('click', () => {
        try {
          const raw = cell.dataset.classData;
          if (raw) {
            const data = JSON.parse(raw);
            this.openClassInspector(data);
          }
        } catch (err) {
          console.error(err);
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
        <div class="group rounded-xl bg-surface-container-low hover:bg-surface-container p-3 sm:p-space-md flex items-center justify-between gap-3 sm:gap-space-md transition-all shadow-sm border border-outline-variant/15">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-full ${isDone ? 'bg-surface-container-high text-secondary' : (isLive ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-outline')} flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[18px]">${isDone ? 'check' : (isLive ? 'play_arrow' : 'schedule')}</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-headline-sm text-sm sm:text-headline-sm text-on-surface font-semibold truncate">${subjName}</span>
                <span class="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-medium">${typeLabel}</span>
              </div>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <button type="button" class="venue-locator-pill inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container-high hover:bg-primary/20 text-secondary hover:text-primary transition-colors cursor-pointer border border-white/[0.04]" data-venue="${c.venue || ''}" title="View classroom on campus map">
                  <span class="material-symbols-outlined text-[13px]">location_on</span>
                  <span>${c.venue ? `Room ${c.venue}` : 'Campus'}</span>
                </button>
                <span class="text-[11px] text-on-surface-variant truncate">${c.venueDetails?.buildingName || 'Academic Block'} • ${c.faculty || 'Faculty'}</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end flex-shrink-0">
            <span class="font-label-md text-xs sm:text-label-md text-on-surface font-mono font-medium">${startTime}</span>
            <span class="text-[11px] font-medium ${isDone ? 'text-secondary' : (isLive ? 'text-primary font-semibold' : 'text-outline')}">${isDone ? 'Completed' : (isLive ? 'In Progress' : 'Upcoming')}</span>
          </div>
        </div>
      `;
    }).join('');

    previewContainer.querySelectorAll('.venue-locator-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const venue = btn.dataset.venue;
        if (window.App) window.App.switchView('campus');
        if (window.CampusMap && window.CampusMap.focusVenue) {
          window.CampusMap.focusVenue(venue);
        }
      });
    });
  }
};

window.TimetableController = TimetableController;
