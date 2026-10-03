/**
 * Annapurna Mess Controller for JUIT Student Hub
 */

const MessController = {
  data: {},
  activeDay: 'Tuesday',
  activeMealFilter: 'all',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],

  init(messData) {
    this.data = messData || (window.JUIT_DATA && window.JUIT_DATA.mess) || {};
    
    // Auto-detect current day name
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    this.activeDay = dayNames[todayIndex] || 'Tuesday';

    this.renderDayTabs();
    this.bindMealFilters();
    this.bindMapLocateButtons();
    this.renderMeals();
    this.renderMilkDistribution();
    this.updateLiveServingStatus();
    this.updateDashboardCard();
    
    const monthLabel = document.getElementById('mess-month-cycle-label');
    if (monthLabel && this.data.month) {
      monthLabel.textContent = `Cycle: ${this.data.month}`;
    }
    
    // Live refresh every minute
    setInterval(() => {
      this.updateLiveServingStatus();
      this.updateDashboardCard();
    }, 60000);
  },

  bindMealFilters() {
    const pills = document.querySelectorAll('.mess-meal-filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        this.activeMealFilter = pill.dataset.filter || 'all';
        pills.forEach(p => {
          if (p === pill) {
            p.className = 'mess-meal-filter-pill active px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 bg-primary text-on-primary shadow-sm';
          } else {
            p.className = 'mess-meal-filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface bg-surface-container';
          }
        });
        this.renderMeals();
      });
    });
  },

  bindMapLocateButtons() {
    const btnLocateAll = document.getElementById('btn-locate-milk-on-map');
    if (btnLocateAll && !btnLocateAll._bound) {
      btnLocateAll._bound = true;
      btnLocateAll.addEventListener('click', (e) => {
        e.preventDefault();
        this.locateCounterOnCampusMap('annapurna_a');
      });
    }
  },

  locateCounterOnCampusMap(buildingId = 'annapurna_a') {
    if (window.App && window.App.switchView) {
      window.App.switchView('campus');
      setTimeout(() => {
        if (window.CampusMap) {
          window.CampusMap.openBuildingDrawer(buildingId);
          window.CampusMap.focusBuilding(buildingId);
        }
      }, 300);
    }
  },

  renderDayTabs() {
    const container = document.getElementById('mess-day-tabs');
    if (!container) return;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const todayName = dayNames[todayIndex];

    container.innerHTML = this.days.map(d => {
      const isToday = (d === todayName);
      const isActive = (d === this.activeDay);
      return `
        <button type="button" class="mess-day-btn ${isActive ? 'active' : ''}" data-day="${d}">
          <span>${d}</span>
          ${isToday ? '<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981; margin-left: 2px;"></span>' : ''}
        </button>
      `;
    }).join('');

    container.querySelectorAll('.mess-day-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.activeDay = btn.dataset.day;
        this.renderDayTabs();
        this.renderMeals();
        this.renderMilkDistribution();
      });
    });
  },

  renderMeals() {
    const container = document.getElementById('mess-meals-container');
    const headerDay = document.getElementById('mess-current-day-label');
    if (!container) return;

    if (headerDay) {
      headerDay.textContent = `${this.activeDay} Menu`;
    }

    const dayData = this.data.weeklyMenu && this.data.weeklyMenu[this.activeDay];
    if (!dayData) {
      container.innerHTML = '<p style="color: var(--color-on-surface-variant); padding: 1.5rem; text-align: center;">No meal data found for this day.</p>';
      return;
    }

    // Dynamically update featured top feast card
    const featTitle = document.getElementById('mess-featured-title');
    const featTag = document.getElementById('mess-featured-tag');
    const d1Name = document.getElementById('mess-dish-1-name');
    const d1Badge = document.getElementById('mess-dish-1-badge');
    const d1Desc = document.getElementById('mess-dish-1-desc');
    const d2Name = document.getElementById('mess-dish-2-name');
    const d2Badge = document.getElementById('mess-dish-2-badge');
    const d2Desc = document.getElementById('mess-dish-2-desc');

    if (featTitle) featTitle.textContent = `${this.activeDay}'s Annapurna Feast`;
    if (featTag) featTag.textContent = `${this.activeDay} Hall Special`;

    if (dayData.dinner) {
      const dinner = dayData.dinner;
      const lunch = dayData.lunch || {};
      const mainDish = dinner.highlights?.[0] || dinner.items?.[1] || dinner.items?.[0] || 'Mountain Special Curry';
      const secDish = dinner.sweet || dinner.highlights?.[1] || lunch.highlights?.[0] || 'Dal Makhani & Basmati';

      if (d1Name) d1Name.textContent = mainDish;
      if (d1Badge) d1Badge.textContent = 'Dinner Highlight';
      if (d1Desc) d1Desc.textContent = `Prepared fresh for ${this.activeDay} evening with authentic mountain seasoning in Annapurna dining halls.`;

      if (d2Name) d2Name.textContent = secDish;
      if (d2Badge) d2Badge.textContent = dinner.sweet ? 'Sweet Dish' : 'Chef Special';
      if (d2Desc) d2Desc.textContent = dinner.sweetDish
        ? `Dessert: ${dinner.sweetDish}, served alongside fragrant steamed rice & hot phulkas.`
        : `Served hot with tandoori roti, dal, and aromatic steamed rice.`;
    }

    const timings = this.data.mealTimings || {};
    const filter = this.activeMealFilter;

    // Build the 5 meal cards in chronological order
    const mealCards = [];

    // 1. Breakfast (07:30 - 09:30 AM)
    if (filter === 'all' || filter === 'breakfast') {
      mealCards.push(`
        <div class="meal-card breakfast">
          <div class="meal-card-header">
            <div class="meal-title-wrap">
              <div class="meal-icon-avatar">🌅</div>
              <div>
                <div class="meal-label-name">Breakfast</div>
                <div class="meal-time-pill">${timings.breakfast?.display || '07:30 AM – 09:30 AM'}</div>
              </div>
            </div>
            ${dayData.breakfast?.category ? `<span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">${dayData.breakfast.category}</span>` : ''}
          </div>
          <div class="meal-items-list">
            ${(dayData.breakfast?.items || []).map(item => `
              <div class="food-item-row">
                <span class="food-bullet">✦</span>
                <span>${item}</span>
              </div>
            `).join('')}
          </div>
          ${dayData.breakfast?.highlights ? `
            <div class="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.04]">
              ${dayData.breakfast.highlights.map(h => `
                <span class="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm">
                  ✨ ${h}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `);
    }

    // 2. Lunch (12:00 - 02:00 PM)
    if (filter === 'all' || filter === 'lunch') {
      mealCards.push(`
        <div class="meal-card lunch">
          <div class="meal-card-header">
            <div class="meal-title-wrap">
              <div class="meal-icon-avatar">☀️</div>
              <div>
                <div class="meal-label-name">Lunch</div>
                <div class="meal-time-pill">${timings.lunch?.display || '12:00 PM – 02:00 PM'}</div>
              </div>
            </div>
            ${dayData.lunch?.fruit ? `<span class="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">🍎 ${dayData.lunch.fruit}</span>` : ''}
          </div>
          <div class="meal-items-list">
            ${(dayData.lunch?.items || []).map(item => `
              <div class="food-item-row">
                <span class="food-bullet">✦</span>
                <span>${item}</span>
              </div>
            `).join('')}
          </div>
          ${dayData.lunch?.highlights ? `
            <div class="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.04]">
              ${dayData.lunch.highlights.map(h => `
                <span class="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-sm text-label-sm">
                  🍲 ${h}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `);
    }

    // 3. Hostel Chai & Evening Snacks (05:00 - 06:15 PM) [CHRONOLOGICALLY BEFORE DINNER]
    if (filter === 'all' || filter === 'snacks' || filter === 'tea' || filter === 'chai') {
      const chaiTitle = dayData.snacks?.title || 'Evening Snacks & Mountain Ginger Chai';
      mealCards.push(`
        <div class="meal-card snacks border border-amber-500/20">
          <div class="meal-card-header">
            <div class="meal-title-wrap">
              <div class="meal-icon-avatar bg-amber-500/15 text-amber-300">☕</div>
              <div>
                <div class="meal-label-name">Hostel Chai & Evening Snacks</div>
                <div class="meal-time-pill">${timings.snacks?.display || '05:00 PM – 06:15 PM'}</div>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-label-sm text-label-sm font-semibold">☕ Quad & Balcony Counters</span>
              <button type="button" class="btn-locate-mess-counter hidden sm:inline-flex px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] text-primary font-medium items-center gap-1 transition-colors cursor-pointer" data-building="annapurna_a">
                <span class="material-symbols-outlined text-[13px]">explore</span>
                <span>Locate</span>
              </button>
            </div>
          </div>
          <div class="text-xs font-semibold text-amber-300 px-3 pt-1">
            ${chaiTitle}
          </div>
          <div class="meal-items-list">
            ${(dayData.snacks?.items || [
              'Hot Pahadi Ginger Tea (Adrak Chai)',
              'Freshly Fried Bread Pakoras / Samosas',
              'Green Mint Chutney',
              'Bakery Cookies & Biscuits'
            ]).map(item => `
              <div class="food-item-row">
                <span class="food-bullet text-amber-400">☕</span>
                <span>${item}</span>
              </div>
            `).join('')}
          </div>
          ${dayData.snacks?.highlights ? `
            <div class="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-white/[0.04]">
              <div class="flex flex-wrap gap-1.5">
                ${dayData.snacks.highlights.map(h => `
                  <span class="px-2 py-0.5 rounded bg-surface-container text-amber-300 font-label-sm text-label-sm">
                    ☕ ${h}
                  </span>
                `).join('')}
              </div>
              <span class="text-[11px] text-on-surface-variant font-mono">📍 Annapurna Quad & Hostels</span>
            </div>
          ` : ''}
        </div>
      `);
    }

    // 4. Dinner (07:30 - 09:00 PM)
    if (filter === 'all' || filter === 'dinner') {
      mealCards.push(`
        <div class="meal-card dinner">
          <div class="meal-card-header">
            <div class="meal-title-wrap">
              <div class="meal-icon-avatar">🌙</div>
              <div>
                <div class="meal-label-name">Dinner</div>
                <div class="meal-time-pill">${timings.dinner?.display || '07:30 PM – 09:00 PM'}</div>
              </div>
            </div>
            ${dayData.dinner?.sweet ? `<span class="px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-400 font-label-sm text-label-sm font-semibold">🍨 ${dayData.dinner.sweet}</span>` : ''}
          </div>
          <div class="meal-items-list">
            ${(dayData.dinner?.items || []).map(item => `
              <div class="food-item-row">
                <span class="food-bullet">✦</span>
                <span>${item}</span>
              </div>
            `).join('')}
          </div>
          ${dayData.dinner?.sweetDish ? `
            <div class="flex items-center gap-2 p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 font-body-sm text-body-sm mt-1">
              <span>🍨</span>
              <span><strong>Sweet Dish:</strong> ${dayData.dinner.sweetDish}</span>
            </div>
          ` : ''}
        </div>
      `);
    }

    // 5. Night Milk & Bournvita Distribution (09:15 - 10:15 PM)
    if (filter === 'all' || filter === 'night-milk' || filter === 'nightMilk') {
      const milkTitle = dayData.nightMilk?.title || 'Night Milk & Haldi Bournvita Counter';
      mealCards.push(`
        <div class="meal-card night-milk border border-sky-500/25">
          <div class="meal-card-header">
            <div class="meal-title-wrap">
              <div class="meal-icon-avatar bg-sky-500/15 text-sky-300">🥛</div>
              <div>
                <div class="meal-label-name">Night Milk & Bournvita Counter</div>
                <div class="meal-time-pill">${timings.nightMilk?.display || '09:15 PM – 10:15 PM'}</div>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 font-label-sm text-label-sm font-semibold">🥛 Hostels & Dining Hall 1</span>
              <button type="button" class="btn-locate-mess-counter hidden sm:inline-flex px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] text-primary font-medium items-center gap-1 transition-colors cursor-pointer" data-building="annapurna_a">
                <span class="material-symbols-outlined text-[13px]">explore</span>
                <span>Locate</span>
              </button>
            </div>
          </div>
          <div class="text-xs font-semibold text-sky-300 px-3 pt-1">
            ${milkTitle}
          </div>
          <div class="meal-items-list">
            ${(dayData.nightMilk?.items || [
              'Hot Kesar-Haldi Milk',
              'Bournvita & Horlicks Dispenser Counter',
              'Sweet Digestive Biscuits'
            ]).map(item => `
              <div class="food-item-row">
                <span class="food-bullet text-sky-400">🥛</span>
                <span>${item}</span>
              </div>
            `).join('')}
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/[0.04] text-[11px]">
            <div class="p-1.5 rounded bg-surface-container text-sky-300 flex items-center gap-1">
              <span>🌸</span>
              <span><strong>Girls:</strong> Geeta & Malviya-B (9:15 PM)</span>
            </div>
            <div class="p-1.5 rounded bg-surface-container text-sky-300 flex items-center gap-1">
              <span>🌲</span>
              <span><strong>Boys:</strong> Dining Hall 1 (9:15 PM)</span>
            </div>
            <div class="p-1.5 rounded bg-surface-container text-amber-300 flex items-center gap-1">
              <span>🏔️</span>
              <span><strong>Terrace:</strong> Azad & Shastri (7:30 PM)</span>
            </div>
          </div>
        </div>
      `);
    }

    container.innerHTML = mealCards.join('');

    // Bind dynamic locate buttons on cards
    container.querySelectorAll('.btn-locate-mess-counter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const bId = btn.dataset.building || 'annapurna_a';
        this.locateCounterOnCampusMap(bId);
      });
    });
  },

  renderMilkDistribution() {
    const tableBody = document.getElementById('milk-schedule-tbody');
    if (!tableBody) return;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekly = this.data.weeklyMenu || {};

    tableBody.innerHTML = days.map(day => {
      const dayData = weekly[day] || {};
      const chaiFlavor = dayData.snacks?.highlights?.[0] || dayData.snacks?.title || 'Adrak Chai & Paneer Bread Pakora';
      const chaiSnack = (dayData.snacks?.items && dayData.snacks.items[1]) || 'Fresh Snacks & Biscuits';
      const milkFlavor = dayData.nightMilk?.highlights?.[0] || dayData.nightMilk?.title || 'Hot Kesar-Haldi Milk';
      const milkCounter = (dayData.nightMilk?.items && dayData.nightMilk.items[1]) || 'Bournvita Counter & Biscuits';
      const isToday = (day === this.activeDay);

      return `
        <tr class="${isToday ? 'bg-primary/10 font-semibold' : ''}">
          <td class="font-bold text-on-surface whitespace-nowrap">
            ${day} ${isToday ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-primary text-on-primary ml-1">Today</span>' : ''}
          </td>
          <td>
            <div class="flex flex-col gap-0.5">
              <span class="text-xs text-amber-300 font-semibold">☕ ${chaiFlavor}</span>
              <span class="text-[11px] text-on-surface-variant font-mono">5:00 PM – 6:15 PM • ${chaiSnack}</span>
            </div>
          </td>
          <td>
            <div class="flex flex-col gap-0.5">
              <span class="text-xs text-sky-300 font-semibold">🥛 ${milkFlavor}</span>
              <span class="text-[11px] text-on-surface-variant font-mono">9:15 PM – 10:15 PM • ${milkCounter}</span>
            </div>
          </td>
          <td class="text-xs">
            <div class="flex flex-col gap-0.5 text-on-surface-variant text-[11px]">
              <span>🌸 <strong>Girls:</strong> Geeta, Malviya-B (9:15 PM)</span>
              <span>🌲 <strong>Boys:</strong> Dining Hall 1 & 1st Year (9:15 PM)</span>
              <span class="text-amber-400">🏔️ <strong>Terraces:</strong> Azad & Shastri (7:30 PM)</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  getCurrentMealStatus() {
    const now = new Date();
    const curMinutes = now.getHours() * 60 + now.getMinutes();

    // 07:30 = 450, 09:30 = 570
    // 12:00 = 720, 14:00 = 840
    // 17:00 = 1020, 18:15 = 1095
    // 19:30 = 1170, 21:00 = 1260
    // 21:15 = 1275, 22:15 = 1335

    if (curMinutes >= 450 && curMinutes <= 570) {
      return { serving: true, meal: 'Breakfast', endsIn: 570 - curMinutes };
    } else if (curMinutes < 450) {
      return { serving: false, nextMeal: 'Breakfast', startsIn: 450 - curMinutes };
    } else if (curMinutes >= 720 && curMinutes <= 840) {
      return { serving: true, meal: 'Lunch', endsIn: 840 - curMinutes };
    } else if (curMinutes > 570 && curMinutes < 720) {
      return { serving: false, nextMeal: 'Lunch', startsIn: 720 - curMinutes };
    } else if (curMinutes >= 1020 && curMinutes <= 1095) {
      return { serving: true, meal: 'Hostel Chai & Snacks', endsIn: 1095 - curMinutes };
    } else if (curMinutes > 840 && curMinutes < 1020) {
      return { serving: false, nextMeal: 'Hostel Chai & Snacks', startsIn: 1020 - curMinutes };
    } else if (curMinutes >= 1170 && curMinutes <= 1260) {
      return { serving: true, meal: 'Dinner', endsIn: 1260 - curMinutes };
    } else if (curMinutes > 1095 && curMinutes < 1170) {
      return { serving: false, nextMeal: 'Dinner', startsIn: 1170 - curMinutes };
    } else if (curMinutes >= 1275 && curMinutes <= 1335) {
      return { serving: true, meal: 'Night Milk', endsIn: 1335 - curMinutes };
    } else if (curMinutes > 1260 && curMinutes < 1275) {
      return { serving: false, nextMeal: 'Night Milk', startsIn: 1275 - curMinutes };
    } else {
      return { serving: false, nextMeal: 'Breakfast Tomorrow', startsIn: (1440 - curMinutes) + 450 };
    }
  },

  updateLiveServingStatus() {
    const pill = document.getElementById('mess-live-serving-badge');
    if (!pill) return;

    const status = this.getCurrentMealStatus();
    if (status.serving) {
      pill.innerHTML = `
        <span class="pulse-indicator"></span>
        <span>Serving Now: <strong>${status.meal}</strong> (Ends in ${status.endsIn}m)</span>
      `;
      pill.style.background = 'rgba(16, 185, 129, 0.15)';
      pill.style.color = '#10b981';
      pill.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else {
      const hours = Math.floor(status.startsIn / 60);
      const mins = status.startsIn % 60;
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      pill.innerHTML = `
        <span>⏳ Next Meal: <strong>${status.nextMeal}</strong> (in ${timeStr})</span>
      `;
      pill.style.background = 'rgba(99, 102, 241, 0.12)';
      pill.style.color = 'var(--accent-primary)';
      pill.style.borderColor = 'var(--border-focus)';
    }
  },

  updateDashboardCard() {
    const previewContainer = document.getElementById('dash-next-meal-preview');
    if (!previewContainer) return;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const todayName = dayNames[todayIndex];
    const dayData = this.data.weeklyMenu && this.data.weeklyMenu[todayName];
    if (!dayData) return;

    const status = this.getCurrentMealStatus();
    let mealKey = 'dinner';
    if (status.serving) {
      mealKey = status.meal.toLowerCase().includes('lunch') ? 'lunch' : (status.meal.toLowerCase().includes('breakfast') ? 'breakfast' : 'dinner');
    } else if (status.nextMeal) {
      if (status.nextMeal.includes('Breakfast')) mealKey = 'breakfast';
      else if (status.nextMeal.includes('Lunch')) mealKey = 'lunch';
      else mealKey = 'dinner';
    }

    const mealObj = dayData[mealKey] || dayData.dinner;
    const mealLabel = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);

    previewContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.3rem;">${mealKey === 'breakfast' ? '🌅' : (mealKey === 'lunch' ? '☀️' : '🌙')}</span>
          <span style="font-weight: 800; font-size: 1.05rem;">${mealLabel} (${todayName})</span>
        </div>
        <span class="kbd-shortcut" style="color: var(--accent-primary);">
          ${status.serving ? 'NOW SERVING' : 'UPCOMING'}
        </span>
      </div>
      <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 12px;">
        ${mealObj.items.slice(0, 5).join(' • ')}...
      </div>
      ${mealObj.sweetDish ? `
        <div class="meal-special-callout sweet-dish-callout" style="padding: 6px 12px; font-size: 0.8rem;">
          <span>🍨</span>
          <span><strong>Sweet Dish:</strong> ${mealObj.sweetDish}</span>
        </div>
      ` : ''}
    `;
  }
};

window.MessController = MessController;
