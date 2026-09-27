/**
 * Events & Clubs Controller for JUIT Student Hub
 */

const EventsClubsController = {
  activeTab: 'events', // 'events' | 'clubs'
  searchQuery: '',

  init() {
    this.renderTabs();
    this.renderContent();
    this.bindEvents();
  },

  getEvents() {
    return (window.JUIT_DATA && window.JUIT_DATA.events) || [];
  },

  getClubs() {
    return (window.JUIT_DATA && window.JUIT_DATA.clubs) || [];
  },

  renderTabs() {
    const tabEvents = document.getElementById('tab-btn-events');
    const tabClubs = document.getElementById('tab-btn-clubs');

    if (tabEvents && tabClubs) {
      tabEvents.classList.toggle('active', this.activeTab === 'events');
      tabClubs.classList.toggle('active', this.activeTab === 'clubs');
    }
  },

  renderContent() {
    if (this.activeTab === 'events') {
      this.renderEvents();
    } else {
      this.renderClubs();
    }
  },

  renderEvents() {
    const container = document.getElementById('events-clubs-container');
    if (!container) return;

    let items = this.getEvents();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.organizer && e.organizer.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card col-span-12">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🎪</div>
          <h3>No Campus Events Found</h3>
          <p>No active events matching your query right now.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(ev => `
      <div class="dash-card event-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <span class="hub-badge" style="background: rgba(99, 102, 241, 0.15); color: var(--accent-primary);">
            ${ev.category}
          </span>
          <span class="kbd-shortcut" style="color: var(--color-lab);">${ev.status || 'Active'}</span>
        </div>

        <h3 style="font-size: 1.2rem; line-height: 1.35; margin: 6px 0 8px;">${ev.title}</h3>
        
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px;">
          <div>📅 Date: <strong>${ev.date} ${ev.endDate ? 'to ' + ev.endDate : ''}</strong> (${ev.time || 'All Day'})</div>
          <div>📍 Venue: <strong>${ev.venue}</strong></div>
          <div>👥 Organized by: <strong>${ev.organizer}</strong></div>
        </div>

        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
          ${ev.description}
        </p>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
          <button type="button" class="btn-micro btn-event-map" data-venue="${ev.venue}">
            🗺️ Locate Venue
          </button>
          <a href="${ev.registrationLink || '#'}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding: 6px 14px; font-size: 0.8rem; text-decoration: none;">
            Register ↗
          </a>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-event-map').forEach(btn => {
      btn.addEventListener('click', () => {
        const venue = btn.dataset.venue;
        if (window.App && window.CampusMap) {
          window.App.switchView('campus');
          window.CampusMap.searchAndHighlightVenue(venue);
        }
      });
    });
  },

  renderClubs() {
    const container = document.getElementById('events-clubs-container');
    if (!container) return;

    let items = this.getClubs();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        (c.tagline && c.tagline.toLowerCase().includes(q))
      );
    }

    container.innerHTML = items.map(c => `
      <div class="dash-card club-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2rem; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--bg-elevated); border-radius: var(--radius-sm);">
              ${c.logo || '🏛️'}
            </div>
            <div>
              <span class="hub-badge">${c.category}</span>
              <h3 style="font-size: 1.15rem; margin-top: 2px;">${c.name}</h3>
            </div>
          </div>
          <span class="kbd-shortcut">${c.membersCount || 100}+ Members</span>
        </div>

        <div style="font-size: 0.84rem; font-style: italic; color: var(--accent-primary); margin-bottom: 8px;">
          "${c.tagline}"
        </div>

        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
          ${c.description}
        </p>

        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.78rem; color: var(--text-muted); background: var(--bg-elevated); padding: 10px; border-radius: var(--radius-sm); margin-bottom: 12px;">
          <div>🎓 Mentor: <strong>${c.facultyAdvisor}</strong></div>
          <div>👤 Student Leads: <strong>${c.coordinators}</strong></div>
          <div>📍 Hub: <strong>${c.meetingVenue}</strong></div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
          <div style="display: flex; gap: 8px;">
            ${c.socials?.instagram ? `<a href="${c.socials.instagram}" target="_blank" class="kbd-shortcut" title="Instagram">Instagram</a>` : ''}
            ${c.socials?.github ? `<a href="${c.socials.github}" target="_blank" class="kbd-shortcut" title="GitHub">GitHub</a>` : ''}
          </div>
          <button type="button" class="btn-secondary btn-join-club" data-name="${c.name}" style="padding: 5px 12px; font-size: 0.78rem;">
            Contact / Join
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-join-club').forEach(btn => {
      btn.addEventListener('click', () => {
        alert(`Join request for ${btn.dataset.name}: Connect directly during club orientation in AB1 or contact student leads.`);
      });
    });
  },

  bindEvents() {
    const tabEvents = document.getElementById('tab-btn-events');
    const tabClubs = document.getElementById('tab-btn-clubs');

    if (tabEvents) {
      tabEvents.addEventListener('click', () => {
        this.activeTab = 'events';
        this.renderTabs();
        this.renderContent();
      });
    }

    if (tabClubs) {
      tabClubs.addEventListener('click', () => {
        this.activeTab = 'clubs';
        this.renderTabs();
        this.renderContent();
      });
    }

    const searchInput = document.getElementById('events-clubs-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderContent();
      });
    }
  }
};

window.EventsClubsController = EventsClubsController;
