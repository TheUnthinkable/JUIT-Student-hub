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
        <button type="button" class="category-pill ${isActive ? 'active' : ''}" data-subject="${s.id}">
          <span class="material-symbols-outlined text-[16px]">${s.icon}</span>
          <span>${s.label}</span>
          <span class="pill-count-badge">${itemsCount}</span>
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
        <button type="button" class="map-filter-chip ${isActive ? 'active' : ''}" data-type="${t.id}">
          <span class="material-symbols-outlined text-[15px]">${t.icon}</span>
          <span>${t.label}</span>
        </button>
      `;
    }).join('');

    typeContainer.querySelectorAll('.map-filter-chip').forEach(btn => {
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
        <div class="featured-tutorials-shelf col-span-12" style="grid-column: 1 / -1; margin-bottom: 22px;">
          <div class="featured-shelf-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="shelf-header-icon" style="width: 36px; height: 36px; border-radius: 8px; background: rgba(59, 130, 246, 0.12); color: #3b82f6; display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined" style="font-size: 20px;">memory</span>
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0; color: var(--text-primary);">Basic Electronics — Tutorial Problem Sets (Tutorials 1 to 5)</h3>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 2px 0 0;">Department of ECE • 25B11EC111 • Complete verified assignment problem sheets for view & download</p>
              </div>
            </div>
            <a href="vault/Basic_Electronics_All_Tutorials_Bundle.pdf" download="Basic_Electronics_All_Tutorials_Bundle.pdf" class="btn-primary" style="font-size: 0.82rem; padding: 7px 14px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
              <span class="material-symbols-outlined" style="font-size: 16px;">download</span>
              <span>Download All (18 Pages PDF)</span>
            </a>
          </div>

          <div class="featured-shelf-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
            ${elecTutorials.map(t => `
              <div class="featured-tutorial-card ${t.isBundle ? 'is-bundle' : ''}" style="background: var(--bg-card); border: 1px solid ${t.isBundle ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-subtle)'}; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; transition: transform 0.15s ease, border-color 0.15s ease;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: ${t.isBundle ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.15)'}; color: ${t.isBundle ? '#3b82f6' : '#f59e0b'};">
                      ${t.isBundle ? 'FULL COMPILATION' : `TUTORIAL ${t.num}`}
                    </span>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${t.size} • PDF</span>
                  </div>
                  <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; line-height: 1.35;">${t.title}</h4>
                  <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${t.desc}</p>
                </div>
                <div style="display: flex; gap: 8px; pt-2; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                  <button type="button" class="btn-preview-resource" data-link="${t.file}" data-title="${t.title}" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 10px; font-size: 0.8rem; font-weight: 600; border-radius: 6px; background: var(--bg-elevated); color: var(--text-primary); border: 1px solid var(--border-subtle); cursor: pointer;">
                    <span class="material-symbols-outlined" style="font-size: 15px;">visibility</span>
                    <span>View PDF</span>
                  </button>
                  <a href="${t.file}" download="${t.file.split('/').pop()}" style="display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 7px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 6px; background: #2563eb; color: #ffffff; text-decoration: none;">
                    <span class="material-symbols-outlined" style="font-size: 15px;">download</span>
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
        <div class="featured-tutorials-shelf col-span-12" style="grid-column: 1 / -1; margin-bottom: 22px;">
          <div class="featured-shelf-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="shelf-header-icon" style="width: 36px; height: 36px; border-radius: 8px; background: rgba(2, 132, 199, 0.12); color: #0284c7; display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined" style="font-size: 20px;">functions</span>
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0; color: var(--text-primary);">Mathematics I — Tutorial Problem Sets (Sheets 1 to 4)</h3>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 2px 0 0;">Department of Mathematics • 25B11MA113 • Official verified assignment sheets for view & download</p>
              </div>
            </div>
            <a href="vault/Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf" download="Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf" class="btn-primary" style="font-size: 0.82rem; padding: 7px 14px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
              <span class="material-symbols-outlined" style="font-size: 16px;">download</span>
              <span>Download All (8 Pages PDF)</span>
            </a>
          </div>

          <div class="featured-shelf-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
            ${mathTutorials.map(t => `
              <div class="featured-tutorial-card ${t.isBundle ? 'is-bundle' : ''}" style="background: var(--bg-card); border: 1px solid ${t.isBundle ? 'rgba(2, 132, 199, 0.4)' : 'var(--border-subtle)'}; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; transition: transform 0.15s ease, border-color 0.15s ease;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: ${t.isBundle ? 'rgba(2, 132, 199, 0.2)' : 'rgba(2, 132, 199, 0.15)'}; color: ${t.isBundle ? '#38bdf8' : '#0284c7'};">
                      ${t.isBundle ? 'FULL COMPILATION' : `SHEET ${t.num}`}
                    </span>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${t.size} • PDF</span>
                  </div>
                  <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; line-height: 1.35;">${t.title}</h4>
                  <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${t.desc}</p>
                </div>
                <div style="display: flex; gap: 8px; pt-2; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                  <button type="button" class="btn-preview-resource" data-link="${t.file}" data-title="${t.title}" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 10px; font-size: 0.8rem; font-weight: 600; border-radius: 6px; background: var(--bg-elevated); color: var(--text-primary); border: 1px solid var(--border-subtle); cursor: pointer;">
                    <span class="material-symbols-outlined" style="font-size: 15px;">visibility</span>
                    <span>View PDF</span>
                  </button>
                  <a href="${t.file}" download="${t.file.split('/').pop()}" style="display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 7px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 6px; background: #0284c7; color: #ffffff; text-decoration: none;">
                    <span class="material-symbols-outlined" style="font-size: 15px;">download</span>
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
        <div class="empty-state-card col-span-12" style="padding: 40px; text-align: center; grid-column: 1 / -1;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">📂</div>
          <h3 style="font-size: 1.25rem; margin-bottom: 6px; color: var(--text-primary);">No Additional Resources Found</h3>
          <p style="color: var(--text-secondary); max-width: 450px; margin: 0 auto 16px;">
            No materials found matching your selected filters.
          </p>
          <button type="button" class="btn-primary" onclick="ResourcesController.resetFilters()">
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
      if (r.type === 'PYQ') icon = 'quiz';
      if (r.type === 'Lab Manual') icon = 'biotech';
      if (r.type === 'Book') icon = 'menu_book';
      if (r.type === 'Tutorial') icon = 'edit_note';

      const subjectColor = r.subject === 'SDF' ? '#3b82f6' : (r.subject === 'English' ? '#8b5cf6' : (r.subject === 'Physics' ? '#10b981' : (r.subject === 'Basic Electronics' ? '#f59e0b' : (r.subject === 'Mathematics' ? '#00e5ff' : '#3b82f6'))));
      const hasDownload = (r.link && r.link !== '#');
      const filename = hasDownload ? r.link.split('/').pop() : `${r.title}.pdf`;

      return `
        <div class="dash-card resource-card" data-subject="${r.subject || 'Gen'}" data-category="${r.type}">
          <div>
            <!-- Card Header Meta -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="resource-badge-icon" style="background: ${subjectColor}20; color: ${subjectColor};">
                  <span class="material-symbols-outlined text-[16px]">${icon}</span>
                </div>
                <div>
                  <span class="resource-subject-badge" style="color: ${subjectColor}; font-weight: 700;">${r.subject || r.type}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 6px;">Sem ${r.semester} • ${r.code || 'Gen'}</span>
                </div>
              </div>
              <span class="kbd-shortcut" style="font-size: 0.72rem; padding: 2px 6px;">
                ${r.size || 'PDF'}
              </span>
            </div>

            <!-- Title -->
            <h4 class="resource-card-title">
              ${r.title}
            </h4>

            <!-- Description -->
            <p class="resource-card-desc">
              ${r.description || ''}
            </p>
          </div>

          <!-- Card Footer with Scope & Actions -->
          <div class="resource-card-footer">
            <div style="display: flex; align-items: center; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 55%;">
              <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Scope:</span>
              <span style="font-size: 0.75rem; color: var(--text-primary); font-weight: 600;" title="${r.unit || 'All Units'}">${r.unit || 'All Units'}</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
              ${hasDownload ? `
                <button type="button" class="btn-preview-resource" data-link="${r.link}" data-title="${r.title}">
                  <span class="material-symbols-outlined text-[15px]">visibility</span>
                  <span>View</span>
                </button>
                <a href="${r.link}" download="${filename}" class="download-trigger">
                  <span>Download</span>
                  <span class="material-symbols-outlined text-[15px]">download</span>
                </a>
              ` : `
                <button type="button" class="download-trigger disabled" style="opacity: 0.6; cursor: default;">
                  <span>In Repository</span>
                  <span class="material-symbols-outlined text-[15px]">verified</span>
                </button>
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

  previewDocument(link, title) {
    if (!link) return;
    
    // Check if modal exists
    let modal = document.getElementById('pdf-preview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pdf-preview-modal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal-content-window" style="max-width: 950px; width: 95%; height: 90vh; display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-subtle); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; background: var(--bg-card); border-bottom: 1px solid var(--border-subtle);">
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
              <span class="material-symbols-outlined text-[20px]" style="color: #3b82f6;">description</span>
              <h3 id="preview-modal-title" style="font-size: 1rem; margin: 0; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Document Preview</h3>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
              <a id="preview-modal-newtab" href="#" target="_blank" class="btn-secondary" style="padding: 6px 12px; font-size: 0.78rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 14px;">open_in_new</span>
                <span>Open in Tab</span>
              </a>
              <a id="preview-modal-download" href="#" download class="btn-primary" style="padding: 6px 14px; font-size: 0.78rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 14px;">download</span>
                <span>Download</span>
              </a>
              <button type="button" class="btn-icon-header" id="preview-modal-close" style="font-size: 1.1rem; width: 32px; height: 32px; border-radius: 6px; cursor: pointer;">✕</button>
            </div>
          </div>
          <div style="flex: 1; position: relative; background: #0b0f19;">
            <iframe id="preview-modal-iframe" src="" style="width: 100%; height: 100%; border: none;"></iframe>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#preview-modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
        modal.querySelector('#preview-modal-iframe').src = '';
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          modal.querySelector('#preview-modal-iframe').src = '';
        }
      });
    }

    const titleEl = modal.querySelector('#preview-modal-title');
    const dlEl = modal.querySelector('#preview-modal-download');
    const newTabEl = modal.querySelector('#preview-modal-newtab');
    const iframeEl = modal.querySelector('#preview-modal-iframe');

    if (titleEl) titleEl.textContent = title || 'Document Preview';
    if (dlEl) {
      dlEl.href = link;
      dlEl.download = link.split('/').pop() || 'document.pdf';
    }
    if (newTabEl) {
      newTabEl.href = link;
    }
    if (iframeEl) iframeEl.src = link;

    modal.classList.add('active');
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
