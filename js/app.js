/**
 * SevaRoute — Core Application State, i18n & Toast Engine
 * Path: js/app.js
 */

window.SevaRoute = window.SevaRoute || {};

(function () {
  'use strict';

  function readStoredJson(key, fallback) {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : fallback;
    } catch (error) {
      console.warn(`Unable to read stored value for ${key}:`, error);
      return fallback;
    }
  }

  function writeStoredJson(key, value) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Unable to store value for ${key}:`, error);
      return false;
    }
  }

  // State Store
  const state = {
    lang: localStorage.getItem('sevaroute_lang') || 'en', // 'en' | 'hi'
    viewMode: localStorage.getItem('sevaroute_view') || 'cards', // 'cards' | 'matrix'
    audioEnabled: localStorage.getItem('sevaroute_audio') === 'true',
    filterDistrict: 'all', // 'all' | 'gkp' | 'jaunpur'
    filterStatus: 'all',   // 'all' | 'critical' | 'warning' | 'stable'
    filterAsset: 'all',    // 'all' | 'icu_gt_5' | 'o2_gt_12' | 'surgeons' | 'antivenom'
    searchQuery: '',
    dispatchLogs: readStoredJson('sevaroute_dispatches', []),
    facilities: (window.SevaRouteFacilityRegistry || []).map(facility => ({ ...facility }))
  };

  // i18n Translations Dictionary (Official MoHFW / NHM UP Hindi Terminology)
  const translations = {
    en: {
      siteSubtitle: 'Rural Health Infrastructure & Emergency Transit Visualizer',
      fieldContrast: 'Field High-Contrast',
      telemetryLogBtn: 'Telemetry Log',
      emergencySosBtn: '108 EMERGENCY SOS',
      districtSector: 'District Sector:',
      allDistricts: 'All UP Districts (12 Facilities)',
      gkpSector: 'Gorakhpur Sector (6 Facilities)',
      jaunpurSector: 'Jaunpur District Sector (6 Facilities)',
      liveFeed: 'LIVE EMERGENCY DISPATCH FEED',
      allStatuses: 'All Statuses',
      criticalAlerts: 'Critical Alerts',
      cautionLowO2: 'Caution / Low O2',
      readyAvailable: 'Ready / Available',
      hospitalsTitle: 'Hospitals & Health Centers',
      matrixView: 'Compact Matrix View',
      cardsView: 'Detailed Cards View',
      searchPlaceholder: 'Search by facility, PIN, doctor, or asset (e.g. Antivenom, O-)...',
      allAssets: 'All Medical Assets',
      icuAvail5: 'ICU Beds > 5 Available',
      o2Avail12: 'Oxygen Supply > 12 Hours',
      surgeonsAvail: 'Active Specialists On Duty',
      antivenomAvail: 'Antivenom Stocked (> 5 Vials)',
      dispatchModalTitle: '108 Emergency Route Dispatch & Bed Lock',
      confirmDispatch: 'CONFIRM 108 DISPATCH & LOCK ICU BED',
      audioToggleOn: 'Audio Alarm: ON',
      audioToggleOff: 'Audio Alarm: OFF',
      telemetryTitle: 'UP East Telemetry & Sat-Link Diagnostics',
      dismissDiag: 'Dismiss Diagnostics',
      exportCsv: 'Export CSV Log',
      exportFhir: 'Export ABDM FHIR JSON',
      printPdf: 'Print PDF Handover',

      // Navigation
      navOverview: 'Executive Overview',
      navHospitals: 'Hospital Grid & Matrix',
      navMap: 'Emergency GIS Map',
      navTelemetry: 'Telemetry & Storage',

      // Vitals
      vitalCriticalBeds: 'Critical ICU Surge',
      vitalOxygenReserve: 'Oxygen Supply Reserve',
      vitalSpecialists: 'Specialist Surgeons On Duty',
      vitalFleetActive: '108 Emergency Fleet Active',

      // Form Labels
      patientNameLabel: 'Patient Name / Emergency Caller',
      triagePriorityLabel: 'Clinical Priority (Triage Category)',
      pickupLocationLabel: 'Pickup Village / GPS Landmark',
      destHospitalLabel: 'Destination Hospital Allocation',
      ambulanceTypeLabel: 'Ambulance Fleet Unit Type',
      abhaIdLabel: 'ABHA ID (Ayushman Bharat Health Account)',
      clinicalNotesLabel: 'Emergency Clinical Notes & Vital Telemetry'
    },
    hi: {
      siteSubtitle: 'ग्रामीण स्वास्थ्य अवसंरचना एवं 108 आपातकालीन प्रेषण कमान केंद्र',
      fieldContrast: 'उच्च-विषमता मोड (धूप हेतु)',
      telemetryLogBtn: 'टेलीमेट्री लॉग',
      emergencySosBtn: '108 आपातकालीन एसओएस प्रेषण',
      districtSector: 'जिला स्वास्थ्य कॉरिडोर:',
      allDistricts: 'समस्त यूपी जिले (12 चिकित्सा केंद्र)',
      gkpSector: 'गोरखपुर प्रभाग (6 चिकित्सा केंद्र)',
      jaunpurSector: 'जौनपुर जिला (6 चिकित्सा केंद्र)',
      liveFeed: 'लाइव 108 आपातकालीन प्रेषण धारा',
      allStatuses: 'समस्त स्थितियां',
      criticalAlerts: 'अति-गंभीर आपातकाल (Critical)',
      cautionLowO2: 'सचेत / कम ऑक्सीजन (Warning)',
      readyAvailable: 'उपलब्ध एवं सुरक्षित (Stable)',
      hospitalsTitle: 'अस्पताल एवं सामुदायिक स्वास्थ्य केंद्र',
      matrixView: 'नियंत्रण कक्ष तालिका',
      cardsView: 'विस्तृत ग्रिड दृश्य',
      searchPlaceholder: 'अस्पताल, डॉक्टर, जिला या चिकित्सा संसाधन खोजें (उदा: एंटीवेनम, आईसीयू)...',
      allAssets: 'समस्त चिकित्सा संसाधन',
      icuAvail5: 'आईसीयू बेड उपलब्ध (> 5)',
      o2Avail12: 'ऑक्सीजन बैकअप (> 12 घंटे)',
      surgeonsAvail: 'ड्यूटी पर विशेषज्ञ शल्य चिकित्सक',
      antivenomAvail: 'एंटीवेनम सर्पदंश औषधि स्टॉक (> 5 शीशियां)',
      dispatchModalTitle: '108 आपातकालीन एम्बुलेंस प्रेषण एवं आईसीयू बेड आरक्षण',
      confirmDispatch: '108 प्रेषण की पुष्टि करें एवं आईसीयू बेड आरक्षित करें',
      audioToggleOn: 'ध्वनि चेतावनी: चालू',
      audioToggleOff: 'ध्वनि चेतावनी: बंद',
      telemetryTitle: 'पूर्वी यूपी उपग्रह टेलीमेट्री एवं कोल्ड-चेन निदान',
      dismissDiag: 'निदान बिंदु बंद करें',
      exportCsv: 'सीएसवी डेटा डाउनलोड',
      exportFhir: 'आयुष्मान भारत FHIR JSON डाउनलोड',
      printPdf: 'पीडीएफ प्रिंट प्रतिवेदन',

      // Navigation
      navOverview: 'कार्यकारी अवलोकन',
      navHospitals: 'अस्पताल ग्रिड व तालिका',
      navMap: 'आपातकालीन जीआईएस मानचित्र',
      navTelemetry: 'टेलीमेट्री व ऑक्सीजन भंडारण',

      // Vitals
      vitalCriticalBeds: 'अति-गंभीर आईसीयू दबाव',
      vitalOxygenReserve: 'ऑक्सीजन आपूर्ति भंडार',
      vitalSpecialists: 'ड्यूटी पर विशेषज्ञ शल्य चिकित्सक',
      vitalFleetActive: '108 सक्रिय आपातकालीन बेड़ा',

      // Form Labels
      patientNameLabel: 'रोगी का नाम / आपातकालीन कॉलर',
      triagePriorityLabel: 'चिकित्सकीय प्राथमिकता (ट्राएज श्रेणी)',
      pickupLocationLabel: 'पिकअप ग्राम / जीपीएस लैंडमार्क',
      destHospitalLabel: 'आवंटित गंतव्य अस्पताल',
      ambulanceTypeLabel: 'एम्बुलेंस बेड़ा इकाई प्रकार',
      abhaIdLabel: 'आभा आईडी (आयुष्मान भारत स्वास्थ्य खाता)',
      clinicalNotesLabel: 'आपातकालीन नैदानिक टिप्पणियां व वाइटल्स'
    }
  };

  // Toast System
  function showToast(title, message, type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-card toast-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : type === 'critical' ? '🚨' : 'ℹ️';

    const iconEl = document.createElement('div');
    iconEl.className = 'toast-icon';
    iconEl.textContent = icon;

    const contentEl = document.createElement('div');
    contentEl.className = 'toast-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;

    const messageEl = document.createElement('div');
    messageEl.className = 'toast-msg';
    messageEl.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close toast');
    closeButton.textContent = '×';

    contentEl.append(titleEl, messageEl);
    toast.append(iconEl, contentEl, closeButton);

    closeButton.onclick = () => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    };

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  // Audio Synth Engine for Emergency Alerts
  function playEmergencyChime(type = 'critical') {
    if (!state.audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type === 'critical' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(type === 'critical' ? 880 : 587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(type === 'critical' ? 440 : 880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio playback restricted:', e);
    }
  }

  // i18n Switcher Implementation (Translates 100% of UI Text)
  function setLanguage(lang) {
    state.lang = lang;
    writeStoredJson('sevaroute_lang', lang);
    document.documentElement.lang = lang;
    
    const dict = translations[lang] || translations.en;

    // 1. Translate all static data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // 2. Translate facility card names and sub-labels
    state.facilities.forEach(fac => {
      const card = document.getElementById(fac.id);
      if (card) {
        const nameEl = card.querySelector('.h-name');
        if (nameEl) {
          nameEl.textContent = lang === 'hi' ? fac.nameHi : fac.nameEn;
        }

        // Translate status badges without replacing the status indicator dot.
        const surgeBadge = card.querySelector('.h-status-badge');
        if (surgeBadge) {
          const statusDot = surgeBadge.querySelector('.live-pulse-dot');
          if (fac.status === 'critical') {
            surgeBadge.replaceChildren(statusDot, document.createTextNode(lang === 'hi' ? `अति-गंभीर दबाव (${Math.round((1 - fac.icuFree/fac.icuTotal)*100)}% फुल)` : `CRITICAL SURGE (${Math.round((1 - fac.icuFree/fac.icuTotal)*100)}% FULL)`));
          } else if (fac.status === 'stable') {
            surgeBadge.replaceChildren(statusDot, document.createTextNode(lang === 'hi' ? `सुरक्षित स्थिति (${Math.round((1 - fac.icuFree/fac.icuTotal)*100)}% फुल)` : `STABLE (${Math.round((1 - fac.icuFree/fac.icuTotal)*100)}% FULL)`));
          } else {
            surgeBadge.replaceChildren(statusDot, document.createTextNode(lang === 'hi' ? `सचेत स्थिति (${Math.round((1 - fac.icuFree/fac.icuTotal)*100)}% फुल)` : `CAUTION ALERT (${Math.round((1 - fac.icuFree/fac.icuTotal)*100)}% FULL)`));
          }
        }
      }
    });

    // 3. Translate Card Metric Labels (.h-metric-label)
    document.querySelectorAll('.h-metric-label').forEach(labelEl => {
      const text = labelEl.textContent.trim();
      if (text.includes('ICU Beds') || text.includes('आईसीयू')) {
        labelEl.innerHTML = lang === 'hi' ? `<span>आईसीयू बेड</span><span>निःशुल्क/कुल</span>` : `<span>ICU Beds</span><span>Free / Total</span>`;
      } else if (text.includes('O2 Supply') || text.includes('ऑक्सीजन')) {
        labelEl.innerHTML = lang === 'hi' ? `<span>ऑक्सीजन आपूर्ति</span><span>घंटे शेष</span>` : `<span>O2 Supply</span><span>Hours Remaining</span>`;
      } else if (text.includes('Blood Bank') || text.includes('रक्त बैंक')) {
        labelEl.innerHTML = lang === 'hi' ? `<span>रक्त बैंक</span><span>यूनिट्स O-</span>` : `<span>Blood Bank</span><span>Units O-</span>`;
      } else if (text.includes('Antivenom') || text.includes('एंटीवेनम')) {
        labelEl.innerHTML = lang === 'hi' ? `<span>एंटीवेनम स्टॉक</span><span>शीशियां उपलब्ध</span>` : `<span>Antivenom Stock</span><span>Vials Available</span>`;
      }
    });

    // 4. Translate Navigation Page Links (Strict Scope)
    const navLinks = [
      { href: 'index.html', en: 'Executive Overview', hi: 'कार्यकारी अवलोकन' },
      { href: 'hospitals.html', en: 'Hospital Grid & Matrix', hi: 'अस्पताल ग्रिड व तालिका' },
      { href: 'map.html', en: 'Emergency GIS Map', hi: 'आपातकालीन जीआईएस मानचित्र' },
      { href: 'telemetry.html', en: 'Telemetry & Storage', hi: 'टेलीमेट्री व ऑक्सीजन भंडारण' }
    ];

    navLinks.forEach(item => {
      document.querySelectorAll(`.main-page-nav a[href="${item.href}"]`).forEach(link => {
        const labelNode = [...link.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (labelNode) labelNode.textContent = ` ${lang === 'hi' ? item.hi : item.en}`;
      });
    });

    document.querySelectorAll('.contrast-toggle-label').forEach(el => { el.textContent = dict.fieldContrast; });
    document.querySelectorAll('.sos-call-btn').forEach(el => { el.textContent = dict.emergencySosBtn; });

    const formLabels = {
      'caller-name': 'patientNameLabel',
      'triage-level': 'triagePriorityLabel',
      'pickup-village': 'pickupLocationLabel',
      'dest-hospital': 'destHospitalLabel',
      'ambulance-type': 'ambulanceTypeLabel',
      'abha-id': 'abhaIdLabel',
      'clinical-notes': 'clinicalNotesLabel'
    };
    Object.entries(formLabels).forEach(([fieldId, key]) => {
      const field = document.getElementById(fieldId);
      const label = field ? document.querySelector(`label[for="${fieldId}"]`) : null;
      if (label && dict[key]) label.textContent = dict[key];
    });

    // 5. Update Language Toggle Button Visual
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="nav-icon"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> ${lang === 'en' ? 'English' : 'हिंदी'}`;
    }
  }

  function toggleLanguage() {
    setLanguage(state.lang === 'en' ? 'hi' : 'en');
    showToast(
      state.lang === 'en' ? 'Language Changed' : 'भाषा बदली गई',
      state.lang === 'en' ? 'Interface switched to English' : 'इंटरफ़ेस अब हिंदी में प्रदर्शित हो रहा है',
      'info'
    );
  }

  // Accessible Modal Keyboard Trapping & Escape listener
  function setupModalAccessibility() {
    let lastFocusedElement = null;

    document.querySelectorAll('label[for]').forEach(label => {
      label.setAttribute('role', 'button');
      label.tabIndex = 0;
      label.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        label.click();
      });
    });

    const modalIds = ['modal-dispatch', 'modal-telemetry'];
    modalIds.forEach(id => {
      const checkbox = document.getElementById(id);
      const backdropClass = id === 'modal-dispatch' ? '.modal-dispatch-wrap' : '.modal-telemetry-wrap';
      const backdrop = document.querySelector(backdropClass);
      if (!checkbox || !backdrop) return;

      backdrop.setAttribute('aria-hidden', checkbox.checked ? 'false' : 'true');
      checkbox.addEventListener('change', () => {
        const isOpen = checkbox.checked;
        backdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

        if (isOpen) {
          lastFocusedElement = document.activeElement;
          requestAnimationFrame(() => backdrop.querySelector('.modal-close-btn, input, select, textarea, button')?.focus());
        } else if (lastFocusedElement instanceof HTMLElement) {
          lastFocusedElement.focus();
        }
      });

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) checkbox.click();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modalDispatch = document.getElementById('modal-dispatch');
        const modalTelemetry = document.getElementById('modal-telemetry');
        if (modalDispatch?.checked) modalDispatch.click();
        if (modalTelemetry?.checked) modalTelemetry.click();
      }

      if (e.key === 'Tab') {
        const activeModal = document.querySelector('.modal-backdrop[aria-hidden="false"]');
        if (!activeModal) return;

        const focusable = [...activeModal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')]
          .filter(element => !element.disabled && element.offsetParent !== null);
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // Main View Tab Switcher
  function setMainTab(tabName) {
    state.mainTab = tabName;
    writeStoredJson('sevaroute_maintab', tabName);
    document.body.setAttribute('data-main-tab', tabName);

    document.querySelectorAll('.main-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  // Theme Persistence Engine (Light / Dark Mode Sync)
  function initThemePersistence() {
    const contrastToggle = document.getElementById('toggle-emergency-contrast');
    const savedTheme = localStorage.getItem('sevaroute_theme');

    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme-active');
      if (contrastToggle) contrastToggle.checked = true;
    } else {
      document.documentElement.classList.remove('light-theme-active');
      if (contrastToggle) contrastToggle.checked = false;
    }

    if (contrastToggle) {
      contrastToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          document.documentElement.classList.add('light-theme-active');
          writeStoredJson('sevaroute_theme', 'light');
        } else {
          document.documentElement.classList.remove('light-theme-active');
          writeStoredJson('sevaroute_theme', 'dark');
        }
      });
    }
  }

  // Live Real-Time Topbar Clock Ticker (12-Hour AM/PM Format)
  function initLiveClock() {
    function updateClock() {
      const clockEl = document.querySelector('.live-clock-text');
      if (clockEl) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', { hour12: true });
        clockEl.textContent = `${timeStr} IST`;
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Keyboard Hotkeys (Alt+S: SOS Dispatch, Alt+T: Contrast, Alt+L: Lang)
  function setupEmergencyHotkeys() {
    document.addEventListener('keydown', (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          const modalDispatch = document.getElementById('modal-dispatch');
          if (modalDispatch) {
            modalDispatch.checked = !modalDispatch.checked;
            showToast('Hotkey Alt+S', modalDispatch.checked ? '108 SOS Dispatch Modal Opened' : 'Modal Closed', 'info');
          }
        } else if (key === 't') {
          e.preventDefault();
          const contrastToggle = document.getElementById('toggle-emergency-contrast');
          if (contrastToggle) {
            contrastToggle.checked = !contrastToggle.checked;
            contrastToggle.dispatchEvent(new Event('change'));
            showToast('Hotkey Alt+T', 'Theme Toggled', 'info');
          }
        } else if (key === 'l') {
          e.preventDefault();
          toggleLanguage();
        }
      }
    });
  }

  // Export module to global scope
  window.SevaRoute.state = state;
  window.SevaRoute.writeStoredJson = writeStoredJson;
  window.SevaRoute.showToast = showToast;
  window.SevaRoute.playEmergencyChime = playEmergencyChime;
  window.SevaRoute.setLanguage = setLanguage;
  window.SevaRoute.toggleLanguage = toggleLanguage;
  window.SevaRoute.setMainTab = setMainTab;
  window.SevaRoute.initThemePersistence = initThemePersistence;

  document.addEventListener('DOMContentLoaded', () => {
    initThemePersistence();
    initLiveClock();
    setupEmergencyHotkeys();
    document.getElementById('btn-lang-toggle')?.addEventListener('click', toggleLanguage);
    setLanguage(state.lang);
    setupModalAccessibility();
    const savedTab = localStorage.getItem('sevaroute_maintab') || 'all';
    setMainTab(savedTab);
  });

})();
