/**
 * Quick Portals & Useful Links Launcher for JUIT Student Hub
 * One-stop access to university portals, learning management, digital libraries,
 * administrative tools, transit reservations, and student helplines.
 */

const PortalsController = {
  activeCategory: 'all',
  searchQuery: '',

  portals: [
    {
      id: 'moodle',
      title: 'JUIT Moodle LMS',
      category: 'academic',
      categoryLabel: 'Academic & LMS',
      subtitle: 'Assignments submission, lecture slides, quizzes & course enrollments',
      url: 'https://lms.juit.ac.in/login/index.php',
      icon: 'school',
      color: '#f97316',
      badge: 'Direct Portal',
      features: ['Assignment Submissions', 'Lecture Notes & Slides', 'Lab Quizzes & Grades', 'Course Discussion Forums']
    },
    {
      id: 'webkiosk',
      title: 'JUIT Webkiosk',
      category: 'academic',
      categoryLabel: 'Academic & Records',
      subtitle: 'Real-time attendance percentages, SGPA/CGPA breakdown, T1/T2/T3 marks & fee receipts',
      url: 'https://webkiosk.juit.ac.in/',
      icon: 'analytics',
      color: '#10b981',
      badge: 'Academic SSO',
      features: ['Real-time Attendance Tracking', 'T1, T2, T3 Marks Breakdown', 'Semester Grade Sheets & SGPA', 'Hostel & Mess Fee Receipts']
    },
    {
      id: 'lrc',
      title: 'LRC Digital Library & Koha OPAC',
      category: 'academic',
      categoryLabel: 'Library & Research',
      subtitle: 'Previous Year Exam Papers (PYQ), IEEE Xplore, DSpace thesis repository & book catalog',
      url: 'https://www.juit.ac.in/lrc/Digital_library.php',
      icon: 'menu_book',
      color: '#3b82f6',
      badge: 'Digital Repository',
      features: ['Previous Year Exam Papers (PYQ)', 'IEEE Xplore & ScienceDirect', 'DSpace Institutional Thesis Archive', 'Koha Web OPAC Book Search']
    },
    {
      id: 'coe',
      title: 'Controller of Examinations (COE)',
      category: 'academic',
      categoryLabel: 'Exams & Results',
      subtitle: 'Official date sheets, examination seating roll plans, grade moderation policies & transcripts',
      url: 'https://www.juit.ac.in/',
      icon: 'assignment_turned_in',
      color: '#ef4444',
      badge: 'Official Notices',
      features: ['T-1, T-2, T-3 Date Sheets', 'Seating Roll Allotment Matrices', 'Grade Moderation & Re-evaluation', 'Degree & Transcript Verification']
    },
    {
      id: 'juit-main',
      title: 'Official JUIT University Portal',
      category: 'admin',
      categoryLabel: 'University Admin',
      subtitle: 'Registrar notifications, academic regulations, faculty directory & administrative circulars',
      url: 'https://www.juit.ac.in/',
      icon: 'account_balance',
      color: '#8b5cf6',
      badge: 'University Home',
      features: ['Official Notifications & Circulars', 'Faculty Directory & Contact Emails', 'Academic Ordinances & Rules', 'Holidays & Campus Calendar Notices']
    },
    {
      id: 'tandp',
      title: 'Training & Placement Cell (T&P)',
      category: 'careers',
      categoryLabel: 'Placements & Internships',
      subtitle: 'Campus recruitment drives, summer internship opportunities & placement statistics',
      url: 'https://www.juit.ac.in/placement_cell.php',
      icon: 'work',
      color: '#06b6d4',
      badge: 'Career Portal',
      features: ['On-Campus Placement Drives', 'Summer Internships & PPOs', 'Resume Building Workshops', 'Alumni Placement Network']
    },
    {
      id: 'tiedc',
      title: 'TIEDC Startup Incubation Centre',
      category: 'careers',
      categoryLabel: 'Incubation & Grants',
      subtitle: 'MSME seed funding grants, student patents, hackathons & startup mentoring',
      url: 'https://www.juit.ac.in/tiedc/',
      icon: 'rocket_launch',
      color: '#eab308',
      badge: 'Startup Hub',
      features: ['Seed Funding & Grants', 'Patent Filing Guidance', 'Incubation Office Space', 'Investor Pitch Days']
    },
    {
      id: 'wifi',
      title: 'Campus WiFi & Cyberoam Auth',
      category: 'living',
      categoryLabel: 'Campus Living',
      subtitle: 'Hostel WiFi authentication, student device MAC registration & high-speed LAN access',
      url: 'http://172.16.1.1:8090/',
      icon: 'wifi',
      color: '#0ea5e9',
      badge: 'Intranet Only',
      features: ['Cyberoam / Fortinet Login', 'Device MAC Address Binding', 'Hostel LAN Port Authentication', 'Bandwidth Quota Management']
    },
    {
      id: 'hrtc',
      title: 'Himachal HRTC Online Bus Portal',
      category: 'living',
      categoryLabel: 'Transit & Travel',
      subtitle: 'Online seat reservations for NH-5 buses between Waknaghat, Shimla, Chandigarh & Delhi',
      url: 'https://online.hrtchp.com/',
      icon: 'directions_bus',
      color: '#059669',
      badge: 'Transit Booking',
      features: ['Volvo & Deluxe Bus Booking', 'Live HRTC Bus Schedule', 'Seat Selection & E-Ticket', 'Himachal Concession Passes']
    },
    {
      id: 'hostel',
      title: 'Hostel Administration & Welfare',
      category: 'living',
      categoryLabel: 'Campus Living',
      subtitle: 'Hostel warden contacts, night leave permissions, maintenance requests & mess rebate forms',
      url: 'https://www.juit.ac.in/facilities/hostels.php',
      icon: 'hotel',
      color: '#ec4899',
      badge: 'Hostel Welfare',
      features: ['Warden & Supervisor Contacts', 'Outstation Night Leave Rules', 'Hostel Maintenance Tickets', 'Mess Rebate Applications']
    },
    {
      id: 'scholarship',
      title: 'National Scholarship Portal (NSP)',
      category: 'admin',
      categoryLabel: 'Scholarships',
      subtitle: 'Central & State Government merit-cum-means and AICTE Pragati/Saksham scholarships',
      url: 'https://scholarships.gov.in/',
      icon: 'card_giftcard',
      color: '#6366f1',
      badge: 'Govt Portal',
      features: ['Central Sector Schemes', 'Himachal State Scholarships', 'AICTE Technical Awards', 'Institute Application Verification']
    },
    {
      id: 'antiragging',
      title: 'Anti-Ragging & Student Grievance',
      category: 'living',
      categoryLabel: 'Student Support',
      subtitle: '24/7 student welfare, confidential grievance redressal & campus mental health counselling',
      url: 'https://www.juit.ac.in/anti_ragging.php',
      icon: 'shield',
      color: '#f43f5e',
      badge: '24/7 Helpline',
      features: ['Confidential Grievance Submission', 'Anti-Ragging Squad Contacts', 'Student Counselling Appointments', 'Zero Tolerance Policy Guidelines']
    }
  ],

  init() {
    this.renderCategoryFilters();
    this.renderPortals();
    this.bindEvents();
  },

  renderCategoryFilters() {
    const container = document.getElementById('portals-category-filters');
    if (!container) return;

    const categories = [
      { id: 'all', label: 'All Portals', icon: 'apps' },
      { id: 'academic', label: 'Academic & LMS', icon: 'school' },
      { id: 'admin', label: 'Admin & Records', icon: 'account_balance' },
      { id: 'living', label: 'Living & Transit', icon: 'cottage' },
      { id: 'careers', label: 'Career & Incubation', icon: 'work' }
    ];

    container.innerHTML = categories.map(cat => {
      const isActive = (cat.id === this.activeCategory);
      let count = 0;
      if (cat.id === 'all') count = this.portals.length;
      else count = this.portals.filter(p => p.category === cat.id).length;

      return `
        <button type="button" class="portal-cat-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-xs transition-all flex-shrink-0 cursor-pointer ${
          isActive
            ? 'bg-primary text-on-primary font-bold shadow-sm'
            : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        }" data-category="${cat.id}">
          <span class="material-symbols-outlined text-[15px]">${cat.icon}</span>
          <span>${cat.label}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}">${count}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.portal-cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.category;
        this.renderCategoryFilters();
        this.renderPortals();
      });
    });
  },

  renderPortals() {
    const container = document.getElementById('dash-portal-tiles');
    if (!container) return;

    let items = [...this.portals];

    // Category filter
    if (this.activeCategory !== 'all') {
      items = items.filter(p => p.category === this.activeCategory);
    }

    // Search query filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.features.some(f => f.toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-surface-container-low rounded-2xl border border-white/[0.06]">
          <div class="text-4xl mb-3">🔗</div>
          <h3 class="font-headline-sm text-base text-on-surface font-semibold mb-1">No Portals Found</h3>
          <p class="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
            ${this.searchQuery ? `No portals matching "${this.searchQuery}".` : 'No services found in this category.'}
          </p>
          <button type="button" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer" onclick="PortalsController.resetFilters()">
            Show All Portals
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(p => `
      <div class="group rounded-2xl bg-surface-container-low hover:bg-surface-container border border-white/[0.06] p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:border-white/[0.12]" id="portal-card-${p.id}">
        <div>
          <!-- Header Row -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style="background: ${p.color}20; border: 1px solid ${p.color}40; color: ${p.color};">
                <span class="material-symbols-outlined text-[24px]">${p.icon}</span>
              </div>
              <div class="min-w-0">
                <span class="font-label-sm text-[11px] font-semibold uppercase tracking-wider" style="color: ${p.color};">${p.categoryLabel}</span>
                <h4 class="font-headline-sm text-base text-on-surface font-bold truncate group-hover:text-primary transition-colors">${p.title}</h4>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-container-high text-secondary border border-white/[0.04] shrink-0 font-medium">
              ${p.badge}
            </span>
          </div>

          <!-- Description -->
          <p class="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
            ${p.subtitle}
          </p>

          <!-- Key Features Pills -->
          <div class="flex flex-wrap gap-1.5 mb-4">
            ${p.features.slice(0, 3).map(f => `
              <span class="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-surface-container-lowest/60 text-on-surface-variant border border-white/[0.03]">
                ${f}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Action Footer -->
        <div class="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
          <button type="button" class="btn-portal-modal px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer" data-id="${p.id}">
            <span class="material-symbols-outlined text-[15px]">info</span>
            <span>Services</span>
          </button>

          <div class="flex items-center gap-2">
            <button type="button" class="btn-portal-copy w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer" data-url="${p.url}" data-title="${p.title}" title="Copy Link">
              <span class="material-symbols-outlined text-[15px]">content_copy</span>
            </button>
            <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-sm">
              <span>Launch</span>
              <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // Bind services modal trigger
    container.querySelectorAll('.btn-portal-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openPortalModal(btn.dataset.id);
      });
    });

    // Bind copy link trigger
    container.querySelectorAll('.btn-portal-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            alert(`✓ Copied link for ${btn.dataset.title}:\n${url}`);
          });
        } else {
          prompt('Copy portal URL:', url);
        }
      });
    });
  },

  openPortalModal(portalId) {
    const portal = this.portals.find(p => p.id === portalId);
    if (!portal) return;

    let modal = document.getElementById('universal-modal');
    let content = document.getElementById('universal-modal-content');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'universal-modal';
      modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4';
      modal.innerHTML = `
        <div class="w-full max-w-lg rounded-2xl bg-surface-container-low border border-white/[0.1] shadow-2xl p-5 sm:p-6 flex flex-col gap-4" id="universal-modal-content">
        </div>
      `;
      document.body.appendChild(modal);
      content = modal.querySelector('#universal-modal-content');
    }

    content.innerHTML = `
      <div class="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style="background: ${portal.color}20; border: 1px solid ${portal.color}40; color: ${portal.color};">
            <span class="material-symbols-outlined text-[26px]">${portal.icon}</span>
          </div>
          <div>
            <span class="font-label-sm text-[11px] font-semibold uppercase tracking-wider" style="color: ${portal.color};">${portal.categoryLabel}</span>
            <h3 class="font-headline-sm text-base sm:text-lg text-on-surface font-bold">${portal.title}</h3>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-xl bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" onclick="PortalsController.closeModal()">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <p class="font-body-sm text-xs sm:text-body-sm text-on-surface-variant leading-relaxed">
        ${portal.subtitle}
      </p>

      <div class="rounded-xl bg-surface-container p-4 border border-white/[0.04]">
        <h4 class="font-label-md text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">verified</span>
          <span>Included Services & Features:</span>
        </h4>
        <ul class="space-y-1.5 text-xs text-on-surface">
          ${portal.features.map(f => `
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.04]">
        <button type="button" class="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer" onclick="PortalsController.closeModal()">
          Close
        </button>
        <a href="${portal.url}" target="_blank" rel="noopener noreferrer" class="px-4 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center gap-1 transition-all shadow-sm">
          <span>Launch Portal</span>
          <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
        </a>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('open', 'active');
  },

  closeModal() {
    const modal = document.getElementById('universal-modal');
    if (modal) {
      modal.classList.remove('open', 'active');
      modal.classList.add('hidden');
    }
  },

  resetFilters() {
    this.searchQuery = '';
    this.activeCategory = 'all';
    const searchInput = document.getElementById('portals-search-input');
    if (searchInput) searchInput.value = '';
    this.renderCategoryFilters();
    this.renderPortals();
  },

  bindEvents() {
    const searchInput = document.getElementById('portals-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderPortals();
      });
    }
  }
};

window.PortalsController = PortalsController;
