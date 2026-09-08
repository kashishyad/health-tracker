/*
 * SevaRoute - Telemetry source boundary.
 * The simulator uses this today; an API/WebSocket adapter can replace it later.
 */
window.SevaRouteTelemetry = window.SevaRouteTelemetry || (function () {
  'use strict';

  const state = {
    source: 'simulator',
    lastSync: null,
    staleAfterMs: 30000,
    fetchSnapshot: null
  };

  function configure(options = {}) {
    if (options.source) state.source = options.source;
    if (typeof options.fetchSnapshot === 'function') state.fetchSnapshot = options.fetchSnapshot;
    if (Number.isFinite(options.staleAfterMs)) state.staleAfterMs = options.staleAfterMs;
  }

  function ingest() {
    state.lastSync = Date.now();
  }

  function getStatus() {
    const age = state.lastSync === null ? Infinity : Date.now() - state.lastSync;
    return {
      source: state.source,
      lastSync: state.lastSync,
      stale: age > state.staleAfterMs,
      ageMs: age
    };
  }

  return { configure, ingest, getStatus };
})();
