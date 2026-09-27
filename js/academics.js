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
    deltaMissed: 0
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
    const tabButtons = document.querySelectorAll('.academic-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSubTab = btn.dataset.subtab;
        this.switchSubTab(targetSubTab);
      });
    });
  },

  switchSubTab(subTabKey) {
    this.activeSubTab = subTabKey;
    document.querySelectorAll('.academic-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subtab === subTabKey);
    });

    const panels = {
      'batch-attendance': document.getElementById('subpanel-batch-attendance'),
      'personal-attendance': document.getElementById('subpanel-personal-attendance'),
      'cgpa-checker': document.getElementById('subpanel-cgpa-checker')
    };

    Object.keys(panels).forEach(k => {
      if (panels[k]) {
        if (k === subTabKey) {
          panels[k].style.display = 'block';
          panels[k].classList.add('active');
        } else {
          panels[k].style.display = 'none';
          panels[k].classList.remove('active');
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
  calculateJuit80Rule(attended, conducted) {
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
    const T = this.targetPercent; // 80%

    if (percent >= T) {
      // Safe bunks: floor((attended - 0.80 * conducted) / 0.80)
      const safeBunks = Math.floor((attended - (T / 100) * conducted) / (T / 100));
      return {
        percent: percent,
        status: 'safe',
        statusLabel: 'Safe Standing (≥80%)',
        safeBunks: safeBunks,
        consecutiveNeeded: 0,
        summaryText: safeBunks > 0
          ? `🛡️ Compliant: You can safely miss up to <strong>${safeBunks}</strong> ${safeBunks === 1 ? 'class' : 'classes'} and still remain at or above the mandatory ${T}% requirement.`
          : `🎯 Boundary Alert: Exactly at ${T}.0%. Attend your next class to maintain safe examination eligibility.`
      };
    } else {
      // Consecutive classes needed: ceil((0.80 * conducted - attended) / (1 - 0.80))
      const consecutiveNeeded = Math.ceil(((T / 100) * conducted - attended) / (1 - (T / 100)));
      const isBorderline = percent >= 75.0;
      return {
        percent: percent,
        status: isBorderline ? 'borderline' : 'critical',
        statusLabel: isBorderline ? 'Borderline Risk (75–80%)' : 'Critical Debar Risk (<75%)',
        safeBunks: 0,
        consecutiveNeeded: consecutiveNeeded,
        summaryText: isBorderline
          ? `⚠️ Borderline Risk (${percent.toFixed(1)}%): Attend next <strong>${consecutiveNeeded}</strong> consecutive classes to clear the ${T}% cutoff without medical dispensary waiver.`
          : `🚨 Critical Debarment Risk (${percent.toFixed(1)}%): Mandatory to attend next <strong>${consecutiveNeeded}</strong> consecutive classes. JUIT rules state hall tickets are withheld for <80% attendance.`
      };
    }
  },

  /* ================= FEATURE 1: BATCH ATTENDANCE INDICATOR ================= */
  renderBatchAttendanceIndicator() {
    const container = document.getElementById('batch-attendance-container');
    if (!container) return;

    // Active batch data with simulation applied
    const activeBatchData = this.batchMasterList.find(b => b.code === this.activeBatch) || this.batchMasterList[0];
    const simAttended = Math.max(0, activeBatchData.attended + this.batchSimulation.deltaAttended);
    const simConducted = Math.max(0, activeBatchData.conducted + this.batchSimulation.deltaAttended + this.batchSimulation.deltaMissed);
    const activeMetrics = this.calculateJuit80Rule(simAttended, simConducted);

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
        const metrics = this.calculateJuit80Rule(b.attended, b.conducted);
        if (this.batchFilter === 'safe' && metrics.status !== 'safe') return false;
        if (this.batchFilter === 'borderline' && metrics.status !== 'borderline') return false;
        if (this.batchFilter === 'critical' && metrics.status !== 'critical') return false;
      }
      return true;
    });

    // Counts for filter pills
    const totalBatches = this.batchMasterList.length;
    const safeCount = this.batchMasterList.filter(b => this.calculateJuit80Rule(b.attended, b.conducted).status === 'safe').length;
    const borderlineCount = this.batchMasterList.filter(b => this.calculateJuit80Rule(b.attended, b.conducted).status === 'borderline').length;
    const criticalCount = this.batchMasterList.filter(b => this.calculateJuit80Rule(b.attended, b.conducted).status === 'critical').length;

    // Quick batch chips row
    const batchChipsHtml = this.batchMasterList.map(b => {
      const isSelected = b.code === this.activeBatch;
      const bMetrics = this.calculateJuit80Rule(b.attended, b.conducted);
      const dotColor = bMetrics.status === 'safe' ? '#10b981' : (bMetrics.status === 'borderline' ? '#f59e0b' : '#ef4444');
      return `
        <button type="button" class="batch-select-chip ${isSelected ? 'active' : ''}" data-batch="${b.code}" title="${b.stream} (${bMetrics.percent.toFixed(1)}%)">
          <span class="chip-status-dot" style="background: ${dotColor};"></span>
          <span>${b.code}</span>
          ${isSelected ? '<span class="chip-active-sub">(Active)</span>' : ''}
        </button>
      `;
    }).join('');

    // Matrix table rows
    const matrixRowsHtml = filteredList.map(b => {
      const isSelected = b.code === this.activeBatch;
      const metrics = this.calculateJuit80Rule(b.attended, b.conducted);
      const pctFormatted = metrics.percent.toFixed(1);
      
      let badgeHtml = '';
      let reqHtml = '';
      if (metrics.status === 'safe') {
        badgeHtml = `<span class="hud-status-badge status-good"><span class="hud-dot green"></span> Safe (≥80%)</span>`;
        reqHtml = `<span style="color: #10b981; font-weight: 700;">+${metrics.safeBunks} safe classes</span>`;
      } else if (metrics.status === 'borderline') {
        badgeHtml = `<span class="hud-status-badge status-warning"><span class="hud-dot yellow"></span> Borderline</span>`;
        reqHtml = `<span style="color: #f59e0b; font-weight: 700;">Need next ${metrics.consecutiveNeeded} classes</span>`;
      } else {
        badgeHtml = `<span class="hud-status-badge status-critical"><span class="hud-dot red"></span> Debar Risk</span>`;
        reqHtml = `<span style="color: #ef4444; font-weight: 700;">Need next ${metrics.consecutiveNeeded} classes</span>`;
      }

      return `
        <tr class="batch-matrix-row ${isSelected ? 'row-active-batch' : ''}" data-batch="${b.code}">
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="color: ${isSelected ? 'var(--accent-primary)' : 'var(--text-primary)'}; font-family: var(--font-mono);">${b.code}</strong>
              ${isSelected ? '<span class="kbd-shortcut" style="color: var(--accent-primary);">Active</span>' : ''}
            </div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">${b.stream}</div>
          </td>
          <td>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">${b.dept}</span>
          </td>
          <td>
            <span class="hud-metric-pill">${b.weekly}h / wk (${b.l}L • ${b.t}T • ${b.p}P)</span>
          </td>
          <td>
            <div style="font-size: 0.88rem; font-weight: 600;">${b.attended} <span style="color: var(--text-muted); font-weight: 400;">/ ${b.conducted}</span></div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <strong style="color: ${metrics.status === 'safe' ? '#10b981' : (metrics.status === 'borderline' ? '#f59e0b' : '#ef4444')}; font-size: 0.95rem;">${pctFormatted}%</strong>
              <div class="matrix-progress-wrap">
                <div class="matrix-progress-bar" style="width: ${Math.min(100, metrics.percent)}%; background: ${metrics.status === 'safe' ? '#10b981' : (metrics.status === 'borderline' ? '#f59e0b' : '#ef4444')};"></div>
                <div class="matrix-threshold-line" title="80% cutoff"></div>
              </div>
            </div>
          </td>
          <td>${badgeHtml}</td>
          <td>${reqHtml}</td>
          <td style="text-align: right;">
            <button type="button" class="btn-micro btn-inspect-batch ${isSelected ? 'btn-selected' : ''}" data-batch="${b.code}">
              ${isSelected ? 'Selected' : 'Inspect'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Status classes for hero dial
    const heroDialClass = activeMetrics.status === 'safe' ? 'dial-good' : (activeMetrics.status === 'borderline' ? 'dial-warning' : 'dial-danger');
    const heroTextColor = activeMetrics.status === 'safe' ? '#10b981' : (activeMetrics.status === 'borderline' ? '#f59e0b' : '#ef4444');
    const isSavedActive = (this.activeBatch === (localStorage.getItem('juit_selected_batch') || '26BT10'));

    container.innerHTML = `
      <!-- QUICK BATCHES STRIP -->
      <div class="batch-strip-card">
        <div class="batch-strip-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined" style="font-size: 18px; color: var(--accent-primary);">format_list_bulleted</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Select Batch for Compliance Breakdown:</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">ODD 2026 Academic Term</span>
        </div>
        <div class="batch-chips-scroll" id="batch-chips-container">
          ${batchChipsHtml}
        </div>
      </div>

      <!-- HERO BATCH HUD CARD -->
      <div class="hero-batch-card">
        <div class="hero-batch-top">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span class="batch-hero-badge">${activeBatchData.code}</span>
              <span class="batch-dept-tag">${activeBatchData.dept}</span>
              <span class="batch-stream-tag">${activeBatchData.stream}</span>
            </div>
            <h3 class="batch-hero-title">Attendance Compliance & 80% Rule Indicator</h3>
            <p class="batch-hero-desc">
              Continuous monitoring under JUIT Regulation clause 4.2. Examination hall tickets require a minimum 80% aggregate attendance across all registered components.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button type="button" class="btn-secondary" id="btn-set-user-batch" ${isSavedActive ? 'disabled' : ''} style="font-size: 0.82rem; padding: 7px 14px;">
              ${isSavedActive ? '✓ Your Active Hub Batch' : '★ Set as My Active Batch'}
            </button>
            <a href="#timetable" class="btn-primary" style="font-size: 0.82rem; padding: 7px 14px; text-decoration: none;">
              📅 View Batch Timetable
            </a>
          </div>
        </div>

        <!-- 4 Metric Cards Grid -->
        <div class="hero-metrics-grid">
          <!-- Metric 1: Dial -->
          <div class="hero-metric-tile">
            <div class="hero-dial-wrap ${heroDialClass}">
              <span class="hero-dial-value" style="color: ${heroTextColor};">${activeMetrics.percent.toFixed(1)}%</span>
              <span class="hero-dial-label">Attendance</span>
            </div>
            <div style="text-align: center; margin-top: 8px;">
              <span class="hud-status-badge ${activeMetrics.status === 'safe' ? 'status-good' : (activeMetrics.status === 'borderline' ? 'status-warning' : 'status-critical')}">
                ${activeMetrics.statusLabel}
              </span>
            </div>
          </div>

          <!-- Metric 2: Conducted vs Attended -->
          <div class="hero-metric-tile">
            <div class="metric-label">Classes Attended</div>
            <div class="metric-val-row">
              <span class="metric-big-val" style="color: ${heroTextColor};">${simAttended}</span>
              <span class="metric-sub-val">/ ${simConducted} conducted</span>
            </div>
            <div class="progress-bar-wrap" style="margin-top: 10px;">
              <div class="progress-bar-fill" style="width: ${Math.min(100, activeMetrics.percent)}%; background: ${heroTextColor};"></div>
              <div class="progress-threshold-line" style="left: 80%;" title="80% Target"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
              <span>0</span>
              <span style="color: var(--accent-primary); font-weight: 700;">80% Target</span>
              <span>100%</span>
            </div>
          </div>

          <!-- Metric 3: Weekly Timetable Load -->
          <div class="hero-metric-tile">
            <div class="metric-label">Scheduled Weekly Load</div>
            <div class="metric-val-row">
              <span class="metric-big-val" style="color: var(--text-primary);">${activeBatchData.weekly}</span>
              <span class="metric-sub-val">hrs / week</span>
            </div>
            <div class="batch-breakdown-pills">
              <span class="sub-pill">📘 ${activeBatchData.l} Lectures</span>
              <span class="sub-pill">💡 ${activeBatchData.t} Tutorials</span>
              <span class="sub-pill">🧪 ${activeBatchData.p} Labs</span>
            </div>
          </div>

          <!-- Metric 4: 80% Rule Calculation -->
          <div class="hero-metric-tile">
            <div class="metric-label">JUIT 80% Requirement</div>
            ${activeMetrics.status === 'safe' ? `
              <div class="metric-val-row">
                <span class="metric-big-val" style="color: #10b981;">+${activeMetrics.safeBunks}</span>
                <span class="metric-sub-val">Safe bunks available</span>
              </div>
              <p style="font-size: 0.76rem; color: #10b981; margin: 8px 0 0;">Can miss up to ${activeMetrics.safeBunks} classes and still stay above 80%.</p>
            ` : `
              <div class="metric-val-row">
                <span class="metric-big-val" style="color: #ef4444;">${activeMetrics.consecutiveNeeded}</span>
                <span class="metric-sub-val">Consecutive classes needed</span>
              </div>
              <p style="font-size: 0.76rem; color: #ef4444; margin: 8px 0 0;">Must attend without any skips to clear 80% cutoff.</p>
            `}
          </div>
        </div>

        <!-- Requirement Advisory Banner -->
        <div class="batch-advisory-banner ${activeMetrics.status === 'safe' ? 'banner-safe' : (activeMetrics.status === 'borderline' ? 'banner-warning' : 'banner-critical')}">
          <div style="font-size: 1.3rem;">
            ${activeMetrics.status === 'safe' ? '🛡️' : (activeMetrics.status === 'borderline' ? '⚠️' : '🚨')}
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.92rem; margin-bottom: 2px;">
              ${activeMetrics.status === 'safe' ? 'Compliant with JUIT Attendance Criterion' : (activeMetrics.status === 'borderline' ? 'Attendance in Borderline Range' : 'Critical Debarment Warning')}
            </div>
            <div style="font-size: 0.82rem; line-height: 1.45;">
              ${activeMetrics.summaryText}
            </div>
          </div>
        </div>

        <!-- Simulation Toolbar -->
        <div class="simulation-toolbar">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined" style="font-size: 17px; color: var(--accent-primary);">tune</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">What-If Attendance Simulator:</span>
            ${(this.batchSimulation.deltaAttended !== 0 || this.batchSimulation.deltaMissed !== 0) ? `
              <span class="badge-sim-active">Simulating (${this.batchSimulation.deltaAttended >= 0 ? '+' : ''}${this.batchSimulation.deltaAttended} Attended, +${this.batchSimulation.deltaMissed} Missed)</span>
            ` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="btn-sim-action btn-sim-attend" id="btn-sim-attend-plus" title="Simulate attending the next scheduled class">+1 Attend Class</button>
            <button type="button" class="btn-sim-action btn-sim-miss" id="btn-sim-miss-plus" title="Simulate missing the next scheduled class">+1 Miss Class</button>
            <button type="button" class="btn-sim-action btn-sim-reset" id="btn-sim-reset" title="Reset simulation to real data">Reset</button>
          </div>
        </div>
      </div>

      <!-- ALL BATCHES MATRIX TABLE SECTION -->
      <div class="batch-matrix-section">
        <div class="batch-matrix-header">
          <div>
            <h3 style="font-size: 1.15rem; margin: 0 0 4px; color: #fff;">All Batches Live Attendance Matrix</h3>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0;">
              Real-time compliance status for all 16 first-year batches under the 80% attendance mandate.
            </p>
          </div>

          <!-- Filters Row -->
          <div class="matrix-filter-controls">
            <div class="filter-pills-row">
              <button type="button" class="filter-pill ${this.batchFilter === 'all' ? 'active' : ''}" data-filter="all">All (${totalBatches})</button>
              <button type="button" class="filter-pill ${this.batchFilter === 'safe' ? 'active' : ''}" data-filter="safe">Safe ≥80% (${safeCount})</button>
              <button type="button" class="filter-pill ${this.batchFilter === 'borderline' ? 'active' : ''}" data-filter="borderline">Borderline (${borderlineCount})</button>
              <button type="button" class="filter-pill ${this.batchFilter === 'critical' ? 'active' : ''}" data-filter="critical">Debar Risk (${criticalCount})</button>
            </div>
            <div style="position: relative;">
              <input type="text" id="batch-matrix-search" placeholder="Search batch (e.g. 26BT12)..." value="${this.batchSearchQuery}" class="select-styled" style="padding-left: 28px; width: 190px; font-size: 0.8rem; height: 32px;" />
              <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.5;">🔍</span>
            </div>
          </div>
        </div>

        <div class="table-responsive-wrapper">
          <table class="batch-matrix-table">
            <thead>
              <tr>
                <th>Batch & Stream</th>
                <th>Department</th>
                <th>Weekly Load</th>
                <th>Attended / Total</th>
                <th style="min-width: 170px;">Attendance %</th>
                <th>Status</th>
                <th>Required to Reach 80%</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
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
        this.batchSimulation = { deltaAttended: 0, deltaMissed: 0 };
        this.renderBatchAttendanceIndicator();
      });
    });

    // Inspect buttons in matrix table
    document.querySelectorAll('.btn-inspect-batch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const batchCode = btn.dataset.batch;
        this.activeBatch = batchCode;
        this.batchSimulation = { deltaAttended: 0, deltaMissed: 0 };
        this.renderBatchAttendanceIndicator();
        window.scrollTo({ top: 320, behavior: 'smooth' });
      });
    });

    // Matrix table row click
    document.querySelectorAll('.batch-matrix-row').forEach(row => {
      row.addEventListener('click', () => {
        const batchCode = row.dataset.batch;
        this.activeBatch = batchCode;
        this.batchSimulation = { deltaAttended: 0, deltaMissed: 0 };
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

    // Simulation: +1 Attend
    const btnSimAttend = document.getElementById('btn-sim-attend-plus');
    if (btnSimAttend) {
      btnSimAttend.addEventListener('click', () => {
        this.batchSimulation.deltaAttended += 1;
        this.renderBatchAttendanceIndicator();
      });
    }

    // Simulation: +1 Miss
    const btnSimMiss = document.getElementById('btn-sim-miss-plus');
    if (btnSimMiss) {
      btnSimMiss.addEventListener('click', () => {
        this.batchSimulation.deltaMissed += 1;
        this.renderBatchAttendanceIndicator();
      });
    }

    // Simulation: Reset
    const btnSimReset = document.getElementById('btn-sim-reset');
    if (btnSimReset) {
      btnSimReset.addEventListener('click', () => {
        this.batchSimulation = { deltaAttended: 0, deltaMissed: 0 };
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

      if (currentPct < T) {
        statusColor = '#ef4444';
        const needed = Math.ceil((T * total - 100 * attended) / (100 - T));
        statusBadge = `<span style="font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: rgba(239, 68, 68, 0.15); color: #ef4444;">Debarment Risk</span>`;
        adviceHtml = `
          <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; padding: 8px 12px; border-radius: 4px; font-size: 0.8rem; color: #fca5a5; margin: 10px 0;">
            ⚠️ Must attend the next <strong>${needed}</strong> consecutive ${needed === 1 ? 'class' : 'classes'} to reach ${T}% compliance.
          </div>
        `;
      } else {
        const canBunk = Math.floor((100 * attended - T * total) / T);
        if (canBunk > 0) {
          statusBadge = `<span style="font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #10b981;">Safe (+${canBunk} Bunks)</span>`;
          adviceHtml = `
            <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10b981; padding: 8px 12px; border-radius: 4px; font-size: 0.8rem; color: #86efac; margin: 10px 0;">
              ✓ On track. You can safely miss <strong>${canBunk}</strong> ${canBunk === 1 ? 'class' : 'classes'} and stay above ${T}%.
            </div>
          `;
        } else {
          statusColor = '#f59e0b';
          statusBadge = `<span style="font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: #f59e0b;">Borderline Cutoff</span>`;
          adviceHtml = `
            <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 4px; font-size: 0.8rem; color: #fde047; margin: 10px 0;">
              ⚠️ Right on the ${T}% cutoff. Missing the next class will cause a shortage.
            </div>
          `;
        }
      }

      const ifAttend1 = ((attended + 1) / (total + 1) * 100).toFixed(1);
      const ifMiss1 = (attended / (total + 1) * 100).toFixed(1);

      return `
        <div class="dash-card attendance-card" data-course-code="${code}" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px;">
          <!-- Course Card Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="hub-badge" style="font-size: 0.75rem;">${code}</span>
                ${statusBadge}
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.3;">${c.name}</h3>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              <span style="font-size: 1.5rem; font-weight: 800; color: ${statusColor};">${pctFormatted}%</span>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Attendance</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-bar-wrap" style="height: 7px; background: rgba(255,255,255,0.06); border-radius: 4px; position: relative; margin-bottom: 14px; overflow: hidden;">
            <div class="progress-bar-fill" style="width: ${Math.min(100, currentPct)}%; background: ${statusColor}; height: 100%; border-radius: 4px; transition: width 0.3s ease;"></div>
          </div>

          <!-- Interactive Steppers for Present / Absent -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: var(--bg-elevated); padding: 10px 12px; border-radius: 8px; margin-bottom: 8px;">
            <!-- Present Stepper -->
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Attended:</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" class="btn-step" data-action="dec-present" data-code="${code}" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-primary); cursor: pointer; font-weight: 700;">−</button>
                <span style="font-size: 0.95rem; font-weight: 700; color: #10b981; min-width: 22px; text-align: center;">${attended}</span>
                <button type="button" class="btn-step" data-action="inc-present" data-code="${code}" style="padding: 2px 8px; height: 26px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.15); color: #10b981; cursor: pointer; font-weight: 700; font-size: 0.78rem;">+1 Present</button>
              </div>
            </div>

            <!-- Absent Stepper -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-left: 1px solid var(--border-subtle); padding-left: 10px;">
              <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Missed:</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" class="btn-step" data-action="dec-absent" data-code="${code}" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-primary); cursor: pointer; font-weight: 700;">−</button>
                <span style="font-size: 0.95rem; font-weight: 700; color: #ef4444; min-width: 22px; text-align: center;">${missed}</span>
                <button type="button" class="btn-step" data-action="inc-absent" data-code="${code}" style="padding: 2px 8px; height: 26px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.15); color: #ef4444; cursor: pointer; font-weight: 700; font-size: 0.78rem;">+1 Absent</button>
              </div>
            </div>
          </div>

          <!-- Total & Edit Counts -->
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">
            <span>Total Conducted: <strong style="color: var(--text-primary);">${total}</strong></span>
            <button type="button" class="btn-edit-counts" data-code="${code}" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 0.75rem; padding: 2px 6px;">
              ✎ Edit Exact Numbers
            </button>
          </div>

          ${adviceHtml}

          <!-- Forecast Pills -->
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
            <span>If attended next: <strong style="color: #10b981;">${ifAttend1}%</strong></span>
            <span>If missed next: <strong style="color: #ef4444;">${ifMiss1}%</strong></span>
          </div>
        </div>
      `;
    }).join('');

    const aggregatePct = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : 100;
    const isSafeAggregate = parseFloat(aggregatePct) >= T;

    container.innerHTML = `
      <!-- SUMMARY & TARGET SELECTOR BANNER -->
      <div class="dash-card col-span-12" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 20px; margin-bottom: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: var(--text-muted);">Aggregate University Attendance</span>
              <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: ${isSafeAggregate ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isSafeAggregate ? '#10b981' : '#ef4444'};">
                ${isSafeAggregate ? '✓ Safe Standing' : '⚠️ Below Mandate'}
              </span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 12px;">
              <span style="font-size: 2.4rem; font-weight: 800; color: ${isSafeAggregate ? '#10b981' : '#ef4444'};">${aggregatePct}%</span>
              <span style="font-size: 0.9rem; color: var(--text-secondary);">${totalAttended} of ${totalConducted} classes attended across registered courses</span>
            </div>
          </div>

          <!-- Target Rule Selector & Quick Actions -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; background: var(--bg-elevated); padding: 4px; border-radius: 8px; border: 1px solid var(--border-subtle);">
              <button type="button" class="btn-target-toggle ${T === 80 ? 'active' : ''}" data-target="80" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; background: ${T === 80 ? '#2563eb' : 'transparent'}; color: ${T === 80 ? '#ffffff' : 'var(--text-secondary)'};">
                80% Rule (JUIT Rule)
              </button>
              <button type="button" class="btn-target-toggle ${T === 75 ? 'active' : ''}" data-target="75" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; background: ${T === 75 ? '#2563eb' : 'transparent'}; color: ${T === 75 ? '#ffffff' : 'var(--text-secondary)'};">
                75% Rule (Relaxed)
              </button>
            </div>
            <button type="button" class="btn-secondary" id="btn-add-custom-course" style="font-size: 0.82rem; padding: 7px 14px; display: inline-flex; align-items: center; gap: 6px;">
              <span class="material-symbols-outlined" style="font-size: 15px;">add</span>
              <span>Add Subject</span>
            </button>
            <button type="button" class="btn-secondary" id="btn-reset-attendance" style="font-size: 0.82rem; padding: 7px 12px; color: var(--text-muted);" title="Reset to standard semester baseline">
              ↺ Reset
            </button>
          </div>
        </div>
      </div>

      <!-- COURSE CARDS GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
        ${courseCardsHtml}
      </div>
    `;

    this.bindAttendanceControls();
  },

  bindAttendanceControls() {
    // Target Rule Toggles
    document.querySelectorAll('.btn-target-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        this.targetPercent = parseInt(btn.dataset.target, 10);
        this.renderAttendanceTracker();
      });
    });

    // Reset button
    const btnReset = document.getElementById('btn-reset-attendance');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Reset all course attendance to standard semester starting baseline?')) {
          this.seedInitialCourses();
        }
      });
    }

    // Add Subject button
    const btnAdd = document.getElementById('btn-add-custom-course');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        this.promptAddCourse();
      });
    }

    // Stepper buttons: inc-present, dec-present, inc-absent, dec-absent
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

    // Edit exact numbers prompt
    document.querySelectorAll('.btn-edit-counts').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        this.promptEditCourse(code);
      });
    });
  },

  promptEditCourse(code) {
    if (!window.JUIT_PROFILE || !window.JUIT_PROFILE.attendance) return;
    const c = window.JUIT_PROFILE.attendance[code];
    if (!c) return;

    const newPresent = prompt(`Enter Attended Classes for ${c.name}:`, c.present || 0);
    if (newPresent === null) return;
    const newAbsent = prompt(`Enter Missed Classes for ${c.name}:`, c.absent || 0);
    if (newAbsent === null) return;

    c.present = Math.max(0, parseInt(newPresent, 10) || 0);
    c.absent = Math.max(0, parseInt(newAbsent, 10) || 0);
    this.saveProfile();
    this.renderAttendanceTracker();
  },

  promptAddCourse() {
    const code = prompt('Course Code (e.g. 25B11EC111):');
    if (!code) return;
    const name = prompt('Course Name (e.g. Basic Electronics):');
    if (!name) return;
    const present = parseInt(prompt('Current Attended Classes:', '20'), 10) || 0;
    const absent = parseInt(prompt('Current Missed Classes:', '2'), 10) || 0;

    window.JUIT_PROFILE = window.JUIT_PROFILE || {};
    window.JUIT_PROFILE.attendance = window.JUIT_PROFILE.attendance || {};
    window.JUIT_PROFILE.attendance[code.toUpperCase()] = {
      name: name,
      present: present,
      absent: absent
    };
    this.saveProfile();
    this.renderAttendanceTracker();
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
              <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Calculate the exact SGPA needed this semester to achieve your target CGPA.</p>
            </div>
            <div class="cgpa-badge-ring target-ring">
              <span class="cgpa-big-number" id="pred-result-sgpa" style="color: #8b5cf6;">${targetResult.requiredSgpa}</span>
              <span class="cgpa-scale-label">Req SGPA</span>
            </div>
          </div>

          <div class="target-predictor-inputs">
            <div class="pred-input-group">
              <label>Completed Credits (Prior)</label>
              <input type="number" id="pred-past-credits" value="${defaultPastCredits}" min="0" max="160" step="1" class="select-styled" style="width: 100%; font-size: 0.85rem;" />
            </div>
            <div class="pred-input-group">
              <label>Current Cumulative CGPA</label>
              <input type="number" id="pred-past-cgpa" value="${defaultPastCgpa.toFixed(2)}" min="0" max="10" step="0.05" class="select-styled" style="width: 100%; font-size: 0.85rem;" />
            </div>
            <div class="pred-input-group">
              <label>Desired Target CGPA</label>
              <input type="number" id="pred-target-cgpa" value="${defaultTargetCgpa.toFixed(2)}" min="0" max="10" step="0.05" class="select-styled" style="width: 100%; font-size: 0.85rem;" />
            </div>
            <div class="pred-input-group">
              <label>Current Term Credits</label>
              <input type="number" id="pred-current-credits" value="${currentCreditsNum}" min="1" max="30" step="0.5" class="select-styled" style="width: 100%; font-size: 0.85rem;" />
            </div>
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

    // Target Predictor Live Inputs
    const updateTargetPrediction = () => {
      const pastCredits = parseFloat(document.getElementById('pred-past-credits').value) || 0;
      const pastCgpa = parseFloat(document.getElementById('pred-past-cgpa').value) || 0;
      const targetCgpa = parseFloat(document.getElementById('pred-target-cgpa').value) || 0;
      const currentCredits = parseFloat(document.getElementById('pred-current-credits').value) || 19.5;

      const res = this.calculateTargetCgpa(pastCredits, pastCgpa, targetCgpa, currentCredits);
      const resNumber = document.getElementById('pred-result-sgpa');
      const diagBanner = document.getElementById('pred-diagnosis-banner');
      const diagText = document.getElementById('pred-diagnosis-text');

      if (resNumber) resNumber.textContent = res.requiredSgpa;
      if (diagText) diagText.innerHTML = res.message;
      if (diagBanner) {
        diagBanner.className = 'target-diagnosis-banner ' + (
          res.feasibility === 'achievable' ? 'banner-achievable' : (
            res.feasibility === 'impossible' ? 'banner-impossible' : 'banner-secured'
          )
        );
      }
    };

    ['pred-past-credits', 'pred-past-cgpa', 'pred-target-cgpa', 'pred-current-credits'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateTargetPrediction);
      }
    });
  }
};

window.AcademicsController = AcademicsController;
