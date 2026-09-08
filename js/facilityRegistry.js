/*
 * SevaRoute - Canonical facility registry.
 * Every UI surface derives facility identity and operational data from this list.
 */
window.SevaRouteFacilityRegistry = [
  {
    id: 'hospital-jaunpur-civil', district: 'jaunpur', status: 'critical',
    nameEn: 'Pt. Deendayal Upadhyay District Hospital (Jaunpur Civil)',
    nameHi: 'पं. दीनदयाल उपाध्याय जिला अस्पताल (जौनपुर सिविल)',
    typeEn: 'District Civil Hospital', location: 'Line Bazar, Jaunpur', beds: 250,
    icuFree: 3, icuTotal: 48, o2Hrs: 5.1, o2Pct: 22, surgeons: 5, bloodUnits: 2, antivenom: 5, etaMin: 6,
    lat: 25.7464, lng: 82.6837, shortName: 'Jaunpur Civil'
  },
  {
    id: 'hospital-jaunpur-shahganj', district: 'jaunpur', status: 'stable',
    nameEn: 'Sub-District Hospital (Shahganj Division, Jaunpur)',
    nameHi: 'उप-जिला अस्पताल (शाहगंज प्रभाग, जौनपुर)',
    typeEn: 'Sub-District Hospital', location: 'Shahganj Junction', beds: 120,
    icuFree: 14, icuTotal: 28, o2Hrs: 40, o2Pct: 88, surgeons: 5, bloodUnits: 9, antivenom: 12, etaMin: 19,
    lat: 26.0526, lng: 82.6908, shortName: 'Shahganj SDH'
  },
  {
    id: 'hospital-jaunpur-mariahu', district: 'jaunpur', status: 'warning',
    nameEn: 'Community Health Center (Mariahu CHC - FRU)',
    nameHi: 'सामुदायिक स्वास्थ्य केंद्र (मडियाहूँ सीएचसी)',
    typeEn: 'Community Health Center', location: 'Mariahu, Jaunpur', beds: 80,
    icuFree: 3, icuTotal: 16, o2Hrs: 8.2, o2Pct: 28, surgeons: 2, bloodUnits: 1, antivenom: 4, etaMin: 24,
    lat: 25.56, lng: 82.57, shortName: 'Mariahu CHC'
  },
  {
    id: 'hospital-jaunpur-machhlishahr', district: 'jaunpur', status: 'stable',
    nameEn: 'Machhlishahr Sub-Divisional Hospital (Jaunpur)',
    nameHi: 'मछलीशहर उप-विभागीय अस्पताल (जौनपुर)',
    typeEn: 'Sub-District Hospital', location: 'Machhlishahr, Jaunpur', beds: 100,
    icuFree: 11, icuTotal: 20, o2Hrs: 34, o2Pct: 80, surgeons: 4, bloodUnits: 5, antivenom: 10, etaMin: 26,
    lat: 25.68, lng: 82.42, shortName: 'Machhlishahr SDH'
  },
  {
    id: 'hospital-jaunpur-baksha', district: 'jaunpur', status: 'critical',
    nameEn: 'Gram Health & Wellness Center (Baksha PHC, Gomti Basin)',
    nameHi: 'ग्राम स्वास्थ्य एवं कल्याण केंद्र (बक्शा प्राथमिक स्वास्थ्य केंद्र)',
    typeEn: 'Primary Health Center', location: 'Baksha PHC, Gomti Basin', beds: 40,
    icuFree: 1, icuTotal: 8, o2Hrs: 4.8, o2Pct: 20, surgeons: 1, bloodUnits: 0, antivenom: 1, etaMin: 31,
    lat: 25.82, lng: 82.55, shortName: 'Baksha PHC'
  },
  {
    id: 'hospital-jaunpur-kerakat', district: 'jaunpur', status: 'warning',
    nameEn: 'Community Health Center (Kerakat CHC, Jaunpur)',
    nameHi: 'सामुदायिक स्वास्थ्य केंद्र (केराकत सीएचसी, जौनपुर)',
    typeEn: 'Community Health Center', location: 'Kerakat, Jaunpur', beds: 80,
    icuFree: 4, icuTotal: 16, o2Hrs: 18, o2Pct: 60, surgeons: 3, bloodUnits: 2, antivenom: 6, etaMin: 21,
    lat: 25.63, lng: 82.92, shortName: 'Kerakat CHC'
  },
  {
    id: 'hospital-dch-central', district: 'gkp', status: 'critical',
    nameEn: 'District Civil Hospital (Gorakhpur Central)',
    nameHi: 'जिला सिविल अस्पताल (गोरखपुर सेंट्रल)',
    typeEn: 'District Civil Hospital', location: 'Civil Lines, Gorakhpur', beds: 300,
    icuFree: 4, icuTotal: 64, o2Hrs: 4.2, o2Pct: 18, surgeons: 4, bloodUnits: 1, antivenom: 8, etaMin: 8,
    lat: 26.7606, lng: 83.3732, shortName: 'Gorakhpur Civil'
  },
  {
    id: 'hospital-sdh-bansgaon', district: 'gkp', status: 'stable',
    nameEn: 'Sub-District Civil Hospital (Bansgaon Division)',
    nameHi: 'उप-जिला सिविल अस्पताल (बांसगांव प्रभाग)',
    typeEn: 'Sub-District Hospital', location: 'Bansgaon Division', beds: 140,
    icuFree: 18, icuTotal: 32, o2Hrs: 38.5, o2Pct: 85, surgeons: 6, bloodUnits: 8, antivenom: 15, etaMin: 22,
    lat: 26.51, lng: 83.35, shortName: 'Bansgaon SDH'
  },
  {
    id: 'hospital-chc-sahjanwa', district: 'gkp', status: 'warning',
    nameEn: 'Community Health Center (Sahjanwa CHC)',
    nameHi: 'सामुदायिक स्वास्थ्य केंद्र (सहजनवा सीएचसी)',
    typeEn: 'Community Health Center', location: 'Sahjanwa, Gorakhpur', beds: 80,
    icuFree: 4, icuTotal: 16, o2Hrs: 9.8, o2Pct: 32, surgeons: 2, bloodUnits: 0, antivenom: 3, etaMin: 17,
    lat: 26.74, lng: 83.18, shortName: 'Sahjanwa CHC'
  },
  {
    id: 'hospital-phc-kusumhi', district: 'gkp', status: 'critical',
    nameEn: 'Tribal Health & Wellness Center (Kusumhi Gram PHC)',
    nameHi: 'जनजातीय स्वास्थ्य केंद्र (कुसुम्ही ग्राम पीएचसी)',
    typeEn: 'Primary Health Center', location: 'Kusumhi Gram, Gorakhpur', beds: 40,
    icuFree: 1, icuTotal: 8, o2Hrs: 5.5, o2Pct: 22, surgeons: 1, bloodUnits: 0, antivenom: 2, etaMin: 34,
    lat: 26.74, lng: 83.49, shortName: 'Kusumhi PHC'
  },
  {
    id: 'hospital-sdh-pipraich', district: 'gkp', status: 'stable',
    nameEn: 'Taluka Civil Hospital (Pipraich Sub-Center)',
    nameHi: 'तालुका सिविल अस्पताल (पिपराइच उप-केंद्र)',
    typeEn: 'Sub-District Hospital', location: 'Pipraich Sub-Center', beds: 100,
    icuFree: 12, icuTotal: 20, o2Hrs: 42, o2Pct: 92, surgeons: 4, bloodUnits: 6, antivenom: 14, etaMin: 28,
    lat: 26.83, lng: 83.53, shortName: 'Pipraich Sub-Center'
  },
  {
    id: 'hospital-mobile-04', district: 'gkp', status: 'warning',
    nameEn: 'Mobile Emergency Container Unit #04 (Riverine Belt)',
    nameHi: 'मोबाइल इमरजेंसी कंटेनर यूनिट #04 (राप्ती नदी क्षेत्र)',
    typeEn: 'Mobile Emergency Unit', location: 'Rapti Riverine Belt', beds: 30,
    icuFree: 3, icuTotal: 6, o2Hrs: 16, o2Pct: 96, surgeons: 1, bloodUnits: 2, antivenom: 5, etaMin: 12,
    lat: 26.67, lng: 83.62, shortName: 'Mobile Unit #04'
  }
];
