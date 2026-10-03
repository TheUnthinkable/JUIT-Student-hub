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
