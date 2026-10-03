/**
 * Academic Resource Hub & Vault Controller for JUIT Student Hub
 * Organizes lecture notes, PYQs, lab manuals, reference books, and tutorial sheets.
 * Provides intuitive course-based browsing, clean category filters, and direct PDF viewing/downloads.
 */

const ResourcesController = {
  activeSubject: 'all', // 'all' | 'Basic Electronics' | 'Mathematics' | 'SDF' | 'Physics' | 'English'
  activeType: 'all',    // 'all' | 'Tutorial' | 'PYQ' | 'Notes' | 'Lab Manual' | 'Book'
  activeSemester: 'all',
  searchQuery: '',

  courses: [
    {
      id: 'all',
      name: 'All Courses',
      code: 'First Year Core',
      dept: 'All 5 Departments',
      icon: 'auto_stories',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/30'
    },
    {
      id: 'Basic Electronics',
      name: 'Basic Electronics',
      code: '25B11EC111',
      dept: 'Dept of ECE',
      icon: 'memory',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30'
    },
    {
      id: 'Mathematics',
      name: 'Mathematics I',
      code: '25B11MA113',
      dept: 'Dept of Mathematics',
      icon: 'functions',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30'
    },
    {
      id: 'SDF',
      name: 'C Programming (SDF)',
      code: '25B11CI112',
      dept: 'Dept of CSE',
      icon: 'terminal',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    },
    {
      id: 'Physics',
      name: 'Engineering Physics',
      code: '25B11PH111',
      dept: 'Dept of Physics',
      icon: 'science',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30'
    },
    {
      id: 'English',
      name: 'Technical English',
      code: '25B11HS111',
      dept: 'Dept of HSS',
      icon: 'record_voice_over',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30'
    }
  ],

  materialTypes: [
    { id: 'all', label: 'All Materials', icon: 'folder' },
    { id: 'Tutorial', label: 'Tutorial Sheets', icon: 'edit_note' },
    { id: 'PYQ', label: 'Past Papers (PYQ)', icon: 'quiz' },
    { id: 'Notes', label: 'Lecture Notes', icon: 'description' },
    { id: 'Lab Manual', label: 'Lab Manuals', icon: 'biotech' },
    { id: 'Book', label: 'Reference Books', icon: 'menu_book' }
  ],

  init() {
    this.renderSubjectFilters();
    this.renderTypeFilters();
    this.renderResources();
    this.bindEvents();
  },

  getResources() {
    return (window.JUIT_DATA && window.JUIT_DATA.resources) || [];
  },

  saveResources() {
    localStorage.setItem('juit_resources', JSON.stringify(window.JUIT_DATA.resources));
  },

  /* 1. RENDER COURSE EXPLORER CARDS */
  renderSubjectFilters() {
    const container = document.getElementById('resource-subject-filters');
    const labelEl = document.getElementById('resources-active-subject-label');
    if (!container) return;

    const allItems = this.getResources();

    container.innerHTML = this.courses.map(c => {
      const isActive = (c.id === this.activeSubject);
      const count = allItems.filter(r => c.id === 'all' || r.subject === c.id).length;

      return `
        <button type="button" 
                class="course-explorer-card text-left p-3 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                  isActive
                    ? 'bg-surface-container-high border-2 border-primary shadow-md ring-2 ring-primary/20'
                    : 'bg-surface-container hover:bg-surface-container-high border border-white/[0.06] hover:border-white/[0.12]'
                }" 
                data-subject="${c.id}">
          <div>
            <div class="flex items-center justify-between gap-1 mb-2">
              <div class="w-8 h-8 rounded-xl ${c.bg} ${c.color} flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">${c.icon}</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
              }">${count} files</span>
            </div>
            <h4 class="font-headline-sm text-xs font-semibold text-on-surface leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              ${c.name}
            </h4>
            <p class="font-mono text-[10px] text-on-surface-variant truncate mt-0.5">${c.code}</p>
          </div>
          <div class="mt-2 pt-1.5 border-t border-white/[0.04] flex items-center justify-between text-[10px]">
            <span class="text-on-surface-variant font-mono truncate">${c.dept}</span>
            <span class="material-symbols-outlined text-[13px] text-primary transition-transform ${isActive ? 'translate-x-0' : 'group-hover:translate-x-0.5'}">arrow_forward</span>
          </div>
        </button>
      `;
    }).join('');

    if (labelEl) {
      const current = this.courses.find(c => c.id === this.activeSubject);
      labelEl.textContent = current ? `${current.name} • ${current.code}` : 'All Courses';
    }

    container.querySelectorAll('.course-explorer-card').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSubject = btn.dataset.subject;
        this.renderSubjectFilters();
        this.renderTypeFilters();
        this.renderResources();
      });
    });
  },

  /* 2. RENDER MATERIAL TYPE PILLS */
  renderTypeFilters() {
    const typeContainer = document.getElementById('resource-type-filters');
    if (!typeContainer) return;

    const allItems = this.getResources().filter(r => this.activeSubject === 'all' || r.subject === this.activeSubject);

    typeContainer.innerHTML = this.materialTypes.map(t => {
      const isActive = (t.id === this.activeType);
      const count = allItems.filter(r => t.id === 'all' || r.type === t.id).length;

      return `
        <button type="button" 
                class="category-pill flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-md text-xs transition-all flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-white/[0.04]'
                }" 
                data-type="${t.id}">
          <span class="material-symbols-outlined text-[15px]">${t.icon}</span>
          <span>${t.label}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] ${
            isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
          }">${count}</span>
        </button>
      `;
    }).join('');

    typeContainer.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeType = btn.dataset.type;
        this.renderTypeFilters();
        this.renderResources();
      });
    });
  },

  /* 3. RENDER RESOURCE ITEMS & SPOTLIGHT BUNDLES */
  renderResources() {
    const container = document.getElementById('resources-grid-container');
    const countLabel = document.getElementById('resources-count-label');
    if (!container) return;

    let items = this.getResources();

    // 1. Filter by Subject Category
    if (this.activeSubject !== 'all') {
      items = items.filter(r => r.subject === this.activeSubject);
    }

    // 2. Filter by Document Type
    if (this.activeType !== 'all') {
      items = items.filter(r => r.type === this.activeType);
    }

    // 3. Search Filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.code && r.code.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.unit && r.unit.toLowerCase().includes(q)) ||
        (r.subject && r.subject.toLowerCase().includes(q)) ||
        (r.author && r.author.toLowerCase().includes(q))
      );
    }

    if (countLabel) {
      countLabel.textContent = `${items.length} verified item${items.length === 1 ? '' : 's'}`;
    }

    // Master Bundles Definition
    const bundles = [
      {
        id: 'res-18',
        subject: 'Basic Electronics',
        code: '25B11EC111',
        title: 'Basic Electronics: Complete Tutorial Problem Sets Bundle (1–5)',
        desc: 'Official compiled 18-page tutorial package containing all 5 Basic Electronics assignment sheets with verified circuit schematics.',
        file: 'vault/Basic_Electronics_All_Tutorials_Bundle.pdf',
        size: '772 KB',
        pages: '18 Pages',
        icon: 'memory',
        color: 'sky'
      },
      {
        id: 'res-23',
        subject: 'Mathematics',
        code: '25B11MA113',
        title: 'Mathematics I: Complete Tutorial Problem Sets Bundle (Sheets 1–4)',
        desc: 'Complete official compilation of all 4 Mathematics I tutorial sheets covering Multivariable Calculus, Series & Double Integrals.',
        file: 'vault/Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf',
        size: '1.5 MB',
        pages: '8 Pages',
        icon: 'functions',
        color: 'indigo'
      }
    ];

    // Determine which bundles to spotlight
    const showBundles = (this.activeType === 'all' || this.activeType === 'Tutorial') && !this.searchQuery;
    let relevantBundles = [];
    if (showBundles) {
      if (this.activeSubject === 'all') {
        relevantBundles = bundles;
      } else {
        relevantBundles = bundles.filter(b => b.subject === this.activeSubject);
      }
    }

    // Featured Bundles HTML
    let bundleHtml = '';
    if (relevantBundles.length > 0) {
      bundleHtml = `
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2.5">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-secondary text-[18px]">verified</span>
              <span class="font-label-sm text-xs font-mono uppercase tracking-wider text-secondary font-bold">Official Problem Set Compilations</span>
            </div>
            <span class="font-mono text-[11px] text-on-surface-variant">Recommended for Exam Prep</span>
          </div>

          <div class="grid grid-cols-1 ${relevantBundles.length > 1 ? 'md:grid-cols-2' : ''} gap-3">
            ${relevantBundles.map(b => `
              <div class="rounded-2xl bg-gradient-to-br from-surface-container via-surface-container-low to-surface-container border border-secondary/25 p-4 sm:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-secondary/40 transition-all">
                <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-secondary/20 text-secondary border border-secondary/30">
                      ★ COMPLETE COMPILATION
                    </span>
                    <span class="font-mono text-[11px] text-on-surface-variant">${b.pages} • ${b.size}</span>
                  </div>
                  <h3 class="font-headline-sm text-sm sm:text-base text-on-surface font-bold line-clamp-2 mb-1.5 group-hover:text-secondary transition-colors">
                    ${b.title}
                  </h3>
                  <p class="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
                    ${b.desc}
                  </p>
                </div>
                <div class="flex items-center gap-2 pt-2.5 border-t border-white/[0.06]">
                  <button type="button" 
                          class="btn-preview-resource flex-1 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer" 
                          data-link="${b.file}" 
                          data-title="${b.title}">
                    <span class="material-symbols-outlined text-[15px]">visibility</span>
                    <span>Preview in Hub</span>
                  </button>
                  <a href="${b.file}" 
                     download="${b.file.split('/').pop()}" 
                     class="flex-1 py-2 rounded-xl bg-secondary text-on-secondary hover:brightness-110 font-label-md text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-sm">
                    <span class="material-symbols-outlined text-[15px]">download</span>
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Filter out the bundles from the list of cards if they're already spotlit at the top
    const spotlitBundleIds = relevantBundles.map(b => b.id);
    const individualCards = items.filter(r => !spotlitBundleIds.includes(r.id));

    // Empty State
    if (individualCards.length === 0 && relevantBundles.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-10 text-center bg-surface-container-low rounded-2xl border border-white/[0.06]">
          <div class="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mx-auto mb-3">
            <span class="material-symbols-outlined text-[32px]">folder_off</span>
          </div>
          <h3 class="font-headline-sm text-base text-on-surface font-semibold mb-1">No Resources Found</h3>
          <p class="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
            No materials found matching "${this.searchQuery || this.activeType}". Try clearing your search or switching filters.
          </p>
          <button type="button" 
                  class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer" 
                  onclick="ResourcesController.resetFilters()">
            Reset All Filters
          </button>
        </div>
      `;
      return;
    }

    // Individual Item Cards
    const cardsHtml = individualCards.map(r => {
      let icon = 'description';
      let typeLabel = r.type || 'Notes';
      let typeColor = 'text-primary';
      let typeBg = 'bg-primary/10';
      let typeBorder = 'border-primary/20';

      if (r.type === 'PYQ') {
        icon = 'quiz';
        typeColor = 'text-rose-400';
        typeBg = 'bg-rose-500/15';
        typeBorder = 'border-rose-500/30';
      } else if (r.type === 'Lab Manual') {
        icon = 'biotech';
        typeColor = 'text-amber-400';
        typeBg = 'bg-amber-500/15';
        typeBorder = 'border-amber-500/30';
      } else if (r.type === 'Book') {
        icon = 'menu_book';
        typeColor = 'text-emerald-400';
        typeBg = 'bg-emerald-500/15';
        typeBorder = 'border-emerald-500/30';
      } else if (r.type === 'Tutorial') {
        icon = 'edit_note';
        typeColor = 'text-secondary';
        typeBg = 'bg-secondary/15';
        typeBorder = 'border-secondary/30';
      }

      const hasDownload = (r.link && r.link !== '#');
      const filename = hasDownload ? r.link.split('/').pop() : `${r.title}.pdf`;

      return `
        <div class="rounded-2xl bg-surface-container-low hover:bg-surface-container border border-white/[0.06] hover:border-white/[0.12] p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-sm group">
          <div>
            <!-- Top Meta Strip -->
            <div class="flex items-center justify-between gap-2 mb-2.5">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${typeBg} ${typeColor} border ${typeBorder}">
                  <span class="material-symbols-outlined text-[13px]">${icon}</span>
                  <span>${typeLabel}</span>
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-container text-on-surface-variant border border-white/[0.04]">
                  ${r.code || r.subject}
                </span>
              </div>
              <span class="font-mono text-[11px] text-on-surface-variant shrink-0">${r.size || 'PDF'}</span>
            </div>

            <!-- Title -->
            <h4 class="font-headline-sm text-sm sm:text-base text-on-surface font-semibold group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-1.5">
              ${r.title}
            </h4>

            <!-- Scope / Unit Tag -->
            <div class="inline-flex items-center gap-1 text-[11px] text-secondary font-mono bg-secondary/10 px-2 py-0.5 rounded-md mb-2">
              <span class="material-symbols-outlined text-[13px]">bookmark</span>
              <span class="truncate">${r.unit || 'Semester 1 Syllabus'}</span>
            </div>

            <!-- Description -->
            <p class="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
              ${r.description || ''}
            </p>
          </div>

          <!-- Footer Actions -->
          <div class="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
            ${hasDownload ? `
              <button type="button" 
                      class="btn-preview-resource flex-1 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer" 
                      data-link="${r.link}" 
                      data-title="${r.title}">
                <span class="material-symbols-outlined text-[15px]">visibility</span>
                <span>View PDF</span>
              </button>
              <a href="${r.link}" 
                 download="${filename}" 
                 class="flex-1 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors shadow-sm">
                <span class="material-symbols-outlined text-[15px]">download</span>
                <span>Download</span>
              </a>
            ` : `
              <span class="font-mono text-[11px] text-secondary flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">verified</span>
                <span>Verified Peer Notes</span>
              </span>
              <button type="button" 
                      class="btn-preview-resource px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer" 
                      data-link="${r.link}" 
                      data-title="${r.title}">
                <span>Read Notes</span>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      ${bundleHtml}
      ${individualCards.length > 0 ? `
        <div class="mb-2 flex items-center justify-between">
          <span class="font-label-sm text-xs font-mono uppercase tracking-wider text-on-surface-variant">
            ${this.activeSubject === 'all' ? 'All Course Materials' : `${this.activeSubject} Course Library`}
          </span>
          <span class="font-mono text-[11px] text-on-surface-variant">${individualCards.length} documents</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
          ${cardsHtml}
        </div>
      ` : ''}
    `;

    // Bind preview triggers
    container.querySelectorAll('.btn-preview-resource').forEach(btn => {
      btn.addEventListener('click', () => {
        this.previewDocument(btn.dataset.link, btn.dataset.title);
      });
    });
  },

  /* 4. MODAL DOCUMENT PREVIEWER */
  closePreviewModal() {
    const modal = document.getElementById('pdf-preview-modal');
    if (modal) {
      modal.classList.remove('open', 'active');
      modal.classList.add('hidden');
      const iframeEl = modal.querySelector('#preview-modal-iframe');
      if (iframeEl) iframeEl.src = '';
    }
  },

  previewDocument(link, title) {
    if (!link || link === '#') {
      alert(`Document: "${title}"\nDirect copy is compiling on LRC servers. Please download available problem set bundles.`);
      return;
    }

    let modal = document.getElementById('pdf-preview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pdf-preview-modal';
      modal.className = 'fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6';
      modal.innerHTML = `
        <div class="w-full max-w-4xl h-[90vh] rounded-2xl bg-surface-container-low border border-white/[0.1] shadow-2xl flex flex-col justify-between overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-white/[0.08] bg-surface-container">
            <div class="flex items-center gap-2.5 overflow-hidden">
              <span class="material-symbols-outlined text-primary text-[22px]">description</span>
              <h3 id="preview-modal-title" class="font-headline-sm text-sm sm:text-base text-on-surface font-semibold truncate">Document Preview</h3>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <a id="preview-modal-newtab" href="#" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary text-xs font-semibold inline-flex items-center gap-1 transition-colors">
                <span class="material-symbols-outlined text-[15px]">open_in_new</span>
                <span class="hidden sm:inline">New Tab</span>
              </a>
              <a id="preview-modal-download" href="#" download class="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-sm">
                <span class="material-symbols-outlined text-[15px]">download</span>
                <span>Download</span>
              </a>
              <button type="button" id="preview-modal-close" class="w-8 h-8 rounded-xl bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" title="Close Preview">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
          <div class="flex-1 w-full bg-surface-container-lowest overflow-hidden relative">
            <iframe id="preview-modal-iframe" src="" class="w-full h-full border-0"></iframe>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = modal.querySelector('#preview-modal-title');
    const dlEl = modal.querySelector('#preview-modal-download');
    const newTabEl = modal.querySelector('#preview-modal-newtab');
    const iframeEl = modal.querySelector('#preview-modal-iframe');
    const closeBtn = modal.querySelector('#preview-modal-close');

    if (titleEl) titleEl.textContent = title || 'Document Preview';
    if (dlEl) {
      dlEl.href = link;
      dlEl.download = link.split('/').pop() || 'document.pdf';
    }
    if (newTabEl) {
      newTabEl.href = link;
      newTabEl.setAttribute('target', '_blank');
      newTabEl.setAttribute('rel', 'noopener noreferrer');
    }
    if (iframeEl) {
      iframeEl.src = link;
    }

    if (closeBtn && !closeBtn._boundPreviewClose) {
      closeBtn._boundPreviewClose = true;
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closePreviewModal();
      });
    }

    if (!modal._boundPreviewBackdrop) {
      modal._boundPreviewBackdrop = true;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closePreviewModal();
        }
      });
    }

    modal.classList.remove('hidden');
    modal.classList.add('open', 'active');
  },

  resetFilters() {
    this.activeSubject = 'all';
    this.activeType = 'all';
    this.activeSemester = 'all';
    this.searchQuery = '';
    const searchInput = document.getElementById('resource-search-input');
    const clearBtn = document.getElementById('btn-clear-resource-search');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    this.renderSubjectFilters();
    this.renderTypeFilters();
    this.renderResources();
  },

  promptAddResource() {
    const title = prompt('Resource Title (e.g. Operating Systems Unit 3 Paging Notes):');
    if (!title) return;
    const code = prompt('Course Code (e.g. 25B11CI514):', '25B11CI112');
    const sem = parseInt(prompt('Semester (1 - 8):', '1'), 10) || 1;
    const subject = prompt('Subject Category (SDF / Basic Electronics / Mathematics / Physics / English):', 'SDF') || 'SDF';
    const type = prompt('Type (Notes / PYQ / Lab Manual / Book / Tutorial):', 'Notes') || 'Notes';
    const desc = prompt('Short description:', 'Key notes and solved questions');

    const newRes = {
      id: `res-${Date.now()}`,
      title: title,
      code: code ? code.toUpperCase() : '',
      semester: sem,
      subject: subject,
      type: type,
      unit: 'Custom Upload',
      author: 'Student Contributor',
      date: new Date().toISOString().split('T')[0],
      size: 'Custom',
      format: 'PDF',
      link: '#',
      description: desc || 'Contributed study resource.'
    };

    window.JUIT_DATA.resources.unshift(newRes);
    this.saveResources();
    this.renderSubjectFilters();
    this.renderTypeFilters();
    this.renderResources();
    alert('Resource added to your local library! Thank you for sharing.');
  },

  bindEvents() {
    const searchInput = document.getElementById('resource-search-input');
    const clearBtn = document.getElementById('btn-clear-resource-search');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        if (clearBtn) {
          clearBtn.classList.toggle('hidden', !this.searchQuery);
        }
        this.renderResources();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        clearBtn.classList.add('hidden');
        this.renderResources();
      });
    }

    const btnAdd = document.getElementById('btn-add-resource');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        this.promptAddResource();
      });
    }

    // Senior Strategy Master Center Bindings
    this.bindSeniorStrategy();

    // Senior Strategy Exam Shortcuts (T-1 -> Tutorial, T-2 -> PYQ, TA -> Lab Manual)
    document.querySelectorAll('.btn-strategy-shortcut').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetType = btn.dataset.strategyType;
        if (targetType) {
          this.activeType = targetType;
          this.renderTypeFilters();
          this.renderResources();
          const targetEl = document.getElementById('resources-grid-container');
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  },

  bindSeniorStrategy() {
    const tabBtns = document.querySelectorAll('.strategy-tab-btn');
    const contentPanels = {
      overview: document.getElementById('strat-content-overview'),
      t1: document.getElementById('strat-content-t1'),
      t2: document.getElementById('strat-content-t2'),
      ta: document.getElementById('strat-content-ta'),
      calc: document.getElementById('strat-content-calc')
    };

    const activateTab = (tabName) => {
      tabBtns.forEach(b => {
        if (b.dataset.tab === tabName) {
          b.className = 'strategy-tab-btn active px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 bg-primary text-on-primary shadow-sm';
        } else {
          b.className = 'strategy-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface bg-surface-container';
        }
      });

      Object.entries(contentPanels).forEach(([key, el]) => {
        if (!el) return;
        if (key === tabName) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    };

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab(btn.dataset.tab);
      });
    });

    document.querySelectorAll('.btn-goto-strat-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab(btn.dataset.targetTab);
      });
    });

    // CGPA Predictor Live Engine
    const inputT1 = document.getElementById('strat-input-t1');
    const inputT2 = document.getElementById('strat-input-t2');
    const inputTa = document.getElementById('strat-input-ta');
    const valT1 = document.getElementById('strat-val-t1');
    const valT2 = document.getElementById('strat-val-t2');
    const valTa = document.getElementById('strat-val-ta');
    const elAccumulated = document.getElementById('strat-calc-accumulated');
    const elNeedAplus = document.getElementById('strat-calc-need-aplus');
    const elNeedA = document.getElementById('strat-calc-need-a');
    const elNeedBplus = document.getElementById('strat-calc-need-bplus');
    const elFeedback = document.getElementById('strat-calc-feedback');

    const updateCalc = () => {
      if (!inputT1 || !inputT2 || !inputTa) return;
      const t1 = parseFloat(inputT1.value) || 0;
      const t2 = parseFloat(inputT2.value) || 0;
      const ta = parseFloat(inputTa.value) || 0;

      if (valT1) valT1.textContent = t1;
      if (valT2) valT2.textContent = t2;
      if (valTa) valTa.textContent = ta;

      const acc = t1 + t2 + ta; // out of 65
      if (elAccumulated) elAccumulated.textContent = `${acc} / 65`;

      // Targets: A+ ~ 80, A ~ 72, B+ ~ 64, B ~ 55
      const calcNeed = (targetTotal) => {
        const diff = Math.max(0, targetTotal - acc);
        if (diff > 35) return 'Out of reach';
        return `${diff} / 35`;
      };

      if (elNeedAplus) elNeedAplus.textContent = calcNeed(80);
      if (elNeedA) elNeedA.textContent = calcNeed(72);
      if (elNeedBplus) elNeedBplus.textContent = calcNeed(64);

      if (elFeedback) {
        if (acc >= 55) {
          elFeedback.innerHTML = `
            <span class="material-symbols-outlined text-amber-400 text-[18px]">workspace_premium</span>
            <span><strong>Elite CGPA Standing:</strong> You have accumulated ${acc}/65 marks! Scoring just 17/35 in T-3 secures an A (9.0 SGPA), and 25/35 secures a flawless A+ (10.0)!</span>
          `;
        } else if (acc >= 45) {
          elFeedback.innerHTML = `
            <span class="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
            <span><strong>Strong Competitive Zone:</strong> ${acc}/65 in hand. Scoring 27/35 in T-3 End-Sem puts you comfortably in the 9.0+ SGPA bracket under JUIT relative curves.</span>
          `;
        } else {
          elFeedback.innerHTML = `
            <span class="material-symbols-outlined text-sky-400 text-[18px]">trending_up</span>
            <span><strong>Opportunity Ahead:</strong> Focus heavily on the 35-mark T-3 End Sem (covering entire syllabus). Target 25+ in T-3 to pull your grade directly into the B+ / A band!</span>
          `;
        }
      }
    };

    [inputT1, inputT2, inputTa].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', updateCalc);
      }
    });

    // Full Playbook Modal Trigger
    const btnPlaybook = document.getElementById('btn-open-full-playbook-modal');
    if (btnPlaybook) {
      btnPlaybook.addEventListener('click', (e) => {
        e.preventDefault();
        this.openPlaybookModal();
      });
    }
  },

  openPlaybookModal() {
    const modal = document.getElementById('universal-modal');
    const content = document.getElementById('universal-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="space-y-4 text-on-surface">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-[22px]">workspace_premium</span>
            </div>
            <div>
              <h3 class="font-headline-sm text-base font-bold">JUIT Senior Examination Strategy Playbook</h3>
              <p class="text-xs text-on-surface-variant font-mono">Curated by 4th-Year Gold Medalists & Department Scholars</p>
            </div>
          </div>
          <button type="button" class="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center cursor-pointer text-sm font-bold" id="btn-close-playbook-modal">✕</button>
        </div>

        <div class="space-y-3.5 text-xs text-on-surface-variant leading-relaxed">
          <!-- 100 Mark Breakdown -->
          <div class="p-3 rounded-xl bg-surface-container-low border border-white/[0.06]">
            <h4 class="font-bold text-on-surface text-xs mb-1.5 flex items-center gap-1.5 text-primary">
              <span class="material-symbols-outlined text-[16px]">pie_chart</span>
              <span>JUIT 100-Mark Architecture & Examination Weights</span>
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[11px] pt-1">
              <div class="p-2 rounded-lg bg-surface-container">
                <span class="text-sky-400 font-bold block">T-1 EXAM</span>
                <span class="text-on-surface font-semibold">15 Marks (15%)</span>
                <span class="text-[10px] text-on-surface-variant block mt-0.5">Units 1 & 2 • 1 Hr</span>
              </div>
              <div class="p-2 rounded-lg bg-surface-container">
                <span class="text-rose-400 font-bold block">T-2 EXAM</span>
                <span class="text-on-surface font-semibold">25 Marks (25%)</span>
                <span class="text-[10px] text-on-surface-variant block mt-0.5">Units 1–4 • 1.5 Hrs</span>
              </div>
              <div class="p-2 rounded-lg bg-surface-container">
                <span class="text-emerald-400 font-bold block">INTERNAL TA</span>
                <span class="text-on-surface font-semibold">25 Marks (25%)</span>
                <span class="text-[10px] text-on-surface-variant block mt-0.5">Attd + Vivas + HW</span>
              </div>
              <div class="p-2 rounded-lg bg-surface-container">
                <span class="text-amber-400 font-bold block">T-3 END-SEM</span>
                <span class="text-on-surface font-semibold">35 Marks (35%)</span>
                <span class="text-[10px] text-on-surface-variant block mt-0.5">All Units • 2.0 Hrs</span>
              </div>
            </div>
          </div>

          <!-- The Golden Rules -->
          <div class="space-y-2">
            <h4 class="font-bold text-on-surface text-xs flex items-center gap-1.5">
              <span class="material-symbols-outlined text-amber-400 text-[16px]">lightbulb</span>
              <span>4 Golden Rules for 9.0+ SGPA at JUIT</span>
            </h4>
            <ul class="space-y-2 pl-1">
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <div>
                  <strong class="text-on-surface">Tutorial Sheets are 75% of T-1:</strong> ECE, Mathematics, and Computing professors draft 75% of T-1 problems directly from Tutorial Sheets 1 and 2. Solving them twice by hand guarantees 12+/15.
                </div>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <div>
                  <strong class="text-on-surface">4-Year PYQ Repetition Pattern in T-2:</strong> Because T-2 covers 4 cumulative units, faculty pull previous questions from 2021–2025 archives. Focus on circuit derivations, algorithm tracing, and boundary value questions.
                </div>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <div>
                  <strong class="text-on-surface">State Assumptions & Units for Partial Marking:</strong> Evaluators follow strict step-marking schemes. Even if a final numerical calculation has a sign error, you bag 70% partial marks if formulas, units, and assumptions are clearly boxed.
                </div>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                <div>
                  <strong class="text-on-surface">Lock TA Marks Early (Target 23+/25):</strong> Never lose marks on attendance (<80%) or tutorial deadlines. A 24/25 TA score gives you huge cushion during the final T-3 crunch.
                </div>
              </li>
            </ul>
          </div>

          <!-- Quick Branch Notes -->
          <div class="p-3 rounded-xl bg-surface-container border border-white/[0.04] space-y-1.5">
            <h4 class="font-bold text-on-surface text-xs">Department Specific Insights:</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <strong class="text-primary">• CSE / IT:</strong> Practice dry-running recursive code with stack diagrams. Big-O questions require formal definitions (c, n0 constants).
              </div>
              <div>
                <strong class="text-sky-300">• ECE:</strong> Draw neat circuits with arrows for current direction. BJT/Diode problems need explicit DC analysis and AC equivalent models.
              </div>
              <div>
                <strong class="text-emerald-300">• Mathematics:</strong> State theorems before applying them (e.g. "By Cayley-Hamilton theorem..."). Write matrix determinant steps clearly.
              </div>
              <div>
                <strong class="text-amber-300">• Biotech & Civil:</strong> Draw labeled diagrams first; examiners award 40% of marks for comprehensive biochemical pathways and structural shear-force diagrams.
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end pt-3 border-t border-white/[0.08] gap-2">
          <button type="button" class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs cursor-pointer" id="btn-close-playbook-modal-bottom">
            Got it, Let's Study!
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const closeModal = () => modal.classList.remove('active');
    const c1 = document.getElementById('btn-close-playbook-modal');
    const c2 = document.getElementById('btn-close-playbook-modal-bottom');
    if (c1) c1.onclick = closeModal;
    if (c2) c2.onclick = closeModal;
  }
};

window.ResourcesController = ResourcesController;
