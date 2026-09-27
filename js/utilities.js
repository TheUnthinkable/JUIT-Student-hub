/**
 * Extra Student Utilities for JUIT Student Hub
 * Includes: CGPA/SGPA Calculator, Assignment Tracker, Pomodoro Timer, Quick Notes, Emergency Contacts.
 */

const UtilitiesController = {
  activeTab: 'gpa', // 'gpa' | 'assignments' | 'pomodoro' | 'notes' | 'emergency'

  // Pomodoro Timer State
  timerDuration: 25 * 60,
  timerRemaining: 25 * 60,
  timerInterval: null,
  timerState: 'stopped', // 'running' | 'paused' | 'stopped'
  timerMode: 'focus', // 'focus' (25m) | 'short' (5m) | 'long' (15m)
  pomodoroSessions: 0,

  init() {
    this.bindTabButtons();
    this.renderActiveTab();
    this.initPomodoro();
  },

  getProfile() {
    return window.JUIT_PROFILE || {};
  },

  saveProfile() {
    localStorage.setItem('juit_student_profile', JSON.stringify(window.JUIT_PROFILE));
  },

  bindTabButtons() {
    document.querySelectorAll('.util-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        document.querySelectorAll('.util-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        this.renderActiveTab();
      });
    });
  },

  renderActiveTab() {
    const container = document.getElementById('utilities-tab-content');
    if (!container) return;

    if (this.activeTab === 'gpa') {
      this.renderGpaCalculator(container);
    } else if (this.activeTab === 'assignments') {
      this.renderAssignmentTracker(container);
    } else if (this.activeTab === 'pomodoro') {
      this.renderPomodoro(container);
    } else if (this.activeTab === 'notes') {
      this.renderNotes(container);
    } else if (this.activeTab === 'emergency') {
      this.renderEmergencyContacts(container);
    }
  },

  /* 1. CGPA & SGPA Calculator */
  renderGpaCalculator(container) {
    const courses = [
      { name: 'Software Development Fundamentals', credits: 4, grade: 'A+' },
      { name: 'Mathematics-I', credits: 4, grade: 'A' },
      { name: 'Engineering Physics', credits: 4, grade: 'B+' },
      { name: 'English Communication Skills', credits: 3, grade: 'A' },
      { name: 'SDF Laboratory', credits: 1.5, grade: 'A+' },
      { name: 'Physics Laboratory', credits: 1.5, grade: 'A' },
      { name: 'Engineering Workshop', credits: 1.5, grade: 'B+' }
    ];

    const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 };

    container.innerHTML = `
      <div class="dash-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 1.25rem;">SGPA & CGPA Estimator</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">Calculate your Semester Grade Point Average (SGPA) based on official JUIT 10-point scale.</p>
          </div>
          <div style="text-align: right; background: var(--bg-elevated); padding: 8px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Estimated SGPA</div>
            <div id="calc-sgpa-result" style="font-size: 1.8rem; font-weight: 800; color: var(--color-lab);">9.05</div>
          </div>
        </div>

        <table class="table-styled" style="width: 100%; margin-bottom: 16px;">
          <thead>
            <tr>
              <th>Course Title</th>
              <th style="width: 100px;">Credits</th>
              <th style="width: 130px;">Expected Grade</th>
              <th style="width: 80px; text-align: right;">Points</th>
            </tr>
          </thead>
          <tbody id="gpa-courses-tbody">
            ${courses.map((c, idx) => `
              <tr data-index="${idx}">
                <td><input type="text" value="${c.name}" class="select-styled" style="width: 100%; padding: 4px 8px; font-size: 0.85rem;" /></td>
                <td><input type="number" step="0.5" min="1" max="6" value="${c.credits}" class="select-styled gpa-credit-input" style="width: 80px; padding: 4px 8px;" /></td>
                <td>
                  <select class="select-styled gpa-grade-select" style="width: 100%; padding: 4px 8px;">
                    ${Object.keys(gradePoints).map(g => `<option value="${g}" ${g === c.grade ? 'selected' : ''}>${g} (${gradePoints[g]} pts)</option>`).join('')}
                  </select>
                </td>
                <td style="text-align: right; font-weight: 700; color: var(--accent-primary);" class="gpa-pts-cell">
                  ${(c.credits * gradePoints[c.grade]).toFixed(1)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Multi-Semester CGPA Accumulator -->
        <div style="background: var(--bg-elevated); padding: 14px 18px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <div>
              <label style="font-size: 0.75rem; color: var(--text-muted); display: block;">Past Semesters Credits</label>
              <input type="number" id="cgpa-past-credits" value="40" class="select-styled" style="width: 110px; padding: 4px 8px;" />
            </div>
            <div>
              <label style="font-size: 0.75rem; color: var(--text-muted); display: block;">Past Cumulative CGPA</label>
              <input type="number" step="0.01" id="cgpa-past-cgpa" value="8.80" class="select-styled" style="width: 110px; padding: 4px 8px;" />
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Updated Cumulative CGPA</div>
            <div id="calc-cgpa-result" style="font-size: 1.6rem; font-weight: 800; color: var(--accent-primary);">8.88</div>
          </div>
        </div>
      </div>
    `;

    this.bindGpaListeners();
  },

  bindGpaListeners() {
    const update = () => {
      const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 };
      let sumPts = 0;
      let sumCredits = 0;

      document.querySelectorAll('#gpa-courses-tbody tr').forEach(row => {
        const cred = parseFloat(row.querySelector('.gpa-credit-input').value) || 0;
        const grade = row.querySelector('.gpa-grade-select').value;
        const pts = cred * (gradePoints[grade] || 0);
        sumCredits += cred;
        sumPts += pts;
        row.querySelector('.gpa-pts-cell').textContent = pts.toFixed(1);
      });

      const sgpa = sumCredits > 0 ? (sumPts / sumCredits) : 0;
      const sgpaEl = document.getElementById('calc-sgpa-result');
      if (sgpaEl) sgpaEl.textContent = sgpa.toFixed(2);

      // CGPA
      const pastCred = parseFloat(document.getElementById('cgpa-past-credits')?.value) || 0;
      const pastCgpa = parseFloat(document.getElementById('cgpa-past-cgpa')?.value) || 0;
      const totalCred = pastCred + sumCredits;
      const totalPts = (pastCred * pastCgpa) + sumPts;
      const cgpa = totalCred > 0 ? (totalPts / totalCred) : sgpa;

      const cgpaEl = document.getElementById('calc-cgpa-result');
      if (cgpaEl) cgpaEl.textContent = cgpa.toFixed(2);
    };

    document.querySelectorAll('.gpa-credit-input, .gpa-grade-select, #cgpa-past-credits, #cgpa-past-cgpa').forEach(input => {
      input.addEventListener('input', update);
      input.addEventListener('change', update);
    });
  },

  /* 2. Assignment Tracker */
  renderAssignmentTracker(container) {
    const profile = this.getProfile();
    const assignments = profile.assignments || [];

    container.innerHTML = `
      <div class="dash-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 1.25rem;">Student Assignment Tracker</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">Organize homework, lab problem sets, and term deadlines.</p>
          </div>
          <button type="button" class="btn-primary" id="btn-add-assignment" style="padding: 6px 14px; font-size: 0.82rem;">+ New Assignment</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          ${assignments.map(a => {
            let statusColor = '#3b82f6';
            if (a.status === 'Completed') statusColor = 'var(--color-lab)';
            if (a.status === 'In Progress') statusColor = 'var(--color-tutorial)';

            return `
              <div class="dash-card" style="padding: 14px; background: var(--bg-elevated);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <span class="hub-badge">${a.course}</span>
                  <select class="select-styled asg-status-select" data-id="${a.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: ${statusColor};">
                    <option value="To Do" ${a.status === 'To Do' ? 'selected' : ''}>To Do</option>
                    <option value="In Progress" ${a.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
                  </select>
                </div>
                <h4 style="font-size: 1.05rem; margin: 6px 0;">${a.title}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px; margin-top: 8px;">
                  <span>⏰ Due: <strong>${a.dueDate}</strong></span>
                  <button type="button" class="btn-micro btn-del-asg" data-id="${a.id}">✕</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('.asg-status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = sel.dataset.id;
        const target = assignments.find(x => x.id === id);
        if (target) {
          target.status = e.target.value;
          this.saveProfile();
          this.renderAssignmentTracker(container);
        }
      });
    });

    document.querySelectorAll('.btn-del-asg').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        window.JUIT_PROFILE.assignments = window.JUIT_PROFILE.assignments.filter(x => x.id !== id);
        this.saveProfile();
        this.renderAssignmentTracker(container);
      });
    });

    const btnAdd = document.getElementById('btn-add-assignment');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const title = prompt('Assignment Title (e.g. Lab 4 Pointer Structs):');
        if (!title) return;
        const course = prompt('Course (e.g. SDF, Maths):', 'SDF');
        const dueDate = prompt('Due Date (YYYY-MM-DD):', '2026-09-30');

        window.JUIT_PROFILE.assignments = window.JUIT_PROFILE.assignments || [];
        window.JUIT_PROFILE.assignments.push({
          id: `asg-${Date.now()}`,
          title,
          course: course || 'General',
          dueDate: dueDate || '2026-09-30',
          priority: 'High',
          status: 'To Do'
        });
        this.saveProfile();
        this.renderAssignmentTracker(container);
      });
    }
  },

  /* 3. Pomodoro Study Timer */
  renderPomodoro(container) {
    const mins = Math.floor(this.timerRemaining / 60);
    const secs = this.timerRemaining % 60;
    const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    container.innerHTML = `
      <div class="dash-card" style="text-align: center; max-width: 500px; margin: 0 auto;">
        <h3 style="font-size: 1.3rem; margin-bottom: 6px;">Deep Study Pomodoro Timer</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 20px;">Use focused 25-minute intervals to master difficult engineering concepts.</p>

        <!-- Interval Switcher -->
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 24px;">
          <button type="button" class="map-filter-chip ${this.timerMode === 'focus' ? 'active' : ''}" id="btn-pomo-focus">25m Focus</button>
          <button type="button" class="map-filter-chip ${this.timerMode === 'short' ? 'active' : ''}" id="btn-pomo-short">5m Short Break</button>
          <button type="button" class="map-filter-chip ${this.timerMode === 'long' ? 'active' : ''}" id="btn-pomo-long">15m Long Break</button>
        </div>

        <!-- Big Timer Dial -->
        <div class="pomodoro-clock-dial" style="font-size: 4rem; font-weight: 800; font-family: var(--font-mono); color: var(--accent-primary); margin-bottom: 20px;">
          <span id="pomo-time-display">${timeDisplay}</span>
        </div>

        <!-- Controls -->
        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 16px;">
          <button type="button" class="btn-primary" id="btn-pomo-start-pause" style="padding: 10px 28px; font-size: 1rem;">
            ${this.timerState === 'running' ? 'Pause ⏸' : 'Start Focus ▶'}
          </button>
          <button type="button" class="btn-secondary" id="btn-pomo-reset" style="padding: 10px 20px; font-size: 1rem;">Reset ↺</button>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-muted);">
          Completed Study Sessions Today: <strong style="color: var(--color-lab);" id="pomo-sessions-counter">${this.pomodoroSessions}</strong>
        </div>
      </div>
    `;

    document.getElementById('btn-pomo-focus')?.addEventListener('click', () => this.setPomoMode('focus', 25 * 60));
    document.getElementById('btn-pomo-short')?.addEventListener('click', () => this.setPomoMode('short', 5 * 60));
    document.getElementById('btn-pomo-long')?.addEventListener('click', () => this.setPomoMode('long', 15 * 60));

    document.getElementById('btn-pomo-start-pause')?.addEventListener('click', () => {
      if (this.timerState === 'running') {
        this.pausePomodoro();
      } else {
        this.startPomodoro();
      }
    });

    document.getElementById('btn-pomo-reset')?.addEventListener('click', () => {
      this.resetPomodoro();
    });
  },

  setPomoMode(mode, duration) {
    this.timerMode = mode;
    this.timerDuration = duration;
    this.timerRemaining = duration;
    this.timerState = 'stopped';
    clearInterval(this.timerInterval);
    this.renderPomodoro(document.getElementById('utilities-tab-content'));
  },

  startPomodoro() {
    this.timerState = 'running';
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timerRemaining > 0) {
        this.timerRemaining--;
        const mins = Math.floor(this.timerRemaining / 60);
        const secs = this.timerRemaining % 60;
        const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const el = document.getElementById('pomo-time-display');
        if (el) el.textContent = display;
      } else {
        clearInterval(this.timerInterval);
        this.timerState = 'stopped';
        if (this.timerMode === 'focus') {
          this.pomodoroSessions++;
          alert('🎉 Great work! Study focus session completed. Take a well-deserved 5-minute break.');
        } else {
          alert('🔔 Break over! Ready to dive back into your studies?');
        }
        this.resetPomodoro();
      }
    }, 1000);

    const btn = document.getElementById('btn-pomo-start-pause');
    if (btn) btn.textContent = 'Pause ⏸';
  },

  pausePomodoro() {
    this.timerState = 'paused';
    clearInterval(this.timerInterval);
    const btn = document.getElementById('btn-pomo-start-pause');
    if (btn) btn.textContent = 'Resume ▶';
  },

  resetPomodoro() {
    clearInterval(this.timerInterval);
    this.timerState = 'stopped';
    this.timerRemaining = this.timerDuration;
    this.renderPomodoro(document.getElementById('utilities-tab-content'));
  },

  initPomodoro() {},

  /* 4. Personal Quick Notes */
  renderNotes(container) {
    const profile = this.getProfile();
    const notes = profile.notes || [];

    container.innerHTML = `
      <div class="dash-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.25rem;">Quick Scholar Scratchpad</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">Instant autosaved scratchpad for classroom formulas, questions, and to-do lists.</p>
          </div>
          <button type="button" class="btn-primary" id="btn-save-notes" style="padding: 6px 14px; font-size: 0.82rem;">Save Notes 💾</button>
        </div>

        <textarea class="select-styled" id="scholar-notes-textarea" style="width: 100%; height: 260px; font-family: var(--font-mono); font-size: 0.88rem; line-height: 1.6; padding: 14px; resize: vertical;" placeholder="Type formulas, doubts for faculty, lab reminders, or test checklists...">${notes[0]?.content || ''}</textarea>
        
        <div id="notes-save-status" style="font-size: 0.78rem; color: var(--color-lab); margin-top: 8px; display: none;">
          ✓ All notes saved to local offline storage.
        </div>
      </div>
    `;

    const textarea = document.getElementById('scholar-notes-textarea');
    const saveBtn = document.getElementById('btn-save-notes');
    const status = document.getElementById('notes-save-status');

    const save = () => {
      window.JUIT_PROFILE.notes = [{
        id: 'note-1',
        title: 'Class Notes',
        content: textarea.value,
        updatedAt: new Date().toLocaleString()
      }];
      this.saveProfile();
      if (status) {
        status.style.display = 'block';
        setTimeout(() => { status.style.display = 'none'; }, 2000);
      }
    };

    if (saveBtn) saveBtn.addEventListener('click', save);
    if (textarea) textarea.addEventListener('input', () => {
      // Auto-save debounce
      clearTimeout(this._noteDebounce);
      this._noteDebounce = setTimeout(save, 1000);
    });
  },

  /* 5. Emergency Contacts */
  renderEmergencyContacts(container) {
    const contacts = [
      { role: 'Campus Medical Dispensary & Ambulance (24x7)', phone: '+91 1792 239250', ext: 'Ext: 250', note: 'Resident medical officer on duty, 24x7 ambulance bay' },
      { role: 'Main Security Gate & Campus Control Room', phone: '+91 1792 239240', ext: 'Ext: 240', note: 'Campus boundary security, visitor authorization, emergencies' },
      { role: 'Dean of Students (DOS) Office', phone: '+91 1792 239230', ext: 'Ext: 230', note: 'Student welfare, disciplinary council, student permissions' },
      { role: 'Chief Warden (Boys Hostels)', phone: '+91 1792 239260', ext: 'Ext: 260', note: 'Shastri, Azad, Patel, Subhash Bhawan caretakers' },
      { role: 'Chief Warden (Girls Hostels)', phone: '+91 1792 239270', ext: 'Ext: 270', note: 'Geeta Bhawan, Malviya Bhawan resident wardens' },
      { role: 'National Anti-Ragging Toll Free Helpline', phone: '1800-180-5522', ext: '24x7 Free', note: 'University Zero-Tolerance Anti-Ragging Committee' },
      { role: 'IT Support & Campus Network Control', phone: '+91 1792 239280', ext: 'Ext: 280', note: 'Wi-Fi credentials, Webkiosk reset, Moodle accounts' }
    ];

    container.innerHTML = `
      <div class="dash-card">
        <h3 style="font-size: 1.25rem; margin-bottom: 6px;">JUIT Emergency Helpline Directory</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 16px;">Important campus emergency contacts, medical dispatch, hostel wardens, and security numbers.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px;">
          ${contacts.map(c => `
            <div class="dash-card" style="padding: 14px; background: var(--bg-elevated); border-left: 3px solid var(--accent-primary);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <h4 style="font-size: 1rem; color: var(--text-primary); margin: 0;">${c.role}</h4>
                <span class="hub-badge">${c.ext}</span>
              </div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-lab); margin: 6px 0; font-family: var(--font-mono);">
                📞 ${c.phone}
              </div>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
                ${c.note}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
};

window.UtilitiesController = UtilitiesController;
