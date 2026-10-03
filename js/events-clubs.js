/**
 * Campus Life & Events Controller for JUIT Student Hub
 * Manages official university fests, hackathons, cultural events,
 * and student clubs & societies.
 */

const EventsClubsController = {
  activeTab: 'events', // 'events' | 'clubs'
  activeCategory: 'all',
  searchQuery: '',

  eventsData: [
    {
      id: 'murious-19',
      title: 'Murious 19.0 — National Technical Symposium',
      category: 'technical',
      categoryLabel: 'Technical & Hackathon',
      icon: 'terminal',
      status: 'Flagship Fest',
      statusType: 'flagship',
      date: 'Oct 9 – Oct 11, 2026',
      time: '10:00 AM – Late Night',
      venue: 'Open Air Theatre (OAT) & AB2',
      organizer: 'TIEDC & Technical Council',
      prizePool: '₹1,50,000+',
      featured: true,
      description: "North India's premier technical fest featuring 24-hr Hackathon, WebCraft, Drone Racing, and CAD Arena across AI, design, and hardware tracks.",
      registrationLink: 'https://murious.juit.ac.in/'
    },
    {
      id: 'le-fiestus',
      title: 'Le Fiestus 2027 — Annual Inter-College Cultural Extravaganza',
      category: 'cultural',
      categoryLabel: 'Cultural & Arts',
      icon: 'theater_comedy',
      status: 'Coming Soon',
      statusType: 'upcoming',
      date: 'Apr 3 – Apr 5, 2027',
      time: '11:00 AM – 10:00 PM',
      venue: 'Open Air Theatre & Campus Grounds',
      organizer: 'Jaypee Youth Club (JYC)',
      prizePool: '₹2,00,000+',
      featured: false,
      description: 'The pinnacle of campus culture. Battle of the Bands, Panache Fashion Runway, Street Play, Classical Solo, and celebrity musical night under the Himalayan stars.',
      registrationLink: 'https://jyc.juit.ac.in/fiestus'
    },
    {
      id: 'algolympics',
      title: 'Algolympics 2026 — 5-Hour ICPC Style Coding Marathon',
      category: 'technical',
      categoryLabel: 'Technical & Hackathon',
      icon: 'code',
      status: 'Registrations Open',
      statusType: 'open',
      date: 'Oct 24, 2026',
      time: '02:00 PM – 07:00 PM',
      venue: 'Academic Block 1 (CL1 & CL2)',
      organizer: 'ACM JUIT Student Chapter',
      prizePool: '₹25,000 + Swag',
      featured: false,
      description: 'Competitive programming sprint testing algorithms, data structures, and mathematical thinking. Teams of 2 to 3 scholars across all batches.',
      registrationLink: 'https://acm.juit.ac.in/algolympics'
    },
    {
      id: 'synapse-symposium',
      title: 'Synapse 2026 — National Biotechnology Research Forum',
      category: 'workshops',
      categoryLabel: 'Workshops & Talks',
      icon: 'biotech',
      status: 'Call for Abstracts',
      statusType: 'open',
      date: 'Nov 14 – Nov 15, 2026',
      time: '09:30 AM – 05:00 PM',
      venue: 'Auditorium (DLC) & AB3 Labs',
      organizer: 'Department of Biotechnology & Bioinformatics',
      prizePool: 'Best Paper Grants',
      featured: false,
      description: 'Keynote lectures by CSIR and ICMR scientists, poster sessions on computational genomics, CRISPR gene editing, and Himalayan medicinal flora.',
      registrationLink: 'https://www.juit.ac.in/synapse2026'
    },
    {
      id: 'diksha-freshers',
      title: 'Diksha 2026 — Official Freshers Induction Gala',
      category: 'cultural',
      categoryLabel: 'Cultural & Arts',
      icon: 'celebration',
      status: 'Scheduled',
      statusType: 'upcoming',
      date: 'Oct 18, 2026',
      time: '04:30 PM onwards',
      venue: 'Open Air Theatre (OAT)',
      organizer: 'JYC & Senior Student Council',
      prizePool: 'Mr. & Ms. Fresher',
      featured: false,
      description: 'Warm welcome ceremony for 2026 B.Tech/M.Tech scholars. Dance recitals, acoustic rock sessions, comedic sketches, and crowning ceremony.',
      registrationLink: '#'
    },
    {
      id: 'juit-champions-league',
      title: 'JUIT Sports Premier League (JSPL) — Inter-Batch Cup',
      category: 'sports',
      categoryLabel: 'Sports & Fitness',
      icon: 'sports_soccer',
      status: 'Fixture Draw',
      statusType: 'upcoming',
      date: 'Nov 6 – Nov 12, 2026',
      time: '04:00 PM – 08:00 PM',
      venue: 'Main Campus Ground & Basketball Court',
      organizer: 'Sports Committee & DSW',
      prizePool: 'Trophies & Medals',
      featured: false,
      description: 'High-octane tournament spanning Football, Box Cricket, Basketball, Volleyball, and Badminton. Batch vs Batch rivalry for the annual trophy.',
      registrationLink: '#'
    },
    {
      id: 'ai-bootcamp',
      title: 'Edge AI & Deep Learning Bootcamp with NVIDIA Jetson',
      category: 'workshops',
      categoryLabel: 'Workshops & Talks',
      icon: 'smart_toy',
      status: 'Limited Seats',
      statusType: 'open',
      date: 'Nov 21, 2026',
      time: '10:00 AM – 04:00 PM',
      venue: 'AB1 Room 204 (IoT Lab)',
      organizer: 'IEEE JUIT & ECE Department',
      prizePool: 'Certificates of Merit',
      featured: false,
      description: 'Hands-on edge artificial intelligence deployment, computer vision pipelines with TensorRT, and embedded microcontroller interfacing.',
      registrationLink: '#'
    }
  ],

  clubsData: [
    {
      id: 'acm',
      name: 'ACM Student Chapter JUIT',
      category: 'technical',
      categoryLabel: 'Technical Society',
      icon: 'terminal',
      color: '#3b82f6',
      tagline: 'Code. Collaborate. Conquer the Edge of Computing.',
      membersCount: 280,
      description: 'The primary technical body at JUIT fostering algorithmic problem-solving, open-source development, ICPC training camps, and hackathons.',
      facultyAdvisor: 'Dr. P.K. Gupta (CSE)',
      coordinators: 'Arjun Mehta & Sneha Rawat',
      meetingVenue: 'AB1 Computer Lab 3 (Wed 5 PM)',
      socials: {
        instagram: 'https://instagram.com/acm_juit',
        github: 'https://github.com/acm-juit'
      }
    },
    {
      id: 'tiedc',
      name: 'TIEDC & E-Cell JUIT',
      category: 'technical',
      categoryLabel: 'Innovation & Startups',
      icon: 'rocket_launch',
      color: '#f59e0b',
      tagline: 'Turning Himalayan Ideas into Scalable Ventures.',
      membersCount: 190,
      description: 'MSME and DST-funded Technology Incubation and Entrepreneurship Development Centre. Provides seed funding, patent mentoring, and investor pitch sessions.',
      facultyAdvisor: 'Dr. Ashish Kumar (Civil/TIEDC)',
      coordinators: 'Devansh Kapur & Priya Negi',
      meetingVenue: 'TIEDC Incubator AB2 2nd Floor',
      socials: {
        instagram: 'https://instagram.com/tiedc_juit',
        linkedin: 'https://linkedin.com/company/tiedc-juit'
      }
    },
    {
      id: 'ieee',
      name: 'IEEE JUIT Student Branch',
      category: 'technical',
      categoryLabel: 'Hardware & Systems',
      icon: 'memory',
      color: '#06b6d4',
      tagline: 'Advancing Technology for Humanity in the Himalayas.',
      membersCount: 220,
      description: 'Focuses on robotics, signal processing, embedded systems, quantum computing, and IEEE conference publications.',
      facultyAdvisor: 'Dr. Shruti Jain (ECE)',
      coordinators: 'Rohan Sharma & Ananya Bisht',
      meetingVenue: 'AB1 Communication Systems Lab',
      socials: {
        instagram: 'https://instagram.com/ieee_juit',
        github: 'https://github.com/ieee-juit'
      }
    },
    {
      id: 'jyc-cultural',
      name: 'Jaypee Youth Club (JYC) — Cultural & Dhwani',
      category: 'cultural',
      categoryLabel: 'Music, Dance & Drama',
      icon: 'theater_comedy',
      color: '#ec4899',
      tagline: 'The Soul, Rhythm, and Beats of Waknaghat Ridge.',
      membersCount: 450,
      description: 'Apex student union managing all cultural wings: Dhwani (Music Band), Panache (Fashion), Apurva (Classical Dance), and Street Play Society.',
      facultyAdvisor: 'Prof. Ashok Kumar Gupta',
      coordinators: 'Kabir Oberoi & Tanya Sen',
      meetingVenue: 'Open Air Theatre (OAT) Green Rooms',
      socials: {
        instagram: 'https://instagram.com/jyc_juit'
      }
    },
    {
      id: 'literary',
      name: 'Literary & Debating Society',
      category: 'literary',
      categoryLabel: 'Debating & MUN',
      icon: 'history_edu',
      color: '#8b5cf6',
      tagline: 'Articulating Ideas, Challenging Convictions.',
      membersCount: 160,
      description: 'Host of the annual JUIT Model United Nations (MUN), parliamentary debates, poetry open-mics, and campus magazine editorial team.',
      facultyAdvisor: 'Dr. Neena Jindal (HSS)',
      coordinators: 'Yuvraj Verma & Kriti Joshi',
      meetingVenue: 'AB1 Room 108 (Thu 5:30 PM)',
      socials: {
        instagram: 'https://instagram.com/debating_juit'
      }
    },
    {
      id: 'rotaract',
      name: 'Rotaract Club of Waknaghat JUIT',
      category: 'social',
      categoryLabel: 'Community & Social Impact',
      icon: 'diversity_3',
      color: '#10b981',
      tagline: 'Service Above Self. Uplifting Hill Communities.',
      membersCount: 310,
      description: 'Affiliated with Rotary International. Organizes blood donation drives, winter warm clothing distributions, clean Himalayan trails, and village teaching initiatives.',
      facultyAdvisor: 'Dr. Saurabh Rawat',
      coordinators: 'Harsh Vardhan & Mehak Chandel',
      meetingVenue: 'Auditorium Foyer (Sat 4 PM)',
      socials: {
        instagram: 'https://instagram.com/rotaract_juit'
      }
    }
  ],

  init() {
    this.renderSubCategoryFilters();
    this.renderTabs();
    this.renderContent();
    this.bindEvents();
  },

  renderTabs() {
    const tabEvents = document.getElementById('tab-btn-events');
    const tabClubs = document.getElementById('tab-btn-clubs');

    if (tabEvents && tabClubs) {
      tabEvents.className = `px-4 py-2 rounded-xl font-label-md text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
        this.activeTab === 'events'
          ? 'bg-primary text-on-primary shadow-sm'
          : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
      }`;
      tabClubs.className = `px-4 py-2 rounded-xl font-label-md text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
        this.activeTab === 'clubs'
          ? 'bg-primary text-on-primary shadow-sm'
          : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
      }`;
    }
  },

  renderSubCategoryFilters() {
    const container = document.getElementById('events-sub-filters');
    if (!container) return;

    let filters = [];
    if (this.activeTab === 'events') {
      filters = [
        { id: 'all', label: 'All Happenings' },
        { id: 'technical', label: 'Tech & Hackathons' },
        { id: 'cultural', label: 'Cultural & Fests' },
        { id: 'sports', label: 'Sports & Fitness' },
        { id: 'workshops', label: 'Workshops & Talks' }
      ];
    } else {
      filters = [
        { id: 'all', label: 'All Societies' },
        { id: 'technical', label: 'Technical & Coding' },
        { id: 'cultural', label: 'Cultural & Performing' },
        { id: 'literary', label: 'Literary & Debating' },
        { id: 'social', label: 'Community & Impact' }
      ];
    }

    container.innerHTML = filters.map(f => {
      const isActive = (f.id === this.activeCategory);
      return `
        <button type="button" class="event-filter-pill px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
          isActive
            ? 'bg-surface-container-highest text-primary font-bold border border-primary/30'
            : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
        }" data-filter="${f.id}">
          ${f.label}
        </button>
      `;
    }).join('');

    container.querySelectorAll('.event-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.filter;
        this.renderSubCategoryFilters();
        this.renderContent();
      });
    });
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

    let items = [...this.eventsData];

    // Sub-category filter
    if (this.activeCategory !== 'all') {
      items = items.filter(e => e.category === this.activeCategory);
    }

    // Search query filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.organizer && e.organizer.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q)) ||
        (e.categoryLabel && e.categoryLabel.toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-surface-container-low rounded-2xl border border-white/[0.06]">
          <div class="text-4xl mb-3">🎪</div>
          <h3 class="font-headline-sm text-base text-on-surface font-semibold mb-1">No Events Found</h3>
          <p class="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
            ${this.searchQuery ? `No happenings matching "${this.searchQuery}".` : 'No events scheduled under this category right now.'}
          </p>
          <button type="button" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer" onclick="EventsClubsController.resetFilters()">
            Show All Events
          </button>
        </div>
      `;
      return;
    }

    // Featured Hero Banner (if viewing All or Technical and no search)
    let featuredHeroHtml = '';
    const featured = items.find(x => x.featured);
    if (featured && !this.searchQuery && this.activeCategory === 'all') {
      featuredHeroHtml = `
        <div class="col-span-full rounded-2xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-5 sm:p-6 border border-primary/20 shadow-xl relative overflow-hidden mb-2">
          <div class="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div class="space-y-2 max-w-2xl">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-primary-container text-on-primary-container shadow-sm">
                  Flagship Annual Fest
                </span>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span class="material-symbols-outlined text-[13px]">military_tech</span>
                  <span>${featured.prizePool}</span>
                </span>
                <span class="text-xs text-on-surface-variant font-medium">• ${featured.organizer}</span>
              </div>
              <h3 class="font-headline-sm text-lg sm:text-xl text-on-surface font-bold tracking-tight">${featured.title}</h3>
              <p class="font-body-sm text-xs sm:text-body-sm text-on-surface-variant leading-relaxed">${featured.description}</p>
              
              <!-- Fast Meta Strip -->
              <div class="flex items-center gap-4 flex-wrap pt-1 font-mono text-xs text-primary font-medium">
                <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[15px]">calendar_month</span>${featured.date}</span>
                <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[15px]">schedule</span>${featured.time}</span>
                <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[15px]">location_on</span>${featured.venue}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5 flex-wrap shrink-0">
              <button type="button" class="btn-event-locate px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-white/[0.08]" data-venue="${featured.venue}">
                <span class="material-symbols-outlined text-[16px]">explore</span>
                <span>Locate on Map</span>
              </button>
              <a href="${featured.registrationLink}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm">
                <span>Register Portal</span>
                <span class="material-symbols-outlined text-[15px]">arrow_outward</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }

    const cardsHtml = items.map(ev => {
      let statusBadge = 'bg-surface-container-highest text-on-surface-variant';
      if (ev.statusType === 'flagship') statusBadge = 'bg-primary-container text-on-primary-container font-bold';
      else if (ev.statusType === 'open') statusBadge = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold';
      else if (ev.statusType === 'upcoming') statusBadge = 'bg-amber-500/15 text-amber-300 border border-amber-500/30';

      return `
        <div class="group rounded-2xl bg-surface-container-low hover:bg-surface-container border border-white/[0.06] p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:border-white/[0.12]">
          <div>
            <!-- Card Header Tags -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-container-high text-primary border border-white/[0.04]">
                <span class="material-symbols-outlined text-[13px]">${ev.icon}</span>
                <span>${ev.categoryLabel}</span>
              </span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-mono ${statusBadge}">
                ${ev.status}
              </span>
            </div>

            <!-- Title -->
            <h4 class="font-headline-sm text-base text-on-surface font-semibold group-hover:text-primary transition-colors leading-snug mb-2">
              ${ev.title}
            </h4>

            <!-- Metadata Box -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-surface-container-lowest/50 border border-white/[0.04] mb-3 text-xs">
              <div class="flex items-center gap-2 text-on-surface">
                <span class="material-symbols-outlined text-primary text-[15px] shrink-0">calendar_today</span>
                <span class="font-mono truncate">${ev.date}</span>
              </div>
              <div class="flex items-center gap-2 text-on-surface">
                <span class="material-symbols-outlined text-secondary text-[15px] shrink-0">schedule</span>
                <span class="font-mono truncate">${ev.time}</span>
              </div>
              <div class="flex items-center gap-2 text-on-surface col-span-1 sm:col-span-2">
                <span class="material-symbols-outlined text-emerald-400 text-[15px] shrink-0">location_on</span>
                <button type="button" class="btn-event-locate text-left hover:text-primary hover:underline transition-colors truncate cursor-pointer font-medium" data-venue="${ev.venue}">
                  ${ev.venue}
                </button>
              </div>
              <div class="flex items-center gap-2 text-on-surface-variant col-span-1 sm:col-span-2">
                <span class="material-symbols-outlined text-outline text-[15px] shrink-0">groups</span>
                <span class="truncate">By ${ev.organizer}</span>
              </div>
            </div>

            <!-- Description -->
            <p class="font-body-sm text-xs text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">
              ${ev.description}
            </p>
          </div>

          <!-- Card Actions Footer -->
          <div class="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
            <button type="button" class="btn-event-locate px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer" data-venue="${ev.venue}">
              <span class="material-symbols-outlined text-[15px]">explore</span>
              <span>Find Venue</span>
            </button>

            <div class="flex items-center gap-2">
              <button type="button" class="btn-event-share w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer" data-title="${ev.title.replace(/"/g, '&quot;')}" data-date="${ev.date}" data-venue="${ev.venue}" title="Copy Event Info">
                <span class="material-symbols-outlined text-[16px]">share</span>
              </button>
              <a href="${ev.registrationLink || '#'}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-sm">
                <span>Details</span>
                <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = featuredHeroHtml + `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">${cardsHtml}</div>`;

    // Bind venue click to switch view to campus wayfinding
    container.querySelectorAll('.btn-event-locate').forEach(btn => {
      btn.addEventListener('click', () => {
        const venue = btn.dataset.venue;
        if (window.App) window.App.switchView('campus');
        if (window.CampusMap && window.CampusMap.focusVenue) {
          window.CampusMap.focusVenue(venue);
        }
      });
    });

    // Bind share buttons
    container.querySelectorAll('.btn-event-share').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = `🎪 JUIT Campus Event: ${btn.dataset.title}\n🗓 Date: ${btn.dataset.date}\n📍 Venue: ${btn.dataset.venue}\nExplore more on JUIT Student Hub!`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            alert(`✓ Copied event details to clipboard:\n${btn.dataset.title}`);
          });
        } else {
          prompt('Copy event details:', text);
        }
      });
    });
  },

  renderClubs() {
    const container = document.getElementById('events-clubs-container');
    if (!container) return;

    let items = [...this.clubsData];

    // Sub-category filter
    if (this.activeCategory !== 'all') {
      items = items.filter(c => c.category === this.activeCategory);
    }

    // Search query filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.tagline && c.tagline.toLowerCase().includes(q)) ||
        (c.facultyAdvisor && c.facultyAdvisor.toLowerCase().includes(q)) ||
        (c.coordinators && c.coordinators.toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-surface-container-low rounded-2xl border border-white/[0.06]">
          <div class="text-4xl mb-3">🏛️</div>
          <h3 class="font-headline-sm text-base text-on-surface font-semibold mb-1">No Societies Found</h3>
          <p class="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
            No student clubs matching your search filters.
          </p>
          <button type="button" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer" onclick="EventsClubsController.resetFilters()">
            Show All Societies
          </button>
        </div>
      `;
      return;
    }

    const clubsHtml = items.map(c => `
      <div class="group rounded-2xl bg-surface-container-low hover:bg-surface-container border border-white/[0.06] p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:border-white/[0.12]">
        <div>
          <!-- Club Header -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style="background: ${c.color}20; border: 1px solid ${c.color}40; color: ${c.color};">
                <span class="material-symbols-outlined text-[24px]">${c.icon}</span>
              </div>
              <div class="min-w-0">
                <span class="font-label-sm text-[11px] font-semibold uppercase tracking-wider" style="color: ${c.color};">${c.categoryLabel}</span>
                <h4 class="font-headline-sm text-base text-on-surface font-bold truncate group-hover:text-primary transition-colors">${c.name}</h4>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-surface-container-high text-secondary border border-white/[0.04] shrink-0 font-semibold">
              ${c.membersCount}+ Members
            </span>
          </div>

          <!-- Tagline -->
          <div class="p-2.5 rounded-xl bg-surface-container-lowest/60 border border-white/[0.03] text-xs italic text-on-surface-variant mb-3">
            "${c.tagline}"
          </div>

          <!-- Description -->
          <p class="font-body-sm text-xs text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">
            ${c.description}
          </p>

          <!-- Leadership & Hub Pills -->
          <div class="space-y-1.5 p-3 rounded-xl bg-surface-container-lowest/40 border border-white/[0.03] mb-4 text-xs font-mono">
            <div class="flex items-center gap-2 text-on-surface-variant truncate">
              <span class="material-symbols-outlined text-[15px] text-primary shrink-0">school</span>
              <span class="truncate">Mentor: <strong class="text-on-surface">${c.facultyAdvisor}</strong></span>
            </div>
            <div class="flex items-center gap-2 text-on-surface-variant truncate">
              <span class="material-symbols-outlined text-[15px] text-secondary shrink-0">badge</span>
              <span class="truncate">Leads: <strong class="text-on-surface">${c.coordinators}</strong></span>
            </div>
            <div class="flex items-center gap-2 text-on-surface-variant truncate">
              <span class="material-symbols-outlined text-[15px] text-emerald-400 shrink-0">meeting_room</span>
              <span class="truncate">Hub: <strong class="text-on-surface">${c.meetingVenue}</strong></span>
            </div>
          </div>
        </div>

        <!-- Club Footer -->
        <div class="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            ${c.socials?.instagram ? `
              <a href="${c.socials.instagram}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors text-xs font-bold" title="Instagram">
                IG
              </a>
            ` : ''}
            ${c.socials?.github ? `
              <a href="${c.socials.github}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors text-xs font-bold" title="GitHub">
                GH
              </a>
            ` : ''}
            ${c.socials?.linkedin ? `
              <a href="${c.socials.linkedin}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors text-xs font-bold" title="LinkedIn">
                IN
              </a>
            ` : ''}
          </div>

          <button type="button" class="btn-join-society px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-sm cursor-pointer" data-club="${c.name.replace(/"/g, '&quot;')}" data-advisor="${c.facultyAdvisor}" data-hub="${c.meetingVenue}">
            <span>Connect & Join</span>
            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">${clubsHtml}</div>`;

    container.querySelectorAll('.btn-join-society').forEach(btn => {
      btn.addEventListener('click', () => {
        alert(`🎓 Joining ${btn.dataset.club}:\n\nOrientation sessions are held weekly at: ${btn.dataset.hub}.\nFaculty Mentor: ${btn.dataset.advisor}.\n\nScholars can walk in directly during orientation or reach out via student leads.`);
      });
    });
  },

  resetFilters() {
    this.searchQuery = '';
    this.activeCategory = 'all';
    const searchInput = document.getElementById('events-clubs-search');
    if (searchInput) searchInput.value = '';
    this.renderSubCategoryFilters();
    this.renderContent();
  },

  bindEvents() {
    const tabEvents = document.getElementById('tab-btn-events');
    const tabClubs = document.getElementById('tab-btn-clubs');

    if (tabEvents) {
      tabEvents.addEventListener('click', () => {
        this.activeTab = 'events';
        this.activeCategory = 'all';
        this.renderTabs();
        this.renderSubCategoryFilters();
        this.renderContent();
      });
    }

    if (tabClubs) {
      tabClubs.addEventListener('click', () => {
        this.activeTab = 'clubs';
        this.activeCategory = 'all';
        this.renderTabs();
        this.renderSubCategoryFilters();
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
