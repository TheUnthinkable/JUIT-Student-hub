/**
 * Announcements & Notification Center for JUIT Student Hub
 */

const AnnouncementsController = {
  activeCategory: 'all',
  searchQuery: '',
  unreadNotifications: [],

  init() {
    this.renderCategoryFilters();
    this.renderAnnouncements();
    this.initNotifications();
    this.bindEvents();
  },

  getAnnouncements() {
    return (window.JUIT_DATA && window.JUIT_DATA.announcements) || [];
  },

  saveAnnouncements() {
    localStorage.setItem('juit_announcements', JSON.stringify(window.JUIT_DATA.announcements));
  },

  renderCategoryFilters() {
    const container = document.getElementById('announcements-category-filters');
    if (!container) return;

    const categories = [
      { id: 'all', label: 'All Notices' },
      { id: 'Examination', label: 'Examinations' },
      { id: 'Academic', label: 'Academic' },
      { id: 'Mess', label: 'Mess & Food' },
      { id: 'Hostel', label: 'Hostels' },
      { id: 'Events', label: 'Events & Fests' },
      { id: 'General', label: 'General' }
    ];

    container.innerHTML = categories.map(c => `
      <button type="button" class="map-filter-chip ${c.id === this.activeCategory ? 'active' : ''}" data-cat="${c.id}">
        ${c.label}
      </button>
    `).join('');

    container.querySelectorAll('.map-filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.cat;
        this.renderCategoryFilters();
        this.renderAnnouncements();
      });
    });
  },

  renderAnnouncements() {
    const container = document.getElementById('announcements-cards-container');
    if (!container) return;

    let items = this.getAnnouncements();

    if (this.activeCategory !== 'all') {
      items = items.filter(a => a.category === this.activeCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.author && a.author.toLowerCase().includes(q))
      );
    }

    // Sort: Pinned first, then by date descending
    items.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date) - new Date(a.date);
    });

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card col-span-12">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📢</div>
          <h3>No Announcements Found</h3>
          <p>You're all caught up with university circulars and notices.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(a => {
      let priorityColor = '#3b82f6';
      if (a.priority === 'Urgent') priorityColor = '#ef4444';
      if (a.priority === 'High') priorityColor = '#f97316';

      return `
        <div class="dash-card announcement-item-card ${a.pinned ? 'card-pinned' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              ${a.pinned ? '<span class="pinned-tag">📌 Pinned</span>' : ''}
              <span class="hub-badge" style="background: ${priorityColor}20; color: ${priorityColor}; border-color: ${priorityColor}50;">
                ${a.priority}
              </span>
              <span class="hub-badge">${a.category}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
              ${a.date}
            </div>
          </div>

          <h3 style="font-size: 1.15rem; line-height: 1.4; margin: 6px 0 8px;">${a.title}</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.5; margin-bottom: 12px;">
            ${a.summary}
          </p>

          ${a.details ? `
            <div class="announcement-expandable-details" id="details-${a.id}" style="display: none; background: var(--bg-elevated); padding: 12px; border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px; border-left: 3px solid var(--accent-primary);">
              ${a.details}
            </div>
          ` : ''}

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 0.78rem; color: var(--text-muted);">
            <span>Issued by: <strong>${a.author || 'University Administration'}</strong></span>
            ${a.details ? `
              <button type="button" class="btn-micro btn-toggle-details" data-id="${a.id}">Read Notice</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-toggle-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const box = document.getElementById(`details-${id}`);
        if (box) {
          const isShown = box.style.display !== 'none';
          box.style.display = isShown ? 'none' : 'block';
          btn.textContent = isShown ? 'Read Notice' : 'Close';
        }
      });
    });
  },

  /* Notification Center Engine */
  initNotifications() {
    const defaultNotifs = [
      { id: 'notif-1', text: 'Upcoming T-2 Mid-Semester Examinations commence next week.', time: '10m ago', unread: true, type: 'exam' },
      { id: 'notif-2', text: 'Annapurna Dinner is currently being served (07:30 PM - 09:00 PM).', time: '1h ago', unread: true, type: 'mess' },
      { id: 'notif-3', text: 'Murious 19.0 Technical Fest registrations close this Friday.', time: '3h ago', unread: true, type: 'event' },
      { id: 'notif-4', text: 'Night Milk Distribution counters open at 09:15 PM.', time: '5h ago', unread: false, type: 'mess' }
    ];

    const saved = localStorage.getItem('juit_notifications');
    this.unreadNotifications = saved ? JSON.parse(saved) : defaultNotifs;
    this.updateNotificationBadge();
  },

  updateNotificationBadge() {
    const unreadCount = this.unreadNotifications.filter(n => n.unread).length;
    const badge = document.getElementById('notif-badge-counter');
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = unreadCount;
      } else {
        badge.style.display = 'none';
      }
    }
  },

  renderNotificationPanel() {
    const list = document.getElementById('notification-items-list');
    if (!list) return;

    if (this.unreadNotifications.length === 0) {
      list.innerHTML = `
        <div style="padding: 30px 20px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 6px;">🔔</div>
          <div>No notifications. You're all caught up!</div>
        </div>
      `;
      return;
    }

    list.innerHTML = this.unreadNotifications.map(n => `
      <div class="notification-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div style="font-size: 0.88rem; line-height: 1.4; color: var(--text-primary);">
            ${n.text}
          </div>
          ${n.unread ? '<span class="notif-dot-unread" title="Unread"></span>' : ''}
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
          ${n.time}
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const target = this.unreadNotifications.find(x => x.id === id);
        if (target) {
          target.unread = false;
          localStorage.setItem('juit_notifications', JSON.stringify(this.unreadNotifications));
          this.updateNotificationBadge();
          this.renderNotificationPanel();
        }
      });
    });
  },

  markAllAsRead() {
    this.unreadNotifications.forEach(n => { n.unread = false; });
    localStorage.setItem('juit_notifications', JSON.stringify(this.unreadNotifications));
    this.updateNotificationBadge();
    this.renderNotificationPanel();
  },

  bindEvents() {
    const searchInput = document.getElementById('announcements-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderAnnouncements();
      });
    }

    // Bell button trigger
    const bellBtn = document.getElementById('btn-open-notifications');
    const drawer = document.getElementById('notification-drawer');
    const closeBtn = document.getElementById('btn-close-notif-drawer');
    const markReadBtn = document.getElementById('btn-mark-all-read');

    if (bellBtn && drawer) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.renderNotificationPanel();
        drawer.classList.toggle('active');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('active');
      });
    }

    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        this.markAllAsRead();
      });
    }

    document.addEventListener('click', (e) => {
      if (drawer && drawer.classList.contains('active') && !drawer.contains(e.target) && e.target !== bellBtn) {
        drawer.classList.remove('active');
      }
    });
  }
};

window.AnnouncementsController = AnnouncementsController;
