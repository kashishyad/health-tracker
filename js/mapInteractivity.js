/**
 * SevaRoute — Tactical GIS Command Map & Live Fleet Engine
 * Path: js/mapInteractivity.js
 */

(function () {
  'use strict';
  const App = window.SevaRoute;

  let leafletMapInstance = null;
  const leafletMarkers = {};

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initMapInteractivity() {
    setupCardToMapHover();
    setupMapToCardHover();
    setupTickerInteractivity();
    initLeafletGisMap();
    renderAccessibleFacilityList();
  }

  function renderAccessibleFacilityList() {
    const list = document.getElementById('map-facility-list');
    const facilities = App?.state?.facilities || [];
    if (!list || !facilities.length) return;

    const heading = document.createElement('h4');
    heading.className = 'map-facility-list-title';
    heading.textContent = 'Facility availability';
    list.replaceChildren(heading);

    const items = document.createElement('div');
    items.className = 'map-facility-list-items';
    facilities.forEach(facility => {
      const link = document.createElement('a');
      link.href = `hospitals.html#${facility.id}`;
      link.className = `map-facility-item ${facility.status}`;
      link.textContent = `${facility.shortName} - ${facility.icuFree} ICU free - ${facility.o2Hrs}h O2`;
      items.appendChild(link);
    });
    list.appendChild(items);
  }

  function initLeafletGisMap() {
    const mapContainer = document.getElementById('gis-leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    if (leafletMapInstance) {
      leafletMapInstance.remove();
    }

    const facilities = App?.state?.facilities || [];
    if (!facilities.length) return;

    mapContainer.setAttribute('aria-busy', 'true');
    setMapStatus(mapContainer, 'Loading map tiles...', 'loading');

    // Centered on Jaunpur/Gorakhpur Sector with optimal zoom to prevent pin overlap
    leafletMapInstance = L.map(mapContainer, {
      center: [26.15, 82.95],
      zoom: 9,
      zoomControl: true,
      attributionControl: true
    });

    // Public demo basemap; production should use an approved tile provider.
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMapInstance);
    tileLayer.on('load', () => {
      mapContainer.setAttribute('aria-busy', 'false');
      setMapStatus(mapContainer, '', 'ready');
    });
    tileLayer.on('tileerror', () => {
      mapContainer.setAttribute('aria-busy', 'false');
      setMapStatus(mapContainer, 'Map tiles unavailable. Facility list remains available below.', 'error');
    });

    // Plot Sleek Non-Overlapping Custom Pin Markers
    facilities.forEach(f => {

      const pinIcon = L.divIcon({
        className: 'leaflet-custom-marker',
        html: `
          <div class="gis-pin-wrapper ${f.status}" id="map-pin-${f.id}">
            <span class="gis-pin-dot ${f.status}"></span>
            <span class="gis-pin-label">${escapeHtml(f.shortName)}</span>
            <span class="gis-pin-metric ${f.status}">${f.icuFree} Free</span>
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      const marker = L.marker([f.lat, f.lng], { icon: pinIcon }).addTo(leafletMapInstance);
      
      marker.bindPopup(`
        <div style="font-family:sans-serif; color:#0f172a; padding:6px; min-width:160px;">
            <strong style="font-size:0.88rem; display:block; margin-bottom:4px; color:#0f172a;">${escapeHtml(f.shortName)}</strong>
          <div style="font-size:0.76rem; color:#475569; margin-bottom:6px;">
            <span>ICU Free: <strong style="color:#047857;">${f.icuFree} / ${f.icuTotal}</strong></span><br>
            <span>Oxygen Reserve: <strong style="color:#0284c7;">${f.o2Hrs}h</strong></span>
          </div>
          <a href="hospitals.html#${f.id}" style="font-size:0.75rem; color:#2563eb; font-weight:700; text-decoration:none;">View Facility Card &rarr;</a>
        </div>
      `);

      marker.on('click', () => {
        const card = document.getElementById(f.id);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('card-hover-highlight');
          setTimeout(() => card.classList.remove('card-hover-highlight'), 3000);
        }
      });

      leafletMarkers[f.id] = marker;

      // Add Glowing Danger Circle for Critical Surge Hospitals
      if (f.status === 'critical') {
        L.circle([f.lat, f.lng], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.15,
          radius: 5000
        }).addTo(leafletMapInstance);
      }
    });

    // Emergency Ambulances on Highway Corridors
    const amb1Icon = L.divIcon({
      className: 'leaflet-custom-marker',
      html: `
        <div class="gis-amb-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> 108 ALS #21 <span class="amb-eta">ETA 5m</span>
        </div>
      `,
      iconSize: [130, 24],
      iconAnchor: [65, 12]
    });
    L.marker([25.9000, 82.6880], { icon: amb1Icon }).addTo(leafletMapInstance);

    // Highway Routes
    const nh31Corridor = [
      getFacilityPoint(facilities, 'hospital-jaunpur-machhlishahr'),
      getFacilityPoint(facilities, 'hospital-jaunpur-baksha'),
      getFacilityPoint(facilities, 'hospital-jaunpur-civil'),
      getFacilityPoint(facilities, 'hospital-jaunpur-shahganj')
    ];
    L.polyline(nh31Corridor, { color: '#ff9933', weight: 3, opacity: 0.85, dashArray: '6, 6' }).addTo(leafletMapInstance);

    const nh28Corridor = [
      getFacilityPoint(facilities, 'hospital-jaunpur-civil'),
      getFacilityPoint(facilities, 'hospital-sdh-bansgaon'),
      getFacilityPoint(facilities, 'hospital-dch-central')
    ];
    L.polyline(nh28Corridor, { color: '#06b6d4', weight: 3, opacity: 0.85 }).addTo(leafletMapInstance);
  }

  function getFacilityPoint(facilities, facilityId) {
    const facility = facilities.find(item => item.id === facilityId);
    return facility ? [facility.lat, facility.lng] : null;
  }

  function setupCardToMapHover() {
    document.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.hospital-card, .matrix-row');
      if (!card) return;

      const facilityId = card.id || card.getAttribute('data-facility-id');
      if (!facilityId) return;

      highlightMapNodeForFacility(facilityId, true);
    });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.hospital-card, .matrix-row');
      if (!card) return;

      const facilityId = card.id || card.getAttribute('data-facility-id');
      if (!facilityId) return;

      highlightMapNodeForFacility(facilityId, false);
    });
  }

  function setupMapToCardHover() {
    const svgMap = document.querySelector('.map-svg-routes');
    if (!svgMap) return;

    svgMap.addEventListener('mouseover', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      highlightCardForFacility(targetId, true);
    });

    svgMap.addEventListener('mouseout', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      highlightCardForFacility(targetId, false);
    });
  }

  function highlightMapNodeForFacility(facilityId, isHighlighted) {
    const pin = document.getElementById(`map-pin-${facilityId}`);
    if (pin) {
      if (isHighlighted) {
        pin.style.transform = 'scale(1.25)';
        pin.style.borderColor = '#38bdf8';
        pin.style.zIndex = '99999';
      } else {
        pin.style.transform = '';
        pin.style.borderColor = '';
        pin.style.zIndex = '';
      }
    }
  }

  function highlightCardForFacility(facilityId, isHighlighted) {
    const card = document.getElementById(facilityId);
    if (!card) return;

    if (isHighlighted) {
      card.classList.add('card-hover-highlight');
    } else {
      card.classList.remove('card-hover-highlight');
    }
  }

  function setupTickerInteractivity() {
    const tickerTrack = document.querySelector('.ticker-track');
    if (!tickerTrack) return;

    tickerTrack.addEventListener('click', (e) => {
      const item = e.target.closest('.ticker-item');
      if (!item) return;

      if (item.textContent.includes('Shahganj')) {
        const targetCard = document.getElementById('hospital-jaunpur-shahganj');
        if (targetCard) targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (item.textContent.includes('Gorakhpur Civil')) {
        const targetCard = document.getElementById('hospital-dch-central');
        if (targetCard) targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    updateMarkerDensity();
    leafletMapInstance.on('zoomend', updateMarkerDensity);
  }

  function setMapStatus(mapContainer, message, state) {
    let status = mapContainer.querySelector('.map-status-message');
    if (!message) {
      status?.remove();
      return;
    }
    if (!status) {
      status = document.createElement('div');
      status.className = 'map-status-message';
      mapContainer.appendChild(status);
    }
    status.className = `map-status-message ${state}`;
    status.textContent = message;
  }

  function updateMarkerDensity() {
    if (!leafletMapInstance) return;
    const compact = leafletMapInstance.getZoom() < 10;
    document.querySelectorAll('.gis-pin-wrapper').forEach(pin => {
      pin.classList.toggle('compact', compact);
    });
  }

  window.SevaRoute.initMapInteractivity = initMapInteractivity;

  document.addEventListener('DOMContentLoaded', initMapInteractivity);

})();
