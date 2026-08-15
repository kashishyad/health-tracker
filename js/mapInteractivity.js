/**
 * SevaRoute — Tactical GIS Command Map & Live Fleet Engine
 * Path: js/mapInteractivity.js
 */

(function () {
  'use strict';

  // Facility Geographical Coordinate Registry
  const FACILITY_COORDS = {
    'hospital-jaunpur-civil':      { lat: 25.7464, lng: 82.6837, shortName: 'Jaunpur Civil Apex', status: 'critical', beds: '3 Free', o2: '5.1h' },
    'hospital-jaunpur-shahganj':    { lat: 26.0526, lng: 82.6908, shortName: 'Shahganj SDH', status: 'stable', beds: '14 Free', o2: '40h' },
    'hospital-jaunpur-mariahu':    { lat: 25.5600, lng: 82.5700, shortName: 'Mariahu CHC', status: 'warning', beds: '3 Free', o2: '8.2h' },
    'hospital-jaunpur-machhlishahr':{ lat: 25.6800, lng: 82.4200, shortName: 'Machhlishahr SDH', status: 'stable', beds: '11 Free', o2: '34h' },
    'hospital-jaunpur-baksha':     { lat: 25.8200, lng: 82.5500, shortName: 'Baksha PHC', status: 'critical', beds: '1 Free', o2: '4.8h' },
    'hospital-jaunpur-kerakat':    { lat: 25.6300, lng: 82.9200, shortName: 'Kerakat CHC', status: 'warning', beds: '4 Free', o2: '18h' },
    'hospital-dch-central':        { lat: 26.7606, lng: 83.3732, shortName: 'Gorakhpur Civil Apex', status: 'critical', beds: '4 Free', o2: '4.2h' },
    'hospital-sdh-bansgaon':       { lat: 26.5100, lng: 83.3500, shortName: 'Bansgaon SDH', status: 'stable', beds: '18 Free', o2: '38.5h' },
    'hospital-chc-sahjanwa':       { lat: 26.7400, lng: 83.1800, shortName: 'Sahjanwa CHC', status: 'warning', beds: '4 Free', o2: '9.8h' },
    'hospital-phc-kusumhi':        { lat: 26.7400, lng: 83.4900, shortName: 'Kusumhi PHC', status: 'critical', beds: '1 Free', o2: '3.5h' }
  };

  let leafletMapInstance = null;
  const leafletMarkers = {};

  function initMapInteractivity() {
    setupCardToMapHover();
    setupMapToCardHover();
    setupTickerInteractivity();
    initLeafletGisMap();
  }

  function initLeafletGisMap() {
    const mapContainer = document.getElementById('gis-leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    if (leafletMapInstance) {
      leafletMapInstance.remove();
    }

    // Centered on Jaunpur/Gorakhpur Sector with optimal zoom to prevent pin overlap
    leafletMapInstance = L.map(mapContainer, {
      center: [26.15, 82.95],
      zoom: 9,
      zoomControl: true,
      attributionControl: false
    });

    // High-Contrast Dark CartoDB Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(leafletMapInstance);

    // Plot Sleek Non-Overlapping Custom Pin Markers
    Object.keys(FACILITY_COORDS).forEach(id => {
      const f = FACILITY_COORDS[id];

      const pinIcon = L.divIcon({
        className: 'leaflet-custom-marker',
        html: `
          <div class="gis-pin-wrapper ${f.status}" id="map-pin-${id}">
            <span class="gis-pin-dot ${f.status}"></span>
            <span class="gis-pin-label">${f.shortName}</span>
            <span class="gis-pin-metric ${f.status}">${f.beds}</span>
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      const marker = L.marker([f.lat, f.lng], { icon: pinIcon }).addTo(leafletMapInstance);
      
      marker.bindPopup(`
        <div style="font-family:sans-serif; color:#0f172a; padding:6px; min-width:160px;">
          <strong style="font-size:0.88rem; display:block; margin-bottom:4px; color:#0f172a;">${f.shortName}</strong>
          <div style="font-size:0.76rem; color:#475569; margin-bottom:6px;">
            <span>ICU Free: <strong style="color:#047857;">${f.beds}</strong></span><br>
            <span>Oxygen Reserve: <strong style="color:#0284c7;">${f.o2}</strong></span>
          </div>
          <a href="#${id}" onclick="document.getElementById('${id}')?.scrollIntoView({behavior:'smooth', block:'center'});" style="font-size:0.75rem; color:#2563eb; font-weight:700; text-decoration:none;">View Facility Card &rarr;</a>
        </div>
      `);

      marker.on('click', () => {
        const card = document.getElementById(id);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('card-hover-highlight');
          setTimeout(() => card.classList.remove('card-hover-highlight'), 3000);
        }
      });

      leafletMarkers[id] = marker;

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
      [FACILITY_COORDS['hospital-jaunpur-machhlishahr'].lat, FACILITY_COORDS['hospital-jaunpur-machhlishahr'].lng],
      [FACILITY_COORDS['hospital-jaunpur-baksha'].lat, FACILITY_COORDS['hospital-jaunpur-baksha'].lng],
      [FACILITY_COORDS['hospital-jaunpur-civil'].lat, FACILITY_COORDS['hospital-jaunpur-civil'].lng],
      [FACILITY_COORDS['hospital-jaunpur-shahganj'].lat, FACILITY_COORDS['hospital-jaunpur-shahganj'].lng]
    ];
    L.polyline(nh31Corridor, { color: '#ff9933', weight: 3, opacity: 0.85, dashArray: '6, 6' }).addTo(leafletMapInstance);

    const nh28Corridor = [
      [FACILITY_COORDS['hospital-jaunpur-civil'].lat, FACILITY_COORDS['hospital-jaunpur-civil'].lng],
      [FACILITY_COORDS['hospital-sdh-bansgaon'].lat, FACILITY_COORDS['hospital-sdh-bansgaon'].lng],
      [FACILITY_COORDS['hospital-dch-central'].lat, FACILITY_COORDS['hospital-dch-central'].lng]
    ];
    L.polyline(nh28Corridor, { color: '#06b6d4', weight: 3, opacity: 0.85 }).addTo(leafletMapInstance);
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
  }

  window.SevaRoute.initMapInteractivity = initMapInteractivity;

  document.addEventListener('DOMContentLoaded', initMapInteractivity);

})();
