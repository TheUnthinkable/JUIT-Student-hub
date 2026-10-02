/**
 * Interactive Architectural Campus Map & Turn-by-Turn Navigation Engine
 * Jaypee University of Information Technology (JUIT Waknaghat, Solan)
 * 
 * Features:
 * - High-precision 1000x680 architectural vector campus map with Shivalik hillside topography.
 * - 14 detailed university landmarks with distinct architectural footprints (AB1, AB2 with tiered lecture theatres, AB3, LRC, OAT, Mess A/B, Hostels, Sports Arena, Gate 1, Dispensary, Helipad).
 * - Live animated pathfinding engine (BFS/Dijkstra shortest path & 100% ramp-accessible routing).
 * - Animated glowing neon walking routes with live distance & estimated time telemetry.
 * - Interactive Timetable Venue Finder: clicking any classroom/lab in the timetable flies to the building, drops an animated beacon pin, and displays the walking route.
 * - Multi-floor interactive building drawer with room search and one-tap directions.
 * - Map Modes: 🗺️ Master Blueprint, 🧭 Walkways & Ramps, and 🌙 Night Ambient Glow.
 * - Smooth touch & mouse pan/zoom with inertia and reset controls.
 */

const CampusMap = {
  data: {},
  buildings: [],
  activeCategory: 'all',
  activeBuilding: null,
  highlightedVenue: null,
  activeFloorFilter: 'all',
  activeMapMode: 'blueprint', // 'blueprint' | 'walkways' | 'night'
  
  // Transform State
  zoomLevel: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  hasMoved: false,
  
  // Active Navigation Route State
  activeRoute: null, // { pathCoords: [...], fromId, toId, distanceMeters, timeMinutes, isAccessible, steps: [...] }

  // Architectural Layout & Metadata for JUIT Waknaghat (1000 x 680 Canvas)
  layoutMeta: {
    main_gate: {
      x: 60, y: 195, w: 128, h: 54,
      code: 'GATE 1', badge: 'Entry', color: '#64748b',
      name: 'Main Campus Gate 1',
      sub: 'Security, Barrier & PNB 24x7 ATM',
      category: 'facility'
    },
    admin: {
      x: 235, y: 155, w: 136, h: 58,
      code: 'ADMIN', badge: 'Directorate', color: '#38bdf8',
      name: 'Administrative Block',
      sub: 'VC Secretariat, Registrar & COE',
      category: 'library'
    },
    dispensary: {
      x: 120, y: 295, w: 132, h: 52,
      code: 'HEALTH', badge: '24x7 Med', color: '#ef4444',
      name: 'Health Centre & Dispensary',
      sub: 'OPD, Pharmacy & Ambulance Bay',
      category: 'facility'
    },
    lrc: {
      x: 420, y: 135, w: 162, h: 68,
      code: 'LRC', badge: '3 Floors', color: '#f59e0b',
      name: 'Learning Resource Centre',
      sub: 'Central Library, DSpace & PYQ Archive',
      featured: true,
      category: 'library'
    },
    viewpoint: {
      x: 640, y: 125, w: 134, h: 50,
      code: 'VIEW', badge: '1,570m Ridge', color: '#0ea5e9',
      name: 'Shivalik Ridge Helipad',
      sub: 'Valley Overlook & Mandir Trail',
      category: 'facility'
    },
    hostels_girls: {
      x: 790, y: 180, w: 150, h: 60,
      code: 'GH', badge: '5 Blocks', color: '#ec4899',
      name: 'Girls Hostels Complex',
      sub: 'Geeta & Malviya Bhawans • Quad',
      category: 'hostel'
    },
    block1: {
      x: 250, y: 345, w: 160, h: 72,
      code: 'AB1', badge: '4 Floors', color: '#00e5ff',
      name: 'Academic Block 1',
      sub: 'CR01–CR10 • TR1–7 • Physics/ECE Labs',
      category: 'academic'
    },
    block2: {
      x: 480, y: 310, w: 172, h: 76,
      code: 'AB2', badge: '4 Floors', color: '#3b82f6',
      name: 'Academic Block 2',
      sub: 'LT1–LT3 Theatres • CL01–52 Computing',
      featured: true,
      category: 'academic'
    },
    block3: {
      x: 720, y: 345, w: 160, h: 72,
      code: 'AB3', badge: '4 Floors', color: '#10b981',
      name: 'Academic Block 3',
      sub: 'Biotech, Bioinformatics & Civil Labs',
      category: 'academic'
    },
    oat: {
      x: 470, y: 435, w: 135, h: 52,
      code: 'OAT', badge: 'Amphitheatre', color: '#8b5cf6',
      name: 'Open Air Theatre',
      sub: 'Tiered Cultural Stage & Arena',
      category: 'sports'
    },
    hostels_boys: {
      x: 120, y: 485, w: 150, h: 64,
      code: 'BH', badge: '1–4 Blocks', color: '#6366f1',
      name: 'Boys Hostels Terraces',
      sub: 'Shastri, Azad, Patel, Subhash, Parmar',
      category: 'hostel'
    },
    annapurna_a: {
      x: 325, y: 520, w: 150, h: 60,
      code: 'MESS-A', badge: 'Central Dining', color: '#f97316',
      name: 'Annapurna Dining A',
      sub: 'Senior Boys & Main Dining Hall',
      category: 'mess'
    },
    annapurna_b: {
      x: 525, y: 520, w: 150, h: 60,
      code: 'MESS-B', badge: 'Dining & Cafe', color: '#f97316',
      name: 'Annapurna Dining B',
      sub: 'Girls, 1st Year & Peach Tree Cafe',
      category: 'mess'
    },
    sports_complex: {
      x: 740, y: 505, w: 150, h: 64,
      code: 'SPORTS', badge: 'Arena & Gym', color: '#14b8a6',
      name: 'Sports Arena & Gym',
      sub: 'Basketball, Volleyball & Fitness Gym',
      category: 'sports'
    }
  },

  // Topological Navigation Waypoint Graph for JUIT Waknaghat Campus
  waypointGraph: {
    // Road & Gate Network
    gate:            { x: 124, y: 222, neighbors: ['dispensary_junc', 'gate_curve'] },
    gate_curve:      { x: 170, y: 200, neighbors: ['gate', 'admin_junc'] },
    admin_junc:      { x: 250, y: 210, neighbors: ['gate_curve', 'admin', 'lrc_junc', 'spine_west'] },
    admin:           { x: 300, y: 185, neighbors: ['admin_junc', 'lrc'] },
    dispensary_junc: { x: 140, y: 270, neighbors: ['gate', 'dispensary', 'spine_west', 'bh_junc'] },
    dispensary:      { x: 185, y: 320, neighbors: ['dispensary_junc'] },
    
    // Central Spine & Academic Spine Network
    lrc_junc:        { x: 420, y: 215, neighbors: ['admin_junc', 'lrc', 'spine_rotunda', 'ridge_junc'] },
    lrc:             { x: 500, y: 170, neighbors: ['lrc_junc', 'admin', 'ridge_junc'] },
    ridge_junc:      { x: 620, y: 170, neighbors: ['lrc_junc', 'lrc', 'viewpoint', 'gh_junc'] },
    viewpoint:       { x: 705, y: 150, neighbors: ['ridge_junc'] },
    gh_junc:         { x: 770, y: 195, neighbors: ['ridge_junc', 'hostels_girls', 'spine_east'] },
    hostels_girls:   { x: 865, y: 210, neighbors: ['gh_junc'] },

    // Central Academic Promenade (Colonnade Spine)
    spine_west:      { x: 280, y: 330, neighbors: ['admin_junc', 'dispensary_junc', 'block1', 'spine_rotunda', 'bh_junc'] },
    block1:          { x: 330, y: 380, neighbors: ['spine_west', 'skybridge_ab1', 'mess_a_junc'] },
    skybridge_ab1:   { x: 410, y: 365, neighbors: ['block1', 'skybridge_ab2'] },
    skybridge_ab2:   { x: 480, y: 355, neighbors: ['skybridge_ab1', 'block2'] },
    
    spine_rotunda:   { x: 450, y: 320, neighbors: ['spine_west', 'lrc_junc', 'block2', 'oat_junc'] },
    block2:          { x: 565, y: 348, neighbors: ['spine_rotunda', 'skybridge_ab2', 'spine_east', 'oat_junc'] },
    
    spine_east:      { x: 690, y: 330, neighbors: ['block2', 'block3', 'gh_junc', 'sports_junc'] },
    block3:          { x: 800, y: 380, neighbors: ['spine_east', 'sports_junc'] },

    // Open Air Theatre & Lower Quads
    oat_junc:        { x: 490, y: 415, neighbors: ['spine_rotunda', 'block2', 'oat', 'mess_cross'] },
    oat:             { x: 535, y: 460, neighbors: ['oat_junc'] },

    // Mess & Residential Lower Terraces
    mess_cross:      { x: 470, y: 485, neighbors: ['oat_junc', 'mess_a_junc', 'annapurna_b', 'sports_junc'] },
    mess_a_junc:     { x: 370, y: 485, neighbors: ['block1', 'mess_cross', 'annapurna_a', 'bh_junc'] },
    annapurna_a:     { x: 400, y: 550, neighbors: ['mess_a_junc'] },
    annapurna_b:     { x: 600, y: 550, neighbors: ['mess_cross'] },

    // Boys Hostels West Terraces
    bh_junc:         { x: 190, y: 450, neighbors: ['dispensary_junc', 'spine_west', 'mess_a_junc', 'hostels_boys'] },
    hostels_boys:    { x: 195, y: 515, neighbors: ['bh_junc'] },

    // Sports Arena East Terraces
    sports_junc:     { x: 740, y: 470, neighbors: ['spine_east', 'block3', 'mess_cross', 'sports_complex'] },
    sports_complex:  { x: 815, y: 535, neighbors: ['sports_junc'] }
  },

  init(campusData) {
    this.data = campusData || (window.JUIT_DATA && window.JUIT_DATA.campus) || {};
    this.buildings = this.data.buildings || [];

    this.renderCategoryFilters();
    this.renderQuickBuildingStrip();
    this.renderMapControlsUI();
    this.renderSVGMap();
    this.bindMapControls();
    this.bindSearch();
    this.bindBuildingCards();
    this.bindTurnByTurn();
  },

  renderCategoryFilters() {
    const container = document.getElementById('map-category-filters');
    if (!container) return;

    const categories = [
      { id: 'all', label: 'All Locations', icon: 'domain' },
      { id: 'academic', label: 'Academic & Classrooms', icon: 'school' },
      { id: 'mess', label: 'Annapurna & Food', icon: 'restaurant' },
      { id: 'hostel', label: 'Hostels', icon: 'hotel' },
      { id: 'library', label: 'LRC Library & Admin', icon: 'local_library' },
      { id: 'sports', label: 'Sports & Facilities', icon: 'fitness_center' }
    ];

    container.innerHTML = categories.map(c => {
      const isActive = (c.id === this.activeCategory);
      return `
        <button type="button" class="category-pill flex items-center gap-1.5 px-space-md py-1.5 rounded-lg font-body-sm text-body-sm ${isActive ? 'bg-primary text-on-primary font-medium shadow-sm' : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'} transition-all flex-shrink-0" data-cat="${c.id}">
          <span class="material-symbols-outlined text-[16px]">${c.icon}</span>
          <span>${c.label}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.cat;
        this.renderCategoryFilters();
        this.renderSVGMap();
      });
    });
  },

  renderQuickBuildingStrip() {
    const container = document.getElementById('map-quick-buildings');
    if (!container) return;

    const quickList = [
      { id: 'all', label: '📍 All Landmarks (14)' },
      { id: 'block1', label: '🏢 AB1 (CR01–10)' },
      { id: 'block2', label: '💻 AB2 (LT1–3 & CL)' },
      { id: 'block3', label: '🧬 AB3 (Bio/Civil)' },
      { id: 'lrc', label: '📚 LRC Library' },
      { id: 'annapurna_a', label: '🍽️ Annapurna Mess A' },
      { id: 'annapurna_b', label: '☕ Annapurna Mess B' },
      { id: 'hostels_boys', label: '🛏️ Boys Hostels' },
      { id: 'hostels_girls', label: '🌸 Girls Hostels' },
      { id: 'sports_complex', label: '🏸 Sports Arena & Gym' },
      { id: 'dispensary', label: '🏥 Health Centre' },
      { id: 'main_gate', label: '⛩️ Campus Gate 1' },
      { id: 'viewpoint', label: '⛰️ Helipad & View' }
    ];

    container.innerHTML = quickList.map(item => `
      <button type="button" class="quick-bldg-btn ${(this.activeBuilding && this.activeBuilding.id === item.id) ? 'active' : ''}" data-bldg-id="${item.id}">
        ${item.label}
      </button>
    `).join('');

    container.querySelectorAll('.quick-bldg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bId = btn.dataset.bldgId;
        if (bId === 'all') {
          this.resetMapView();
        } else {
          const target = this.buildings.find(b => b.id === bId);
          if (target) {
            this.focusBuilding(target);
          }
        }
      });
    });
  },

  renderMapControlsUI() {
    // 1. Sync header mode bar
    const headerModeBar = document.getElementById('map-header-mode-bar');
    if (headerModeBar) {
      headerModeBar.querySelectorAll('.map-mode-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === this.activeMapMode);
        if (!btn._boundMode) {
          btn._boundMode = true;
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.activeMapMode = btn.dataset.mode;
            this.renderMapControlsUI();
            this.renderSVGMap();
          });
        }
      });
    }

    const viewport = document.getElementById('map-viewport-box');
    if (!viewport) return;

    // 2. Active Route HUD inside viewport (only rendered when route is active!)
    let hudLayer = document.getElementById('map-hud-overlay-layer');
    if (!hudLayer) {
      hudLayer = document.createElement('div');
      hudLayer.id = 'map-hud-overlay-layer';
      hudLayer.className = 'map-hud-overlay-layer';
      viewport.appendChild(hudLayer);
    }

    if (!this.activeRoute) {
      hudLayer.innerHTML = '';
      hudLayer.style.display = 'none';
      return;
    }

    hudLayer.style.display = 'flex';
    hudLayer.innerHTML = `
      <div class="map-active-route-hud" id="map-active-route-hud">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="walking-avatar-mini">🚶</div>
          <div>
            <div class="route-hud-title" id="route-hud-title">
              ${this.activeRoute.fromName} → ${this.activeRoute.toName}
            </div>
            <div class="route-hud-subtitle" id="route-hud-subtitle">
              ~${this.activeRoute.timeMinutes} min (${this.activeRoute.distanceMeters}m) • ${this.activeRoute.isAccessible ? '100% Ramp Accessible' : 'Direct Path'}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button type="button" class="btn-micro" id="btn-view-route-details" style="padding: 4px 10px; font-size: 0.74rem;">
            Step Guide
          </button>
          <button type="button" class="btn-micro" id="btn-clear-active-route" style="padding: 4px 8px; font-size: 0.74rem;" title="Clear Walking Route">
            ✕ Clear
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-clear-active-route')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearRoute();
    });

    document.getElementById('btn-view-route-details')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.activeRoute) {
        this.openRouteModal(this.activeRoute.toId, this.highlightedVenue, this.activeRoute.isAccessible);
      }
    });
  },

  renderSVGMap() {
    const svg = document.getElementById('campus-vector-svg');
    if (!svg) return;

    // Filter buildings based on active category
    const isCategoryActive = (cat, bldgId) => {
      if (cat === 'all') return true;
      if (cat === 'academic') return bldgId === 'block1' || bldgId === 'block2' || bldgId === 'block3';
      if (cat === 'mess') return bldgId === 'annapurna_a' || bldgId === 'annapurna_b';
      if (cat === 'hostel') return bldgId === 'hostels_boys' || bldgId === 'hostels_girls';
      if (cat === 'library') return bldgId === 'lrc' || bldgId === 'admin';
      if (cat === 'sports') return bldgId === 'sports_complex' || bldgId === 'oat' || bldgId === 'viewpoint';
      return true;
    };

    const isNight = (this.activeMapMode === 'night');
    const isWalkwaysOnly = (this.activeMapMode === 'walkways');

    // Color palettes for map modes
    const terrainFill = isNight ? '#050811' : '#0b101c';
    const lawnFill = isNight ? '#0a1715' : '#0e241e';
    const lawnStroke = isNight ? '#122c26' : '#183c32';
    const roadColor = isNight ? '#141a29' : '#1c2438';
    const roadCenter = isNight ? '#253248' : '#334155';
    const spineColor = isWalkwaysOnly ? '#00e5ff' : '#22324e';
    const spineDash = isWalkwaysOnly ? '#38bdf8' : '#3b82f6';

    // Route SVG path markup
    let routeMarkup = '';
    if (this.activeRoute && this.activeRoute.pathCoords && this.activeRoute.pathCoords.length > 1) {
      const d = this.activeRoute.pathCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
      const startPt = this.activeRoute.pathCoords[0];
      const endPt = this.activeRoute.pathCoords[this.activeRoute.pathCoords.length - 1];

      routeMarkup = `
        <!-- Active Route Layer -->
        <g id="map-active-route-group">
          <!-- Outer Pulsing Glow Line -->
          <path d="${d}" fill="none" stroke="#00e5ff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" filter="url(#route-blur)" />
          
          <!-- Core Walking Path Line -->
          <path d="${d}" fill="none" stroke="#00e5ff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" class="walking-route-path" />

          <!-- Origin Beacon Marker (Green Pulse) -->
          <circle cx="${startPt.x}" cy="${startPt.y}" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2" />
          <circle cx="${startPt.x}" cy="${startPt.y}" r="16" fill="none" stroke="#10b981" stroke-width="1.5" class="beacon-radar-pulse" />

          <!-- Destination Beacon Marker (Cyan Glow) -->
          <circle cx="${endPt.x}" cy="${endPt.y}" r="8" fill="#00e5ff" stroke="#ffffff" stroke-width="2" />
          <circle cx="${endPt.x}" cy="${endPt.y}" r="18" fill="none" stroke="#00e5ff" stroke-width="2" class="beacon-radar-pulse" />
        </g>
      `;
    }

    // Render Full SVG Canvas (1000 x 680)
    svg.setAttribute('viewBox', '0 0 1000 680');
    svg.innerHTML = `
      <defs>
        <!-- Route Glow Filter -->
        <filter id="route-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
        </filter>
        <filter id="bldg-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.55" />
        </filter>
        <linearGradient id="spine-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.8"/>
        </linearGradient>
      </defs>

      <!-- Interactive World Container (Smooth Pan & Zoom Layer) -->
      <g id="map-world-layer">
        <!-- 1. Campus Himalayan Hillside Base Terrain -->
        <rect width="1000" height="680" fill="${terrainFill}" />

      <!-- 2. Shivalik Topographic Elevation Isolines (1,550m Altitude) -->
      <g opacity="${isNight ? '0.2' : '0.35'}">
        <path d="M 0 90 Q 250 60 500 80 T 1000 65" fill="none" stroke="#1c2d3f" stroke-width="1.2" stroke-dasharray="4 4" />
        <text x="940" y="60" font-family="'JetBrains Mono', monospace" font-size="8" fill="#475569">1,570m</text>
        <path d="M 0 240 Q 300 210 600 230 T 1000 215" fill="none" stroke="#1c2d3f" stroke-width="1.2" stroke-dasharray="4 4" />
        <text x="940" y="210" font-family="'JetBrains Mono', monospace" font-size="8" fill="#475569">1,550m</text>
        <path d="M 0 440 Q 350 410 700 430 T 1000 420" fill="none" stroke="#1c2d3f" stroke-width="1.2" stroke-dasharray="4 4" />
        <text x="940" y="415" font-family="'JetBrains Mono', monospace" font-size="8" fill="#475569">1,530m</text>
      </g>

      <!-- 3. Campus Landscaped Green Lawns & Courtyards -->
      <g>
        <!-- North Ridge Forest Buffer -->
        <path d="M 0 50 Q 300 20 600 40 T 1000 30 L 1000 110 Q 600 120 0 110 Z" fill="${lawnFill}" opacity="0.6" />
        
        <!-- Central Academic Lawn Quad (between AB1, AB2, and LRC) -->
        <rect x="230" y="235" width="410" height="90" rx="14" fill="${lawnFill}" stroke="${lawnStroke}" stroke-width="1.5" />
        
        <!-- Amphitheatre & South Sports Lawn -->
        <rect x="680" y="445" width="230" height="150" rx="16" fill="${lawnFill}" stroke="${lawnStroke}" stroke-width="1.5" />
        
        <!-- Boys Hostels Hill Terrace Green -->
        <rect x="90" y="430" width="180" height="150" rx="14" fill="${lawnFill}" stroke="${lawnStroke}" stroke-width="1.5" />
      </g>

      <!-- 4. Himalayan Pine Trees (Evergreen Conifer Silhouettes) -->
      <g fill="${isNight ? '#0b1f1a' : '#14342b'}" opacity="0.85">
        <!-- North Forest Clusters -->
        <polygon points="50,75 42,95 58,95" /> <polygon points="50,65 44,80 56,80" />
        <polygon points="120,70 112,90 128,90" />
        <polygon points="200,60 192,80 208,80" />
        <polygon points="580,65 572,85 588,85" />
        <polygon points="630,55 622,75 638,75" />
        <polygon points="880,70 872,90 888,90" />
        <polygon points="930,60 922,80 938,80" />
        <!-- Mid-Hill Pine Clusters -->
        <polygon points="60,380 52,400 68,400" />
        <polygon points="75,410 67,430 83,430" />
        <polygon points="920,440 912,460 928,460" />
        <polygon points="940,480 932,500 948,500" />
        <polygon points="460,265 454,280 466,280" />
        <polygon points="510,265 504,280 516,280" />
      </g>

      <!-- 5. Campus Road Networks (Asphalt Arteries & Driveways) -->
      <!-- Waknaghat Highway connecting to Gate 1 and climbing up past Health Centre to LRC & Ridge -->
      <path d="M 20 220 Q 90 225 140 220 T 250 205 T 410 200 T 620 170 T 780 195 T 980 210" 
            fill="none" stroke="${roadColor}" stroke-width="18" stroke-linecap="round"/>
      <path d="M 20 220 Q 90 225 140 220 T 250 205 T 410 200 T 620 170 T 780 195 T 980 210" 
            fill="none" stroke="${roadCenter}" stroke-width="1.8" stroke-dasharray="8 6" />

      <!-- Connector Road to Lower Residential & Mess Complex -->
      <path d="M 140 220 L 140 280 L 190 450 L 190 530" 
            fill="none" stroke="${roadColor}" stroke-width="14" stroke-linecap="round"/>
      <path d="M 190 470 L 800 470 L 800 530" 
            fill="none" stroke="${roadColor}" stroke-width="14" stroke-linecap="round"/>

      <!-- 6. Grand Academic Spine Promenade (Paved Colonnade) -->
      <!-- Wide Covered Walkway connecting AB1, Central Rotunda, AB2 and AB3 -->
      <path d="M 240 330 L 780 330" 
            fill="none" stroke="${spineColor}" stroke-width="${isWalkwaysOnly ? '18' : '14'}" stroke-linecap="round" />
      <path d="M 240 330 L 780 330" 
            fill="none" stroke="${spineDash}" stroke-width="2.5" stroke-dasharray="8 5" opacity="0.8" />

      <!-- Elevated Covered Skybridge connecting AB1 (2nd floor) and AB2 (2nd floor) -->
      <path d="M 410 365 L 480 355" fill="none" stroke="#3b82f6" stroke-width="9" stroke-linecap="round" opacity="0.9" />
      <path d="M 410 365 L 480 355" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 3" />
      <text x="445" y="352" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="700" fill="#93c5fd">SKYBRIDGE</text>

      <!-- Walkway Connecting Spine to LRC & Administrative Plaza -->
      <path d="M 450 330 L 450 205" 
            fill="none" stroke="${spineColor}" stroke-width="10" stroke-linecap="round" />
      <!-- Walkway to Annapurna Messes & Amphitheatre -->
      <path d="M 490 330 L 490 480" 
            fill="none" stroke="${spineColor}" stroke-width="10" stroke-linecap="round" />

      <!-- Central Campus Clock & Rotunda Plaza -->
      <circle cx="450" cy="330" r="14" fill="#131d2e" stroke="#3b82f6" stroke-width="2" />
      <circle cx="450" cy="330" r="4" fill="#00e5ff" />
      <text x="450" y="310" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="700" fill="#94a3b8">CENTRAL SPINA</text>

      <!-- Regulation Basketball Court Markings on Sports Area -->
      <g transform="translate(745, 515)" opacity="0.7">
        <rect x="0" y="0" width="85" height="48" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
        <line x1="42.5" y1="0" x2="42.5" y2="48" stroke="#38bdf8" stroke-width="1" />
        <circle cx="42.5" cy="24" r="7" fill="none" stroke="#38bdf8" stroke-width="1" />
        <path d="M 0 12 L 18 12 A 6 6 0 0 1 18 36 L 0 36 Z" fill="none" stroke="#38bdf8" stroke-width="1" />
        <path d="M 85 12 L 67 12 A 6 6 0 0 0 67 36 L 85 36 Z" fill="none" stroke="#38bdf8" stroke-width="1" />
      </g>

      <!-- Helipad Landing Circle on Ridge -->
      <g transform="translate(670, 138)" opacity="0.85">
        <circle cx="0" cy="0" r="18" fill="#141c2b" stroke="#ffffff" stroke-width="1.8" />
        <text x="0" y="6" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="16" font-weight="900" fill="#ffffff">H</text>
      </g>

      <!-- Active Walking Route Polyline & Beacons -->
      ${routeMarkup}

      <!-- 7. Architectural Building Nodes Layer -->
      <g id="map-buildings-layer">
        ${this.buildings.map(b => {
          const meta = this.layoutMeta[b.id] || { x: b.coordinates.x, y: b.coordinates.y, w: 140, h: 54, code: b.code, badge: 'Landmark', color: b.color || '#3b82f6', name: b.name, sub: '' };
          const { x, y, w, h, code, badge, color, name, sub, featured } = meta;
          
          const isCategoryMatch = isCategoryActive(this.activeCategory, b.id);
          const isHighlighted = (this.activeBuilding && this.activeBuilding.id === b.id);
          const isVenueMatch = (this.highlightedVenue && this.buildingContainsVenue(b, this.highlightedVenue));
          const opacity = isCategoryMatch ? '1' : '0.2';

          // Animated Glowing Bouncing Location Pin
          const anchorPin = (isHighlighted || isVenueMatch) ? `
            <g transform="translate(${w / 2}, -20)" class="venue-beacon-pin">
              <!-- Radar Wave Rings -->
              <circle cx="0" cy="0" r="10" fill="none" stroke="${color}" stroke-width="2" class="beacon-radar-pulse" />
              <circle cx="0" cy="0" r="22" fill="none" stroke="${color}" stroke-width="1.2" class="beacon-radar-pulse" />
              
              <!-- Pin Pill Badge -->
              <rect x="-46" y="-18" width="92" height="22" rx="6" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" filter="url(#bldg-shadow)" />
              <text x="0" y="-3" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="800" fill="#ffffff">
                ${this.highlightedVenue ? `📍 ${this.highlightedVenue}` : '📍 Selected'}
              </text>
              <polygon points="0,4 -5,-2 5,-2" fill="#0284c7" />
            </g>
          ` : '';

          // Card Background and Border styling
          let cardBg = isNight ? '#0b1120' : (featured ? '#161c2e' : '#111728');
          let cardBorder = (isHighlighted || isVenueMatch) ? '#00e5ff' : (featured ? color : '#232f48');
          let borderWidth = (isHighlighted || isVenueMatch) ? '2.8' : (featured ? '2' : '1.3');

          return `
            <g class="bldg-node ${isHighlighted || isVenueMatch ? 'highlighted' : ''}" 
               data-id="${b.id}" 
               transform="translate(${x}, ${y})"
               opacity="${opacity}"
               filter="url(#bldg-shadow)"
               style="cursor: pointer;">
              
              ${anchorPin}

              <!-- Architectural Building Footprint Box -->
              <rect x="0" y="0" width="${w}" height="${h}" rx="9" 
                    fill="${cardBg}" 
                    stroke="${cardBorder}" 
                    stroke-width="${borderWidth}" />
              
              <!-- Department Color Accent Bar -->
              <rect x="0" y="0" width="5" height="${h}" rx="2" fill="${color}" />

              <!-- Building Code Pill Badge -->
              <rect x="10" y="8" width="48" height="17" rx="4" fill="rgba(0,0,0,0.6)" stroke="${color}" stroke-width="1" />
              <text x="34" y="20" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="800" fill="#ffffff">
                ${code}
              </text>

              <!-- Level / Tag Pill -->
              <text x="${w - 10}" y="20" text-anchor="end" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="700" fill="${color}">
                ${badge}
              </text>

              <!-- Building Name -->
              <text x="12" y="38" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="700" fill="#f8fafc">
                ${name}
              </text>
              <text x="12" y="50" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.8" font-weight="500" fill="#94a3b8">
                ${sub ? sub.substring(0, 27) : ''}
              </text>
            </g>
          `;
        }).join('')}
      </g>

      <!-- 8. Campus Map Header Branding & Compass Orientation -->
      <g transform="translate(24, 24)">
        <rect x="0" y="0" width="370" height="36" rx="8" fill="#0f172a" stroke="rgba(255,255,255,0.12)" />
        <circle cx="18" cy="18" r="5" fill="#00e5ff" />
        <text x="32" y="22" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#f8fafc">
          Jaypee University of Information Technology
        </text>
        <text x="290" y="22" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="600" fill="#38bdf8">
          Waknaghat
        </text>
      </g>
      </g><!-- /#map-world-layer -->

      <!-- North Compass Indicator (Fixed Overlay) -->
      <g transform="translate(940, 24)">
        <rect x="0" y="0" width="36" height="36" rx="8" fill="#0f172a" stroke="rgba(255,255,255,0.12)" />
        <text x="18" y="22" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" fill="#00e5ff">
          N ↑
        </text>
      </g>
    `;

    // Apply current pan/zoom transformation onto map-world-layer
    this.applyTransform(false);
  },

  /* ================= PATHFINDING & ROUTING ENGINE ================= */
  findPath(startNodeKey, destNodeKey) {
    if (!this.waypointGraph[startNodeKey] || !this.waypointGraph[destNodeKey]) {
      return null;
    }
    if (startNodeKey === destNodeKey) {
      return [this.waypointGraph[startNodeKey]];
    }

    // Standard BFS pathfinder on topological graph
    const queue = [[startNodeKey]];
    const visited = new Set([startNodeKey]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === destNodeKey) {
        return path.map(k => ({ key: k, ...this.waypointGraph[k] }));
      }

      const neighbors = this.waypointGraph[current]?.neighbors || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push([...path, n]);
        }
      }
    }

    return null;
  },

  drawRoute(fromId, toId, isAccessible = false) {
    // Map building IDs to graph keys
    const startKey = this.waypointGraph[fromId] ? fromId : (fromId === 'spine' ? 'spine_rotunda' : (this.layoutMeta[fromId] ? fromId : 'spine_rotunda'));
    const destKey = this.waypointGraph[toId] ? toId : (this.layoutMeta[toId] ? toId : 'block2');

    const pathNodes = this.findPath(startKey, destKey);
    if (!pathNodes || pathNodes.length < 2) return;

    // Calculate approximate Euclidean distance in meters (1 unit ~ 0.5 meters)
    let totalDist = 0;
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const dx = pathNodes[i+1].x - pathNodes[i].x;
      const dy = pathNodes[i+1].y - pathNodes[i].y;
      totalDist += Math.sqrt(dx * dx + dy * dy);
    }
    const distanceMeters = Math.round(totalDist * 0.55);
    const timeMinutes = Math.max(1, Math.round(distanceMeters / 65)); // ~4 km/h walking speed

    const fromName = this.layoutMeta[fromId]?.name || (fromId === 'spine' ? 'Central Spine' : 'Campus Origin');
    const toName = this.layoutMeta[toId]?.name || 'Destination';

    this.activeRoute = {
      pathCoords: pathNodes,
      fromId,
      toId,
      fromName,
      toName,
      distanceMeters,
      timeMinutes,
      isAccessible
    };

    this.renderMapControlsUI();
    this.renderSVGMap();
  },

  clearRoute() {
    this.activeRoute = null;
    this.renderMapControlsUI();
    this.renderSVGMap();
  },

  /* ================= BUILDING SELECTION & PAN/ZOOM ================= */
  focusBuilding(bldg, roomCode, shouldPlotRoute = true) {
    if (!bldg) return;
    this.activeBuilding = bldg;
    this.highlightedVenue = roomCode || null;

    // Center map view accurately on building coordinates (SVG 1000x680 space)
    const meta = this.layoutMeta[bldg.id] || { x: bldg.coordinates?.x || 500, y: bldg.coordinates?.y || 340, w: 140, h: 60 };
    const bx = meta.x + (meta.w ? meta.w / 2 : 70);
    const by = meta.y + (meta.h ? meta.h / 2 : 35);
    this.panX = Math.round(500 - bx);
    this.panY = Math.round(340 - by);
    this.zoomLevel = 1.4;

    // Plot walking route from Central Spine if not already routed
    if (shouldPlotRoute && bldg.id !== 'spine_rotunda') {
      this.drawRoute('spine', bldg.id, false);
    } else {
      this.renderSVGMap();
    }

    // Smooth animated transition to the building
    this.applyTransform(true);

    // Refresh UI strips & open drawer
    this.renderQuickBuildingStrip();
    this.openBuildingDrawer(bldg, roomCode);
  },

  resetMapView() {
    this.activeBuilding = null;
    this.highlightedVenue = null;
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.clearRoute();
    this.closeBuildingDrawer();
    this.renderQuickBuildingStrip();
    this.renderSVGMap();
    this.applyTransform(true);
  },

  buildingContainsVenue(bldg, venueCode) {
    if (!venueCode) return false;
    const v = venueCode.trim().toUpperCase();

    // Direct room code prefix heuristics
    if (v.startsWith('CR0') || v === 'CR10' || v.startsWith('TR1') || v.startsWith('TR2') || v.startsWith('TR3') || v.startsWith('TR4') || v.startsWith('TR5') || v.startsWith('TR6') || v.startsWith('TR7') || v === 'DLC' || v === 'LANGULAB' || v === 'PHLAB' || v.startsWith('ECL')) {
      return bldg.id === 'block1';
    }
    if (v.startsWith('LT') || v.startsWith('CL') || v.startsWith('ALAB') || v === 'DLAB') {
      return bldg.id === 'block2';
    }
    if (v.startsWith('CR1') || v.startsWith('CR2') || v.startsWith('TR8') || v.startsWith('TR9') || v.startsWith('TR10') || v === 'BIL' || v === 'GENOMELAB' || v === 'MICROLAB') {
      return bldg.id === 'block3';
    }
    if (v.includes('MESS') || v.includes('ANNAPURNA')) {
      return (v.includes('B') || v.includes('2') || v.includes('PEACH')) ? bldg.id === 'annapurna_b' : bldg.id === 'annapurna_a';
    }
    if (v.includes('LRC') || v.includes('LIBRARY') || v.includes('BOOK')) {
      return bldg.id === 'lrc';
    }
    if (v.includes('GYM') || v.includes('SPORTS') || v.includes('BADMINTON') || v.includes('BASKETBALL')) {
      return bldg.id === 'sports_complex';
    }
    if (v.includes('DISPENSARY') || v.includes('HEALTH') || v.includes('DOCTOR') || v.includes('MEDICAL')) {
      return bldg.id === 'dispensary';
    }

    if (bldg.floors) {
      for (const fl of bldg.floors) {
        for (const fac of fl.facilities) {
          if (fac.toUpperCase().includes(v)) return true;
        }
      }
    }
    return false;
  },

  /* ================= FLYOUT BUILDING DRAWER ================= */
  openBuildingDrawer(bldg, roomToMatch) {
    const drawer = document.getElementById('map-venue-drawer');
    if (!drawer) return;

    this.activeBuilding = bldg;
    const meta = this.layoutMeta[bldg.id] || { color: '#3b82f6', code: bldg.code, badge: 'Landmark' };
    const matchCode = roomToMatch || this.highlightedVenue;

    // Floor navigation tabs
    const floors = bldg.floors || [];
    const floorTabsHtml = floors.length > 0 ? `
      <div class="drawer-floor-tabs">
        <button type="button" class="floor-tab-btn ${this.activeFloorFilter === 'all' ? 'active' : ''}" data-floor="all">All Floors</button>
        ${floors.map(fl => `
          <button type="button" class="floor-tab-btn ${this.activeFloorFilter === fl.level ? 'active' : ''}" data-floor="${fl.level}">
            ${fl.level}
          </button>
        `).join('')}
      </div>
    ` : '';

    // Filter rooms by selected floor
    const filteredFloors = (this.activeFloorFilter === 'all')
      ? floors
      : floors.filter(fl => fl.level === this.activeFloorFilter);

    const roomListHtml = filteredFloors.map(fl => `
      <div class="drawer-floor-group">
        <div class="floor-group-header">
          <span class="material-symbols-outlined" style="font-size: 16px; color: ${meta.color};">layers</span>
          <span>${fl.level}</span>
          <span class="floor-room-count">${fl.facilities.length} rooms / labs</span>
        </div>
        <div class="drawer-rooms-grid">
          ${fl.facilities.map(fac => {
            const isTarget = matchCode && fac.toUpperCase().includes(matchCode.toUpperCase());
            return `
              <div class="drawer-room-chip ${isTarget ? 'room-target' : ''}" data-room="${fac}">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                  <span class="room-chip-name">${fac}</span>
                  ${isTarget ? '<span class="room-matched-pill">📍 Your Class</span>' : ''}
                </div>
                <button type="button" class="btn-room-nav" data-room="${fac}" title="Get walking route to this room">
                  Walk Here →
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    drawer.innerHTML = `
      <div class="drawer-header-strip" style="border-top: 3px solid ${meta.color};">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="drawer-code-pill" style="color: ${meta.color}; border-color: ${meta.color};">${meta.code}</span>
            <span class="drawer-category-pill">${bldg.category ? bldg.category.toUpperCase() : 'CAMPUS'}</span>
            <span class="hud-status-badge status-good" style="font-size: 0.68rem; padding: 1px 6px;">Open Facility</span>
          </div>
          <h2 class="drawer-bldg-name">${bldg.name}</h2>
          <p class="drawer-bldg-summary">${bldg.summary || meta.sub || 'Main facility at JUIT Waknaghat.'}</p>
        </div>
        <button type="button" class="btn-drawer-close" id="btn-close-map-drawer" aria-label="Close building inspector">✕</button>
      </div>

      <!-- Facility Overview Telemetry Bar -->
      <div class="drawer-telemetry-bar">
        <div class="telemetry-item">
          <span class="tele-label">Building Levels</span>
          <span class="tele-val">${floors.length || 1} Floors</span>
        </div>
        <div class="telemetry-item">
          <span class="tele-label">Accessibility</span>
          <span class="tele-val" style="color: #10b981;">Elevator & Ramps ✓</span>
        </div>
        <div class="telemetry-item">
          <span class="tele-label">Operating Hours</span>
          <span class="tele-val">08:00 AM – 10:00 PM</span>
        </div>
      </div>

      <!-- Floor Filter Tabs -->
      ${floorTabsHtml}

      <!-- Rooms Directory Section -->
      <div class="drawer-rooms-container">
        ${roomListHtml || '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No rooms listed for this floor.</div>'}
      </div>

      <!-- Actions Footer -->
      <div class="drawer-actions-footer">
        <button type="button" class="btn-primary" id="btn-drawer-directions" style="flex: 1; font-size: 0.85rem; padding: 10px 14px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          <span class="material-symbols-outlined" style="font-size: 16px;">directions_walk</span>
          <span>Route to ${bldg.code}</span>
        </button>
        <a href="#timetable" class="btn-secondary" style="font-size: 0.85rem; padding: 10px 14px; text-decoration: none; text-align: center;">
          📅 Classes Here
        </a>
      </div>
    `;

    drawer.classList.add('open');

    // Close button
    document.getElementById('btn-close-map-drawer')?.addEventListener('click', () => {
      this.closeBuildingDrawer();
    });

    // Floor tabs
    drawer.querySelectorAll('.floor-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFloorFilter = btn.dataset.floor;
        this.openBuildingDrawer(bldg, roomToMatch);
      });
    });

    // Room Directions buttons
    drawer.querySelectorAll('.btn-room-nav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const r = btn.dataset.room;
        this.drawRoute('spine', bldg.id, false);
        this.openRouteModal(bldg.id, r);
      });
    });

    // Drawer Directions button
    document.getElementById('btn-drawer-directions')?.addEventListener('click', () => {
      this.drawRoute('spine', bldg.id, false);
      this.openRouteModal(bldg.id);
    });
  },

  closeBuildingDrawer() {
    const drawer = document.getElementById('map-venue-drawer');
    if (drawer) drawer.classList.remove('open');
    this.activeBuilding = null;
    this.highlightedVenue = null;
    this.activeFloorFilter = 'all';
    this.renderQuickBuildingStrip();
    this.renderSVGMap();
  },

  /* ================= SEARCH & AUTOCOMPLETE ================= */
  bindSearch() {
    const input = document.getElementById('map-search-input');
    const dropdown = document.getElementById('map-search-dropdown');
    const clearBtn = document.getElementById('map-search-clear');
    if (!input || !dropdown) return;

    // Collect all searchable index items
    const searchIndex = [];
    this.buildings.forEach(b => {
      searchIndex.push({
        title: b.name,
        code: b.code,
        bldgId: b.id,
        bldgName: b.name,
        type: 'Building',
        detail: b.summary || ''
      });

      if (b.floors) {
        b.floors.forEach(fl => {
          fl.facilities.forEach(fac => {
            searchIndex.push({
              title: fac,
              code: b.code,
              bldgId: b.id,
              bldgName: b.name,
              floor: fl.level,
              type: 'Room / Lab',
              detail: `${b.name} • ${fl.level}`
            });
          });
        });
      }
    });

    const handleSearch = () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        dropdown.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
        this.highlightedVenue = null;
        this.renderSVGMap();
        return;
      }

      if (clearBtn) clearBtn.style.display = 'block';

      const matches = searchIndex.filter(item => {
        return item.title.toLowerCase().includes(q) ||
               item.code.toLowerCase().includes(q) ||
               item.bldgName.toLowerCase().includes(q);
      }).slice(0, 8);

      if (matches.length === 0) {
        dropdown.innerHTML = `
          <div style="padding: 12px 16px; font-size: 0.82rem; color: var(--text-muted); text-align: center;">
            No campus venues matching "<strong>${input.value}</strong>".
          </div>
        `;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = matches.map(m => `
        <div class="search-result-item" data-bldg-id="${m.bldgId}" data-room="${m.title}">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="font-weight: 700; color: #ffffff; font-size: 0.86rem;">
              ${m.title}
            </div>
            <span class="search-type-chip">${m.type}</span>
          </div>
          <div style="font-size: 0.74rem; color: var(--accent-primary); margin-top: 2px;">
            🏢 ${m.detail}
          </div>
        </div>
      `).join('');

      dropdown.style.display = 'block';

      dropdown.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
          const bId = el.dataset.bldgId;
          const room = el.dataset.room;
          input.value = room;
          dropdown.style.display = 'none';

          const targetBldg = this.buildings.find(b => b.id === bId);
          if (targetBldg) {
            this.focusBuilding(targetBldg, room);
          }
        });
      });
    };

    input.addEventListener('input', handleSearch);
    input.addEventListener('focus', handleSearch);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        dropdown.style.display = 'none';
        clearBtn.style.display = 'none';
        this.highlightedVenue = null;
        this.renderSVGMap();
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.map-search-container')) {
        dropdown.style.display = 'none';
      }
    });
  },

  /* ================= PAN & ZOOM CONTROLS ================= */
  applyTransform(animate = false) {
    const world = document.getElementById('map-world-layer');
    if (!world) return;

    if (animate) {
      world.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      world.style.transition = 'none';
    }
    world.style.transformOrigin = '500px 340px';
    world.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
  },

  bindMapControls() {
    const btnIn = document.getElementById('btn-map-zoom-in');
    const btnOut = document.getElementById('btn-map-zoom-out');
    const btnReset = document.getElementById('btn-map-reset');
    const viewport = document.getElementById('map-viewport-box');

    if (btnIn) {
      btnIn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.zoomLevel = Math.min(this.zoomLevel + 0.3, 2.6);
        this.applyTransform(true);
      });
    }

    if (btnOut) {
      btnOut.addEventListener('click', (e) => {
        e.stopPropagation();
        this.zoomLevel = Math.max(this.zoomLevel - 0.3, 0.75);
        this.applyTransform(true);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetMapView();
      });
    }

    if (!viewport) return;

    let isPointerDown = false;
    let startX = 0, startY = 0;
    let startPanX = 0, startPanY = 0;
    let hasDragged = false;
    let targetBldgNode = null;
    let initialPinchDist = null;
    let initialPinchZoom = 1;

    const onPointerDown = (clientX, clientY, target) => {
      // Ignore clicks on controls or open building drawer
      if (target.closest('.btn-zoom') || target.closest('.map-venue-drawer') || target.closest('#btn-clear-active-route') || target.closest('#btn-view-route-details') || target.closest('.map-hud-overlay-layer')) {
        return;
      }
      isPointerDown = true;
      hasDragged = false;
      startX = clientX;
      startY = clientY;
      startPanX = this.panX;
      startPanY = this.panY;
      targetBldgNode = target.closest('.bldg-node');
    };

    const onPointerMove = (clientX, clientY) => {
      if (!isPointerDown) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      if (!hasDragged && Math.hypot(dx, dy) > 5) {
        hasDragged = true;
      }
      if (hasDragged) {
        const svgEl = document.getElementById('campus-vector-svg');
        const rect = svgEl ? svgEl.getBoundingClientRect() : { width: 1000, height: 680 };
        // Exact ratio of SVG coordinates per screen pixel
        const svgRatio = 1000 / (rect.width || 1000);
        this.panX = Math.max(-450, Math.min(450, Math.round(startPanX + (dx * svgRatio) / this.zoomLevel)));
        this.panY = Math.max(-320, Math.min(320, Math.round(startPanY + (dy * svgRatio) / this.zoomLevel)));
        this.applyTransform(false); // 60fps instant response, zero lag
      }
    };

    const onPointerUp = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      // If it was a genuine tap/click without dragging, focus building
      if (!hasDragged && targetBldgNode) {
        const bldgId = targetBldgNode.dataset.id;
        const bldg = this.buildings.find(b => b.id === bldgId);
        if (bldg) {
          this.focusBuilding(bldg);
        }
      }
      targetBldgNode = null;
    };

    // Mouse drag events
    viewport.addEventListener('mousedown', (e) => {
      onPointerDown(e.clientX, e.clientY, e.target);
    });

    window.addEventListener('mousemove', (e) => {
      if (isPointerDown) {
        onPointerMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isPointerDown) {
        onPointerUp();
      }
    });

    // Touch events for mobile devices (1 finger pan, 2 fingers pinch zoom)
    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY, e.target);
      } else if (e.touches.length === 2) {
        isPointerDown = false;
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchZoom = this.zoomLevel;
      }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && isPointerDown) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && initialPinchDist) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / initialPinchDist;
        this.zoomLevel = Math.max(0.75, Math.min(2.5, initialPinchZoom * factor));
        this.applyTransform(false);
      }
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        onPointerUp();
        initialPinchDist = null;
      }
    });

    // Mouse Wheel Zoom
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      this.zoomLevel = Math.max(0.75, Math.min(2.5, this.zoomLevel + delta));
      this.applyTransform(true);
    }, { passive: false });
  },

  /* ================= 4 BOTTOM CARDS ================= */
  bindBuildingCards() {
    document.querySelectorAll('.bldg-detail-card').forEach(card => {
      card.addEventListener('click', () => {
        const bldgId = card.dataset.bldg;
        const bldg = this.buildings.find(b => b.id === bldgId);
        if (bldg) {
          this.focusBuilding(bldg);
          document.getElementById('map-viewport-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  },

  /* ================= TURN-BY-TURN GUIDANCE MODAL ================= */
  bindTurnByTurn() {
    document.getElementById('btn-accessible-path')?.addEventListener('click', () => {
      this.openRouteModal(null, null, true);
    });

    document.getElementById('btn-shortest-path')?.addEventListener('click', () => {
      this.openRouteModal(null, null, false);
    });
  },

  openRouteModal(destBldgId, destRoom, isAccessiblePreferred = false) {
    const modal = document.getElementById('map-route-modal');
    const card = document.getElementById('map-route-modal-card');
    if (!modal || !card) return;

    const defaultDest = destBldgId || 'block2';
    const bldgOptions = this.buildings.map(b => {
      const isSel = (b.id === defaultDest);
      return `<option value="${b.id}" ${isSel ? 'selected' : ''}>${b.name} (${b.code})</option>`;
    }).join('');

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="walking-avatar-circle" style="width: 40px; height: 40px; border-radius: 10px; background: rgba(0, 229, 255, 0.15); color: #00e5ff; display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="font-size: 22px;">alt_route</span>
          </div>
          <div>
            <h3 style="font-size: 1.2rem; margin: 0; color: #fff;">Turn-by-Turn Route Guidance</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">JUIT Waknaghat Campus Navigation Engine</span>
          </div>
        </div>
        <button type="button" class="btn-drawer-close" id="btn-close-route-modal">✕</button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
        <div>
          <label style="display: block; font-size: 0.76rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Starting Origin</label>
          <select class="select-styled" id="route-start-point" style="width: 100%; font-size: 0.85rem;">
            <option value="spine" selected>Central Academic Spine Walkway</option>
            <option value="main_gate">Main Campus Gate 1 (ATM)</option>
            <option value="hostels_boys">Boys Hostels Quad (Parmar/Azad)</option>
            <option value="hostels_girls">Girls Hostels Plaza (Geeta/Sharda)</option>
            <option value="annapurna_a">Annapurna Dining Hall A</option>
            <option value="lrc">LRC Central Library Ground Floor</option>
          </select>
        </div>

        <div>
          <label style="display: block; font-size: 0.76rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Destination</label>
          <select class="select-styled" id="route-dest-point" style="width: 100%; font-size: 0.85rem;">
            ${bldgOptions}
          </select>
        </div>
      </div>

      <!-- Accessibility Mode Switcher -->
      <div style="display: flex; gap: 10px; background: #101422; padding: 6px; border-radius: 10px; border: 1px solid #1f273e; margin-bottom: 18px;">
        <button type="button" class="route-mode-btn ${!isAccessiblePreferred ? 'active' : ''}" id="btn-route-fast" style="flex: 1;">
          ⚡ Fastest Route (Colonnade & Stairs)
        </button>
        <button type="button" class="route-mode-btn ${isAccessiblePreferred ? 'active' : ''}" id="btn-route-accessible" style="flex: 1;">
          ♿ 100% Ramp & Elevator Accessible
        </button>
      </div>

      <div id="route-steps-container"></div>
    `;

    modal.style.display = 'flex';

    const renderSteps = (isAccessible) => {
      const destId = document.getElementById('route-dest-point')?.value || defaultDest;
      const startId = document.getElementById('route-start-point')?.value || 'spine';
      const targetB = this.buildings.find(b => b.id === destId) || this.buildings[0];
      const targetRoomLabel = destRoom ? ` → ${destRoom}` : '';

      // Plot route on SVG
      this.drawRoute(startId, destId, isAccessible);

      const steps = isAccessible ? [
        `1. Start from <strong>Central Academic Spine</strong> near LRC ramp connector.`,
        `2. Follow the gradient gentle ramp (slope 1:12) smoothly leading into <strong>${targetB.name}</strong>.`,
        `3. Enter through automatic sliding glass doors into the main elevator lobby.`,
        `4. Board the accessible hydraulic lift to reach your designated floor.`,
        `5. Exit elevator into the wide hallway corridor; ${targetRoomLabel || 'instructional rooms'} feature level zero-threshold doors.`
      ] : [
        `1. Start at <strong>Central Spine Walkway</strong> directly opposite Academic Block 2.`,
        `2. Walk along the sheltered paved colonnade towards <strong>${targetB.name} (${targetB.code})</strong>.`,
        `3. Enter via main portal archway and take the central staircase or skybridge corridor.`,
        `4. Room direction signs are mounted at each landing; proceed to ${targetRoomLabel || 'your lecture/lab corridor'}.`
      ];

      const stepsContainer = document.getElementById('route-steps-container');
      if (stepsContainer) {
        stepsContainer.innerHTML = `
          <div style="background: rgba(0, 229, 255, 0.08); border: 1px solid rgba(0, 229, 255, 0.25); border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; color: #00e5ff; font-size: 0.95rem;">
                Estimated Time: ~${this.activeRoute?.timeMinutes || 2} mins (${this.activeRoute?.distanceMeters || 135}m)
              </div>
              <div style="font-size: 0.78rem; color: #94a3b8;">Sheltered hillside pathways • Elevation ~1,550m</div>
            </div>
            <span class="hud-status-badge status-good">${isAccessible ? '100% Ramp Verified' : 'Optimal Direct'}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; max-height: 220px; overflow-y: auto;">
            ${steps.map(s => `
              <div style="background: #141826; border: 1px solid #1f273d; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.45;">
                ${s}
              </div>
            `).join('')}
          </div>

          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn-primary" id="btn-show-pin-on-map" style="flex: 1; padding: 10px 16px;">
              📍 View Glowing Path on Campus Map
            </button>
          </div>
        `;

        document.getElementById('btn-show-pin-on-map')?.addEventListener('click', () => {
          modal.style.display = 'none';
          this.focusBuilding(targetB, destRoom, false);
          document.getElementById('map-viewport-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    };

    renderSteps(isAccessiblePreferred);

    // Modal Events
    document.getElementById('btn-close-route-modal')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    document.getElementById('route-dest-point')?.addEventListener('change', () => {
      const isAcc = document.getElementById('btn-route-accessible')?.classList.contains('active');
      renderSteps(isAcc);
    });

    document.getElementById('route-start-point')?.addEventListener('change', () => {
      const isAcc = document.getElementById('btn-route-accessible')?.classList.contains('active');
      renderSteps(isAcc);
    });

    document.getElementById('btn-route-fast')?.addEventListener('click', () => {
      document.getElementById('btn-route-fast').classList.add('active');
      document.getElementById('btn-route-accessible').classList.remove('active');
      renderSteps(false);
    });

    document.getElementById('btn-route-accessible')?.addEventListener('click', () => {
      document.getElementById('btn-route-accessible').classList.add('active');
      document.getElementById('btn-route-fast').classList.remove('active');
      renderSteps(true);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  },

  /* ================= TIMETABLE-TO-MAP INTEGRATION ================= */
  focusVenue(venueCode) {
    if (!venueCode) return;
    const cleanVenue = venueCode.trim().toUpperCase();

    // Find building matching this venue
    const targetBldg = this.buildings.find(b => this.buildingContainsVenue(b, cleanVenue)) || this.buildings[0];
    if (targetBldg) {
      if (window.App && window.App.switchView) {
        window.App.switchView('campus');
      }

      // Draw route from Central Spine to the building
      this.drawRoute('spine', targetBldg.id, false);
      this.focusBuilding(targetBldg, cleanVenue, false);

      // Smooth scroll to map
      setTimeout(() => {
        document.getElementById('map-viewport-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }
};

window.CampusMap = CampusMap;
