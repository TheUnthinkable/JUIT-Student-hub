/**
 * Academics, Batch Attendance Indicator & CGPA Hub for JUIT Student Hub
 * Built to strictly comply with official JUIT 80% criteria & JUIT 10-point Letter Grading System.
 */

const AcademicsController = {
  activeSubTab: 'personal-attendance', // 'personal-attendance' | 'batch-attendance' | 'cgpa-checker'
  activeBatch: '26BT10',
  batchFilter: 'all', // 'all' | 'safe' | 'borderline' | 'critical'
  batchSearchQuery: '',
  targetPercent: 80, // Official JUIT 80% Mandatory Attendance Rule

  // Simulation state for selected batch
  batchSimulation: {
    deltaAttended: 0,
    deltaMissed: 0,
    targetPercent: 80,
    manualAttended: null,
    manualConducted: null
  },

  // Courses data for SGPA calculation
  cgpaCourses: [
    { id: 'c1', code: '25B11CI112', name: 'Software Development Fundamentals', credits: 4.0, grade: 'A+' },
    { id: 'c2', code: '25B11MA113', name: 'Mathematics-I (Calculus & Linear Algebra)', credits: 4.0, grade: 'A' },
    { id: 'c3', code: '25B11PH111', name: 'Engineering Physics', credits: 4.0, grade: 'B+' },
    { id: 'c4', code: '25B11EC111', name: 'Basic Electronics', credits: 4.0, grade: 'A' },
    { id: 'c5', code: '25B11HS111', name: 'English Communication Skills', credits: 3.0, grade: 'A' },
    { id: 'c6', code: '25B17CI172', name: 'SDF Laboratory', credits: 1.5, grade: 'A+' },
    { id: 'c7', code: '25B17PH171', name: 'Physics Laboratory', credits: 1.5, grade: 'A' },
    { id: 'c8', code: '25B17GE171', name: 'Engineering Workshop', credits: 1.5, grade: 'A' }
  ],

  // JUIT 10-point scale grade mapping
  gradeScale: {
    'A+': { points: 10.0, label: 'Outstanding (90–100%)', color: '#00e5ff' },
    'A':  { points: 9.0,  label: 'Excellent (80–89%)', color: '#10b981' },
    'B+': { points: 8.0,  label: 'Very Good (70–79%)', color: '#3b82f6' },
    'B':  { points: 7.0,  label: 'Good (60–69%)', color: '#8b5cf6' },
    'C+': { points: 6.0,  label: 'Average (50–59%)', color: '#f59e0b' },
    'C':  { points: 5.0,  label: 'Below Average (40–49%)', color: '#fb923c' },
    'D':  { points: 4.0,  label: 'Marginal Pass (30–39%)', color: '#ef4444' },
    'F':  { points: 0.0,  label: 'Fail (<30%)', color: '#dc2626' }
  },

  // Batch baseline master dataset (28 weekly scheduled hrs per timetable: 13L, 6T, 9P)
  batchMasterList: [
    { code: '26BT01', dept: 'Computer Science & Engineering', stream: 'CSE Section A1', conducted: 140, attended: 124, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT02', dept: 'Computer Science & Engineering', stream: 'CSE Section A2', conducted: 140, attended: 129, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT03', dept: 'Computer Science & Engineering', stream: 'CSE Section A3', conducted: 140, attended: 118, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT04', dept: 'Computer Science & Engineering', stream: 'CSE Section A4', conducted: 140, attended: 113, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT05', dept: 'Computer Science & Engineering', stream: 'CSE Section B1', conducted: 140, attended: 110, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT06', dept: 'Computer Science & Engineering', stream: 'CSE Section B2', conducted: 140, attended: 122, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT07', dept: 'Computer Science & Engineering', stream: 'CSE Section B3', conducted: 140, attended: 108, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT08', dept: 'Computer Science & Engineering', stream: 'CSE Section B4', conducted: 140, attended: 98,  weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT09', dept: 'Computer Science & Engineering', stream: 'CSE Section C1', conducted: 140, attended: 120, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT10', dept: 'Computer Science & Engineering', stream: 'CSE Section C2', conducted: 140, attended: 125, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT11', dept: 'Information Technology', stream: 'IT Section 1', conducted: 140, attended: 109, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT12', dept: 'Information Technology', stream: 'IT Section 2', conducted: 140, attended: 119, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT13', dept: 'Electronics & Communication', stream: 'ECE Section 1', conducted: 140, attended: 102, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT14', dept: 'Electronics & Communication', stream: 'ECE Section 2', conducted: 140, attended: 121, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT15', dept: 'Biotechnology', stream: 'Biotech & Bioinfo', conducted: 140, attended: 126, weekly: 28, l: 13, t: 6, p: 9 },
    { code: '26BT16', dept: 'Civil Engineering', stream: 'Civil & Infra', conducted: 140, attended: 125, weekly: 28, l: 13, t: 6, p: 9 }
  ],

  init() {
    this.initActiveBatch();
    const profile = this.getProfile();
    if (!profile.attendance || Object.keys(profile.attendance).length === 0) {
      this.seedInitialCourses();
    }
    this.bindSubTabs();
    this.renderAttendanceTracker();
    this.renderCourseCards();
    this.renderBatchAttendanceIndicator();
    this.renderCgpaChecker();
  },

  onViewActivated() {
    this.initActiveBatch();
    this.renderBatchAttendanceIndicator();
    this.renderAttendanceTracker();
    this.renderCgpaChecker();
  },

  initActiveBatch() {
    // Check saved batch in profile or timetable
    const saved = localStorage.getItem('juit_selected_batch');
    if (saved && this.batchMasterList.some(b => b.code === saved)) {
      this.activeBatch = saved;
    } else if (window.TimetableController && window.TimetableController.activeBatch) {
      this.activeBatch = window.TimetableController.activeBatch;
    } else {
      this.activeBatch = '26BT10';
    }
  },

  getProfile() {
    return window.JUIT_PROFILE || { attendance: {} };
  },

  saveProfile() {
    localStorage.setItem('juit_student_profile', JSON.stringify(window.JUIT_PROFILE));
  },

  /* ================= SUB-TAB NAVIGATION ================= */
  bindSubTabs() {
    const tabButtons = document.querySelectorAll('.academic-tab-btn, #academics-subnav-tabs button');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSubTab = btn.dataset.subtab || (
          btn.id.includes('batch') ? 'batch-attendance' : (btn.id.includes('cgpa') ? 'cgpa-checker' : 'personal-attendance')
        );
        this.switchSubTab(targetSubTab);
      });
    });
  },

  switchSubTab(subTabKey) {
    this.activeSubTab = subTabKey;
    document.querySelectorAll('.academic-tab-btn, #academics-subnav-tabs button').forEach(btn => {
      const match = (btn.dataset.subtab === subTabKey) || (btn.id === `tab-btn-${subTabKey}`);
      btn.classList.toggle('active', match);
      if (match) {
        btn.classList.add('bg-surface-container', 'text-primary', 'shadow-sm');
        btn.classList.remove('text-on-surface-variant');
      } else {
        btn.classList.remove('bg-surface-container', 'text-primary', 'shadow-sm');
        btn.classList.add('text-on-surface-variant');
      }
    });

    const panels = {
      'batch-attendance': document.getElementById('subpanel-batch-attendance'),
      'personal-attendance': document.getElementById('subpanel-personal-attendance'),
      'cgpa-checker': document.getElementById('subpanel-cgpa-checker')
    };

    Object.keys(panels).forEach(k => {
      const el = panels[k];
      if (el) {
        if (k === subTabKey) {
          el.classList.remove('hidden');
          el.style.display = 'block';
          el.classList.add('active');
        } else {
          el.classList.add('hidden');
          el.style.display = 'none';
          el.classList.remove('active');
        }
      }
    });

    if (subTabKey === 'batch-attendance') {
      this.renderBatchAttendanceIndicator();
    } else if (subTabKey === 'personal-attendance') {
      this.renderAttendanceTracker();
    } else if (subTabKey === 'cgpa-checker') {
      this.renderCgpaChecker();
    }
  },

  /* ================= MATHEMATICAL 80% RULE HELPER ================= */
  calculateJuit80Rule(attended, conducted, customTarget = null) {
    const T = (customTarget !== null && customTarget !== undefined) ? customTarget : (this.targetPercent || 80);
    if (conducted === 0) {
      return {
        percent: 100,
        status: 'safe',
        statusLabel: 'Safe Standing',
        safeBunks: 0,
        consecutiveNeeded: 0,
        summaryText: 'No classes conducted yet in session.'
      };
    }

    const percent = (attended / conducted) * 100;

    if (percent >= T) {
      // Safe bunks: floor((attended - T/100 * conducted) / (T/100))
      const safeBunks = Math.floor((attended - (T / 100) * conducted) / (T / 100));
      return {
        percent: percent,
        status: 'safe',
        statusLabel: `Safe Standing (≥${T}%)`,
        safeBunks: Math.max(0, safeBunks),
        consecutiveNeeded: 0,
        summaryText: safeBunks > 0
          ? `🛡️ Compliant: You can safely miss up to <strong>${safeBunks}</strong> ${safeBunks === 1 ? 'class' : 'classes'} and still remain at or above the mandatory ${T}% requirement.`
          : `🎯 Boundary Alert: Exactly at ${T}.0%. Attend your next class to maintain safe examination eligibility.`
      };
    } else {
      // Consecutive classes needed: ceil((T/100 * conducted - attended) / (1 - T/100))
      const consecutiveNeeded = Math.ceil(((T / 100) * conducted - attended) / (1 - (T / 100)));
      const isBorderline = percent >= Math.max(50, T - 5.0);
      return {
        percent: percent,
        status: isBorderline ? 'borderline' : 'critical',
        statusLabel: isBorderline ? `Borderline Risk (${(T - 5).toFixed(0)}–${T}%)` : `Critical Debar Risk (<${(T - 5).toFixed(0)}%)`,
        safeBunks: 0,
        consecutiveNeeded: Math.max(1, consecutiveNeeded),
        summaryText: isBorderline
          ? `⚠️ Borderline Risk (${percent.toFixed(1)}%): Attend next <strong>${consecutiveNeeded}</strong> consecutive classes to clear the ${T}% cutoff without medical dispensary waiver.`
          : `🚨 Critical Debarment Risk (${percent.toFixed(1)}%): Mandatory to attend next <strong>${consecutiveNeeded}</strong> consecutive classes. JUIT rules state hall tickets are withheld for <${T}% attendance.`
      };
    }
  },

  /* ================= FEATURE 1: BATCH ATTENDANCE INDICATOR ================= */
  renderBatchAttendanceIndicator() {
    const container = document.getElementById('batch-attendance-container');
    if (!container) return;

    // Active batch data with simulation applied
    const activeBatchData = this.batchMasterList.find(b => b.code === this.activeBatch) || this.batchMasterList[0];
    const baseAttended = (this.batchSimulation.manualAttended !== null && !isNaN(this.batchSimulation.manualAttended)) ? this.batchSimulation.manualAttended : activeBatchData.attended;
    const baseConducted = (this.batchSimulation.manualConducted !== null && !isNaN(this.batchSimulation.manualConducted)) ? this.batchSimulation.manualConducted : activeBatchData.conducted;
    const simAttended = Math.max(0, baseAttended + (this.batchSimulation.deltaAttended || 0));
    const simConducted = Math.max(simAttended, Math.max(1, baseConducted + (this.batchSimulation.deltaAttended || 0) + (this.batchSimulation.deltaMissed || 0)));
    const simTarget = this.batchSimulation.targetPercent || 80;
    const activeMetrics = this.calculateJuit80Rule(simAttended, simConducted, simTarget);

    // Filter master list for matrix table
    let filteredList = this.batchMasterList.filter(b => {
      // Search query filter
      if (this.batchSearchQuery) {
        const q = this.batchSearchQuery.toLowerCase();
        const matchesCode = b.code.toLowerCase().includes(q);
        const matchesDept = b.dept.toLowerCase().includes(q);
        const matchesStream = b.stream.toLowerCase().includes(q);
        if (!matchesCode && !matchesDept && !matchesStream) return false;
      }

      // Status filter
      if (this.batchFilter !== 'all') {
        const metrics = this.calculateJuit80Rule(b.attended, b.conducted, simTarget);
        if (this.batchFilter === 'safe' && metrics.status !== 'safe') return false;
        if (this.batchFilter === 'borderline' && metrics.status !== 'borderline') return false;
        if (this.batchFilter === 'critical' && metrics.status !== 'critical') return false;
      }
      return true;
    });

    // Counts for filter pills
    const totalBatches = this.batchMasterList.length;
    const safeCount = this.batchMasterList.filter(b => this.calculateJuit80Rule(b.attended, b.conducted, simTarget).status === 'safe').length;
    const borderlineCount = this.batchMasterList.filter(b => this.calculateJuit80Rule(b.attended, b.conducted, simTarget).status === 'borderline').length;
    const criticalCount = this.batchMasterList.filter(b => this.calculateJuit80Rule(b.attended, b.conducted, simTarget).status === 'critical').length;

    // Quick batch chips row
    const batchChipsHtml = this.batchMasterList.map(b => {
      const isSelected = b.code === this.activeBatch;
      const bMetrics = this.calculateJuit80Rule(b.attended, b.conducted, simTarget);
      const dotColor = bMetrics.status === 'safe' ? '#10b981' : (bMetrics.status === 'borderline' ? '#f59e0b' : '#ef4444');
      return `
        <button type="button" class="batch-select-chip px-3 py-1.5 rounded-xl font-mono text-xs font-semibold border transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 ${
          isSelected
            ? 'bg-primary text-on-primary border-primary shadow-sm font-bold'
            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border-white/[0.06]'
        }" data-batch="${b.code}" title="${b.stream} (${bMetrics.percent.toFixed(1)}%)">
          <span class="w-2 h-2 rounded-full shrink-0" style="background: ${dotColor};"></span>
          <span>${b.code}</span>
          ${isSelected ? '<span class="text-[10px] font-mono px-1 rounded bg-black/20">Active</span>' : ''}
        </button>
      `;
    }).join('');

    // Matrix table rows
    const matrixRowsHtml = filteredList.map(b => {
      const isSelected = b.code === this.activeBatch;
      const metrics = this.calculateJuit80Rule(b.attended, b.conducted, simTarget);
      const pctFormatted = metrics.percent.toFixed(1);

      let badgeHtml = '';
      let reqHtml = '';
      if (metrics.status === 'safe') {
        badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Safe (≥${simTarget}%)</span>`;
        reqHtml = `<span class="text-emerald-400 font-bold font-mono">+${metrics.safeBunks} safe bunks</span>`;
      } else if (metrics.status === 'borderline') {
        badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Borderline</span>`;
        reqHtml = `<span class="text-amber-400 font-bold font-mono">Need next ${metrics.consecutiveNeeded}</span>`;
      } else {
        badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Debar Risk</span>`;
        reqHtml = `<span class="text-rose-400 font-bold font-mono">Need next ${metrics.consecutiveNeeded}</span>`;
      }

      return `
        <tr class="batch-matrix-row transition-colors hover:bg-surface-container/60 cursor-pointer ${isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : ''}" data-batch="${b.code}">
          <td class="p-3">
            <div class="flex items-center gap-1.5">
              <strong class="font-mono text-sm ${isSelected ? 'text-primary' : 'text-on-surface'}">${b.code}</strong>
              ${isSelected ? '<span class="px-1.5 py-0.2 rounded text-[10px] bg-primary/20 text-primary font-bold">Active</span>' : ''}
            </div>
            <div class="text-[11px] text-on-surface-variant truncate max-w-[150px]">${b.stream}</div>
          </td>
          <td class="p-3 text-on-surface-variant text-xs">${b.dept}</td>
          <td class="p-3">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container border border-white/[0.04] text-on-surface-variant">
              ${b.weekly}h (${b.l}L • ${b.t}T • ${b.p}P)
            </span>
          </td>
          <td class="p-3 font-mono text-xs font-semibold text-on-surface">
            ${b.attended} <span class="text-on-surface-variant font-normal">/ ${b.conducted}</span>
          </td>
          <td class="p-3">
            <div class="flex items-center gap-2.5">
              <strong class="font-mono text-xs font-bold" style="color: ${metrics.status === 'safe' ? '#10b981' : (metrics.status === 'borderline' ? '#f59e0b' : '#ef4444')};">${pctFormatted}%</strong>
              <div class="relative w-20 h-2 bg-surface-container-high rounded-full overflow-hidden shrink-0">
                <div class="h-full rounded-full transition-all" style="width: ${Math.min(100, metrics.percent)}%; background: ${metrics.status === 'safe' ? '#10b981' : (metrics.status === 'borderline' ? '#f59e0b' : '#ef4444')};"></div>
                <div class="absolute top-0 bottom-0 w-0.5 bg-white shadow-xs" style="left: ${simTarget}%;"></div>
              </div>
            </div>
          </td>
          <td class="p-3">${badgeHtml}</td>
          <td class="p-3">${reqHtml}</td>
          <td class="p-3 text-right">
            <button type="button" class="btn-inspect-batch px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              isSelected ? 'bg-primary text-on-primary font-bold shadow-xs' : 'bg-surface-container-high hover:bg-surface-container-highest text-primary'
            }" data-batch="${b.code}">
              ${isSelected ? 'Selected' : 'Inspect'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const heroTextColor = activeMetrics.status === 'safe' ? '#10b981' : (activeMetrics.status === 'borderline' ? '#f59e0b' : '#ef4444');
    const isSavedActive = (this.activeBatch === (localStorage.getItem('juit_selected_batch') || '26BT10'));

    container.innerHTML = `
      <!-- QUICK BATCHES STRIP -->
      <div class="rounded-2xl bg-surface-container-low p-3.5 sm:p-4 border border-white/[0.06] shadow-sm space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[18px]">view_comfy_alt</span>
            <span class="text-xs font-bold text-on-surface uppercase tracking-wider">Select Batch for Compliance Breakdown:</span>
          </div>
          <span class="text-[11px] font-mono text-secondary bg-surface-container px-2 py-0.5 rounded-full border border-white/[0.04]">ODD 2026 Term</span>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5" id="batch-chips-container">
          ${batchChipsHtml}
        </div>
      </div>

      <!-- HERO BATCH COMPLIANCE CARD -->
      <div class="rounded-2xl bg-gradient-to-br from-surface-container-high/90 via-surface-container to-surface-container-low p-4 sm:p-6 border border-white/[0.08] shadow-md space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="px-2.5 py-0.5 rounded-lg bg-primary/20 text-primary border border-primary/30 font-mono text-xs font-bold">${activeBatchData.code}</span>
              <span class="px-2 py-0.5 rounded text-[11px] bg-surface-container text-on-surface-variant font-medium">${activeBatchData.dept}</span>
              <span class="px-2 py-0.5 rounded text-[11px] bg-surface-container text-secondary font-medium">${activeBatchData.stream}</span>
            </div>
            <h3 class="font-headline-sm text-base sm:text-lg text-on-surface font-bold tracking-tight">Attendance Compliance & 80% Rule Indicator</h3>
            <p class="font-body-sm text-xs text-on-surface-variant mt-0.5">Continuous monitoring under JUIT Regulation clause 4.2. Examination hall tickets require ≥${simTarget}% aggregate attendance.</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" id="btn-set-user-batch" class="px-3 py-1.5 rounded-xl ${isSavedActive ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-surface-container-high hover:bg-surface-container-highest text-primary border border-white/[0.08]'} text-xs font-semibold transition-all cursor-pointer shadow-sm">
              ${isSavedActive ? '✓ Your Active Hub Batch' : '★ Set as My Active Batch'}
            </button>
            <a href="#timetable" class="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold transition-all shadow-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">calendar_month</span>
              <span>Batch Timetable</span>
            </a>
          </div>
        </div>

        <!-- 4 Metric Cards Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Metric 1: Percent & Status -->
          <div class="p-3.5 rounded-xl bg-surface-container border border-white/[0.06] flex flex-col justify-between space-y-2">
            <span class="text-[11px] font-mono text-on-surface-variant font-semibold uppercase">Attendance Standing</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-extrabold font-mono" style="color: ${heroTextColor};">${activeMetrics.percent.toFixed(1)}%</span>
            </div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start ${activeMetrics.status === 'safe' ? 'bg-emerald-500/20 text-emerald-400' : (activeMetrics.status === 'borderline' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-400')}">
              ${activeMetrics.statusLabel}
            </span>
          </div>

          <!-- Metric 2: Classes Attended -->
          <div class="p-3.5 rounded-xl bg-surface-container border border-white/[0.06] flex flex-col justify-between space-y-2">
            <span class="text-[11px] font-mono text-on-surface-variant font-semibold uppercase">Classes Attended</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl sm:text-3xl font-extrabold font-mono" style="color: ${heroTextColor};">${simAttended}</span>
              <span class="text-xs text-on-surface-variant font-mono">/ ${simConducted} held</span>
            </div>
            <div class="relative w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300" style="width: ${Math.min(100, activeMetrics.percent)}%; background: ${heroTextColor};"></div>
              <div class="absolute top-0 bottom-0 w-0.5 bg-white shadow-xs" style="left: ${simTarget}%;"></div>
            </div>
          </div>

          <!-- Metric 3: Scheduled Weekly Load -->
          <div class="p-3.5 rounded-xl bg-surface-container border border-white/[0.06] flex flex-col justify-between space-y-2">
            <span class="text-[11px] font-mono text-on-surface-variant font-semibold uppercase">Scheduled Weekly Load</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl sm:text-3xl font-extrabold font-mono text-on-surface">${activeBatchData.weekly}</span>
              <span class="text-xs text-on-surface-variant font-mono">hrs / week</span>
            </div>
            <div class="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant">
              <span class="px-1.5 py-0.5 rounded bg-surface-container-high">${activeBatchData.l}L</span>
              <span class="px-1.5 py-0.5 rounded bg-surface-container-high">${activeBatchData.t}T</span>
              <span class="px-1.5 py-0.5 rounded bg-surface-container-high">${activeBatchData.p}P</span>
            </div>
          </div>

          <!-- Metric 4: 80% Rule Requirement -->
          <div class="p-3.5 rounded-xl bg-surface-container border border-white/[0.06] flex flex-col justify-between space-y-2">
            <span class="text-[11px] font-mono text-on-surface-variant font-semibold uppercase">Rule Requirement</span>
            ${activeMetrics.status === 'safe' ? `
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">+${activeMetrics.safeBunks}</span>
                <span class="text-xs text-emerald-400 font-mono">safe bunks</span>
              </div>
              <span class="text-[11px] text-emerald-400 font-medium">Safe to miss up to ${activeMetrics.safeBunks} classes</span>
            ` : `
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400">${activeMetrics.consecutiveNeeded}</span>
                <span class="text-xs text-rose-400 font-mono">needed</span>
              </div>
              <span class="text-[11px] text-rose-400 font-medium">Attend next ${activeMetrics.consecutiveNeeded} consecutive classes</span>
            `}
          </div>
        </div>

        <!-- Advisory Banner -->
        <div class="p-3.5 rounded-xl border flex items-start gap-3 ${activeMetrics.status === 'safe' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : (activeMetrics.status === 'borderline' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-200')}">
          <span class="text-xl shrink-0">${activeMetrics.status === 'safe' ? '🛡️' : (activeMetrics.status === 'borderline' ? '⚠️' : '🚨')}</span>
          <div class="min-w-0 flex-1 text-xs leading-relaxed">
            <strong class="font-bold block mb-0.5">${activeMetrics.status === 'safe' ? 'Compliant with JUIT Attendance Mandate' : (activeMetrics.status === 'borderline' ? 'Warning: Borderline Attendance Range' : 'Critical Debarment Warning')}</strong>
            <span>${activeMetrics.summaryText}</span>
          </div>
        </div>

        <!-- WHAT-IF ATTENDANCE SIMULATOR WITH EXACT AMOUNT INPUTS -->
        <div class="p-4 rounded-xl bg-surface-container/60 border border-white/[0.06] space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[18px]">tune</span>
              <span class="text-xs font-bold text-on-surface uppercase tracking-wider">What-If Attendance Simulator: Type Exact Amounts</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" class="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary text-[11px] font-semibold transition-colors cursor-pointer" id="btn-sim-preset-80">Target 80%</button>
              <button type="button" class="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary text-[11px] font-semibold transition-colors cursor-pointer" id="btn-sim-preset-75">Target 75%</button>
              <button type="button" class="btn-sim-action px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-error/20 hover:text-error text-on-surface-variant text-[11px] font-semibold transition-colors cursor-pointer" id="btn-sim-reset">Reset</button>
            </div>
          </div>

          <!-- Exact Inputs Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label class="text-[11px] text-on-surface-variant block mb-1 font-medium">Target Attendance %</label>
              <div class="relative">
                <input type="number" id="sim-target-percent-input" min="50" max="100" step="1" value="${simTarget}" class="w-full h-9 px-3 pr-7 bg-surface-container rounded-lg font-mono text-xs text-on-surface border border-white/[0.08] focus:border-primary outline-none" />
                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-on-surface-variant">%</span>
              </div>
            </div>
            <div>
              <label class="text-[11px] text-secondary block mb-1 font-medium">Future Classes to Attend</label>
              <div class="flex items-center gap-1">
                <input type="number" id="sim-attend-count-input" min="0" max="100" step="1" value="${this.batchSimulation.deltaAttended || 0}" class="w-full h-9 px-3 bg-surface-container rounded-lg font-mono text-xs text-secondary border border-white/[0.08] focus:border-secondary outline-none" />
                <button type="button" class="btn-sim-action h-9 px-2 rounded-lg bg-secondary/15 hover:bg-secondary/25 text-secondary text-xs font-bold" id="btn-sim-attend-plus" title="+1">+1</button>
              </div>
            </div>
            <div>
              <label class="text-[11px] text-rose-400 block mb-1 font-medium">Future Classes to Miss</label>
              <div class="flex items-center gap-1">
                <input type="number" id="sim-miss-count-input" min="0" max="100" step="1" value="${this.batchSimulation.deltaMissed || 0}" class="w-full h-9 px-3 bg-surface-container rounded-lg font-mono text-xs text-rose-400 border border-white/[0.08] focus:border-rose-400 outline-none" />
                <button type="button" class="btn-sim-action h-9 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold" id="btn-sim-miss-plus" title="+1">+1</button>
              </div>
            </div>
            <div>
              <label class="text-[11px] text-on-surface-variant block mb-1 font-medium">Base Attended / Held</label>
              <div class="flex items-center gap-1">
                <input type="number" id="sim-base-attended-input" min="0" max="300" step="1" value="${baseAttended}" class="w-1/2 h-9 px-2 bg-surface-container rounded-lg font-mono text-xs text-on-surface border border-white/[0.08] outline-none text-center" title="Base Attended" />
                <span class="text-on-surface-variant font-mono text-xs">/</span>
                <input type="number" id="sim-base-conducted-input" min="1" max="300" step="1" value="${baseConducted}" class="w-1/2 h-9 px-2 bg-surface-container rounded-lg font-mono text-xs text-on-surface border border-white/[0.08] outline-none text-center" title="Base Conducted" />
              </div>
            </div>
          </div>
          <div class="text-[11px] font-mono text-on-surface-variant flex items-center justify-between pt-1 border-t border-white/[0.04] flex-wrap gap-2">
            <span>💡 Real-time dynamic recalculation: type any exact amount above to project your standing instantly.</span>
            <span class="text-primary font-semibold" id="sim-active-summary-tag">Simulated Standing: ${activeMetrics.percent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <!-- ALL BATCHES MATRIX TABLE SECTION -->
      <div class="rounded-2xl bg-surface-container-low border border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="font-headline-sm text-base sm:text-lg text-on-surface font-bold">All Batches Live Attendance Matrix</h3>
            <p class="font-body-sm text-xs text-on-surface-variant mt-0.5">Real-time compliance status for all 16 batches under the ${simTarget}% university mandate.</p>
          </div>

          <!-- Filters Row -->
          <div class="matrix-filter-controls flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1 p-1 rounded-xl bg-surface-container border border-white/[0.04]">
              <button type="button" class="filter-pill px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${this.batchFilter === 'all' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="all">All (${totalBatches})</button>
              <button type="button" class="filter-pill px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${this.batchFilter === 'safe' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="safe">Safe ≥${simTarget}% (${safeCount})</button>
              <button type="button" class="filter-pill px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${this.batchFilter === 'borderline' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="borderline">Borderline (${borderlineCount})</button>
              <button type="button" class="filter-pill px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${this.batchFilter === 'critical' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="critical">Debar Risk (${criticalCount})</button>
            </div>
            <div class="relative">
              <input type="text" id="batch-matrix-search" placeholder="Search batch..." value="${this.batchSearchQuery}" class="h-9 pl-8 pr-3 bg-surface-container rounded-xl text-xs font-mono text-on-surface border border-white/[0.06] outline-none w-36 sm:w-44 focus:border-primary" />
              <span class="material-symbols-outlined text-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-white/[0.06] bg-surface-container/20">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-white/[0.08] bg-surface-container/60 text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
                <th class="p-3 font-semibold">Batch & Stream</th>
                <th class="p-3 font-semibold">Department</th>
                <th class="p-3 font-semibold">Weekly Load</th>
                <th class="p-3 font-semibold">Attended / Total</th>
                <th class="p-3 font-semibold min-w-[140px]">Attendance %</th>
                <th class="p-3 font-semibold">Status</th>
                <th class="p-3 font-semibold">Requirement</th>
                <th class="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              ${matrixRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindBatchAttendanceEvents();
  },

  bindBatchAttendanceEvents() {
    // Batch Chips Click
    document.querySelectorAll('.batch-select-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const batchCode = chip.dataset.batch;
        this.activeBatch = batchCode;
        this.batchSimulation.deltaAttended = 0;
        this.batchSimulation.deltaMissed = 0;
        this.batchSimulation.manualAttended = null;
        this.batchSimulation.manualConducted = null;
        this.renderBatchAttendanceIndicator();
      });
    });

    // Inspect buttons in matrix table
    document.querySelectorAll('.btn-inspect-batch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const batchCode = btn.dataset.batch;
        this.activeBatch = batchCode;
        this.batchSimulation.deltaAttended = 0;
        this.batchSimulation.deltaMissed = 0;
        this.batchSimulation.manualAttended = null;
        this.batchSimulation.manualConducted = null;
        this.renderBatchAttendanceIndicator();
        window.scrollTo({ top: 320, behavior: 'smooth' });
      });
    });

    // Matrix table row click
    document.querySelectorAll('.batch-matrix-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-inspect-batch')) return;
        const batchCode = row.dataset.batch;
        this.activeBatch = batchCode;
        this.batchSimulation.deltaAttended = 0;
        this.batchSimulation.deltaMissed = 0;
        this.batchSimulation.manualAttended = null;
        this.batchSimulation.manualConducted = null;
        this.renderBatchAttendanceIndicator();
        window.scrollTo({ top: 320, behavior: 'smooth' });
      });
    });

    // "Set as My Active Batch"
    const btnSetBatch = document.getElementById('btn-set-user-batch');
    if (btnSetBatch) {
      btnSetBatch.addEventListener('click', () => {
        localStorage.setItem('juit_selected_batch', this.activeBatch);
        if (window.TimetableController) {
          window.TimetableController.activeBatch = this.activeBatch;
          window.TimetableController.renderSchedule();
        }
        if (window.JUIT_PROFILE) {
          window.JUIT_PROFILE.batch = this.activeBatch;
          this.saveProfile();
        }
        const userBatchLabel = document.getElementById('sidebar-user-batch-label');
        if (userBatchLabel) {
          userBatchLabel.textContent = `B.Tech Sem 1 • ${this.activeBatch}`;
        }
        this.renderBatchAttendanceIndicator();
      });
    }

    // Simulation: Exact Numeric Inputs Dynamic Adjustment
    const handleExactInputs = () => {
      const targetInput = document.getElementById('sim-target-percent-input');
      const attendInput = document.getElementById('sim-attend-count-input');
      const missInput = document.getElementById('sim-miss-count-input');
      const baseAttInput = document.getElementById('sim-base-attended-input');
      const baseCondInput = document.getElementById('sim-base-conducted-input');

      const targetVal = parseFloat(targetInput?.value);
      const attendVal = parseInt(attendInput?.value, 10);
      const missVal = parseInt(missInput?.value, 10);
      const baseAttVal = parseInt(baseAttInput?.value, 10);
      const baseCondVal = parseInt(baseCondInput?.value, 10);

      this.batchSimulation.targetPercent = (!isNaN(targetVal) && targetVal >= 50 && targetVal <= 100) ? targetVal : 80;
      this.batchSimulation.deltaAttended = isNaN(attendVal) ? 0 : attendVal;
      this.batchSimulation.deltaMissed = isNaN(missVal) ? 0 : missVal;
      this.batchSimulation.manualAttended = isNaN(baseAttVal) ? null : baseAttVal;
      this.batchSimulation.manualConducted = isNaN(baseCondVal) ? null : baseCondVal;

      this.renderBatchAttendanceIndicator();
    };

    ['sim-target-percent-input', 'sim-attend-count-input', 'sim-miss-count-input', 'sim-base-attended-input', 'sim-base-conducted-input'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', handleExactInputs);
        el.addEventListener('change', handleExactInputs);
      }
    });

    // Preset 80% / 75%
    document.getElementById('btn-sim-preset-80')?.addEventListener('click', () => {
      this.batchSimulation.targetPercent = 80;
      this.renderBatchAttendanceIndicator();
    });
    document.getElementById('btn-sim-preset-75')?.addEventListener('click', () => {
      this.batchSimulation.targetPercent = 75;
      this.renderBatchAttendanceIndicator();
    });

    // Simulation: +1 Attend
    const btnSimAttend = document.getElementById('btn-sim-attend-plus');
    if (btnSimAttend) {
      btnSimAttend.addEventListener('click', () => {
        this.batchSimulation.deltaAttended = (this.batchSimulation.deltaAttended || 0) + 1;
        this.renderBatchAttendanceIndicator();
      });
    }

    // Simulation: +1 Miss
    const btnSimMiss = document.getElementById('btn-sim-miss-plus');
    if (btnSimMiss) {
      btnSimMiss.addEventListener('click', () => {
        this.batchSimulation.deltaMissed = (this.batchSimulation.deltaMissed || 0) + 1;
        this.renderBatchAttendanceIndicator();
      });
    }

    // Simulation: Reset
    const btnSimReset = document.getElementById('btn-sim-reset');
    if (btnSimReset) {
      btnSimReset.addEventListener('click', () => {
        this.batchSimulation = { deltaAttended: 0, deltaMissed: 0, targetPercent: 80, manualAttended: null, manualConducted: null };
        this.renderBatchAttendanceIndicator();
      });
    }

    // Filter pills
    document.querySelectorAll('.matrix-filter-controls .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.batchFilter = pill.dataset.filter;
        this.renderBatchAttendanceIndicator();
      });
    });

    // Search box
    const searchInput = document.getElementById('batch-matrix-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.batchSearchQuery = e.target.value.trim();
        this.renderBatchAttendanceIndicator();
      });
    }
  },

  /* ================= FEATURE 2: PERSONAL COURSE TRACKER ================= */
  renderAttendanceTracker() {
    const container = document.getElementById('academics-attendance-container');
    if (!container) return;

    const profile = this.getProfile();
    let attendance = profile.attendance || {};
    let keys = Object.keys(attendance);

    if (keys.length === 0) {
      this.seedInitialCourses();
      attendance = this.getProfile().attendance || {};
      keys = Object.keys(attendance);
    }

    let totalAttended = 0;
    let totalConducted = 0;
    let totalSafeBunks = 0;
    const T = this.targetPercent;

    const courseCardsHtml = keys.map(code => {
      const c = attendance[code];
      const attended = Math.max(0, c.present || 0);
      const missed = Math.max(0, c.absent || 0);
      const total = attended + missed;
      totalAttended += attended;
      totalConducted += total;

      const currentPct = total > 0 ? ((attended / total) * 100) : 100;
      const pctFormatted = currentPct.toFixed(1);

      let adviceHtml = '';
      let statusColor = '#10b981';
      let statusBadge = '';
      let isSafe = currentPct >= T;

      if (!isSafe) {
        statusColor = '#ef4444';
        const needed = Math.ceil((T * total - 100 * attended) / (100 - T));
        statusBadge = `<span class="px-2 py-0.5 rounded-full bg-error/20 text-error text-[11px] font-semibold">Debar Risk</span>`;
        adviceHtml = `
          <div class="p-2.5 rounded-xl bg-error/10 border border-error/20 text-xs text-error flex items-start gap-2">
            <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5">warning</span>
            <span>Must attend next <strong class="font-bold underline">${needed} consecutive ${needed === 1 ? 'class' : 'classes'}</strong> to clear the ${T}% cutoff.</span>
          </div>
        `;
      } else {
        const canBunk = Math.floor((100 * attended - T * total) / T);
        totalSafeBunks += canBunk;
        if (canBunk > 0) {
          statusBadge = `<span class="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[11px] font-semibold">Safe (+${canBunk} Bunks)</span>`;
          adviceHtml = `
            <div class="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-xs text-secondary flex items-start gap-2">
              <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5">verified_user</span>
              <span>On track! You can safely miss up to <strong class="font-bold">${canBunk} ${canBunk === 1 ? 'class' : 'classes'}</strong> and maintain ≥${T}%.</span>
            </div>
          `;
        } else {
          statusColor = '#f59e0b';
          statusBadge = `<span class="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[11px] font-semibold">Cutoff Boundary</span>`;
          adviceHtml = `
            <div class="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2">
              <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
              <span>Right on the ${T}% cutoff. Missing the next scheduled class will drop below threshold.</span>
            </div>
          `;
        }
      }

      const ifAttend1 = ((attended + 1) / (total + 1) * 100).toFixed(1);
      const ifMiss1 = (attended / (total + 1) * 100).toFixed(1);

      return `
        <div class="rounded-2xl bg-surface-container-low hover:bg-surface-container/70 p-4 sm:p-5 border border-white/[0.06] shadow-sm transition-all flex flex-col justify-between gap-4" data-course-code="${code}">
          <!-- Course Card Header -->
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-md bg-surface-container-highest text-on-surface font-mono text-[11px] font-bold border border-white/[0.06]">${code}</span>
                ${statusBadge}
              </div>
              <h3 class="font-headline-sm text-sm sm:text-base text-on-surface font-bold truncate">${c.name}</h3>
            </div>
            <div class="text-right shrink-0">
              <span class="font-mono text-2xl font-extrabold tracking-tight" style="color: ${statusColor};">${pctFormatted}%</span>
              <span class="block text-[11px] text-on-surface-variant">Attendance</span>
            </div>
          </div>

          <!-- Progress Track with 80% Marker -->
          <div class="space-y-1">
            <div class="relative w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${Math.min(100, currentPct)}%; background: ${statusColor};"></div>
              <div class="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-sm" style="left: ${T}%;" title="${T}% Target Threshold"></div>
            </div>
            <div class="flex items-center justify-between text-[10px] font-mono text-on-surface-variant">
              <span>0%</span>
              <span class="text-on-surface font-bold">${T}% Target</span>
              <span>100%</span>
            </div>
          </div>

          <!-- Dual Interactive Stepper Controls -->
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Present Stepper -->
            <div class="p-2.5 rounded-xl bg-surface-container border border-white/[0.04] flex flex-col justify-between gap-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-medium text-secondary">Attended</span>
                <span class="font-mono text-base font-bold text-on-surface">${attended}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button type="button" class="btn-step w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-sm flex items-center justify-center transition-colors cursor-pointer" data-action="dec-present" data-code="${code}" title="Subtract attended class">−</button>
                <button type="button" class="btn-step flex-1 h-8 rounded-lg bg-secondary/20 hover:bg-secondary/30 text-secondary font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1" data-action="inc-present" data-code="${code}">+1 Present</button>
              </div>
            </div>

            <!-- Absent Stepper -->
            <div class="p-2.5 rounded-xl bg-surface-container border border-white/[0.04] flex flex-col justify-between gap-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-medium text-error">Missed</span>
                <span class="font-mono text-base font-bold text-on-surface">${missed}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button type="button" class="btn-step w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-sm flex items-center justify-center transition-colors cursor-pointer" data-action="dec-absent" data-code="${code}" title="Subtract missed class">−</button>
                <button type="button" class="btn-step flex-1 h-8 rounded-lg bg-error/20 hover:bg-error/30 text-error font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1" data-action="inc-absent" data-code="${code}">+1 Absent</button>
              </div>
            </div>
          </div>

          <!-- Total Conducted & Manual Edit Link -->
          <div class="flex items-center justify-between text-xs text-on-surface-variant border-t border-white/[0.04] pt-2.5">
            <span>Total Conducted: <strong class="text-on-surface font-bold">${total} classes</strong></span>
            <button type="button" class="btn-edit-course-modal text-primary hover:text-primary-fixed font-medium flex items-center gap-1 cursor-pointer transition-colors" data-code="${code}">
              <span class="material-symbols-outlined text-[14px]">edit</span>
              <span>Edit Numbers</span>
            </button>
          </div>

          <!-- Advice Banner -->
          ${adviceHtml}

          <!-- Forecast Pills -->
          <div class="flex items-center justify-between gap-2 text-[11px] font-mono text-on-surface-variant bg-surface-container/40 px-3 py-1.5 rounded-xl">
            <span>If attended next: <strong class="text-secondary">${ifAttend1}%</strong></span>
            <span>If missed next: <strong class="text-error">${ifMiss1}%</strong></span>
          </div>
        </div>
      `;
    }).join('');

    const aggregatePct = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : 100;
    const isSafeAggregate = parseFloat(aggregatePct) >= T;

    container.innerHTML = `
      <!-- AGGREGATE SUMMARY HERO CARD -->
      <div class="rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-low p-5 sm:p-6 border border-white/[0.08] shadow-md space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-semibold uppercase tracking-wider text-on-surface-variant">Aggregate Semester Standing</span>
              <span class="px-2.5 py-0.5 rounded-full ${isSafeAggregate ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'} text-xs font-bold">
                ${isSafeAggregate ? '✓ Safe Compliance' : '⚠️ Shortage Warning'}
              </span>
            </div>
            <div class="flex items-baseline gap-3">
              <span class="font-mono text-4xl sm:text-5xl font-extrabold" style="color: ${isSafeAggregate ? '#10b981' : '#ef4444'};">${aggregatePct}%</span>
              <span class="text-xs sm:text-sm text-on-surface-variant font-medium">Overall Attendance (${totalAttended} of ${totalConducted} classes attended)</span>
            </div>
          </div>

          <!-- Target Rule Selector & Safe Bunks -->
          <div class="flex flex-col sm:items-end gap-2">
            <div class="inline-flex p-1 bg-surface-container-high rounded-xl border border-white/[0.06] shadow-inner">
              <button type="button" class="btn-target-toggle px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${T === 80 ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-target="80">
                80% Rule (Official)
              </button>
              <button type="button" class="btn-target-toggle px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${T === 75 ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-target="75">
                75% Rule (Relaxed)
              </button>
            </div>
            <span class="text-xs text-secondary font-mono font-medium">
              🛡️ +${totalSafeBunks} total safe bunks available across subjects
            </span>
          </div>
        </div>

        <!-- Overall Progress Bar -->
        <div class="relative w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500" style="width: ${Math.min(100, parseFloat(aggregatePct))}%; background: ${isSafeAggregate ? '#10b981' : '#ef4444'};"></div>
          <div class="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm" style="left: ${T}%;" title="${T}% Target Threshold"></div>
        </div>
      </div>

      <!-- COURSE CARDS RESPONSIVE GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="academics-cards-grid">
        ${courseCardsHtml}
      </div>
    `;

    this.bindAttendanceControls();
    this.bindModalListeners();
  },

  bindAttendanceControls() {
    // Target Rule Toggles
    document.querySelectorAll('.btn-target-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        this.targetPercent = parseInt(btn.dataset.target, 10);
        this.renderAttendanceTracker();
      });
    });

    // Reset button in header and card
    const resetBtns = [
      document.getElementById('btn-reset-attendance-all'),
      document.getElementById('btn-reset-attendance')
    ];
    resetBtns.forEach(btn => {
      btn?.addEventListener('click', () => {
        if (confirm('Reset all course attendance to standard semester starting baseline?')) {
          this.seedInitialCourses();
        }
      });
    });

    // Add Subject buttons
    const addBtns = [
      document.getElementById('btn-add-subject-modal'),
      document.getElementById('btn-add-personal-main'),
      document.getElementById('btn-add-custom-course')
    ];
    addBtns.forEach(btn => {
      btn?.addEventListener('click', () => {
        this.openAddCourseModal();
      });
    });

    // Stepper buttons
    document.querySelectorAll('.btn-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const action = btn.dataset.action;
        const prof = this.getProfile();
        if (prof && prof.attendance && prof.attendance[code]) {
          const c = prof.attendance[code];
          if (action === 'inc-present') c.present = (c.present || 0) + 1;
          if (action === 'dec-present') c.present = Math.max(0, (c.present || 0) - 1);
          if (action === 'inc-absent') c.absent = (c.absent || 0) + 1;
          if (action === 'dec-absent') c.absent = Math.max(0, (c.absent || 0) - 1);
          this.saveProfile();
          this.renderAttendanceTracker();
        }
      });
    });

    // Edit exact numbers buttons
    document.querySelectorAll('.btn-edit-course-modal, .btn-edit-counts').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        this.openEditCourseModal(code);
      });
    });
  },

  bindModalListeners() {
    const modal = document.getElementById('modal-attendance-edit');
    const form = document.getElementById('form-attendance-edit');
    const btnClose = document.getElementById('btn-close-course-modal');
    const btnCancel = document.getElementById('btn-cancel-course-modal');

    if (!modal || modal._boundListeners) return;
    modal._boundListeners = true;

    btnClose?.addEventListener('click', () => this.closeCourseModal());
    btnCancel?.addEventListener('click', () => this.closeCourseModal());

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('input-course-code')?.value.trim().toUpperCase();
      const name = document.getElementById('input-course-name')?.value.trim();
      const present = Math.max(0, parseInt(document.getElementById('input-course-present')?.value, 10) || 0);
      const absent = Math.max(0, parseInt(document.getElementById('input-course-absent')?.value, 10) || 0);

      if (!code || !name) return;

      window.JUIT_PROFILE = window.JUIT_PROFILE || {};
      window.JUIT_PROFILE.attendance = window.JUIT_PROFILE.attendance || {};
      window.JUIT_PROFILE.attendance[code] = {
        name: name,
        present: present,
        absent: absent
      };

      this.saveProfile();
      this.closeCourseModal();
      this.renderAttendanceTracker();
    });
  },

  openAddCourseModal() {
    const modal = document.getElementById('modal-attendance-edit');
    if (!modal) return;
    document.getElementById('modal-course-title').textContent = 'Add New Subject';
    document.getElementById('input-course-code').value = '';
    document.getElementById('input-course-code').readOnly = false;
    document.getElementById('input-course-name').value = '';
    document.getElementById('input-course-present').value = '20';
    document.getElementById('input-course-absent').value = '2';
    modal.classList.remove('hidden');
  },

  openEditCourseModal(code) {
    const modal = document.getElementById('modal-attendance-edit');
    if (!modal) return;
    const c = this.getProfile().attendance?.[code];
    if (!c) return;

    document.getElementById('modal-course-title').textContent = `Edit Attendance: ${c.name}`;
    document.getElementById('input-course-code').value = code;
    document.getElementById('input-course-code').readOnly = true;
    document.getElementById('input-course-name').value = c.name;
    document.getElementById('input-course-present').value = c.present || 0;
    document.getElementById('input-course-absent').value = c.absent || 0;
    modal.classList.remove('hidden');
  },

  closeCourseModal() {
    const modal = document.getElementById('modal-attendance-edit');
    if (modal) modal.classList.add('hidden');
  },

  seedInitialCourses() {
    window.JUIT_PROFILE = window.JUIT_PROFILE || {};
    window.JUIT_PROFILE.attendance = {
      '25B11CI112': { name: 'Software Development Fundamentals (SDF)', present: 22, absent: 2 },
      '25B11MA113': { name: 'Mathematics-I (Calculus & Linear Algebra)', present: 19, absent: 3 },
      '25B11PH111': { name: 'Engineering Physics', present: 18, absent: 2 },
      '25B11EC111': { name: 'Basic Electronics (ECE)', present: 21, absent: 3 },
      '25B11HS111': { name: 'English Communication Skills', present: 13, absent: 1 },
      '25B17CI172': { name: 'SDF Laboratory', present: 8, absent: 1 },
      '25B17PH171': { name: 'Physics Laboratory', present: 7, absent: 1 }
    };
    this.saveProfile();
    this.renderAttendanceTracker();
  },

  renderCourseCards() {
    const container = document.getElementById('academics-courses-list');
    if (!container) return;

    const courses = [
      { code: '25B11CI112', name: 'Software Development Fundamentals', credits: 4, faculty: 'FSL / CSE Dept', type: 'Core Theory', classesWeek: 4 },
      { code: '25B11MA113', name: 'Mathematics-I (Calculus & Linear Algebra)', credits: 4, faculty: 'MAT_RS7 / Maths Dept', type: 'Core Theory', classesWeek: 4 },
      { code: '25B11PH111', name: 'Engineering Physics', credits: 4, faculty: 'PHY_F1 / Physics Dept', type: 'Core Theory', classesWeek: 4 },
      { code: '25B11HS111', name: 'English Communication Skills', credits: 3, faculty: 'DLR / HSS Dept', type: 'Core Theory', classesWeek: 3 },
      { code: '25B17CI172', name: 'SDF Laboratory', credits: 1.5, faculty: 'CSE Lab Instructors', type: 'Practical Lab', classesWeek: 2 },
      { code: '25B17PH171', name: 'Physics Laboratory', credits: 1.5, faculty: 'Physics Lab Instructors', type: 'Practical Lab', classesWeek: 2 },
      { code: '25B17GE171', name: 'Engineering Workshop', credits: 1.5, faculty: 'Mechanical Workshop', type: 'Practical Lab', classesWeek: 2 }
    ];

    container.innerHTML = courses.map(c => `
      <div class="dash-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <span class="hub-badge">${c.code}</span>
          <span class="kbd-shortcut" style="color: var(--accent-primary);">${c.credits} Credits</span>
        </div>
        <h4 style="font-size: 1.05rem; margin-bottom: 6px;">${c.name}</h4>
        <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 10px;">
          👨‍🏫 Faculty: <strong>${c.faculty}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
          <span>Type: <strong>${c.type}</strong></span>
          <span>${c.classesWeek} hrs/week</span>
        </div>
      </div>
    `).join('');
  },

  /* ================= FEATURE 3: CGPA & SGPA CHECKER ================= */
  calculateSgpa() {
    let totalCredits = 0;
    let totalPoints = 0;

    this.cgpaCourses.forEach(c => {
      const credits = parseFloat(c.credits) || 0;
      const gradeObj = this.gradeScale[c.grade] || { points: 0 };
      totalCredits += credits;
      totalPoints += (credits * gradeObj.points);
    });

    const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    const equivalentPercentage = sgpa > 0.75 ? ((sgpa - 0.75) * 10).toFixed(1) : (sgpa * 10).toFixed(1);

    let division = 'Second Division';
    let divisionColor = '#f59e0b';
    if (sgpa >= 8.5) {
      division = 'First Division with Distinction 🌟';
      divisionColor = '#00e5ff';
    } else if (sgpa >= 6.5) {
      division = 'First Division 👍';
      divisionColor = '#10b981';
    } else if (sgpa >= 5.0) {
      division = 'Second Division';
      divisionColor = '#f59e0b';
    } else {
      division = 'Academic Warning / Marginal Pass';
      divisionColor = '#ef4444';
    }

    return {
      sgpa: sgpa.toFixed(2),
      rawSgpa: sgpa,
      totalCredits: totalCredits.toFixed(1),
      totalPoints: totalPoints.toFixed(1),
      equivalentPercentage: equivalentPercentage,
      division: division,
      divisionColor: divisionColor
    };
  },

  calculateTargetCgpa(pastCredits, pastCgpa, targetCgpa, currentCredits) {
    const totalCredits = pastCredits + currentCredits;
    if (currentCredits <= 0) return { requiredSgpa: '0.00', feasibility: 'error', message: 'Current credits must be greater than zero.' };

    const targetTotalPoints = targetCgpa * totalCredits;
    const pastTotalPoints = pastCgpa * pastCredits;
    const requiredSemesterPoints = targetTotalPoints - pastTotalPoints;
    const requiredSgpa = requiredSemesterPoints / currentCredits;

    let feasibility = 'achievable';
    let message = '';

    if (requiredSgpa > 10.0) {
      feasibility = 'impossible';
      const gap = targetTotalPoints - pastTotalPoints;
      const extraTerms = Math.ceil(gap / (9.0 * currentCredits));
      message = `⚠️ Target mathematically unreachable in a single semester (requires SGPA <strong>${requiredSgpa.toFixed(2)}</strong> > 10.0). At a strong 9.0 SGPA pace, you would need approximately <strong>${Math.max(2, extraTerms)} semesters</strong> to reach ${targetCgpa.toFixed(2)} CGPA.`;
    } else if (requiredSgpa < 4.0) {
      feasibility = 'secured';
      message = `🛡️ Target Secured! You only need a minimum passing SGPA of 4.00 (or ${Math.max(0, requiredSgpa).toFixed(2)}) to achieve your ${targetCgpa.toFixed(2)} target.`;
    } else {
      feasibility = 'achievable';
      message = `🎯 Target is Achievable! You need an SGPA of <strong>${requiredSgpa.toFixed(2)}</strong> in this ${currentCredits} credit semester to achieve your target CGPA of <strong>${targetCgpa.toFixed(2)}</strong>.`;
    }

    return {
      requiredSgpa: requiredSgpa.toFixed(2),
      feasibility: feasibility,
      message: message
    };
  },

  renderCgpaChecker() {
    const container = document.getElementById('academics-cgpa-container');
    if (!container) return;

    const sgpaResult = this.calculateSgpa();

    // Default inputs for Target CGPA Predictor
    const defaultPastCredits = 20;
    const defaultPastCgpa = 7.80;
    const defaultTargetCgpa = 8.50;
    const currentCreditsNum = parseFloat(sgpaResult.totalCredits) || 19.5;
    const targetResult = this.calculateTargetCgpa(defaultPastCredits, defaultPastCgpa, defaultTargetCgpa, currentCreditsNum);

    // Course rows for SGPA table
    const courseRowsHtml = this.cgpaCourses.map(c => {
      const gradeOptions = Object.keys(this.gradeScale).map(g => {
        const isSelected = c.grade === g;
        return `<option value="${g}" ${isSelected ? 'selected' : ''}>${g} (${this.gradeScale[g].points.toFixed(1)})</option>`;
      }).join('');

      const gradeObj = this.gradeScale[c.grade] || { points: 0 };
      const pointsEarned = ((parseFloat(c.credits) || 0) * gradeObj.points).toFixed(1);

      return `
        <tr class="cgpa-course-row" data-course-id="${c.id}">
          <td>
            <div style="font-weight: 700; color: #fff;">${c.name}</div>
            <div style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--text-muted);">${c.code}</div>
          </td>
          <td>
            <input type="number" step="0.5" min="1" max="6" value="${c.credits}" class="input-credit-styled" data-course-id="${c.id}" />
          </td>
          <td>
            <select class="select-grade-styled" data-course-id="${c.id}">
              ${gradeOptions}
            </select>
          </td>
          <td>
            <strong style="color: ${gradeObj.color};">${gradeObj.points.toFixed(1)}</strong>
          </td>
          <td>
            <span style="font-weight: 700; color: var(--text-primary);">${pointsEarned}</span>
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn-micro-del" data-course-id="${c.id}" title="Remove course">×</button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <!-- SGPA & TARGET PREDICTOR TOP DUAL CARDS -->
      <div class="cgpa-top-grid">
        <!-- Card 1: Calculated SGPA Showcase -->
        <div class="cgpa-showcase-card">
          <div class="cgpa-showcase-header">
            <div>
              <span class="hub-pill-tag">OFFICIAL 10-POINT SCALE</span>
              <h3 style="font-size: 1.2rem; margin: 4px 0 2px; color: #fff;">Projected Semester SGPA</h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Calculated from registered credits & course letter grades.</p>
            </div>
            <div class="cgpa-badge-ring">
              <span class="cgpa-big-number">${sgpaResult.sgpa}</span>
              <span class="cgpa-scale-label">/ 10.00</span>
            </div>
          </div>

          <div class="cgpa-details-row">
            <div class="cgpa-stat-box">
              <div class="stat-box-label">Total Credits</div>
              <div class="stat-box-val">${sgpaResult.totalCredits}</div>
            </div>
            <div class="cgpa-stat-box">
              <div class="stat-box-label">Earned Points</div>
              <div class="stat-box-val">${sgpaResult.totalPoints}</div>
            </div>
            <div class="cgpa-stat-box">
              <div class="stat-box-label">JUIT Percentage</div>
              <div class="stat-box-val" style="color: #00e5ff;">${sgpaResult.equivalentPercentage}%</div>
            </div>
          </div>

          <div class="cgpa-division-banner" style="border-color: ${sgpaResult.divisionColor};">
            <span class="division-title" style="color: ${sgpaResult.divisionColor};">Classification:</span>
            <span style="font-weight: 700; color: #fff; font-size: 0.88rem;">${sgpaResult.division}</span>
          </div>

          <!-- Quick Presets -->
          <div class="cgpa-presets-row">
            <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Quick Presets:</span>
            <button type="button" class="btn-preset-grade" data-preset="A+">All A+ (10.0)</button>
            <button type="button" class="btn-preset-grade" data-preset="A">All A (9.0)</button>
            <button type="button" class="btn-preset-grade" data-preset="B+">All B+ (8.0)</button>
            <button type="button" class="btn-preset-grade" data-preset="B">All B (7.0)</button>
          </div>
        </div>

        <!-- Card 2: Cumulative CGPA Target Predictor -->
        <div class="cgpa-showcase-card">
          <div class="cgpa-showcase-header">
            <div>
              <span class="hub-pill-tag">STRATEGIC GOAL PLANNER</span>
              <h3 style="font-size: 1.2rem; margin: 4px 0 2px; color: #fff;">Cumulative CGPA Target Predictor</h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Type your exact targets and observe required SGPA and projected CGPA adjust in real time.</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="cgpa-badge-ring target-ring">
                <span class="cgpa-big-number" id="pred-result-sgpa" style="color: #8b5cf6;">${targetResult.requiredSgpa}</span>
                <span class="cgpa-scale-label">Req SGPA</span>
              </div>
            </div>
          </div>

          <div class="target-predictor-inputs">
            <div class="pred-input-group">
              <label>Completed Credits (Prior)</label>
              <input type="number" id="pred-past-credits" value="${defaultPastCredits}" min="0" max="160" step="1" class="select-styled" style="width: 100%; font-size: 0.85rem;" />
            </div>
            <div class="pred-input-group">
              <label>Current Cumulative CGPA</label>
              <input type="number" id="pred-past-cgpa" value="${defaultPastCgpa.toFixed(2)}" min="0" max="10" step="0.01" class="select-styled" style="width: 100%; font-size: 0.85rem;" />
            </div>
            <div class="pred-input-group">
              <label>Desired Target CGPA</label>
              <input type="number" id="pred-target-cgpa" value="${defaultTargetCgpa.toFixed(2)}" min="0" max="10" step="0.01" class="select-styled" style="width: 100%; font-size: 0.85rem;" />
            </div>
            <div class="pred-input-group">
              <label>Current Term Credits</label>
              <input type="number" id="pred-current-credits" value="${currentCreditsNum}" min="1" max="30" step="0.5" class="select-styled" style="width: 100%; font-size: 0.85rem;" />
            </div>
            <div class="pred-input-group">
              <label>Simulate Term SGPA</label>
              <input type="number" id="pred-expected-sgpa" value="${sgpaResult.sgpa}" min="0" max="10" step="0.05" class="select-styled" style="width: 100%; font-size: 0.85rem;" />
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-surface-container/60 border border-white/[0.04] flex items-center justify-between text-xs font-mono">
            <span class="text-on-surface-variant">Projected Cumulative CGPA:</span>
            <strong id="pred-result-projected-cgpa" class="text-secondary font-bold text-sm">
              ${(((defaultPastCgpa * defaultPastCredits) + (parseFloat(sgpaResult.sgpa) * currentCreditsNum)) / (defaultPastCredits + currentCreditsNum)).toFixed(2)}
            </strong>
          </div>

          <div class="target-diagnosis-banner" id="pred-diagnosis-banner">
            <div id="pred-diagnosis-text" style="font-size: 0.84rem; line-height: 1.45;">
              ${targetResult.message}
            </div>
          </div>
        </div>
      </div>

      <!-- COURSE GRADE TABLE -->
      <div class="cgpa-courses-card">
        <div class="cgpa-courses-header">
          <div>
            <h3 style="font-size: 1.15rem; margin: 0 0 4px; color: #fff;">Semester Course Grade Ledger</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Adjust credits or select anticipated letter grades to observe real-time SGPA shifts.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-secondary" id="btn-add-cgpa-course" style="font-size: 0.82rem; padding: 6px 14px;">+ Add Custom Subject</button>
            <button type="button" class="btn-secondary" id="btn-reset-cgpa-courses" style="font-size: 0.82rem; padding: 6px 14px;">↺ Reset Defaults</button>
          </div>
        </div>

        <div class="table-responsive-wrapper">
          <table class="cgpa-table">
            <thead>
              <tr>
                <th>Subject Name & Code</th>
                <th style="width: 110px;">Credits</th>
                <th style="width: 150px;">Letter Grade</th>
                <th style="width: 110px;">Grade Point</th>
                <th style="width: 110px;">Credit Points</th>
                <th style="width: 60px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${courseRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- JUIT 10-POINT GRADING SCALE ACCORDION / REFERENCE -->
      <div class="juit-grading-ref-card">
        <div class="ref-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined" style="font-size: 18px; color: var(--accent-primary);">school</span>
            <span style="font-weight: 700; font-size: 0.95rem; color: #fff;">Official JUIT 10-Point Letter Grading Scheme Reference</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Jaypee University of Information Technology Ordinance</span>
        </div>
        <div class="grading-chips-grid">
          <div class="grade-chip"><span class="chip-g">A+</span><span class="chip-p">10.0</span><span class="chip-d">Outstanding (90–100%)</span></div>
          <div class="grade-chip"><span class="chip-g">A</span><span class="chip-p">9.0</span><span class="chip-d">Excellent (80–89%)</span></div>
          <div class="grade-chip"><span class="chip-g">B+</span><span class="chip-p">8.0</span><span class="chip-d">Very Good (70–79%)</span></div>
          <div class="grade-chip"><span class="chip-g">B</span><span class="chip-p">7.0</span><span class="chip-d">Good (60–69%)</span></div>
          <div class="grade-chip"><span class="chip-g">C+</span><span class="chip-p">6.0</span><span class="chip-d">Average (50–59%)</span></div>
          <div class="grade-chip"><span class="chip-g">C</span><span class="chip-p">5.0</span><span class="chip-d">Below Average (40–49%)</span></div>
          <div class="grade-chip"><span class="chip-g">D</span><span class="chip-p">4.0</span><span class="chip-d">Marginal Pass (30–39%)</span></div>
          <div class="grade-chip"><span class="chip-g">F</span><span class="chip-p">0.0</span><span class="chip-d">Fail / Unsuccessful (<30%)</span></div>
        </div>
      </div>
    `;

    this.bindCgpaEvents();
  },

  bindCgpaEvents() {
    // Grade select changes
    document.querySelectorAll('.select-grade-styled').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const courseId = sel.dataset.courseId;
        const newGrade = sel.value;
        const course = this.cgpaCourses.find(c => c.id === courseId);
        if (course) {
          course.grade = newGrade;
          this.renderCgpaChecker();
        }
      });
    });

    // Credit input changes
    document.querySelectorAll('.input-credit-styled').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const courseId = inp.dataset.courseId;
        const newCredits = parseFloat(inp.value) || 1.0;
        const course = this.cgpaCourses.find(c => c.id === courseId);
        if (course) {
          course.credits = newCredits;
          this.renderCgpaChecker();
        }
      });
    });

    // Remove course
    document.querySelectorAll('.btn-micro-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = btn.dataset.courseId;
        this.cgpaCourses = this.cgpaCourses.filter(c => c.id !== courseId);
        this.renderCgpaChecker();
      });
    });

    // Quick Presets
    document.querySelectorAll('.btn-preset-grade').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetGrade = btn.dataset.preset;
        this.cgpaCourses.forEach(c => c.grade = targetGrade);
        this.renderCgpaChecker();
      });
    });

    // Add Course
    const btnAdd = document.getElementById('btn-add-cgpa-course');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const name = prompt('Enter Course Name (e.g. Artificial Intelligence):');
        if (!name) return;
        const code = prompt('Enter Course Code (e.g. 25B11CI511):') || 'CUSTOM';
        const credits = parseFloat(prompt('Course Credits (e.g. 3 or 4):', '3.0')) || 3.0;

        const newId = 'c_' + Date.now();
        this.cgpaCourses.push({
          id: newId,
          code: code.toUpperCase(),
          name: name,
          credits: credits,
          grade: 'A'
        });
        this.renderCgpaChecker();
      });
    }

    // Reset Defaults
    const btnReset = document.getElementById('btn-reset-cgpa-courses');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.cgpaCourses = [
          { id: 'c1', code: '25B11CI112', name: 'Software Development Fundamentals', credits: 4.0, grade: 'A+' },
          { id: 'c2', code: '25B11MA113', name: 'Mathematics-I (Calculus & Linear Algebra)', credits: 4.0, grade: 'A' },
          { id: 'c3', code: '25B11PH111', name: 'Engineering Physics', credits: 4.0, grade: 'B+' },
          { id: 'c4', code: '25B11HS111', name: 'English Communication Skills', credits: 3.0, grade: 'A' },
          { id: 'c5', code: '25B17CI172', name: 'SDF Laboratory', credits: 1.5, grade: 'A+' },
          { id: 'c6', code: '25B17PH171', name: 'Physics Laboratory', credits: 1.5, grade: 'A' },
          { id: 'c7', code: '25B17GE171', name: 'Engineering Workshop', credits: 1.5, grade: 'A' }
        ];
        this.renderCgpaChecker();
      });
    }

    // Target Predictor Live Inputs with Mutual Dynamic Adjustments
    const updateFromTarget = () => {
      const pastCredits = parseFloat(document.getElementById('pred-past-credits')?.value) || 0;
      const pastCgpa = parseFloat(document.getElementById('pred-past-cgpa')?.value) || 0;
      const targetCgpa = parseFloat(document.getElementById('pred-target-cgpa')?.value) || 0;
      const currentCredits = parseFloat(document.getElementById('pred-current-credits')?.value) || 19.5;

      const res = this.calculateTargetCgpa(pastCredits, pastCgpa, targetCgpa, currentCredits);
      const resNumber = document.getElementById('pred-result-sgpa');
      const diagBanner = document.getElementById('pred-diagnosis-banner');
      const diagText = document.getElementById('pred-diagnosis-text');
      const projCgpaBadge = document.getElementById('pred-result-projected-cgpa');

      if (resNumber) resNumber.textContent = res.requiredSgpa;
      if (diagText) diagText.innerHTML = res.message;
      if (diagBanner) {
        diagBanner.className = 'target-diagnosis-banner ' + (
          res.feasibility === 'achievable' ? 'banner-achievable' : (
            res.feasibility === 'impossible' ? 'banner-impossible' : 'banner-secured'
          )
        );
      }

      // If required SGPA is achievable (0 to 10), sync expected SGPA input
      const reqNum = parseFloat(res.requiredSgpa);
      const expSgpaInput = document.getElementById('pred-expected-sgpa');
      if (expSgpaInput && !isNaN(reqNum) && reqNum >= 0 && reqNum <= 10) {
        expSgpaInput.value = reqNum.toFixed(2);
      }
      if (projCgpaBadge) {
        const totalCred = pastCredits + currentCredits;
        const projected = totalCred > 0 ? (((pastCredits * pastCgpa) + (Math.min(10, Math.max(0, reqNum || 0)) * currentCredits)) / totalCred).toFixed(2) : targetCgpa.toFixed(2);
        projCgpaBadge.textContent = projected;
      }

      // Also update outer summary display if present
      const calcCgpaEl = document.getElementById('calc-cgpa-result');
      if (calcCgpaEl) calcCgpaEl.textContent = targetCgpa.toFixed(2);
    };

    const updateFromExpectedSgpa = () => {
      const pastCredits = parseFloat(document.getElementById('pred-past-credits')?.value) || 0;
      const pastCgpa = parseFloat(document.getElementById('pred-past-cgpa')?.value) || 0;
      const expectedSgpa = parseFloat(document.getElementById('pred-expected-sgpa')?.value) || 0;
      const currentCredits = parseFloat(document.getElementById('pred-current-credits')?.value) || 19.5;

      const totalCred = pastCredits + currentCredits;
      const projectedCgpa = totalCred > 0 ? (((pastCredits * pastCgpa) + (expectedSgpa * currentCredits)) / totalCred) : expectedSgpa;

      const targetInput = document.getElementById('pred-target-cgpa');
      if (targetInput) targetInput.value = projectedCgpa.toFixed(2);

      const projCgpaBadge = document.getElementById('pred-result-projected-cgpa');
      if (projCgpaBadge) projCgpaBadge.textContent = projectedCgpa.toFixed(2);

      const resNumber = document.getElementById('pred-result-sgpa');
      if (resNumber) resNumber.textContent = expectedSgpa.toFixed(2);

      const diagBanner = document.getElementById('pred-diagnosis-banner');
      const diagText = document.getElementById('pred-diagnosis-text');
      if (diagText) {
        diagText.innerHTML = `⚡ Typing SGPA <strong>${expectedSgpa.toFixed(2)}</strong> yields a cumulative CGPA of <strong>${projectedCgpa.toFixed(2)}</strong> across ${totalCred} total credits.`;
      }
      if (diagBanner) {
        diagBanner.className = 'target-diagnosis-banner banner-achievable';
      }

      const calcCgpaEl = document.getElementById('calc-cgpa-result');
      if (calcCgpaEl) calcCgpaEl.textContent = projectedCgpa.toFixed(2);
      const calcSgpaEl = document.getElementById('calc-sgpa-result');
      if (calcSgpaEl) calcSgpaEl.textContent = expectedSgpa.toFixed(2);
    };

    ['pred-past-credits', 'pred-past-cgpa', 'pred-target-cgpa', 'pred-current-credits'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateFromTarget);
        el.addEventListener('change', updateFromTarget);
      }
    });

    const expSgpaEl = document.getElementById('pred-expected-sgpa');
    if (expSgpaEl) {
      expSgpaEl.addEventListener('input', updateFromExpectedSgpa);
      expSgpaEl.addEventListener('change', updateFromExpectedSgpa);
    }

    // Connect past CGPA & credits in upper card if user edits them
    const topPastCgpa = document.getElementById('cgpa-past-cgpa');
    const topPastCred = document.getElementById('cgpa-past-credits');
    if (topPastCgpa) {
      topPastCgpa.addEventListener('input', (e) => {
        const val = e.target.value;
        const predEl = document.getElementById('pred-past-cgpa');
        if (predEl) { predEl.value = val; updateFromTarget(); }
      });
    }
    if (topPastCred) {
      topPastCred.addEventListener('input', (e) => {
        const val = e.target.value;
        const predEl = document.getElementById('pred-past-credits');
        if (predEl) { predEl.value = val; updateFromTarget(); }
      });
    }
  }
};

window.AcademicsController = AcademicsController;
