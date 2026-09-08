/**
 * SevaRoute — 108 Emergency SOS Dispatch Engine & Validation System
 * Path: js/dispatchEngine.js
 */

(function () {
  'use strict';

  const App = window.SevaRoute;
  const fleetAvailability = { als: 4, '4x4': 3, bls: 6, drone: 2 };

  function setupDispatchForm() {
    const dispatchForm = document.querySelector('.modal-dispatch-wrap form');
    const submitBtn = document.querySelector('.dispatch-submit-btn');

    populateDestinationOptions();
    populateAmbulanceOptions();

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

  function populateAmbulanceOptions() {
    const options = [
      ['als', 'Advanced Life Support (ALS)'],
      ['4x4', '4x4 Heavy Rural Terrain'],
      ['bls', 'Basic Life Support (BLS)'],
      ['drone', 'Medical Drone Express']
    ];

    document.querySelectorAll('#ambulance-type').forEach(select => {
      const currentValue = options.some(([value]) => value === select.value) ? select.value : 'als';
      select.replaceChildren();
      options.forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = `${label} (${fleetAvailability[value]} available)`;
        option.selected = value === currentValue;
        select.appendChild(option);
      });
    });
  }

  function populateDestinationOptions() {
    if (!App?.state?.facilities) return;

    document.querySelectorAll('#dest-hospital').forEach(select => {
      const currentId = select.value;
      const preferredId = App.state.facilities.some(facility => facility.id === currentId)
        ? currentId
        : 'hospital-jaunpur-shahganj';

      select.replaceChildren();
      App.state.facilities.forEach(facility => {
        const option = document.createElement('option');
        option.value = facility.id;
        option.textContent = `${facility.nameEn} (${facility.icuFree} ICU Free)`;
        option.selected = facility.id === preferredId;
        select.appendChild(option);
      });
    });
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

    if (!Object.prototype.hasOwnProperty.call(fleetAvailability, ambulanceType) || fleetAvailability[ambulanceType] < 1) {
      showInputError(document.getElementById('ambulance-type'), 'No units of this ambulance type are currently available');
      isValid = false;
    }

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

    fleetAvailability[ambulanceType] -= 1;

    // Generate unique Dispatch ID
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dispatchId = `DISP-2026-${randomHex}`;

    const targetFacility = App.state.facilities.find(f => f.id === destHospitalValue);

    // Lock ICU bed
    let bedLockMsg = '';
    let reservationStatus = 'overflow';
    if (targetFacility) {
      if (targetFacility.icuFree > 0) {
        targetFacility.icuFree -= 1;
        reservationStatus = 'reserved';
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
      status: 'requested',
      reservationStatus,
      owner: 'demo-operator',
      expiresAt: Date.now() + 15 * 60 * 1000,
      updatedAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    App.state.dispatchLogs.unshift(newDispatch);
    if (App.writeStoredJson) {
      App.writeStoredJson('sevaroute_dispatches', App.state.dispatchLogs);
    }

    // Append to live incident queue in DOM
    addIncidentToFeed(newDispatch);

    // Close Modal & Reset Input Fields
    const modalCheckbox = document.getElementById('modal-dispatch');
    if (modalCheckbox) modalCheckbox.click();

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
      reservationStatus === 'overflow' ? 'critical' : triageLevel === 'p1' ? 'critical' : 'success',
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
    item.dataset.dispatchId = dispatch.id;

    const top = document.createElement('div');
    top.className = 'inc-top';

    const priority = document.createElement('span');
    priority.className = `inc-priority-tag ${dispatch.triageLevel}`;
    priority.textContent = `${pTag} • ${dispatch.id}`;

    const time = document.createElement('span');
    time.className = 'inc-time text-mono-xs';
    time.textContent = 'Just Now';
    top.append(priority, time);

    const state = document.createElement('span');
    state.className = 'dispatch-state text-mono-xs';
    state.textContent = 'REQUESTED';
    top.appendChild(state);

    const description = document.createElement('p');
    description.className = 'inc-desc';
    description.textContent = `${dispatch.callerName} • ${dispatch.notes}`;

    const route = document.createElement('div');
    route.className = 'inc-route-info';

    const pickup = document.createElement('span');
    pickup.className = 'text-mono-xs';
    pickup.textContent = 'Pickup: ';
    const pickupValue = document.createElement('strong');
    pickupValue.textContent = dispatch.pickupLocation;
    pickup.appendChild(pickupValue);

    const destination = document.createElement('span');
    destination.className = 'inc-eta text-mono-xs';
    destination.textContent = `Dest: ${dispatch.destination}`;
    route.append(pickup, destination);

    const lifecycleButton = document.createElement('button');
    lifecycleButton.type = 'button';
    lifecycleButton.className = 'dispatch-status-action action-btn-sm';
    lifecycleButton.dataset.dispatchId = dispatch.id;
    lifecycleButton.textContent = 'Mark Accepted';
    route.appendChild(lifecycleButton);

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'dispatch-cancel-action action-btn-sm';
    cancelButton.dataset.dispatchId = dispatch.id;
    cancelButton.textContent = 'Cancel';
    route.appendChild(cancelButton);

    const reassignButton = document.createElement('button');
    reassignButton.type = 'button';
    reassignButton.className = 'dispatch-reassign-action action-btn-sm';
    reassignButton.dataset.dispatchId = dispatch.id;
    reassignButton.textContent = 'Reassign';
    route.appendChild(reassignButton);

    item.append(top, description, route);

    list.insertBefore(item, list.firstChild);
  }

  function advanceDispatchStatus(dispatchId, item) {
    const dispatch = App.state.dispatchLogs.find(entry => entry.id === dispatchId);
    if (!dispatch) return;

    const statuses = [
      ['requested', 'Mark Accepted', 'REQUESTED'],
      ['accepted', 'Mark En Route', 'ACCEPTED'],
      ['en-route', 'Mark Arrived', 'EN ROUTE'],
      ['arrived', 'Close Dispatch', 'ARRIVED'],
      ['closed', 'Closed', 'CLOSED']
    ];
    const currentIndex = statuses.findIndex(([status]) => status === dispatch.status);
    const next = statuses[Math.min(currentIndex + 1, statuses.length - 1)];
    dispatch.status = next[0];
    dispatch.updatedAt = new Date().toISOString();
    if (App.writeStoredJson) App.writeStoredJson('sevaroute_dispatches', App.state.dispatchLogs);

    item.querySelector('.dispatch-state').textContent = next[2];
    item.querySelector('.dispatch-status-action').textContent = next[1];
    item.querySelector('.dispatch-status-action').disabled = next[0] === 'closed';
    if (next[0] === 'closed') {
      item.querySelector('.dispatch-cancel-action')?.remove();
      item.querySelector('.dispatch-reassign-action')?.remove();
    }
  }

  function releaseReservation(dispatch) {
    if (dispatch.reservationStatus !== 'reserved' || dispatch.reservationReleased) return;
    const facility = App.state.facilities.find(item => item.nameEn === dispatch.destination);
    if (facility) facility.icuFree = Math.min(facility.icuTotal, facility.icuFree + 1);
    dispatch.reservationReleased = true;
    fleetAvailability[dispatch.ambulanceType] = (fleetAvailability[dispatch.ambulanceType] || 0) + 1;
  }

  function cancelDispatch(dispatchId, item) {
    const dispatch = App.state.dispatchLogs.find(entry => entry.id === dispatchId);
    if (!dispatch || dispatch.status === 'closed' || dispatch.status === 'cancelled') return;
    releaseReservation(dispatch);
    dispatch.status = 'cancelled';
    dispatch.updatedAt = new Date().toISOString();
    if (App.writeStoredJson) App.writeStoredJson('sevaroute_dispatches', App.state.dispatchLogs);
    item.querySelector('.dispatch-state').textContent = 'CANCELLED';
    item.querySelector('.dispatch-status-action').disabled = true;
    item.querySelector('.dispatch-cancel-action')?.remove();
    item.querySelector('.dispatch-reassign-action')?.remove();
  }

  function reassignDispatch(dispatchId, item) {
    const dispatch = App.state.dispatchLogs.find(entry => entry.id === dispatchId);
    const replacement = App.state.facilities.find(facility => facility.nameEn !== dispatch?.destination && facility.icuFree > 0);
    if (!dispatch || !replacement || dispatch.status === 'closed' || dispatch.status === 'cancelled') return;

    releaseReservation(dispatch);
    replacement.icuFree -= 1;
    dispatch.destination = replacement.nameEn;
    dispatch.reservationStatus = 'reserved';
    dispatch.reservationReleased = false;
    dispatch.status = 'accepted';
    dispatch.updatedAt = new Date().toISOString();
    if (App.writeStoredJson) App.writeStoredJson('sevaroute_dispatches', App.state.dispatchLogs);
    item.querySelector('.dispatch-state').textContent = 'ACCEPTED';
    item.querySelector('.inc-eta').textContent = `Dest: ${dispatch.destination}`;
  }

  function expireDispatches() {
    const now = Date.now();
    document.querySelectorAll('.incident-item[data-dispatch-id]').forEach(item => {
      const dispatch = App.state.dispatchLogs.find(entry => entry.id === item.dataset.dispatchId);
      if (dispatch && dispatch.expiresAt <= now && !['closed', 'cancelled'].includes(dispatch.status)) {
        cancelDispatch(dispatch.id, item);
        item.querySelector('.dispatch-state').textContent = 'EXPIRED';
      }
    });
  }

  function setupDispatchLifecycle() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('.dispatch-status-action');
      const item = event.target.closest('.incident-item');
      if (button && item) {
        advanceDispatchStatus(button.dataset.dispatchId, item);
        return;
      }
      const cancelButton = event.target.closest('.dispatch-cancel-action');
      if (cancelButton && item) {
        cancelDispatch(cancelButton.dataset.dispatchId, item);
        return;
      }
      const reassignButton = event.target.closest('.dispatch-reassign-action');
      if (reassignButton && item) reassignDispatch(reassignButton.dataset.dispatchId, item);
    });
    setInterval(expireDispatches, 30000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupDispatchForm();
    setupDispatchLifecycle();
  });

})();
