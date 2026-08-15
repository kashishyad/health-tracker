/**
 * SevaRoute — Smart Search, Asset Filters & Layout View Switcher Engine
 * Path: js/searchFilter.js
 */

(function () {
  'use strict';

  const App = window.SevaRoute;

  function initSearchAndFilters() {
    setupSearchInput();
    setupAssetFilter();
    setupViewSwitcher();
    setupCorridorRadioListeners();
    setupHealthRadioListeners();
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
      localStorage.setItem('sevaroute_view', mode);

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
        const displayName = App.state.lang === 'hi' ? f.nameHi : f.nameEn;

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
