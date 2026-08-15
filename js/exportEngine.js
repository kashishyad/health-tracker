/**
 * SevaRoute — Diagnostic & Dispatch Log Export Engine (CSV, FHIR JSON, PDF)
 * Path: js/exportEngine.js
 */

(function () {
  'use strict';

  const App = window.SevaRoute;

  function initExporter() {
    const btnCsv = document.getElementById('btn-export-csv');
    const btnFhir = document.getElementById('btn-export-fhir');
    const btnPdf = document.getElementById('btn-export-pdf');

    if (btnCsv) btnCsv.addEventListener('click', exportCSV);
    if (btnFhir) btnFhir.addEventListener('click', exportFHIRJSON);
    if (btnPdf) btnPdf.addEventListener('click', printPDF);
  }

  function exportCSV() {
    if (!App || !App.state || !App.state.facilities) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Facility ID,District,Name,Status,ICU Free,ICU Total,O2 Hours Left,O2 Pct,Surgeons,Blood Units O-,Antivenom Vials,ETA Min\n';

    App.state.facilities.forEach(f => {
      const row = `"${f.id}","${f.district}","${f.nameEn}","${f.status}",${f.icuFree},${f.icuTotal},${f.o2Hrs},${f.o2Pct},${f.surgeons},${f.bloodUnits},${f.antivenom},${f.etaMin}`;
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sevaroute_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (App.showToast) {
      App.showToast('Export Complete', 'Telemetry dataset exported to CSV', 'success');
    }
  }

  function exportFHIRJSON() {
    if (!App || !App.state || !App.state.facilities) return;

    const fhirBundle = {
      resourceType: 'Bundle',
      id: `sevaroute-abdm-export-${Date.now()}`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: App.state.facilities.map(f => ({
        resource: {
          resourceType: 'Location',
          id: f.id,
          name: f.nameEn,
          status: f.status === 'critical' ? 'suspended' : 'active',
          extension: [
            { url: 'https://abdm.gov.in/fhir/StructureDefinition/icu-beds-available', valueInteger: f.icuFree },
            { url: 'https://abdm.gov.in/fhir/StructureDefinition/oxygen-hours-remaining', valueDecimal: f.o2Hrs },
            { url: 'https://abdm.gov.in/fhir/StructureDefinition/active-surgeons', valueInteger: f.surgeons },
            { url: 'https://abdm.gov.in/fhir/StructureDefinition/antivenom-vials', valueInteger: f.antivenom }
          ]
        }
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fhirBundle, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `abdm_fhir_telemetry_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (App.showToast) {
      App.showToast('ABDM FHIR Export', 'FHIR JSON Bundle exported successfully', 'success');
    }
  }

  function printPDF() {
    window.print();
  }

  document.addEventListener('DOMContentLoaded', initExporter);
})();
