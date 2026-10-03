/**
 * Academic Resource Hub & Vault Controller for JUIT Student Hub
 * Organizes lecture notes, PYQs, lab manuals, reference books, and tutorial sheets.
 * Provides direct PDF viewing and downloads.
 */

const ResourcesController = {
  activeSubject: 'all', // 'all' | 'SDF' | 'Basic Electronics' | 'Mathematics' | 'English' | 'Physics'
  activeType: 'all',    // 'all' | 'Tutorial' | 'Notes' | 'PYQ' | 'Lab Manual' | 'Book'
  activeSemester: 'all',
  searchQuery: '',

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

  renderSubjectFilters() {
    const container = document.getElementById('resource-subject-filters');
    if (!container) return;

    const subjects = [
      { id: 'all', label: 'All Subjects', icon: 'apps' },
      { id: 'Basic Electronics', label: 'Basic Electronics', icon: 'memory' },
      { id: 'Mathematics', label: 'Mathematics I', icon: 'functions' },
      { id: 'SDF', label: 'SDF (C Programming)', icon: 'terminal' },
      { id: 'Physics', label: 'Physics (Optics)', icon: 'science' },
      { id: 'English', label: 'English (Communication)', icon: 'record_voice_over' }
    ];

    container.innerHTML = subjects.map(s => {
      const isActive = (s.id === this.activeSubject);
      const itemsCount = this.getResources().filter(r => s.id === 'all' || r.subject === s.id).length;
      return `
        <button type="button" class="category-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-xs transition-all flex-shrink-0 cursor-pointer ${
          isActive
            ? 'bg-primary text-on-primary font-bold shadow-sm'
            : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        }" data-subject="${s.id}">
          <span class="material-symbols-outlined text-[15px]">${s.icon}</span>
          <span>${s.label}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}">${itemsCount}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSubject = btn.dataset.subject;
        this.renderSubjectFilters();
        this.renderResources();
      });
    });
  },

  renderTypeFilters() {
    const typeContainer = document.getElementById('resource-type-filters');
    if (!typeContainer) return;

    const types = [
      { id: 'all', label: 'All Materials', icon: 'folder' },
      { id: 'Tutorial', label: 'Tutorial Sheets', icon: 'edit_note' },
      { id: 'Notes', label: 'Lecture Notes', icon: 'description' },
      { id: 'PYQ', label: 'Past Papers (PYQ)', icon: 'quiz' },
      { id: 'Lab Manual', label: 'Lab Manuals', icon: 'biotech' },
      { id: 'Book', label: 'Reference Books', icon: 'menu_book' }
    ];

    typeContainer.innerHTML = types.map(t => {
      const isActive = (t.id === this.activeType);
      return `
        <button type="button" class="category-pill flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-body-sm text-xs transition-all flex-shrink-0 cursor-pointer ${
          isActive
            ? 'bg-surface-container-highest text-primary font-bold border border-primary/30 shadow-sm'
            : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
        }" data-type="${t.id}">
          <span class="material-symbols-outlined text-[15px]">${t.icon}</span>
          <span>${t.label}</span>
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

    // 3. Filter by Semester
    if (this.activeSemester !== 'all') {
      const semNum = parseInt(this.activeSemester, 10);
      items = items.filter(r => r.semester === semNum);
    }

    // 4. Search Filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.code && r.code.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.unit && r.unit.toLowerCase().includes(q)) ||
        (r.subject && r.subject.toLowerCase().includes(q))
      );
    }

    if (countLabel) {
      countLabel.textContent = `${items.length} verified item${items.length === 1 ? '' : 's'}`;
    }

    // Featured Curated Shelves
    let featuredShelfHtml = '';
    if (this.activeSubject === 'all' || this.activeSubject === 'Basic Electronics') {
      const elecTutorials = [
        { num: 1, title: 'Tutorial 1: Charge, Current, Voltage & Power', desc: 'Charge waveforms q(t), current density, energy balance & independent source circuits.', file: 'vault/Basic_Electronics_Tutorial_1.pdf', size: '124 KB' },
        { num: 2, title: 'Tutorial 2: Circuit Topology, KVL, KCL & Resistors', desc: 'Node identification, branch loop equations, Kirchhoff laws & bridge reduction.', file: 'vault/Basic_Electronics_Tutorial_2.pdf', size: '136 KB' },
        { num: 3, title: 'Tutorial 3: Nodal Analysis, Supernodes & Mesh Analysis', desc: 'Node matrix formulation, supernode constraints, planar mesh with dependent sources.', file: 'vault/Basic_Electronics_Tutorial_3.pdf', size: '165 KB' },
        { num: 4, title: 'Tutorial 4: Superposition, Thévenin & Norton Theorems', desc: 'Multi-source circuits, source conversions, Thévenin open-circuit & Norton equivalents.', file: 'vault/Basic_Electronics_Tutorial_4.pdf', size: '156 KB' },
        { num: 5, title: 'Tutorial 5: PN Junction Diode & Zener Regulators', desc: 'Shockley diode equation, piecewise linear modeling, Zener reverse breakdown.', file: 'vault/Basic_Electronics_Tutorial_5.pdf', size: '193 KB' },
        { num: '★', title: 'Complete Tutorial Problem Sets Bundle (1–5)', desc: 'Official verified compilation of all 5 Basic Electronics assignment question sheets.', file: 'vault/Basic_Electronics_All_Tutorials_Bundle.pdf', size: '772 KB', isBundle: true }
      ];

      featuredShelfHtml = `
        <div class="col-span-full mb-4">
          <div class="rounded-2xl bg-surface-container-low p-4 sm:p-5 border border-white/[0.06] shadow-sm mb-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[22px]">memory</span>
                </div>
                <div>
                  <h3 class="font-headline-sm text-base text-on-surface font-semibold">Basic Electronics — Verified Problem Sets (1–5)</h3>
                  <p class="font-body-sm text-xs text-on-surface-variant">Dept of Electronics & Communication • Course Code: 25B11EC111</p>
                </div>
              </div>
              <a href="vault/Basic_Electronics_All_Tutorials_Bundle.pdf" download="Basic_Electronics_All_Tutorials_Bundle.pdf" class="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto">
                <span class="material-symbols-outlined text-[15px]">download</span>
                <span>Download All (18p Bundle)</span>
              </a>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${elecTutorials.map(t => `
              <div class="rounded-2xl bg-surface-container-low hover:bg-surface-container border border-white/[0.06] p-4 flex flex-col justify-between transition-all duration-200 shadow-sm hover:border-white/[0.1]">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      t.isBundle ? 'bg-primary text-on-primary' : 'bg-primary/15 text-primary'
                    }">
                      ${t.isBundle ? 'FULL COMPILATION' : `TUTORIAL ${t.num}`}
                    </span>
                    <span class="font-mono text-[11px] text-on-surface-variant">${t.size} • PDF</span>
                  </div>
                  <h4 class="font-headline-sm text-sm text-on-surface font-semibold line-clamp-1 mb-1">${t.title}</h4>
                  <p class="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">${t.desc}</p>
                </div>
                <div class="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                  <button type="button" class="btn-preview-resource flex-1 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer" data-link="${t.file}" data-title="${t.title}">
                    <span class="material-symbols-outlined text-[14px]">visibility</span>
                    <span>View PDF</span>
                  </button>
                  <a href="${t.file}" download="${t.file.split('/').pop()}" class="flex-1 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors shadow-sm">
                    <span class="material-symbols-outlined text-[14px]">download</span>
                    <span>Download</span>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (this.activeSubject === 'Mathematics') {
      const mathTutorials = [
        { num: 1, title: 'Tutorial Sheet 1: Limits, Continuity & Jacobian', desc: 'Delta-epsilon limits, partial derivatives, Euler theorem on homogeneous functions & Jacobians.', file: 'vault/Math1_Tutorial_Sheet_1.pdf', size: '383 KB' },
        { num: 2, title: 'Tutorial Sheet 2: Taylor Series & Lagrange Multipliers', desc: 'Taylor series multivariable expansions, stationary points classification & constrained optimization.', file: 'vault/Math1_Tutorial_Sheet_2.pdf', size: '450 KB' },
        { num: 3, title: 'Tutorial Sheet 3: Double Integrals & Beta-Gamma Functions', desc: 'Double integrals, order inversion, polar transformation & Beta-Gamma special integral functions.', file: 'vault/Math1_Tutorial_Sheet_3.pdf', size: '254 KB' },
        { num: 4, title: 'Tutorial Sheet 4: Applications to Area & Volume', desc: 'Planar area computation, volume under paraboloids, surface area & physical applications.', file: 'vault/Math1_Tutorial_Sheet_4.pdf', size: '448 KB' },
        { num: '★', title: 'Complete Tutorial Problem Sets Bundle (1–4)', desc: 'Complete verified compilation of all 4 Mathematics I tutorial assignment sheets.', file: 'vault/Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf', size: '1.5 MB', isBundle: true }
      ];

      featuredShelfHtml = `
        <div class="col-span-full mb-4">
          <div class="rounded-2xl bg-surface-container-low p-4 sm:p-5 border border-white/[0.06] shadow-sm mb-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[22px]">functions</span>
                </div>
                <div>
                  <h3 class="font-headline-sm text-base text-on-surface font-semibold">Mathematics I — Verified Problem Sets (Sheets 1–4)</h3>
                  <p class="font-body-sm text-xs text-on-surface-variant">Dept of Mathematics • Course Code: 25B11MA113</p>
                </div>
              </div>
              <a href="vault/Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf" download="Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf" class="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto">
                <span class="material-symbols-outlined text-[15px]">download</span>
                <span>Download All (8p Bundle)</span>
              </a>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${mathTutorials.map(t => `
              <div class="rounded-2xl bg-surface-container-low hover:bg-surface-container border border-white/[0.06] p-4 flex flex-col justify-between transition-all duration-200 shadow-sm hover:border-white/[0.1]">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      t.isBundle ? 'bg-secondary text-on-secondary' : 'bg-secondary/15 text-secondary'
                    }">
                      ${t.isBundle ? 'FULL COMPILATION' : `SHEET ${t.num}`}
                    </span>
                    <span class="font-mono text-[11px] text-on-surface-variant">${t.size} • PDF</span>
                  </div>
                  <h4 class="font-headline-sm text-sm text-on-surface font-semibold line-clamp-1 mb-1">${t.title}</h4>
                  <p class="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">${t.desc}</p>
                </div>
                <div class="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                  <button type="button" class="btn-preview-resource flex-1 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer" data-link="${t.file}" data-title="${t.title}">
                    <span class="material-symbols-outlined text-[14px]">visibility</span>
                    <span>View PDF</span>
                  </button>
                  <a href="${t.file}" download="${t.file.split('/').pop()}" class="flex-1 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors shadow-sm">
                    <span class="material-symbols-outlined text-[14px]">download</span>
                    <span>Download</span>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (items.length === 0) {
      container.innerHTML = featuredShelfHtml + `
        <div class="col-span-full p-8 text-center bg-surface-container-low rounded-2xl border border-white/[0.06]">
          <div class="text-4xl mb-3">📂</div>
          <h3 class="font-headline-sm text-base text-on-surface font-semibold mb-1">No Additional Resources Found</h3>
          <p class="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
            No materials found matching your selected filters.
          </p>
          <button type="button" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer" onclick="ResourcesController.resetFilters()">
            Reset All Filters
          </button>
        </div>
      `;
      container.querySelectorAll('.btn-preview-resource').forEach(btn => {
        btn.addEventListener('click', () => {
          this.previewDocument(btn.dataset.link, btn.dataset.title);
        });
      });
      return;
    }

    const cardsHtml = items.map(r => {
      let icon = 'description';
      let typeLabel = r.type || 'Notes';
      let typeColor = 'text-primary';
      let typeBg = 'bg-primary/10';

      if (r.type === 'PYQ') {
        icon = 'quiz';
        typeColor = 'text-rose-400';
        typeBg = 'bg-rose-500/15';
      } else if (r.type === 'Lab Manual') {
        icon = 'biotech';
        typeColor = 'text-amber-400';
        typeBg = 'bg-amber-500/15';
      } else if (r.type === 'Book') {
        icon = 'menu_book';
        typeColor = 'text-emerald-400';
        typeBg = 'bg-emerald-500/15';
      } else if (r.type === 'Tutorial') {
        icon = 'edit_note';
        typeColor = 'text-secondary';
        typeBg = 'bg-secondary/15';
      }

      const hasDownload = (r.link && r.link !== '#');
      const filename = hasDownload ? r.link.split('/').pop() : `${r.title}.pdf`;

      return `
        <div class="group rounded-2xl bg-surface-container-low hover:bg-surface-container border border-white/[0.06] p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:border-white/[0.12]">
          <div>
            <!-- Header Meta Strip -->
            <div class="flex items-center justify-between gap-2 mb-2.5">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${typeBg} ${typeColor}">
                  <span class="material-symbols-outlined text-[13px]">${icon}</span>
                  <span>${typeLabel}</span>
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-container text-on-surface-variant border border-white/[0.04]">
                  Sem ${r.semester} • ${r.code || r.subject}
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
              <span class="truncate">${r.unit || 'All Units Syllabus'}</span>
            </div>

            <!-- Description -->
            <p class="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
              ${r.description || ''}
            </p>
          </div>

          <!-- Action Footer -->
          <div class="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
            ${hasDownload ? `
              <button type="button" class="btn-preview-resource flex-1 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer" data-link="${r.link}" data-title="${r.title}">
                <span class="material-symbols-outlined text-[14px]">visibility</span>
                <span>View</span>
              </button>
              <a href="${r.link}" download="${filename}" class="flex-1 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors shadow-sm">
                <span class="material-symbols-outlined text-[14px]">download</span>
                <span>Download</span>
              </a>
            ` : `
              <span class="font-mono text-[11px] text-secondary flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">verified</span>
                <span>Verified Peer Notes</span>
              </span>
              <button type="button" class="btn-preview-resource px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium inline-flex items-center gap-1 transition-colors" data-link="${r.link}" data-title="${r.title}">
                <span>Read in Vault</span>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = featuredShelfHtml + `<div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">${cardsHtml}</div>`;

    // Bind preview triggers
    container.querySelectorAll('.btn-preview-resource').forEach(btn => {
      btn.addEventListener('click', () => {
        this.previewDocument(btn.dataset.link, btn.dataset.title);
      });
    });
  },

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
      alert(`Document: "${title}"\nDirect cloud copy is compiling on LRC servers. You can download problem sets from the featured shelf above.`);
      return;
    }
    
    // Check if modal exists
    let modal = document.getElementById('pdf-preview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pdf-preview-modal';
      modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6';
      modal.innerHTML = `
        <div class="w-full max-w-4xl h-[88vh] rounded-2xl bg-surface-container-low border border-white/[0.1] shadow-2xl flex flex-col justify-between overflow-hidden">
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
    if (searchInput) searchInput.value = '';
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
    const type = prompt('Type (Notes / PYQ / Lab Manual / Book):', 'Notes') || 'Notes';
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
    this.renderResources();
    alert('Resource added to your local library! Thank you for sharing.');
  },

  bindEvents() {
    const searchInput = document.getElementById('resource-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderResources();
      });
    }

    const btnAdd = document.getElementById('btn-add-resource');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        this.promptAddResource();
      });
    }
  }
};

window.ResourcesController = ResourcesController;
