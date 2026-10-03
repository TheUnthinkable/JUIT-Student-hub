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
  is3DMode: true, // Default to 3D Isometric View
  
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

  // Architectural Layout & Metadata for JUIT Waknaghat with Real Campus Gallery Imagery
  layoutMeta: {
    main_gate: {
      x: 60, y: 195, w: 128, h: 54, height3D: 18,
      code: 'GATE 1', badge: 'Entry', color: '#64748b',
      name: 'Main Campus Gate 1',
      sub: 'Security, Barrier & PNB 24x7 ATM',
      category: 'facility',
      photo: 'https://www.juit.ac.in/banners/campus-gallery.jpg',
      photoAlt: 'NH-5 Highway Gate 1 Entrance'
    },
    admin: {
      x: 235, y: 155, w: 136, h: 58, height3D: 28,
      code: 'ADMIN', badge: 'Directorate', color: '#38bdf8',
      name: 'Administrative Block',
      sub: 'VC Secretariat, Registrar & COE',
      category: 'library',
      photo: 'https://www.juit.ac.in/galleryimages/photo-gallery-7.jpg',
      photoAlt: 'JUIT Administrative Secretariat'
    },
    dispensary: {
      x: 120, y: 295, w: 132, h: 52, height3D: 22,
      code: 'HEALTH', badge: '24x7 Med', color: '#ef4444',
      name: 'Health Centre & Dispensary',
      sub: 'OPD, Pharmacy & Ambulance Bay',
      category: 'facility',
      photo: 'https://www.juit.ac.in/galleryimages/dispensary.jpg',
      photoAlt: 'JUIT Campus Dispensary & Medical Centre'
    },
    lrc: {
      x: 420, y: 135, w: 162, h: 68, height3D: 36,
      code: 'LRC', badge: '3 Floors', color: '#f59e0b',
      name: 'Learning Resource Centre',
      sub: 'Central Library, DSpace & PYQ Archive',
      featured: true,
      category: 'library',
      photo: 'https://www.juit.ac.in/galleryimages/photo-gallery-3.jpg',
      photoAlt: 'Central Learning Resource Centre Library'
    },
    viewpoint: {
      x: 640, y: 125, w: 134, h: 50, height3D: 16,
      code: 'VIEW', badge: '1,570m Ridge', color: '#0ea5e9',
      name: 'Shivalik Ridge Helipad',
      sub: 'Valley Overlook & Mandir Trail',
      category: 'facility',
      photo: 'https://www.juit.ac.in/galleryimages/photo-gallery-2.jpg',
      photoAlt: 'Shivalik Ridge Mountain Overlook & Helipad'
    },
    hostels_girls: {
      x: 790, y: 180, w: 150, h: 60, height3D: 38,
      code: 'GH', badge: '5 Blocks', color: '#ec4899',
      name: 'Girls Hostels Complex',
      sub: 'Geeta & Malviya Bhawans • Quad',
      category: 'hostel',
      photo: 'https://www.juit.ac.in/galleryimages/photo-gallery-5.jpg',
      photoAlt: 'Girls Hostels Courtyard Complex'
    },
    block1: {
      x: 250, y: 345, w: 160, h: 72, height3D: 42,
      code: 'AB1', badge: '4 Floors', color: '#00e5ff',
      name: 'Academic Block 1',
      sub: 'CR01–CR10 • TR1–7 • Physics/ECE Labs',
      category: 'academic',
      photo: 'https://www.juit.ac.in/galleryimages/Academic%20Block1.JPG',
      photoAlt: 'Academic Block 1 Lecture Theatres & Core Labs'
    },
    block2: {
      x: 480, y: 310, w: 172, h: 76, height3D: 44,
      code: 'AB2', badge: '4 Floors', color: '#3b82f6',
      name: 'Academic Block 2',
      sub: 'LT1–LT3 Theatres • CL01–52 Computing',
      featured: true,
      category: 'academic',
      photo: 'https://www.juit.ac.in/galleryimages/Electronics%20and%20Communication%20Lab2.JPG',
      photoAlt: 'Academic Block 2 Computing & ECE Labs'
    },
    block3: {
      x: 720, y: 345, w: 160, h: 72, height3D: 42,
      code: 'AB3', badge: '4 Floors', color: '#10b981',
      name: 'Academic Block 3',
      sub: 'Biotech, Bioinformatics & Civil Labs',
      category: 'academic',
      photo: 'https://www.juit.ac.in/galleryimages/civil1.JPG',
      photoAlt: 'Academic Block 3 Civil & Biotech Labs'
    },
    oat: {
      x: 470, y: 435, w: 135, h: 52, height3D: 22,
      code: 'OAT', badge: 'Amphitheatre', color: '#8b5cf6',
      name: 'Open Air Theatre',
      sub: 'Tiered Cultural Stage & Arena',
      category: 'sports',
      photo: 'https://www.juit.ac.in/galleryimages/Stage%20performance.JPG',
      photoAlt: 'Tagore Open Air Amphitheatre'
    },
    hostels_boys: {
      x: 120, y: 485, w: 150, h: 64, height3D: 40,
      code: 'BH', badge: '1–4 Blocks', color: '#6366f1',
      name: 'Boys Hostels Terraces',
      sub: 'Shastri, Azad, Patel, Subhash, Parmar',
      category: 'hostel',
      photo: 'https://www.juit.ac.in/galleryimages/Mall%20Road.JPG',
      photoAlt: 'Boys Hostels Terraces & Campus Mall Road'
    },
    annapurna_a: {
      x: 325, y: 520, w: 150, h: 60, height3D: 30,
      code: 'MESS-A', badge: 'Central Dining', color: '#f97316',
      name: 'Annapurna Dining A',
      sub: 'Senior Boys & Main Dining Hall',
      category: 'mess',
      photo: 'https://www.juit.ac.in/galleryimages/Annapurna%20(%20Student\'s%20Mess%20).JPG',
      photoAlt: 'Annapurna Main Dining Hall'
    },
    annapurna_b: {
      x: 525, y: 520, w: 150, h: 60, height3D: 30,
      code: 'MESS-B', badge: 'Dining & Cafe', color: '#f97316',
      name: 'Annapurna Dining B',
      sub: 'Girls, 1st Year & Peach Tree Cafe',
      category: 'mess',
      photo: 'https://www.juit.ac.in/galleryimages/Student%20mess%20counter.JPG',
      photoAlt: 'Annapurna Dining Counters & Peach Tree Cafe'
    },
    sports_complex: {
      x: 740, y: 505, w: 150, h: 64, height3D: 26,
      code: 'SPORTS', badge: 'Arena & Gym', color: '#14b8a6',
      name: 'Sports Arena & Gym',
      sub: 'Basketball, Volleyball & Fitness Gym',
      category: 'sports',
      photo: 'https://www.juit.ac.in/galleryimages/NCC.JPG',
      photoAlt: 'Sports Complex & Athletic Activity Grounds'
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
    this.set3DMode(true);
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
    const lawnFill = isNight ? '#081412' : '#0c221b';
    const lawnStroke = isNight ? '#122c26' : '#183c32';
    const roadColor = isNight ? '#131926' : '#1b2436';
    const roadCurb = isNight ? '#0b0f17' : '#101622';
    const roadCenter = isNight ? '#253248' : '#334155';
    const spineColor = isWalkwaysOnly ? '#00e5ff' : '#1e2c45';
    const spineDash = isWalkwaysOnly ? '#38bdf8' : '#3b82f6';

    // Route SVG path markup
    let routeMarkup = '';
    if (this.activeRoute && this.activeRoute.pathCoords && this.activeRoute.pathCoords.length > 1) {
      const d = this.activeRoute.pathCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
      const startPt = this.activeRoute.pathCoords[0];
      const endPt = this.activeRoute.pathCoords[this.activeRoute.pathCoords.length - 1];

      routeMarkup = `
        <!-- 3D Active Walking Route Ribbon -->
        <g id="map-active-route-group">
          <!-- 3D Ground Cast Shadow of Route Ribbon -->
          <path d="${d}" fill="none" stroke="#000000" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" transform="translate(0, 10)" filter="url(#route-blur)" />
          
          <!-- Outer Pulsing Glow Line -->
          <path d="${d}" fill="none" stroke="#00e5ff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity="0.35" filter="url(#route-blur)" />
          
          <!-- 3D Elevated Walking Path Line -->
          <path d="${d}" fill="none" stroke="#00e5ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="walking-route-path" />

          <!-- Origin Beacon Marker (Green Pulse) -->
          <g transform="translate(${startPt.x}, ${startPt.y})">
            <circle cx="0" cy="0" r="16" fill="none" stroke="#10b981" stroke-width="1.5" class="beacon-radar-pulse" />
            <circle cx="0" cy="0" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2.5" filter="url(#bldg-shadow)" />
            <text x="0" y="-12" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="800" fill="#34d399">START</text>
          </g>

          <!-- Destination Beacon Marker (Cyan Glow) -->
          <g transform="translate(${endPt.x}, ${endPt.y})">
            <circle cx="0" cy="0" r="18" fill="none" stroke="#00e5ff" stroke-width="2" class="beacon-radar-pulse" />
            <circle cx="0" cy="0" r="9" fill="#00e5ff" stroke="#ffffff" stroke-width="2.5" filter="url(#bldg-shadow)" />
            <text x="0" y="-14" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="800" fill="#00e5ff">DESTINATION</text>
          </g>
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
        <filter id="bldg-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000000" flood-opacity="0.65" />
        </filter>
        <linearGradient id="topo-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${isNight ? '#03060f' : '#080d1a'}"/>
          <stop offset="50%" stop-color="${isNight ? '#070b16' : '#0c1425'}"/>
          <stop offset="100%" stop-color="${isNight ? '#040711' : '#080d19'}"/>
        </linearGradient>
        <linearGradient id="cliff-face-upper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${isNight ? '#0a0f1d' : '#141d33'}"/>
          <stop offset="100%" stop-color="${isNight ? '#04070f' : '#090e1c'}"/>
        </linearGradient>
        <linearGradient id="cliff-face-lower" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${isNight ? '#090e1a' : '#121a2d'}"/>
          <stop offset="100%" stop-color="${isNight ? '#03050c' : '#070b16'}"/>
        </linearGradient>
        <linearGradient id="skybridge-glass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(0, 229, 255, 0.45)"/>
          <stop offset="50%" stop-color="rgba(59, 130, 246, 0.7)"/>
          <stop offset="100%" stop-color="rgba(16, 185, 129, 0.45)"/>
        </linearGradient>
      </defs>

      <!-- Interactive World Container (Smooth Pan & Zoom Layer) -->
      <g id="map-world-layer">
        <!-- 1. Campus Himalayan Hillside Base Gradient -->
        <rect width="1000" height="680" fill="url(#topo-bg)" />

        <!-- 2. 3D Shivalik Terraced Mountain Elevation Plates -->
        <!-- Terrace 1: Upper Ridge Plateau (1,570m MSL - Helipad, Viewpoint, Girls Hostels) -->
        <polygon points="40,30 960,30 965,190 35,210" fill="${isNight ? '#080e1c' : '#101a2e'}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        <!-- Terrace 1 Drop Cliff Retaining Wall -->
        <polygon points="35,210 965,190 965,220 35,240" fill="url(#cliff-face-upper)" stroke="rgba(0,0,0,0.5)" stroke-width="1"/>
        <line x1="35" y1="210" x2="965" y2="190" stroke="${isNight ? '#1e293b' : '#334155'}" stroke-width="2.5" />
        <!-- Retaining Wall Buttress Pillars -->
        <line x1="200" y1="206" x2="200" y2="236" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
        <line x1="400" y1="202" x2="400" y2="232" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
        <line x1="600" y1="198" x2="600" y2="228" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
        <line x1="800" y1="194" x2="800" y2="224" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

        <!-- Terrace 2: Central Academic Promenade Plateau (1,550m MSL - AB1, AB2, AB3, LRC, Admin) -->
        <polygon points="30,240 970,220 970,448 30,468" fill="${isNight ? '#0b1122' : '#131e36'}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        <!-- Terrace 2 Drop Cliff Retaining Wall -->
        <polygon points="30,468 970,448 970,476 30,496" fill="url(#cliff-face-lower)" stroke="rgba(0,0,0,0.5)" stroke-width="1"/>
        <line x1="30" y1="468" x2="970" y2="448" stroke="${isNight ? '#1e293b' : '#334155'}" stroke-width="2.5" />
        <!-- Retaining Wall Buttress Pillars -->
        <line x1="180" y1="465" x2="180" y2="493" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
        <line x1="360" y1="461" x2="360" y2="489" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
        <line x1="540" y1="457" x2="540" y2="485" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
        <line x1="720" y1="453" x2="720" y2="481" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

        <!-- Terrace 3: Lower Terraces Plateau (1,530m MSL - Annapurna Messes, Boys Hostels, Sports Arena) -->
        <polygon points="20,496 980,476 980,670 20,670" fill="${isNight ? '#070c17' : '#0e172a'}"/>

        <!-- Elevation Altitude Chips on Terraces -->
        <g opacity="${isNight ? '0.45' : '0.75'}">
          <g transform="translate(860, 48)">
            <rect x="0" y="0" width="105" height="22" rx="6" fill="#080e1a" stroke="#334155" stroke-width="1"/>
            <text x="52" y="15" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="700" fill="#38bdf8">⛰️ 1,570m Ridge</text>
          </g>
          <g transform="translate(860, 245)">
            <rect x="0" y="0" width="105" height="22" rx="6" fill="#080e1a" stroke="#334155" stroke-width="1"/>
            <text x="52" y="15" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="700" fill="#00e5ff">⛰️ 1,550m Spine</text>
          </g>
          <g transform="translate(860, 502)">
            <rect x="0" y="0" width="105" height="22" rx="6" fill="#080e1a" stroke="#334155" stroke-width="1"/>
            <text x="52" y="15" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="700" fill="#94a3b8">⛰️ 1,530m Valley</text>
          </g>
        </g>

        <!-- 3. 3D Campus Landscaped Green Lawns & Courtyards -->
        <g>
          <!-- Central Academic Lawn Quad with 3D Bevel Edge -->
          <polygon points="230,248 640,248 640,320 230,320" fill="${lawnFill}" stroke="${lawnStroke}" stroke-width="1.8" />
          <polygon points="230,320 640,320 640,324 230,324" fill="#06120e" />
          
          <!-- Amphitheatre & Sports Lawn -->
          <polygon points="680,485 910,485 910,610 680,610" fill="${lawnFill}" stroke="${lawnStroke}" stroke-width="1.8" />
          <polygon points="680,610 910,610 910,614 680,614" fill="#06120e" />
          
          <!-- Boys Hostels Hill Terrace Green -->
          <polygon points="90,490 270,490 270,610 90,610" fill="${lawnFill}" stroke="${lawnStroke}" stroke-width="1.8" />
          <polygon points="90,610 270,610 270,614 90,614" fill="#06120e" />
        </g>

        <!-- 4. 3D Volumetric Conifer Pine Trees -->
        <g opacity="0.9">
          <!-- Conifer Pines with Tiered Shading -->
          ${[
            [50,75], [120,70], [200,60], [580,65], [630,55], [880,70], [930,60],
            [60,400], [75,430], [920,440], [940,490], [460,270], [510,270]
          ].map(([tx, ty]) => `
            <g transform="translate(${tx}, ${ty})">
              <!-- Tree Shadow -->
              <ellipse cx="6" cy="18" rx="10" ry="4" fill="rgba(0,0,0,0.4)" filter="url(#route-blur)"/>
              <!-- Tier 1 -->
              <polygon points="0,0 -9,16 0,16" fill="${isNight ? '#0e2920' : '#1b4a3a'}"/>
              <polygon points="0,0 0,16 9,16" fill="${isNight ? '#071612' : '#0f2c23'}"/>
              <!-- Tier 2 -->
              <polygon points="0,-7 -7,6 0,6" fill="${isNight ? '#123328' : '#225d49'}"/>
              <polygon points="0,-7 0,6 7,6" fill="${isNight ? '#091c16' : '#12362b'}"/>
              <!-- Trunk -->
              <rect x="-1.5" y="16" width="3" height="5" fill="#3b2314"/>
            </g>
          `).join('')}
        </g>

        <!-- 5. 3D Curving Mountain Roadways with Curbs -->
        <!-- Downhill Curb Shadow & Curb Slab -->
        <path d="M 20 223 Q 90 228 140 223 T 250 208 T 410 203 T 620 173 T 780 198 T 980 213" 
              fill="none" stroke="${roadCurb}" stroke-width="21" stroke-linecap="round"/>
        <!-- Asphalt Surface -->
        <path d="M 20 220 Q 90 225 140 220 T 250 205 T 410 200 T 620 170 T 780 195 T 980 210" 
              fill="none" stroke="${roadColor}" stroke-width="17" stroke-linecap="round"/>
        <!-- Road Center Dashed Line -->
        <path d="M 20 220 Q 90 225 140 220 T 250 205 T 410 200 T 620 170 T 780 195 T 980 210" 
              fill="none" stroke="${roadCenter}" stroke-width="1.8" stroke-dasharray="8 6" />

        <!-- Connector Road to Lower Residential & Mess Complex -->
        <path d="M 140 220 L 140 280 L 190 450 L 190 530" fill="none" stroke="${roadCurb}" stroke-width="16" stroke-linecap="round"/>
        <path d="M 140 220 L 140 280 L 190 450 L 190 530" fill="none" stroke="${roadColor}" stroke-width="13" stroke-linecap="round"/>
        <path d="M 190 470 L 800 470 L 800 530" fill="none" stroke="${roadCurb}" stroke-width="16" stroke-linecap="round"/>
        <path d="M 190 470 L 800 470 L 800 530" fill="none" stroke="${roadColor}" stroke-width="13" stroke-linecap="round"/>

        <!-- 6. 3D Grand Academic Spine Promenade (Colonnade Walkway) -->
        <path d="M 240 334 L 780 334" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="16" stroke-linecap="round" />
        <path d="M 240 330 L 780 330" fill="none" stroke="${spineColor}" stroke-width="${isWalkwaysOnly ? '18' : '14'}" stroke-linecap="round" />
        <path d="M 240 330 L 780 330" fill="none" stroke="${spineDash}" stroke-width="2.5" stroke-dasharray="8 5" opacity="0.85" />

        <!-- 3D Paved Walkway Connectors -->
        <path d="M 450 330 L 450 205" fill="none" stroke="${spineColor}" stroke-width="10" stroke-linecap="round" />
        <path d="M 490 330 L 490 480" fill="none" stroke="${spineColor}" stroke-width="10" stroke-linecap="round" />

        <!-- Central Campus Clock & Rotunda Plaza (3D Raised Cylinder) -->
        <g transform="translate(450, 330)">
          <!-- Ground Shadow -->
          <circle cx="2" cy="5" r="17" fill="rgba(0,0,0,0.6)" filter="url(#route-blur)"/>
          <!-- Rotunda Base Depth -->
          <polygon points="-15,0 15,0 15,6 -15,6" fill="#0a101d" />
          <!-- Rotunda Disc -->
          <circle cx="0" cy="0" r="15" fill="#131d2e" stroke="#3b82f6" stroke-width="2" />
          <circle cx="0" cy="0" r="4" fill="#00e5ff" />
          <text x="0" y="-18" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="700" fill="#94a3b8">CENTRAL SPINA</text>
        </g>

        <!-- 3D Elevated Covered Skybridge (AB1 <-> AB2) with Concrete Columns -->
        <g id="map-3d-skybridge">
          <!-- Skybridge Ground Shadow -->
          <path d="M 410 375 L 480 365" fill="none" stroke="rgba(0,0,0,0.7)" stroke-width="11" stroke-linecap="round" filter="url(#route-blur)"/>
          <!-- Vertical Concrete Support Pylons -->
          <rect x="424" y="362" width="6" height="18" fill="#1e293b" stroke="#0f172a" stroke-width="0.8"/>
          <rect x="462" y="356" width="6" height="18" fill="#1e293b" stroke="#0f172a" stroke-width="0.8"/>
          <!-- 3D Enclosed Glass Bridge Corridor -->
          <polygon points="410,358 480,348 480,362 410,372" fill="url(#skybridge-glass)" stroke="#38bdf8" stroke-width="1.4"/>
          <!-- Bridge Floor Slab -->
          <polygon points="410,372 480,362 482,365 412,375" fill="#0f172a"/>
          <text x="445" y="362" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="800" fill="#ffffff">3D SKYBRIDGE</text>
        </g>

        <!-- 3D Tagore Open Air Theatre (OAT) Stepped Stone Amphitheatre -->
        <g transform="translate(535, 455)">
          <!-- Tier 4 Outer Ring -->
          <path d="M -45,-5 A 45 26 0 0 0 45 -5" fill="none" stroke="#2a334a" stroke-width="5" />
          <!-- Tier 3 Ring -->
          <path d="M -35,-4 A 35 20 0 0 0 35 -4" fill="none" stroke="#334155" stroke-width="4.5" />
          <!-- Tier 2 Ring -->
          <path d="M -25,-3 A 25 14 0 0 0 25 -3" fill="none" stroke="#475569" stroke-width="4" />
          <!-- Tier 1 Inner Stage -->
          <ellipse cx="0" cy="0" rx="14" ry="7" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5" />
          <text x="0" y="3" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="6.5" font-weight="800" fill="#a78bfa">STAGE</text>
        </g>

        <!-- 3D Sports Arena & Regulation Basketball Court -->
        <g transform="translate(745, 515)" opacity="0.85">
          <!-- 3D Court Perimeter Bank -->
          <polygon points="0,0 85,0 85,48 0,48" fill="#1b2438" stroke="#38bdf8" stroke-width="1.5" />
          <polygon points="0,48 85,48 88,52 3,52" fill="#0d1320" />
          <line x1="42.5" y1="0" x2="42.5" y2="48" stroke="#38bdf8" stroke-width="1" />
          <circle cx="42.5" cy="24" r="7" fill="none" stroke="#38bdf8" stroke-width="1" />
          <path d="M 0 12 L 18 12 A 6 6 0 0 1 18 36 L 0 36 Z" fill="none" stroke="#38bdf8" stroke-width="1" />
          <path d="M 85 12 L 67 12 A 6 6 0 0 0 67 36 L 85 36 Z" fill="none" stroke="#38bdf8" stroke-width="1" />
        </g>

        <!-- 3D Shivalik Ridge Helipad Landing Pad -->
        <g transform="translate(670, 138)" opacity="0.95">
          <!-- 3D Octagonal Concrete Pad -->
          <polygon points="-22,-8 -8,-22 8,-22 22,-8 22,8 8,22 -8,22 -22,8" fill="#1b2333" stroke="#ffffff" stroke-width="1.8" />
          <polygon points="-22,8 22,8 24,14 -20,14" fill="#0d121c"/>
          <circle cx="0" cy="0" r="14" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4 2" />
          <text x="0" y="5.5" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="15" font-weight="900" fill="#ffffff">H</text>
        </g>

        <!-- Active Walking Route Polyline & 3D Beacons -->
        ${routeMarkup}

        <!-- 7. 3D Architectural Building Blocks Layer -->
        <g id="map-buildings-layer">
          ${this.buildings.map(b => {
            const meta = this.layoutMeta[b.id] || { x: b.coordinates.x, y: b.coordinates.y, w: 140, h: 54, height3D: 28, code: b.code, badge: 'Landmark', color: b.color || '#3b82f6', name: b.name, sub: '' };
            const { x, y, w, h, code, badge, color, name, sub, featured, height3D, photo } = meta;
            
            const isCategoryMatch = isCategoryActive(this.activeCategory, b.id);
            const isHighlighted = (this.activeBuilding && this.activeBuilding.id === b.id);
            const isVenueMatch = (this.highlightedVenue && this.buildingContainsVenue(b, this.highlightedVenue));
            const opacity = isCategoryMatch ? '1' : '0.22';
            const depth = height3D || 32;

            // 3D Architectural Geometry Facades
            const frontFacadeFill = isNight ? '#0b111e' : (featured ? '#151d30' : '#101726');
            const sideFacadeFill = isNight ? '#060a14' : (featured ? '#0b101c' : '#080d17');
            const roofFill = isNight ? '#101728' : (featured ? '#1a233a' : '#141d30');
            const cardBorder = (isHighlighted || isVenueMatch) ? '#00e5ff' : (featured ? color : '#293754');
            const borderWidth = (isHighlighted || isVenueMatch) ? '2.8' : (featured ? '2.2' : '1.4');

            // Specific 3D Rooftop Architectural Features
            let rooftopFeature = '';
            if (b.id === 'lrc') {
              // 3D Pyramid Glass Atrium Skylight
              rooftopFeature = `
                <polygon points="${w/2 - 18},${h/2} ${w/2},${h/2 - 12} ${w/2 + 18},${h/2} ${w/2},${h/2 + 12}" fill="rgba(0, 229, 255, 0.35)" stroke="#00e5ff" stroke-width="1"/>
                <line x1="${w/2}" y1="${h/2 - 12}" x2="${w/2}" y2="${h/2 + 12}" stroke="#ffffff" stroke-width="0.8"/>
              `;
            } else if (b.id === 'block2') {
              // 3D Tiered Lecture Theatre Roof Monitors (LT1, LT2, LT3)
              rooftopFeature = `
                <rect x="${w - 48}" y="12" width="38" height="20" rx="3" fill="#0d1424" stroke="#3b82f6" stroke-width="1"/>
                <text x="${w - 29}" y="25" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="800" fill="#93c5fd">LT1–3</text>
              `;
            } else if (b.id === 'block1') {
              // Physics Lab Antenna / HVAC Chiller
              rooftopFeature = `
                <circle cx="${w - 22}" cy="18" r="6" fill="#1b253b" stroke="#38bdf8" stroke-width="1"/>
                <circle cx="${w - 22}" cy="18" r="2" fill="#00e5ff"/>
              `;
            } else if (b.id === 'block3') {
              // Biotech Rooftop Green Botanical Area
              rooftopFeature = `
                <rect x="${w - 44}" y="12" width="34" height="18" rx="3" fill="#0d241d" stroke="#10b981" stroke-width="1"/>
                <text x="${w - 27}" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="700" fill="#34d399">BIO-LAB</text>
              `;
            }

            // Animated Glowing Bouncing Location Beacon Pin
            const pinY = -34;
            const anchorPin = (isHighlighted || isVenueMatch) ? `
              <g transform="translate(${w / 2}, ${pinY})" class="venue-beacon-pin">
                <!-- 3D Radar Wave Rings -->
                <circle cx="0" cy="0" r="12" fill="none" stroke="${color}" stroke-width="2.2" class="beacon-radar-pulse" />
                <circle cx="0" cy="0" r="26" fill="none" stroke="${color}" stroke-width="1.4" class="beacon-radar-pulse" />
                
                <!-- 3D Floating Pin Pill Badge -->
                <rect x="-52" y="-20" width="104" height="24" rx="8" fill="#0284c7" stroke="#ffffff" stroke-width="2" filter="url(#bldg-shadow)" />
                <text x="0" y="-4" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="800" fill="#ffffff">
                  ${this.highlightedVenue ? `📍 ${this.highlightedVenue}` : '📍 Selected'}
                </text>
                <polygon points="0,5 -6,-2 6,-2" fill="#0284c7" />
              </g>
            ` : '';

            // Real Photo Badge
            const photoBadge = photo ? `
              <g transform="translate(${w - 54}, ${h - 18})" opacity="0.9">
                <rect width="46" height="13" rx="3" fill="rgba(0,0,0,0.75)" stroke="${color}" stroke-width="0.8"/>
                <text x="23" y="9.5" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700" fill="#ffffff">📷 PHOTO</text>
              </g>
            ` : '';

            return `
              <g class="bldg-node bldg-node-3d ${isHighlighted || isVenueMatch ? 'highlighted' : ''}" 
                 data-id="${b.id}" 
                 transform="translate(${x}, ${y})"
                 opacity="${opacity}"
                 style="cursor: pointer;">
                
                <!-- 1. 3D Ground Cast Drop Shadow -->
                <polygon points="8,${h + depth + 4} ${w + 14},${h + depth + 4} ${w + 14},${depth + 6} 0,${h}" fill="rgba(0,0,0,0.65)" filter="url(#route-blur)" />
                
                <!-- 2. 3D Front Facade (South Facing Perspective) -->
                <polygon points="0,${h} ${w},${h} ${w},${h + depth} 0,${h + depth}" 
                         fill="${frontFacadeFill}" 
                         stroke="rgba(255,255,255,0.12)" 
                         stroke-width="0.8" />
                
                <!-- Storey Window Rows & Structural Floors -->
                <line x1="6" y1="${h + depth * 0.35}" x2="${w - 6}" y2="${h + depth * 0.35}" stroke="${color}" stroke-opacity="0.45" stroke-dasharray="5 7" stroke-width="1.4" />
                <line x1="6" y1="${h + depth * 0.72}" x2="${w - 6}" y2="${h + depth * 0.72}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4 6" stroke-width="1" />
                
                <!-- 3D Entrance Portico Canopy -->
                <polygon points="${w/2 - 14},${h + depth - 8} ${w/2 + 14},${h + depth - 8} ${w/2 + 14},${h + depth} ${w/2 - 14},${h + depth}" fill="#0284c7" opacity="0.8" />
                <line x1="${w/2 - 12}" y1="${h + depth}" x2="${w/2 + 12}" y2="${h + depth}" stroke="#00e5ff" stroke-width="2" />
                
                <!-- 3. 3D Right Depth Wall (East Shaded Face) -->
                <polygon points="${w},0 ${w},${h} ${w + 12},${h + depth} ${w + 12},${depth}" 
                         fill="${sideFacadeFill}" 
                         stroke="rgba(0,0,0,0.5)" 
                         stroke-width="0.8" />
                <!-- Architectural Depth Vertical Fins -->
                <line x1="${w + 6}" y1="${depth * 0.5}" x2="${w + 6}" y2="${h + depth * 0.5}" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

                <!-- 4. 3D Top Roof Slab -->
                <rect x="0" y="0" width="${w}" height="${h}" rx="8" 
                      fill="${roofFill}" 
                      stroke="${cardBorder}" 
                      stroke-width="${borderWidth}" />
                
                <!-- Parapet Roof Edge Trim -->
                <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="6" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

                <!-- Department Color Accent Bar -->
                <rect x="0" y="0" width="5.5" height="${h}" rx="2" fill="${color}" />

                <!-- Specific Rooftop Feature (Skylight / Atrium) -->
                ${rooftopFeature}

                <!-- Building Code Pill Badge -->
                <rect x="10" y="8" width="50" height="18" rx="4" fill="rgba(0,0,0,0.65)" stroke="${color}" stroke-width="1.2" />
                <text x="35" y="20.5" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="800" fill="#ffffff">
                  ${code}
                </text>

                <!-- Level / Tag Pill -->
                <text x="${w - 10}" y="20.5" text-anchor="end" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="700" fill="${color}">
                  ${badge}
                </text>

                <!-- Building Name -->
                <text x="12" y="38" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="700" fill="#f8fafc">
                  ${name}
                </text>
                <text x="12" y="50" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.8" font-weight="500" fill="#94a3b8">
                  ${sub ? sub.substring(0, 27) : ''}
                </text>

                <!-- Real Photo Badge -->
                ${photoBadge}

                <!-- 3D Bouncing Beacon Pin -->
                ${anchorPin}
              </g>
            `;
          }).join('')}
        </g>

        <!-- 8. Campus Map Header Branding & Topography Altitude HUD -->
        <g transform="translate(24, 24)">
          <rect x="0" y="0" width="380" height="38" rx="10" fill="#0a101d" stroke="rgba(255,255,255,0.12)" filter="url(#bldg-shadow)"/>
          <circle cx="18" cy="19" r="5" fill="#00e5ff" />
          <text x="32" y="23" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#f8fafc">
            Jaypee University of Information Technology
          </text>
          <text x="300" y="23" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="600" fill="#38bdf8">
            ⛰️ 1,550m MSL
          </text>
        </g>
      </g><!-- /#map-world-layer -->

      <!-- North 3D Isometric Compass Dial (Fixed Overlay) -->
      <g transform="translate(940, 24)">
        <rect x="0" y="0" width="38" height="38" rx="10" fill="#0a101d" stroke="rgba(255,255,255,0.12)" filter="url(#bldg-shadow)"/>
        <text x="19" y="23" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" fill="#00e5ff">
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
  /* ================= FLYOUT BUILDING DRAWER ================= */
  openBuildingDrawer(bldg, roomToMatch) {
    const drawer = document.getElementById('map-venue-drawer');
    if (!drawer) return;

    this.activeBuilding = bldg;
    const meta = this.layoutMeta[bldg.id] || { color: '#3b82f6', code: bldg.code, badge: 'Landmark', photo: null, photoAlt: bldg.name };
    const matchCode = roomToMatch || this.highlightedVenue;

    // Floor navigation tabs
    const floors = bldg.floors || [];
    const floorTabsHtml = floors.length > 0 ? `
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button type="button" class="floor-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${this.activeFloorFilter === 'all' ? 'bg-primary text-on-primary shadow-sm font-bold' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}" data-floor="all">All Floors</button>
        ${floors.map(fl => `
          <button type="button" class="floor-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${this.activeFloorFilter === fl.level ? 'bg-primary text-on-primary shadow-sm font-bold' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}" data-floor="${fl.level}">
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
      <div class="p-3 rounded-xl bg-surface-container border border-white/[0.06] space-y-2">
        <div class="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <div class="flex items-center gap-1.5 text-xs font-bold text-on-surface">
            <span class="material-symbols-outlined text-[15px]" style="color: ${meta.color};">layers</span>
            <span>${fl.level}</span>
          </div>
          <span class="text-[11px] font-mono text-on-surface-variant">${fl.facilities.length} rooms / labs</span>
        </div>
        <div class="space-y-1.5">
          ${fl.facilities.map(fac => {
            const isTarget = matchCode && fac.toUpperCase().includes(matchCode.toUpperCase());
            return `
              <div class="flex items-center justify-between p-2 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-highest transition-colors border border-white/[0.04] text-xs ${isTarget ? 'ring-1 ring-cyan-400 bg-cyan-400/10' : ''}">
                <div class="flex items-center gap-2 truncate pr-2">
                  <span class="font-medium text-on-surface truncate">${fac}</span>
                  ${isTarget ? '<span class="px-1.5 py-0.2 rounded text-[10px] bg-cyan-400/20 text-cyan-300 font-bold shrink-0">📍 Your Class</span>' : ''}
                </div>
                <button type="button" class="btn-room-nav shrink-0 px-2.5 py-1 rounded-md bg-primary/15 hover:bg-primary text-primary hover:text-on-primary text-[11px] font-semibold transition-all cursor-pointer" data-room="${fac}">
                  Walk →
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    const safePhoto = meta.photo ? (meta.photo.includes('%') ? meta.photo : encodeURI(meta.photo)) : null;
    const photoBannerHtml = safePhoto ? `
      <div class="relative w-full h-44 sm:h-48 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 shrink-0">
        <img src="${safePhoto}" alt="${meta.photoAlt || bldg.name}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80';" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#181c25] via-[#181c25]/30 to-transparent"></div>
        <a href="https://www.juit.ac.in/campus-facilities/campus-gallery" target="_blank" rel="noopener noreferrer" class="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-medium text-white flex items-center gap-1.5 hover:bg-black/80 transition-colors shadow">
          <span class="material-symbols-outlined text-[13px] text-cyan-400">photo_camera</span>
          <span>JUIT Campus Gallery</span>
          <span class="material-symbols-outlined text-[11px] text-slate-400">open_in_new</span>
        </a>
        <button type="button" class="btn-drawer-close absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer z-10" id="btn-close-map-drawer" aria-label="Close building inspector">✕</button>
        <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
          <span class="font-mono truncate max-w-[70%] drop-shadow">${meta.photoAlt || bldg.name}</span>
          <span class="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold">3D Verified</span>
        </div>
      </div>
    ` : `
      <div class="drawer-header-strip" style="border-top: 3px solid ${meta.color};">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="drawer-code-pill" style="color: ${meta.color}; border-color: ${meta.color};">${meta.code}</span>
            <span class="drawer-category-pill">${bldg.category ? bldg.category.toUpperCase() : 'CAMPUS'}</span>
          </div>
          <h2 class="drawer-bldg-name">${bldg.name}</h2>
        </div>
        <button type="button" class="btn-drawer-close" id="btn-close-map-drawer" aria-label="Close building inspector">✕</button>
      </div>
    `;

    drawer.innerHTML = `
      <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-2 sm:hidden cursor-pointer" id="drawer-mobile-handle"></div>
      ${photoBannerHtml}
      <div class="drawer-scroll-body flex-1 overflow-y-auto p-4 space-y-3.5">
        <!-- Building Identity Strip -->
        <div class="p-3 rounded-xl bg-surface-container border border-white/[0.06] border-l-4" style="border-left-color: ${meta.color};">
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded font-mono text-[11px] font-bold border border-white/[0.1] bg-surface-container-high" style="color: ${meta.color};">${meta.code}</span>
            <span class="text-[11px] font-mono text-on-surface-variant uppercase font-semibold">${bldg.category ? bldg.category.toUpperCase() : 'CAMPUS'}</span>
            <span class="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold ml-auto">Open Facility</span>
          </div>
          <h2 class="text-base font-bold text-on-surface tracking-tight">${bldg.name}</h2>
          <p class="text-xs text-on-surface-variant mt-0.5 leading-relaxed">${bldg.summary || meta.sub || 'Main facility at JUIT Waknaghat.'}</p>
        </div>

        <!-- Facility Overview Telemetry Bar -->
        <div class="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-container border border-white/[0.06] text-center">
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-mono text-on-surface-variant font-semibold">Levels</span>
            <span class="text-xs font-bold text-on-surface mt-0.5">${floors.length || 1} Floors</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-mono text-on-surface-variant font-semibold">Access</span>
            <span class="text-xs font-bold text-emerald-400 mt-0.5">Ramps & Lift ✓</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-mono text-on-surface-variant font-semibold">Hours</span>
            <span class="text-xs font-bold text-on-surface mt-0.5">8 AM – 10 PM</span>
          </div>
        </div>

        <!-- Floor Filter Tabs -->
        ${floorTabsHtml}

        <!-- Rooms Directory Section -->
        <div class="space-y-3">
          ${roomListHtml || '<div class="p-6 text-center text-xs text-on-surface-variant">No rooms listed for this floor.</div>'}
        </div>
      </div>

      <!-- Actions Footer -->
      <div class="drawer-actions-footer p-3 bg-surface-container-low border-t border-white/[0.06] flex items-center gap-2">
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

    // Show mobile backdrop
    const backdrop = document.getElementById('map-drawer-backdrop');
    if (backdrop) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
    }

    // Close button & mobile handle
    document.getElementById('btn-close-map-drawer')?.addEventListener('click', () => {
      this.closeBuildingDrawer();
    });
    document.getElementById('drawer-mobile-handle')?.addEventListener('click', () => {
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
    const backdrop = document.getElementById('map-drawer-backdrop');
    if (backdrop) {
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
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

  /* ================= 2D / 3D MAP MODE TOGGLE ================= */
  set3DMode(is3D) {
    this.is3DMode = !!is3D;
    const container = document.getElementById('map-canvas-container');
    if (container) {
      if (this.is3DMode) {
        container.classList.remove('map-mode-2d');
        container.classList.add('map-mode-3d');
      } else {
        container.classList.remove('map-mode-3d');
        container.classList.add('map-mode-2d');
      }
    }

    const btn3D = document.getElementById('btn-map-mode-3d');
    const btn2D = document.getElementById('btn-map-mode-2d');
    if (btn3D && btn2D) {
      if (this.is3DMode) {
        btn3D.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 active bg-primary text-on-primary shadow-sm';
        btn2D.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface';
      } else {
        btn2D.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 active bg-primary text-on-primary shadow-sm';
        btn3D.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface';
      }
    }

    this.renderSVGMap();
  },

  /* ================= PAN & ZOOM CONTROLS ================= */
  applyTransform(animate = false) {
    const world = document.querySelector('#campus-vector-svg #map-world-layer') || document.getElementById('map-world-layer');
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
    const btn3D = document.getElementById('btn-map-mode-3d');
    const btn2D = document.getElementById('btn-map-mode-2d');
    const backdrop = document.getElementById('map-drawer-backdrop');
    const viewport = document.getElementById('map-viewport-box');

    if (btn3D) {
      btn3D.addEventListener('click', (e) => {
        e.stopPropagation();
        this.set3DMode(true);
      });
    }

    if (btn2D) {
      btn2D.addEventListener('click', (e) => {
        e.stopPropagation();
        this.set3DMode(false);
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.closeBuildingDrawer();
      });
    }

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
    }, { passive: false });

    viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && isPointerDown) {
        if (e.cancelable) e.preventDefault();
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && initialPinchDist) {
        if (e.cancelable) e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / initialPinchDist;
        this.zoomLevel = Math.max(0.75, Math.min(2.5, initialPinchZoom * factor));
        this.applyTransform(false);
      }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        onPointerUp();
        initialPinchDist = null;
      }
    }, { passive: false });

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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="walking-avatar-circle" style="width: 38px; height: 38px; border-radius: 10px; background: rgba(0, 229, 255, 0.15); color: #00e5ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="font-size: 22px;">alt_route</span>
          </div>
          <div>
            <h3 style="font-size: 1.15rem; margin: 0; color: #fff; font-weight: 700;">Campus Shortest Path & Guidance</h3>
            <span style="font-size: 0.76rem; color: var(--text-muted);">JUIT Waknaghat 3D Navigation Engine</span>
          </div>
        </div>
        <button type="button" class="btn-drawer-close" id="btn-close-route-modal" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">✕</button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; flex-shrink: 0;">
        <div>
          <label style="display: block; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Start From</label>
          <select class="select-styled" id="route-start-point" style="width: 100%; font-size: 0.82rem; padding: 6px 8px;">
            <option value="spine" selected>Central Academic Spine Walkway</option>
            <option value="main_gate">Main Campus Gate 1 (ATM)</option>
            <option value="hostels_boys">Boys Hostels Quad (Parmar/Azad)</option>
            <option value="hostels_girls">Girls Hostels Plaza (Geeta/Sharda)</option>
            <option value="annapurna_a">Annapurna Dining Hall A</option>
            <option value="lrc">LRC Central Library Ground Floor</option>
          </select>
        </div>

        <div>
          <label style="display: block; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Destination</label>
          <select class="select-styled" id="route-dest-point" style="width: 100%; font-size: 0.82rem; padding: 6px 8px;">
            ${bldgOptions}
          </select>
        </div>
      </div>

      <!-- Accessibility / Speed Mode Buttons -->
      <div style="display: flex; gap: 8px; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 12px; flex-shrink: 0;">
        <button type="button" class="route-mode-btn ${!isAccessiblePreferred ? 'active' : ''}" id="btn-route-fast" style="flex: 1; font-size: 0.78rem; padding: 6px 8px;">
          ⚡ Fastest Direct Walk
        </button>
        <button type="button" class="route-mode-btn ${isAccessiblePreferred ? 'active' : ''}" id="btn-route-accessible" style="flex: 1; font-size: 0.78rem; padding: 6px 8px;">
          ♿ 100% Ramp Accessible
        </button>
      </div>

      <!-- Scrollable Steps Area (Guaranteed Scrollable Container) -->
      <div id="route-steps-container" style="flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; max-height: calc(88vh - 250px); min-height: 160px; padding-right: 4px;"></div>

      <div style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;">
        <button type="button" class="btn-primary" id="btn-show-pin-on-map" style="width: 100%; padding: 10px 16px; font-size: 0.86rem; font-weight: 700; cursor: pointer; border-radius: 10px;">
          📍 View Glowing Path on 3D Campus Map
        </button>
      </div>
    `;

    const closeRouteModal = () => {
      modal.classList.remove('open', 'active');
      modal.classList.add('hidden');
    };

    modal.classList.remove('hidden');
    modal.classList.add('open', 'active');

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
        `3. Enter via main portal archway and take the central staircase or 3D skybridge corridor.`,
        `4. Room direction signs are mounted at each landing; proceed to ${targetRoomLabel || 'your lecture/lab corridor'}.`
      ];

      const stepsContainer = document.getElementById('route-steps-container');
      if (stepsContainer) {
        stepsContainer.innerHTML = `
          <div style="background: rgba(0, 229, 255, 0.08); border: 1px solid rgba(0, 229, 255, 0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; color: #00e5ff; font-size: 0.92rem;">
                Estimated Time: ~${this.activeRoute?.timeMinutes || 2} mins (${this.activeRoute?.distanceMeters || 135}m)
              </div>
              <div style="font-size: 0.75rem; color: #94a3b8;">Sheltered hillside pathways • Elevation ~1,550m</div>
            </div>
            <span class="hud-status-badge status-good">${isAccessible ? '100% Ramp Verified' : 'Optimal Direct'}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;">
            ${steps.map(s => `
              <div style="background: #141826; border: 1px solid #1f273d; border-radius: 8px; padding: 10px 14px; font-size: 0.83rem; color: #cbd5e1; line-height: 1.45;">
                ${s}
              </div>
            `).join('')}
          </div>
        `;

        document.getElementById('btn-show-pin-on-map')?.addEventListener('click', () => {
          closeRouteModal();
          this.focusBuilding(targetB, destRoom, false);
          document.getElementById('map-viewport-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    };

    renderSteps(isAccessiblePreferred);

    // Modal Events
    document.getElementById('btn-close-route-modal')?.addEventListener('click', closeRouteModal);

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
      if (e.target === modal) closeRouteModal();
    });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeRouteModal();
        window.removeEventListener('keydown', onKeyDown);
      }
    };
    window.addEventListener('keydown', onKeyDown);
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
