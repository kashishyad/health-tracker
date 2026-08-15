/**
 * SevaRoute — 108 Emergency SOS Dispatch Engine & Validation System
 * Path: js/dispatchEngine.js
 */

(function () {
  'use strict';

  const App = window.SevaRoute;

  function setupDispatchForm() {
    const dispatchForm = document.querySelector('.modal-dispatch-wrap form');
    const submitBtn = document.querySelector('.dispatch-submit-btn');

    if (submitBtn) {
      submitBtn.addEventListener('click', handleDispatchSubmit);
    }

    if (dispatchForm) {
      dispatchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleDispatchSubmit();
      });
    }

    setupInputValidationListeners();
  }

  function setupInputValidationListeners() {
    ['caller-name', 'pickup-village', 'abha-id'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          el.classList.remove('input-error');
          const errText = el.parentNode.querySelector('.form-error-msg');
          if (errText) errText.remove();
        });
      }
    });
  }

  function clearInputErrors() {
    document.querySelectorAll('.modal-dispatch-wrap .input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.modal-dispatch-wrap .form-error-msg').forEach(msg => msg.remove());
  }

  function showInputError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('input-error');
    inputEl.focus();

    const parent = inputEl.parentNode;
    if (parent) {
      let errMsg = parent.querySelector('.form-error-msg');
      if (!errMsg) {
        errMsg = document.createElement('span');
        errMsg.className = 'form-error-msg';
        parent.appendChild(errMsg);
      }
      errMsg.textContent = message;
    }
  }

  function handleDispatchSubmit() {
    clearInputErrors();

    const callerInput = document.getElementById('caller-name');
    const pickupInput = document.getElementById('pickup-village');
    const abhaInput = document.getElementById('abha-id');
    const destHospitalInput = document.getElementById('dest-hospital');

    const callerName = callerInput?.value.trim() || '';
    const triageLevel = document.getElementById('triage-level')?.value || 'p1';
    const pickupLocation = pickupInput?.value.trim() || '';
    const destHospitalValue = destHospitalInput?.value || 'sdh-shahganj';
    const ambulanceType = document.getElementById('ambulance-type')?.value || 'als';
    const abhaId = abhaInput?.value.trim() || '';
    const clinicalNotes = document.getElementById('clinical-notes')?.value.trim() || 'Emergency transfer requested';

    let isValid = true;

    // 1. Patient / Caller Name Validation
    if (!callerName || callerName.length < 2) {
      showInputError(callerInput, 'Please enter a valid Patient / Caller Name (at least 2 characters)');
      isValid = false;
    }

    // 2. Pickup Village / Location Validation
    if (!pickupLocation || pickupLocation.length < 3) {
      showInputError(pickupInput, 'Please enter a valid Pickup Village / Landmark (at least 3 characters)');
      isValid = false;
    }

    // 3. ABHA ID Format Validation (Optional field, but validate format if entered)
    if (abhaId.length > 0) {
      const cleanAbha = abhaId.replace(/[\s-]/g, '');
      if (cleanAbha.length < 10 || !/^\d+$/.test(cleanAbha)) {
        showInputError(abhaInput, 'ABHA ID must contain at least 10-14 numeric digits');
        isValid = false;
      }
    }

    if (!isValid) {
      if (App && App.showToast) {
        App.showToast('Validation Failed', 'Please fill required patient & pickup location fields', 'warning');
      }
      return;
    }

    // Generate unique Dispatch ID
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dispatchId = `DISP-2026-${randomHex}`;

    // Map destination hospital option value to facility ID
    const hospitalMap = {
      'sdh-shahganj': 'hospital-jaunpur-shahganj',
      'dch-jaunpur': 'hospital-jaunpur-civil',
      'sdh-machhlishahr': 'hospital-jaunpur-machhlishahr',
      'chc-mariahu': 'hospital-jaunpur-mariahu',
      'sdh-bansgaon': 'hospital-sdh-bansgaon',
      'dch-gkp': 'hospital-dch-central'
    };

    const targetFacilityId = hospitalMap[destHospitalValue] || 'hospital-jaunpur-shahganj';
    const targetFacility = App.state.facilities.find(f => f.id === targetFacilityId);

    // Lock ICU bed
    let bedLockMsg = '';
    if (targetFacility) {
      if (targetFacility.icuFree > 0) {
        targetFacility.icuFree -= 1;
        bedLockMsg = `1 ICU Bed Locked at ${targetFacility.nameEn}. (${targetFacility.icuFree} Free Remaining)`;

        const card = document.getElementById(targetFacility.id);
        if (card) {
          const valEl = card.querySelector('.h-metric-val');
          if (valEl) valEl.textContent = targetFacility.icuFree;
        }
      } else {
        bedLockMsg = `WARNING: ${targetFacility.nameEn} ICU at 100% surge! Emergency overflow bed assigned.`;
      }
    }

    // Save dispatch object
    const newDispatch = {
      id: dispatchId,
      callerName,
      triageLevel,
      pickupLocation,
      destination: targetFacility ? targetFacility.nameEn : destHospitalValue,
      ambulanceType,
      abhaId: abhaId || 'N/A',
      notes: clinicalNotes,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    App.state.dispatchLogs.unshift(newDispatch);
    localStorage.setItem('sevaroute_dispatches', JSON.stringify(App.state.dispatchLogs));

    // Append to live incident queue in DOM
    addIncidentToFeed(newDispatch);

    // Close Modal & Reset Input Fields
    const modalCheckbox = document.getElementById('modal-dispatch');
    if (modalCheckbox) modalCheckbox.checked = false;

    if (callerInput) callerInput.value = '';
    if (pickupInput) pickupInput.value = '';
    if (abhaInput) abhaInput.value = '';
    const notesInput = document.getElementById('clinical-notes');
    if (notesInput) notesInput.value = '';

    // Trigger Audio Alert & Toast
    App.playEmergencyChime(triageLevel === 'p1' ? 'critical' : 'warning');
    App.showToast(
      `108 DISPATCH CONFIRMED [${dispatchId}]`,
      `${bedLockMsg} • Pickup: ${pickupLocation}`,
      triageLevel === 'p1' ? 'critical' : 'success',
      6000
    );
  }

  function addIncidentToFeed(dispatch) {
    const list = document.querySelector('.incidents-list');
    if (!list) return;

    const pClass = dispatch.triageLevel === 'p1' ? 'p1-critical' : 'p2-warning';
    const pTag = dispatch.triageLevel === 'p1' ? 'P1 CRITICAL' : 'P2 URGENT';

    const item = document.createElement('div');
    item.className = `incident-item ${pClass}`;
    item.innerHTML = `
      <div class="inc-top">
        <span class="inc-priority-tag ${dispatch.triageLevel}">${pTag} • ${dispatch.id}</span>
        <span class="inc-time text-mono-xs">Just Now</span>
      </div>
      <p class="inc-desc">${dispatch.callerName} • ${dispatch.notes}</p>
      <div class="inc-route-info">
        <span class="text-mono-xs">Pickup: <strong>${dispatch.pickupLocation}</strong></span>
        <span class="inc-eta text-mono-xs">Dest: ${dispatch.destination}</span>
      </div>
    `;

    list.insertBefore(item, list.firstChild);
  }

  document.addEventListener('DOMContentLoaded', setupDispatchForm);

})();
