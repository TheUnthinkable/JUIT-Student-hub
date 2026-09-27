/**
 * Quick Portals Launcher for JUIT Student Hub
 */

const PortalsController = {
  portals: [
    {
      id: 'moodle',
      title: 'JUIT Moodle LMS',
      subtitle: 'Assignments, lecture slides, quizzes & course enrollments',
      url: 'https://lms.juit.ac.in/login/index.php',
      icon: '🎓',
      color: '#f97316',
      badge: 'Direct Portal',
      features: ['Assignments Submission', 'Lecture Notes & Slides', 'Lab Quizzes', 'Course Announcements']
    },
    {
      id: 'lrc',
      title: 'LRC Digital Library',
      subtitle: 'DSpace, IEEE Xplore, Previous Year Questions (PYQ) & Research',
      url: 'https://www.juit.ac.in/lrc/Digital_library.php',
      icon: '📚',
      color: '#3b82f6',
      badge: 'Knowledge Hub',
      features: ['DSpace Institutional Repository', 'Previous Year Exam Papers (PYQ)', 'IEEE Xplore & ScienceDirect', 'Koha Web OPAC Book Catalog']
    },
    {
      id: 'webkiosk',
      title: 'JUIT Webkiosk',
      subtitle: 'Live attendance percentage, semester grades, SGPA & fee receipts',
      url: 'https://webkiosk.juit.ac.in/',
      icon: '📊',
      color: '#10b981',
      badge: 'Academic Records',
      features: ['Real-time Attendance Tracking', 'T1, T2, T3 Marks Breakdown', 'Semester Grade Sheets & SGPA', 'Hostel & Mess Fee Receipts']
    },
    {
      id: 'juit-main',
      title: 'Official JUIT Portal',
      subtitle: 'University administration, notices, events & circulars',
      url: 'https://www.juit.ac.in/',
      icon: '🏛️',
      color: '#8b5cf6',
      badge: 'University Home',
      features: ['Official Notifications & Circulars', 'Faculty Directory & Emails', 'Training & Placement Cell (T&P)', 'JYC Clubs & Activities']
    }
  ],

  init() {
    this.renderTiles();
  },

  renderTiles() {
    const container = document.getElementById('dash-portal-tiles');
    if (!container) return;

    container.innerHTML = this.portals.map(p => `
      <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="portal-tile-link" id="portal-link-${p.id}">
        <div class="portal-tile-left">
          <div class="portal-tile-icon" style="background: ${p.color};">
            ${p.icon}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="portal-tile-title">${p.title}</span>
              <span class="hub-badge" style="font-size: 0.65rem; padding: 1px 6px;">${p.badge}</span>
            </div>
            <div class="portal-tile-desc">${p.subtitle}</div>
          </div>
        </div>
        <div style="color: var(--text-muted); font-size: 1.1rem; flex-shrink: 0;">
          ↗
        </div>
      </a>
    `).join('');
  },

  openPortalModal(portalId) {
    const portal = this.portals.find(p => p.id === portalId);
    if (!portal) return;

    const modal = document.getElementById('universal-modal');
    const content = document.getElementById('universal-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="display: flex; align-items: flex-start; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="portal-tile-icon" style="background: ${portal.color}; width: 48px; height: 48px; font-size: 24px;">
            ${portal.icon}
          </div>
          <div>
            <h2 style="font-size: 1.35rem;">${portal.title}</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">${portal.subtitle}</p>
          </div>
        </div>
        <button type="button" class="btn-close-drawer" onclick="PortalsController.closeModal()">✕</button>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px;">
        <div style="font-weight: 700; margin-bottom: 8px; font-size: 0.9rem;">Included Services:</div>
        <ul style="padding-left: 20px; line-height: 1.6; font-size: 0.88rem; color: var(--text-secondary);">
          ${portal.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button type="button" class="btn-cmd-search" onclick="PortalsController.closeModal()">Cancel</button>
        <a href="${portal.url}" target="_blank" rel="noopener noreferrer" class="nav-tab-item active" style="text-decoration: none;">
          Launch Portal ↗
        </a>
      </div>
    `;

    modal.classList.add('open');
  },

  closeModal() {
    const modal = document.getElementById('universal-modal');
    if (modal) modal.classList.remove('open');
  }
};

window.PortalsController = PortalsController;
