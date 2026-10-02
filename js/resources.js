/**
 * Academic Resource Hub & Vault Controller for JUIT Student Hub
 * Organizes lecture notes, PYQs, lab manuals, reference books, and assignment solutions.
 * Supports subject categorizations (SDF, English, Physics) and direct PDF downloads.
 */

const ResourcesController = {
  activeSubject: 'all', // 'all' | 'SDF' | 'English' | 'Physics' | 'Mathematics'
  activeType: 'all',    // 'all' | 'Notes' | 'PYQ' | 'Lab Manual' | 'Book'
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
      { id: 'SDF', label: 'SDF (C Programming)', icon: 'terminal' },
      { id: 'Basic Electronics', label: 'Basic Electronics', icon: 'memory' },
      { id: 'English', label: 'English (Communication)', icon: 'record_voice_over' },
      { id: 'Physics', label: 'Physics (Optics & Waves)', icon: 'science' },
      { id: 'Mathematics', label: 'Mathematics', icon: 'functions' }
    ];

    container.innerHTML = subjects.map(s => {
      const isActive = (s.id === this.activeSubject);
      const itemsCount = this.getResources().filter(r => s.id === 'all' || r.subject === s.id).length;
      return `
        <button type="button" class="category-pill ${isActive ? 'active bg-surface-container-high text-primary font-medium shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'} flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all flex-shrink-0 cursor-pointer" data-subject="${s.id}">
          <span class="material-symbols-outlined text-[15px]">${s.icon}</span>
          <span>${s.label}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-highest text-on-surface-variant'}">${itemsCount}</span>
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
      { id: 'all', label: 'All Types', icon: 'folder' },
      { id: 'Tutorial', label: 'Tutorial Sheets', icon: 'edit_note' },
      { id: 'Notes', label: 'Lecture Notes', icon: 'description' },
      { id: 'PYQ', label: 'Past Papers (PYQ)', icon: 'quiz' },
      { id: 'Lab Manual', label: 'Lab Manuals', icon: 'biotech' },
      { id: 'Book', label: 'Reference Books', icon: 'menu_book' }
    ];

    typeContainer.innerHTML = types.map(t => {
      const isActive = (t.id === this.activeType);
      return `
        <button type="button" class="category-pill ${isActive ? 'active bg-primary text-on-primary font-medium shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'} flex items-center gap-1.5 px-space-md py-1.5 rounded-lg font-body-sm text-body-sm transition-all flex-shrink-0 cursor-pointer" data-type="${t.id}">
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

    // Featured Basic Electronics Tutorials Shelf (prominently displayed when viewing All or Basic Electronics)
    let featuredShelfHtml = '';
    if (this.activeSubject === 'all' || this.activeSubject === 'Basic Electronics') {
      const elecTutorials = [
        { num: 1, title: 'Tutorial 1: Charge, Current, Voltage & Power', desc: 'Charge flow q(t), current waveforms, element power, solar cell IV curves, dependent sources.', file: 'vault/Basic_Electronics_Tutorial_1.pdf', size: '124 KB' },
        { num: 2, title: 'Tutorial 2: Circuit Topology, KVL, KCL & Resistors', desc: 'Nodes, branches, loops, Kirchhoff laws, bridge reduction, voltage and current division.', file: 'vault/Basic_Electronics_Tutorial_2.pdf', size: '136 KB' },
        { num: 3, title: 'Tutorial 3: Nodal Analysis, Supernodes & Mesh Analysis', desc: 'Nodal voltage formulations, supernode techniques, planar mesh analysis with dependent sources.', file: 'vault/Basic_Electronics_Tutorial_3.pdf', size: '165 KB' },
        { num: 4, title: 'Tutorial 4: Superposition, Thévenin & Norton Theorems', desc: 'Multi-source superposition, source transformations, Thévenin equivalent Voc/Isc, Norton circuits.', file: 'vault/Basic_Electronics_Tutorial_4.pdf', size: '156 KB' },
        { num: 5, title: 'Tutorial 5: PN Junction Diode & Zener Regulators', desc: 'Diode equation, thermal voltage, static/dynamic resistance, piecewise linear models, Zener curves.', file: 'vault/Basic_Electronics_Tutorial_5.pdf', size: '193 KB' },
        { num: '★', title: 'Complete Tutorial Problem Sets Bundle (1–5)', desc: 'Complete 18-page compilation of all 5 Basic Electronics tutorial assignment problem sets.', file: 'vault/Basic_Electronics_All_Tutorials_Bundle.pdf', size: '772 KB', isBundle: true }
      ];

      featuredShelfHtml = `
        <div class="featured-tutorials-shelf col-span-1 md:col-span-2 xl:col-span-4 mb-space-lg">
          <div class="flex items-center justify-between mb-space-md flex-wrap gap-space-sm bg-surface-container-low p-space-md rounded-xl border border-outline-variant/15 shadow-sm">
            <div class="flex items-center gap-space-sm">
              <div class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-[22px]">memory</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Basic Electronics — Tutorial Problem Sets (1 to 5)</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Department of ECE • 25B11EC111 • Verified assignment problem sheets</p>
              </div>
            </div>
            <a href="vault/Basic_Electronics_All_Tutorials_Bundle.pdf" download="Basic_Electronics_All_Tutorials_Bundle.pdf" class="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
              <span class="material-symbols-outlined text-[16px]">download</span>
              <span>Download All (18 Pages PDF)</span>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
            ${elecTutorials.map(t => `
              <div class="group flex flex-col justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/15 transition-all duration-200 shadow-sm">
                <div>
                  <div class="flex items-center justify-between mb-space-xs">
                    <span class="font-label-sm text-label-sm uppercase px-1.5 py-0.5 rounded ${t.isBundle ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-high text-primary font-medium'}">
                      ${t.isBundle ? 'FULL COMPILATION' : `TUTORIAL ${t.num}`}
                    </span>
                    <span class="font-code-sm text-code-sm text-outline">${t.size} • PDF</span>
                  </div>
                  <h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">${t.title}</h4>
                  <p class="font-body-sm text-body-sm text-on-surface-variant text-xs line-clamp-2 leading-relaxed">${t.desc}</p>
                </div>
                <div class="flex items-center gap-2 pt-space-sm mt-space-sm border-t border-outline-variant/10">
                  <button type="button" class="btn-preview-resource flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm text-xs transition-colors" data-link="${t.file}" data-title="${t.title}">
                    <span class="material-symbols-outlined text-[15px]">visibility</span>
                    <span>View PDF</span>
                  </button>
                  <a href="${t.file}" download="${t.file.split('/').pop()}" class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm text-xs font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
                    <span class="material-symbols-outlined text-[15px]">download</span>
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
        { num: 1, title: 'Tutorial Sheet 1: Limits, Continuity, Chain Rule & Jacobian', desc: 'Delta-epsilon limits, continuity, partial derivatives, Euler theorem & Jacobians.', file: 'vault/Math1_Tutorial_Sheet_1.pdf', size: '383 KB' },
        { num: 2, title: 'Tutorial Sheet 2: Taylor Series, Maxima-Minima & Lagrange Multiplier', desc: 'Taylor series expansions, stationary points classification & Lagrange multipliers.', file: 'vault/Math1_Tutorial_Sheet_2.pdf', size: '450 KB' },
        { num: 3, title: 'Tutorial Sheet 3: Double Integrals, Change of Order & Beta-Gamma Functions', desc: 'Double integrals, order inversion, polar form & Beta-Gamma special functions.', file: 'vault/Math1_Tutorial_Sheet_3.pdf', size: '254 KB' },
        { num: 4, title: 'Tutorial Sheet 4: Applications of Double Integrals to Area & Volume', desc: 'Planar area, volume under paraboloids, surface area & heat dissipation modeling.', file: 'vault/Math1_Tutorial_Sheet_4.pdf', size: '448 KB' },
        { num: '★', title: 'Complete Tutorial Problem Sets Bundle (1–4)', desc: 'Official compilation of all 4 Mathematics I tutorial sheets with verified solutions.', file: 'vault/Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf', size: '1.5 MB', isBundle: true }
      ];

      featuredShelfHtml = `
        <div class="featured-tutorials-shelf col-span-1 md:col-span-2 xl:col-span-4 mb-space-lg">
          <div class="flex items-center justify-between mb-space-md flex-wrap gap-space-sm bg-surface-container-low p-space-md rounded-xl border border-outline-variant/15 shadow-sm">
            <div class="flex items-center gap-space-sm">
              <div class="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                <span class="material-symbols-outlined text-[22px]">functions</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Mathematics I — Tutorial Problem Sets (Sheets 1 to 4)</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Department of Mathematics • 25B11MA113 • Official verified assignment sheets</p>
              </div>
            </div>
            <a href="vault/Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf" download="Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf" class="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
              <span class="material-symbols-outlined text-[16px]">download</span>
              <span>Download All (8 Pages PDF)</span>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
            ${mathTutorials.map(t => `
              <div class="group flex flex-col justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/15 transition-all duration-200 shadow-sm">
                <div>
                  <div class="flex items-center justify-between mb-space-xs">
                    <span class="font-label-sm text-label-sm uppercase px-1.5 py-0.5 rounded ${t.isBundle ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-container-high text-secondary font-medium'}">
                      ${t.isBundle ? 'FULL COMPILATION' : `SHEET ${t.num}`}
                    </span>
                    <span class="font-code-sm text-code-sm text-outline">${t.size} • PDF</span>
                  </div>
                  <h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold text-sm line-clamp-2 mb-1 group-hover:text-secondary transition-colors">${t.title}</h4>
                  <p class="font-body-sm text-body-sm text-on-surface-variant text-xs line-clamp-2 leading-relaxed">${t.desc}</p>
                </div>
                <div class="flex items-center gap-2 pt-space-sm mt-space-sm border-t border-outline-variant/10">
                  <button type="button" class="btn-preview-resource flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm text-xs transition-colors" data-link="${t.file}" data-title="${t.title}">
                    <span class="material-symbols-outlined text-[15px]">visibility</span>
                    <span>View PDF</span>
                  </button>
                  <a href="${t.file}" download="${t.file.split('/').pop()}" class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm text-xs font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
                    <span class="material-symbols-outlined text-[15px]">download</span>
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
        <div class="col-span-1 md:col-span-2 xl:col-span-4 bg-surface-container-low rounded-xl p-space-xl text-center border border-outline-variant/15">
          <div class="text-4xl mb-space-sm">📂</div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">No Additional Resources Found</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto mb-space-md">
            No materials found matching your selected filters.
          </p>
          <button type="button" class="px-space-md py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm" onclick="ResourcesController.resetFilters()">
            Reset All Filters
          </button>
        </div>
      `;
      // Bind preview triggers on shelf
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
        typeColor = 'text-error';
        typeBg = 'bg-error-container/20';
      } else if (r.type === 'Lab Manual') {
        icon = 'biotech';
        typeColor = 'text-secondary';
        typeBg = 'bg-secondary/15';
      } else if (r.type === 'Book') {
        icon = 'menu_book';
        typeColor = 'text-tertiary';
        typeBg = 'bg-tertiary/15';
      } else if (r.type === 'Tutorial') {
        icon = 'edit_note';
        typeColor = 'text-secondary';
        typeBg = 'bg-secondary/15';
      }

      const hasDownload = (r.link && r.link !== '#');
      const filename = hasDownload ? r.link.split('/').pop() : `${r.title}.pdf`;

      return `
        <div class="resource-card group flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-200 shadow-sm border border-outline-variant/15" data-category="${r.type}" data-semester="sem-${r.semester}">
          <div>
            <!-- Card Header Meta -->
            <div class="flex items-center justify-between gap-space-xs mb-space-sm">
              <div class="flex items-center gap-1.5 min-w-0">
                <div class="w-6 h-6 rounded ${typeBg} flex items-center justify-center flex-shrink-0 ${typeColor}">
                  <span class="material-symbols-outlined text-[15px]">${icon}</span>
                </div>
                <span class="font-label-md text-label-md font-medium truncate ${typeColor}">${typeLabel}</span>
                <span class="w-1 h-1 rounded-full bg-outline flex-shrink-0"></span>
                <span class="font-label-sm text-label-sm text-on-surface-variant truncate">Sem ${r.semester} • ${r.code || r.subject || 'Gen'}</span>
              </div>
              <span class="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant flex-shrink-0">${r.size || 'PDF'}</span>
            </div>

            <!-- Title -->
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-space-xs">
              ${r.title}
            </h3>

            <!-- Description -->
            <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mb-space-md">
              ${r.description || ''}
            </p>
          </div>

          <!-- Card Footer -->
          <div class="pt-space-sm flex items-center justify-between bg-surface-container-lowest/40 -mx-space-lg -mb-space-lg px-space-lg py-space-sm rounded-b-xl border-t border-outline-variant/10">
            <div class="flex items-center gap-1 min-w-0 max-w-[50%]">
              <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider flex-shrink-0">Scope:</span>
              <span class="font-label-sm text-label-sm text-on-surface truncate" title="${r.unit || 'All Units'}">${r.unit || 'All Units'}</span>
            </div>

            <div class="flex items-center gap-2">
              ${hasDownload ? `
                <button type="button" class="btn-preview-resource flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" data-link="${r.link}" data-title="${r.title}">
                  <span class="material-symbols-outlined text-[14px]">visibility</span>
                  <span>View</span>
                </button>
                <a href="${r.link}" download="${filename}" class="download-trigger flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-secondary-fixed transition-colors">
                  <span>Download</span>
                  <span class="material-symbols-outlined text-[15px] group-hover:translate-x-0.5 transition-transform">north_east</span>
                </a>
              ` : `
                <span class="font-label-sm text-label-sm text-outline flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">verified</span>
                  <span>Verified</span>
                </span>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = featuredShelfHtml + cardsHtml;

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
    if (!link) return;
    
    // Check if modal exists
    let modal = document.getElementById('pdf-preview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pdf-preview-modal';
      modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4';
      modal.innerHTML = `
        <div class="modal-card w-full max-w-4xl h-[85vh] p-4 flex flex-col justify-between" style="box-shadow: 0 24px 60px rgba(0,0,0,0.7);">
          <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div class="flex items-center gap-2.5 overflow-hidden">
              <span class="material-symbols-outlined text-primary text-[22px]">description</span>
              <h3 id="preview-modal-title" class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">Document Preview</h3>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <a id="preview-modal-newtab" href="#" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary text-xs font-semibold inline-flex items-center gap-1 transition-colors">
                <span class="material-symbols-outlined text-[15px]">open_in_new</span>
                <span>Open in Tab</span>
              </a>
              <a id="preview-modal-download" href="#" download class="btn-attendance-toggle attended text-xs py-1.5 px-3 inline-flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">download</span>
                <span>Download</span>
              </a>
              <button type="button" id="preview-modal-close" class="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer" title="Close Preview">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
          <div class="flex-1 w-full mt-3 bg-surface-container-lowest rounded-lg overflow-hidden relative">
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

    // Attach listeners reliably
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
    const semFilter = document.getElementById('resource-sem-filter');
    if (semFilter) semFilter.value = 'all';
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
    const subject = prompt('Subject Category (SDF / English / Physics / Mathematics / Other):', 'SDF') || 'SDF';
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
    const semFilter = document.getElementById('resource-sem-filter');
    if (semFilter) {
      semFilter.addEventListener('change', (e) => {
        this.activeSemester = e.target.value;
        this.renderResources();
      });
    }

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
