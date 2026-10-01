/**
 * Annapurna Mess Controller for JUIT Student Hub
 */

const MessController = {
  data: {},
  activeDay: 'Tuesday',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],

  init(messData) {
    this.data = messData || (window.JUIT_DATA && window.JUIT_DATA.mess) || {};
    
    // Auto-detect current day name
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    this.activeDay = dayNames[todayIndex] || 'Tuesday';

    this.renderDayTabs();
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
          <div>${d}</div>
          ${isToday ? '<span style="font-size: 0.7rem; color: #10b981; font-weight: 700;">● Today</span>' : ''}
        </button>
      `;
    }).join('');

    container.querySelectorAll('.mess-day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeDay = btn.dataset.day;
        this.renderDayTabs();
        this.renderMeals();
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
      container.innerHTML = '<p style="color: var(--text-muted);">No meal data found for this day.</p>';
      return;
    }

    const timings = this.data.mealTimings || {};

    container.innerHTML = `
      <!-- Breakfast -->
      <div class="meal-card breakfast">
        <div class="meal-card-header">
          <div class="meal-title-wrap">
            <div class="meal-icon-avatar">🌅</div>
            <div>
              <div class="meal-label-name">Breakfast</div>
              <div class="meal-time-pill">${timings.breakfast?.display || '07:30 AM – 09:30 AM'}</div>
            </div>
          </div>
          ${dayData.breakfast.category ? `<span class="kbd-shortcut" style="color: var(--color-breakfast);">${dayData.breakfast.category}</span>` : ''}
        </div>
        <div class="meal-items-list">
          ${dayData.breakfast.items.map(item => `
            <div class="food-item-row">
              <span class="food-bullet">✦</span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
        ${dayData.breakfast.highlights ? `
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
            ${dayData.breakfast.highlights.map(h => `
              <span class="facility-pill" style="color: var(--color-breakfast); border-color: rgba(249, 115, 22, 0.3);">
                ✨ ${h}
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Lunch -->
      <div class="meal-card lunch">
        <div class="meal-card-header">
          <div class="meal-title-wrap">
            <div class="meal-icon-avatar">☀️</div>
            <div>
              <div class="meal-label-name">Lunch</div>
              <div class="meal-time-pill">${timings.lunch?.display || '12:00 PM – 02:00 PM'}</div>
            </div>
          </div>
          ${dayData.lunch.fruit ? `<span class="kbd-shortcut" style="color: #10b981;">🍎 ${dayData.lunch.fruit}</span>` : ''}
        </div>
        <div class="meal-items-list">
          ${dayData.lunch.items.map(item => `
            <div class="food-item-row">
              <span class="food-bullet">✦</span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
        ${dayData.lunch.fruit ? `
          <div class="meal-special-callout fruit-callout">
            <span>🍏</span>
            <span><strong>Seasonal Fruit:</strong> ${dayData.lunch.fruit}</span>
          </div>
        ` : ''}
      </div>

      <!-- Dinner -->
      <div class="meal-card dinner">
        <div class="meal-card-header">
          <div class="meal-title-wrap">
            <div class="meal-icon-avatar">🌙</div>
            <div>
              <div class="meal-label-name">Dinner</div>
              <div class="meal-time-pill">${timings.dinner?.display || '07:30 PM – 09:00 PM'}</div>
            </div>
          </div>
          ${dayData.dinner.sweet ? `<span class="kbd-shortcut" style="color: #ec4899;">🍨 ${dayData.dinner.sweet}</span>` : ''}
        </div>
        <div class="meal-items-list">
          ${dayData.dinner.items.map(item => `
            <div class="food-item-row">
              <span class="food-bullet">✦</span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
        ${dayData.dinner.sweetDish ? `
          <div class="meal-special-callout sweet-dish-callout">
            <span>🍨</span>
            <span><strong>Sweet Dish:</strong> ${dayData.dinner.sweetDish}</span>
          </div>
        ` : ''}
      </div>
    `;
  },

  renderMilkDistribution() {
    const tableBody = document.getElementById('milk-schedule-tbody');
    if (!tableBody) return;

    const list = this.data.milkDistribution || [];
    tableBody.innerHTML = list.map(item => `
      <tr>
        <td style="font-weight: 700;">${item.group}</td>
        <td><span class="kbd-shortcut" style="color: var(--color-milk);">${item.timing}</span></td>
        <td style="color: var(--text-secondary);">${item.place}</td>
      </tr>
    `).join('');
  },

  getCurrentMealStatus() {
    const now = new Date();
    const curMinutes = now.getHours() * 60 + now.getMinutes();

    // 07:30 = 450, 09:30 = 570
    // 12:00 = 720, 14:00 = 840
    // 19:30 = 1170, 21:00 = 1260
    // 21:15 = 1275, 21:45 = 1305

    if (curMinutes >= 450 && curMinutes <= 570) {
      return { serving: true, meal: 'Breakfast', endsIn: 570 - curMinutes };
    } else if (curMinutes < 450) {
      return { serving: false, nextMeal: 'Breakfast', startsIn: 450 - curMinutes };
    } else if (curMinutes >= 720 && curMinutes <= 840) {
      return { serving: true, meal: 'Lunch', endsIn: 840 - curMinutes };
    } else if (curMinutes > 570 && curMinutes < 720) {
      return { serving: false, nextMeal: 'Lunch', startsIn: 720 - curMinutes };
    } else if (curMinutes >= 1170 && curMinutes <= 1260) {
      return { serving: true, meal: 'Dinner', endsIn: 1260 - curMinutes };
    } else if (curMinutes > 840 && curMinutes < 1170) {
      return { serving: false, nextMeal: 'Dinner', startsIn: 1170 - curMinutes };
    } else if (curMinutes >= 1275 && curMinutes <= 1305) {
      return { serving: true, meal: 'Night Milk', endsIn: 1305 - curMinutes };
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
