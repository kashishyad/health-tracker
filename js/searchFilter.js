/**
 * SevaRoute — Smart Search, Asset Filters & Layout View Switcher Engine
 * Path: js/searchFilter.js
 */

(function () {
  'use strict';

  const App = window.SevaRoute;

  function initSearchAndFilters() {
    renderFacilityCards();
    setupSearchInput();
    setupAssetFilter();
    setupViewSwitcher();
    setupCorridorRadioListeners();
    setupHealthRadioListeners();
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderFacilityCards() {
    const container = document.querySelector('.hospitals-matrix-list');
    if (!container || !App?.state?.facilities) return;

    container.replaceChildren();

    App.state.facilities.forEach(facility => {
      const article = createElement('article', `hospital-card card-status-${facility.status} district-${facility.district}`);
      article.id = facility.id;

      const top = createElement('div', 'h-card-top');
      const identity = createElement('div', 'h-identity');
      const tags = createElement('div', 'h-tier-tags');
      tags.append(
        createElement('span', `h-district-pill ${facility.district}`, facility.district === 'gkp' ? 'Gorakhpur' : 'Jaunpur'),
        createElement('span', 'h-type-badge', facility.typeEn)
      );
      identity.append(
        tags,
        createElement('h3', 'h-name', facility.nameEn),
        createElement('div', 'h-location', `${facility.location} - ${facility.beds} Beds`)
      );

      const occupancy = Math.round((1 - facility.icuFree / facility.icuTotal) * 100);
      const statusText = facility.status === 'critical'
        ? `CRITICAL SURGE (${occupancy}% FULL)`
        : facility.status === 'warning'
          ? `CAUTION ALERT (${occupancy}% FULL)`
          : `STABLE (${occupancy}% FULL)`;
      const status = createElement('div', `h-status-badge ${facility.status}`);
      status.append(createElement('span', `live-pulse-dot ${facility.status}`), document.createTextNode(statusText));
      top.append(identity, status);

      const metrics = createElement('div', 'h-metrics-row');
      metrics.append(
        createMetric('ICU Free', `${facility.icuFree} Free / ${facility.icuTotal}`, facility.icuFree, facility.icuFree < 5 ? 'critical' : 'stable'),
        createMetric('O2 Reserve', `${facility.o2Hrs} Hours`, `${facility.o2Hrs}h`, facility.o2Hrs < 8 ? 'critical' : 'stable'),
        createMetric('Surgeons', `${facility.surgeons} Active`, facility.surgeons, facility.surgeons < 3 ? 'warning' : 'stable'),
        createMetric('Antivenom', `${facility.antivenom} Vials`, facility.antivenom, facility.antivenom < 5 ? 'warning' : 'stable')
      );

      const footer = createElement('div', 'h-infra-footer');
      const badges = createElement('div', 'infra-badges');
      badges.append(
        createElement('span', `infra-badge ${facility.status === 'critical' ? 'alert' : facility.status === 'warning' ? 'caution' : 'passable'}`,
          facility.status === 'critical' ? 'Capacity alert' : facility.status === 'warning' ? 'Monitoring required' : 'Beds ready'),
        createElement('span', 'infra-badge passable', `${facility.o2Hrs}h O2 reserve`)
      );
      const actions = createElement('div', 'card-actions-group');
      const dispatchLabel = createElement('label', `action-btn-sm ${facility.status === 'critical' ? 'divert-btn' : 'route-btn'}`, '108 Route');
      dispatchLabel.htmlFor = 'modal-dispatch';
      actions.append(dispatchLabel);
      footer.append(badges, actions);

      article.append(top, metrics, footer);
      container.appendChild(article);
    });

    ensureCardEmptyState(container, App.state.facilities.length);

    if (App.setLanguage) App.setLanguage(App.state.lang);
  }

  function ensureCardEmptyState(container, visibleCount) {
    let emptyState = container.querySelector('.facility-empty-state');
    if (!emptyState) {
      emptyState = createElement('div', 'facility-empty-state');
      emptyState.setAttribute('role', 'status');
      container.appendChild(emptyState);
    }
    emptyState.hidden = visibleCount > 0;
    emptyState.textContent = 'No facilities match the active filters.';
  }

  function createMetric(label, detail, value, tone) {
    const metric = createElement('div', 'h-metric-block');
    const metricLabel = createElement('div', 'h-metric-label');
    metricLabel.append(createElement('span', '', label), createElement('span', `text-${tone}`, detail));
    metric.append(metricLabel, createElement('div', `h-metric-val text-${tone}`, value));
    return metric;
  }

  function setupSearchInput() {
    const searchInput = document.getElementById('global-search-input');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        App.state.searchQuery = e.target.value.toLowerCase().trim();
        applyAllFilters();
      }, 250);
    });
  }

  function setupAssetFilter() {
    const assetSelect = document.getElementById('asset-filter-select');
    if (!assetSelect) return;

    assetSelect.addEventListener('change', (e) => {
      App.state.filterAsset = e.target.value;
      applyAllFilters();
    });
  }

  function setupViewSwitcher() {
    const btnCards = document.getElementById('btn-view-cards');
    const btnMatrix = document.getElementById('btn-view-matrix');
    const cardsContainer = document.querySelector('.hospitals-matrix-list');
    const matrixContainer = document.getElementById('compact-matrix-container');

    if (!btnCards || !btnMatrix) return;

    btnCards.addEventListener('click', () => setViewMode('cards'));
    btnMatrix.addEventListener('click', () => setViewMode('matrix'));

    // Apply saved view mode on load
    setViewMode(App.state.viewMode);

    function setViewMode(mode) {
      App.state.viewMode = mode;
      try {
        localStorage.setItem('sevaroute_view', mode);
      } catch (error) {
        console.warn('Unable to store preferred view mode:', error);
      }

      if (mode === 'matrix') {
        btnMatrix.classList.add('active');
        btnCards.classList.remove('active');
        if (cardsContainer) cardsContainer.style.display = 'none';
        if (matrixContainer) {
          matrixContainer.style.display = 'block';
          renderCompactMatrixTable();
        }
      } else {
        btnCards.classList.add('active');
        btnMatrix.classList.remove('active');
        if (cardsContainer) cardsContainer.style.display = 'flex';
        if (matrixContainer) matrixContainer.style.display = 'none';
      }
    }
  }

  function setupCorridorRadioListeners() {
    document.querySelectorAll('.corridor-radio').forEach(radio => {
      radio.addEventListener('change', () => {
        const id = radio.id;
        App.state.filterDistrict = id === 'corridor-gkp' ? 'gkp' : id === 'corridor-jaunpur' ? 'jaunpur' : 'all';
        applyAllFilters();
      });
    });
  }

  function setupHealthRadioListeners() {
    document.querySelectorAll('.filter-radio').forEach(radio => {
      radio.addEventListener('change', () => {
        const id = radio.id;
        App.state.filterStatus = id === 'filter-critical' ? 'critical' : id === 'filter-warning' ? 'warning' : id === 'filter-stable' ? 'stable' : 'all';
        applyAllFilters();
      });
    });
  }

  function applyAllFilters() {
    const query = App.state.searchQuery;
    const asset = App.state.filterAsset;
    const district = App.state.filterDistrict;
    const status = App.state.filterStatus;

    let visibleCount = 0;

    App.state.facilities.forEach(fac => {
      const card = document.getElementById(fac.id);
      if (!card) return;

      // 1. District match
      const matchDistrict = district === 'all' || fac.district === district;

      // 2. Status match
      const matchStatus = status === 'all' || fac.status === status;

      // 3. Asset filter match
      let matchAsset = true;
      if (asset === 'icu_gt_5') matchAsset = fac.icuFree >= 5;
      else if (asset === 'o2_gt_12') matchAsset = fac.o2Hrs >= 12;
      else if (asset === 'surgeons') matchAsset = fac.surgeons >= 3;
      else if (asset === 'antivenom') matchAsset = fac.antivenom >= 5;

      // 4. Search query match
      let matchQuery = true;
      if (query) {
        const textContent = card.innerText.toLowerCase();
        matchQuery = textContent.includes(query) || fac.nameEn.toLowerCase().includes(query) || fac.nameHi.includes(query);
      }

      const isVisible = matchDistrict && matchStatus && matchAsset && matchQuery;
      card.style.display = isVisible ? '' : 'none';

      if (isVisible) visibleCount++;
    });

    // Update facility counter text
    const counterEl = document.querySelector('.section-counter');
    if (counterEl) {
      counterEl.textContent = `${visibleCount} Monitored Facilities`;
    }
    const cardsContainer = document.querySelector('.hospitals-matrix-list');
    if (cardsContainer) ensureCardEmptyState(cardsContainer, visibleCount);

    // Re-render compact matrix table if in matrix mode
    if (App.state.viewMode === 'matrix') {
      renderCompactMatrixTable();
    }
  }

  function renderCompactMatrixTable() {
    const container = document.getElementById('compact-matrix-container');
    if (!container) return;

    const query = App.state.searchQuery;
    const asset = App.state.filterAsset;
    const district = App.state.filterDistrict;
    const status = App.state.filterStatus;

    const filtered = App.state.facilities.filter(fac => {
      const matchDistrict = district === 'all' || fac.district === district;
      const matchStatus = status === 'all' || fac.status === status;
      let matchAsset = true;
      if (asset === 'icu_gt_5') matchAsset = fac.icuFree >= 5;
      else if (asset === 'o2_gt_12') matchAsset = fac.o2Hrs >= 12;
      else if (asset === 'surgeons') matchAsset = fac.surgeons >= 3;
      else if (asset === 'antivenom') matchAsset = fac.antivenom >= 5;

      let matchQuery = true;
      if (query) {
        matchQuery = fac.nameEn.toLowerCase().includes(query) || fac.nameHi.includes(query);
      }

      return matchDistrict && matchStatus && matchAsset && matchQuery;
    });

    let html = `
      <div class="matrix-table-wrapper">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>District & Facility</th>
              <th>Status</th>
              <th>ICU Free</th>
              <th>O2 Reserves</th>
              <th>Surgeons</th>
              <th>Blood (O-)</th>
              <th>Antivenom</th>
              <th>ETA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (filtered.length === 0) {
      html += `<tr><td colspan="9" style="text-align:center; padding: 2rem;" class="text-muted">No facilities match the active search and filter criteria.</td></tr>`;
    } else {
      filtered.forEach(f => {
        const statusBadge = f.status === 'critical' ? '<span class="vital-status-pill critical">CRITICAL</span>' : f.status === 'warning' ? '<span class="vital-status-pill warning">WARNING</span>' : '<span class="vital-status-pill stable">STABLE</span>';
        const distLabel = f.district === 'jaunpur' ? 'Jaunpur' : 'Gorakhpur';
        const displayName = escapeHtml(App.state.lang === 'hi' ? f.nameHi : f.nameEn);

        html += `
          <tr id="matrix-row-${f.id}" class="matrix-row" data-facility-id="${f.id}">
            <td>
              <strong class="text-main">${displayName}</strong>
              <div class="text-mono-xs text-dimmer">${distLabel} Corridor</div>
            </td>
            <td>${statusBadge}</td>
            <td class="text-mono-sm ${f.icuFree < 5 ? 'text-critical' : 'text-stable'}">${f.icuFree} / ${f.icuTotal}</td>
            <td class="text-mono-sm ${f.o2Hrs < 8 ? 'text-critical' : 'text-stable'}">${f.o2Hrs}h (${f.o2Pct}%)</td>
            <td>${f.surgeons} Active</td>
            <td>${f.bloodUnits} Units</td>
            <td>${f.antivenom} Vials</td>
            <td class="text-mono-xs">${f.etaMin} m</td>
            <td>
              <label for="modal-dispatch" class="action-btn-sm saffron-btn" style="padding: 2px 8px; font-size: 0.7rem;">Dispatch</label>
            </td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  }

  window.SevaRoute.applyAllFilters = applyAllFilters;

  document.addEventListener('DOMContentLoaded', initSearchAndFilters);
})();
