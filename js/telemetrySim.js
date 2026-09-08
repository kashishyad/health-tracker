/**
 * SevaRoute — Real-Time IoT Telemetry Simulator & Diagnostic Log Filter
 * Path: js/telemetrySim.js
 */

(function () {
  'use strict';

  const App = window.SevaRoute;
  const Telemetry = window.SevaRouteTelemetry;

  // Initialize Telemetry Simulator
  function initSimulator() {
    // Every 12 seconds, append a new IoT log entry to Telemetry Modal
    setInterval(generateNewTelemetryLog, 12000);
    setInterval(updateTelemetrySourceStatus, 5000);

    // Wire Diagnostic Severity Filters inside Telemetry Modal
    setupDiagnosticFilters();
    Telemetry?.ingest();
    updateTelemetrySourceStatus();
    updateKPIVitals();
  }

  function updateTelemetrySourceStatus() {
    const statusEl = document.querySelector('.telemetry-source-status');
    if (!statusEl || !Telemetry) return;

    const status = Telemetry.getStatus();
    statusEl.classList.toggle('is-stale', status.stale);
    statusEl.textContent = status.stale
      ? `TELEMETRY STALE • ${status.source.toUpperCase()} • Last sync unavailable`
      : `TELEMETRY ${status.source.toUpperCase()} • ${status.lastSync ? 'SYNCED' : 'CONNECTING'}`;
  }

  function updateRandomFacilityTelemetry() {
    if (!App || !App.state || !App.state.facilities) return;
    const facilities = App.state.facilities;
    const randomIndex = Math.floor(Math.random() * facilities.length);
    const target = facilities[randomIndex];
    Telemetry?.ingest();

    // Minor fluctuation: +/- 1 ICU bed within limits
    const deltaBed = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    if (deltaBed !== 0) {
      target.icuFree = Math.max(0, Math.min(target.icuTotal, target.icuFree + deltaBed));
      
      // Update DOM for target card
      const card = document.getElementById(target.id);
      if (card) {
        const valEl = card.querySelector('.h-metric-val');
        if (
          valEl &&
          (
            valEl.classList.contains('text-critical') ||
            valEl.classList.contains('text-stable') ||
            valEl.classList.contains('text-warning')
          )
        ) {
          valEl.textContent = target.icuFree;
        }

        // Pulse the card briefly to indicate telemetry sync
        card.classList.add('telemetry-pulse-card');
        setTimeout(() => card.classList.remove('telemetry-pulse-card'), 1500);
      }

      // Update KPI counter at top
      updateKPIVitals();
    }
  }

  function updateKPIVitals() {
    if (!App || !App.state) return;
    const totalFreeBeds = App.state.facilities.reduce((sum, facility) => sum + facility.icuFree, 0);
    const totalIcuBeds = App.state.facilities.reduce((sum, facility) => sum + facility.icuTotal, 0);
    const kpiNumber = document.querySelector('.vital-card.status-critical-theme .vital-number');
    const kpiUnit = document.querySelector('.vital-card.status-critical-theme .vital-unit');
    const kpiBar = document.querySelector('.vital-card.status-critical-theme .vital-bar-fill');
    if (kpiNumber) {
      kpiNumber.textContent = totalFreeBeds;
    }
    if (kpiUnit) {
      kpiUnit.textContent = `/ ${totalIcuBeds} Free Beds`;
    }
    if (kpiBar && totalIcuBeds > 0) {
      kpiBar.style.width = `${((totalIcuBeds - totalFreeBeds) / totalIcuBeds) * 100}%`;
    }
  }

  function generateNewTelemetryLog() {
    const list = document.querySelector('.telemetry-log-list');
    if (!list) return;
    Telemetry?.ingest();

    const sampleLogs = [
      { status: 'ok', title: '[OK] NavIC SATELLITE TELEMETRY BEACON #08', detail: 'Grid lock verified • Latency: 29ms • Signal: -62 dBm • 108 GPS corridor open' },
      { status: 'warn', title: '[WARN] COLD-CHAIN SENSOR NODE #04 (BAKSHA PHC)', detail: 'Temperature fluctuated to 4.2°C • Solar battery backup engaged (100%)' },
      { status: 'alert', title: '[ALERT] CRYOGENIC O2 PRESSURE DROP (JAUNPUR CIVIL)', detail: 'Manifold Line Pressure at 2.1 Bar • Refill Truck ETA: 18 min' },
      { status: 'info', title: '[INFO] 108 AMBULANCE #22 DISPATCH ACKNOWLEDGED', detail: 'En-route to Shahganj SDH • Green corridor traffic signals preempted' }
    ];

    const randomLog = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
    const entry = document.createElement('div');
    entry.className = `telemetry-log-entry status-${randomLog.status}`;
    entry.setAttribute('data-severity', randomLog.status);
    const title = document.createElement('div');
    title.className = 'tlog-status';
    title.textContent = randomLog.title;
    const detail = document.createElement('div');
    detail.className = 'tlog-detail';
    detail.textContent = randomLog.detail;
    entry.append(title, detail);

    list.insertBefore(entry, list.firstChild);

    // Keep list bounded to 15 entries max
    while (list.children.length > 15) {
      list.removeChild(list.lastChild);
    }
  }

  function setupDiagnosticFilters() {
    const filterContainer = document.getElementById('telemetry-severity-filters');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.tfilter-btn');
      if (!btn) return;

      filterContainer.querySelectorAll('.tfilter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const severity = btn.getAttribute('data-severity');
      const entries = document.querySelectorAll('.telemetry-log-list .telemetry-log-entry');

      entries.forEach(entry => {
        if (severity === 'all') {
          entry.style.display = 'block';
        } else {
          const entrySev = entry.getAttribute('data-severity') || (entry.classList.contains('status-ok') ? 'ok' : entry.classList.contains('status-warn') ? 'warn' : entry.classList.contains('status-alert') ? 'alert' : 'offline');
          entry.style.display = entrySev === severity ? 'block' : 'none';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initSimulator);
})();
