# SevaRoute (सेवारूट)

SevaRoute is a browser-based command-center prototype for regional health infrastructure and 108 emergency routing across the Gorakhpur and Jaunpur corridors of Uttar Pradesh.

It presents hospital capacity, ICU availability, oxygen reserves, ambulance routes, dispatch incidents, telemetry logs, and operational exports in a responsive static web interface.

The project is a demonstration system. It is not connected to live hospital, ambulance, sensor, ABDM, or ABHA services.

## What It Includes

### Executive Overview

[`index.html`](index.html) provides:

- Regional ICU, oxygen, specialist, and fleet KPIs
- Live alert ticker
- Explicit `DEMO TELEMETRY` data-source label
- Links to hospital, map, and telemetry workflows
- English/Hindi navigation and field-contrast mode

### Hospital Grid

[`hospitals.html`](hospitals.html) provides:

- Twelve registry-backed facility cards
- Gorakhpur and Jaunpur corridor filters
- Critical, warning, and stable status filters
- Debounced hospital search
- ICU, oxygen, specialist, and antivenom asset filters
- Detailed card view and matrix-table view
- Mobile matrix horizontal scrolling with a sticky facility column
- Empty-state feedback when no facilities match the filters

### GIS Command Map

[`map.html`](map.html) provides:

- Leaflet-based facility map
- Twelve facility markers
- Compact marker labels at regional zoom levels
- Full labels at closer zoom levels
- NH-31 and NH-28 demonstration corridors
- 108 ambulance marker
- Emergency dispatch queue
- Accessible facility availability list below the map
- Loading and tile-error states
- OpenStreetMap tiles with attribution

### Telemetry and Diagnostics

[`telemetry.html`](telemetry.html) provides:

- Liquid medical oxygen tank panels
- Oxygen level and pressure values
- ABDM-style diagnostic log entries
- Telemetry source and freshness state
- Severity filtering
- CSV, FHIR-style JSON, and print exports

## Architecture

The application uses plain HTML, CSS, and browser JavaScript. There is no framework, bundler, database, or backend service.

### Canonical Facility Registry

[`js/facilityRegistry.js`](js/facilityRegistry.js) is the single source of truth for the twelve facilities.

Each record contains:

- Stable facility ID
- District
- Display names
- Facility type
- Location and bed capacity
- ICU availability
- Oxygen reserve
- Specialist count
- Blood and antivenom stock
- ETA
- Latitude and longitude
- Short map label

The following features derive from this registry:

- Hospital cards
- Dispatch destinations
- Map markers
- Route points
- Facility filters
- Matrix rows
- CSV exports
- FHIR-style exports

Pipraich and Mobile Unit #04 coordinates are provisional and require confirmation from an authoritative NHM, hospital, or government GIS source.

### JavaScript Modules

| File | Responsibility |
| --- | --- |
| [`app.js`](js/app.js) | Application state, language, theme, clock, hotkeys, toast notifications, modal accessibility |
| [`facilityRegistry.js`](js/facilityRegistry.js) | Canonical twelve-facility dataset |
| [`dispatchEngine.js`](js/dispatchEngine.js) | Dispatch validation, ICU reservation demo, fleet availability, lifecycle, cancellation, reassignment, expiry |
| [`searchFilter.js`](js/searchFilter.js) | Hospital search, filters, card rendering, matrix rendering, view switching |
| [`mapInteractivity.js`](js/mapInteractivity.js) | Leaflet map, markers, corridors, map status, accessible facility list |
| [`telemetryAdapter.js`](js/telemetryAdapter.js) | Replaceable telemetry source boundary and freshness state |
| [`telemetrySim.js`](js/telemetrySim.js) | Local diagnostic-log simulator and demo telemetry status |
| [`exportEngine.js`](js/exportEngine.js) | CSV, FHIR-style JSON, and print exports |
| [`theme-init.js`](js/theme-init.js) | Early theme initialization to reduce flash of incorrect theme |

### CSS Modules

[`style.css`](style.css) is the stylesheet entry point and imports:

- [`css/base.css`](css/base.css): tokens, resets, typography, focus styles, animations
- [`css/components.css`](css/components.css): shell, navigation, cards, headers, responsive layouts
- [`css/map-matrix.css`](css/map-matrix.css): map, markers, filters, matrix table, incidents
- [`css/themes.css`](css/themes.css): modals, toasts, light theme, print rules

## Dispatch Workflow

The dispatch form validates:

- Caller name: minimum two characters
- Pickup location: minimum three characters
- ABHA ID: optional numeric value with format validation
- Ambulance type availability
- Destination facility selection

In demo mode, a successful dispatch:

1. Creates a dispatch ID.
2. Reserves one ICU bed locally.
3. Reserves one demo ambulance unit.
4. Stores the dispatch in browser storage.
5. Adds the incident to the map queue.
6. Starts in `Requested` state.
7. Allows `Accepted`, `En Route`, `Arrived`, and `Closed` transitions.
8. Supports cancellation and reservation rollback.
9. Supports reassignment to another facility with available ICU capacity.
10. Expires after fifteen minutes in the demo lifecycle.

This is not server authority. Multiple users or tabs can still disagree because there is no backend transaction system.

## Telemetry Behavior

Telemetry is simulated locally.

- Diagnostic entries are added periodically.
- The log list is capped at fifteen entries.
- ICU capacity does not change randomly.
- ICU changes occur through demo dispatch actions, keeping the overview KPI consistent with the registry.
- The adapter exposes source, last-sync time, and stale state for future REST, WebSocket, or event-stream integration.

## Exports

### CSV

Exports the current registry-backed facility state, including capacity, oxygen, staffing, stock, and ETA values.

### FHIR-style JSON

Exports a collection bundle containing `Location` resources and custom capacity extensions.

This is an internal FHIR-style export, not a certified ABDM exchange format. Official ABDM profiles, canonical URLs, terminology bindings, provenance, and integration credentials are still required.

### Print

Uses the browser print dialog for a PDF-style handover document.

## Themes, Language, and Accessibility

Persisted browser preferences include:

- `sevaroute_theme`
- `sevaroute_lang`
- `sevaroute_view`
- `sevaroute_dispatches`

Supported controls include:

- `Alt + S`: open or close SOS dispatch
- `Alt + T`: toggle field contrast
- `Alt + L`: toggle English/Hindi

Dialogs support keyboard activation, focus entry, focus trapping, Escape close, backdrop close, and focus restoration.

## Security and CSP

All live pages include a Content Security Policy covering:

- Same-origin application scripts
- Leaflet from `unpkg.com`
- Google Fonts
- OpenStreetMap tiles
- Cartographic image sources retained by the stylesheet policy

Dynamic user/data values are rendered with text nodes or escaped before HTML interpolation. The browser storage layer remains unsuitable for patient data or production dispatch records.

## Shared Components and Build Pipeline

Shared component references live in [`components/`](components/):

- `header.html`
- `footer.html`
- `navigation.html`
- `modals.html`
- `map-incidents.html`

The dependency-free assembler is [`scripts/assemble-pages.mjs`](scripts/assemble-pages.mjs). It expands markers such as:

```html
<!-- include:header.html -->
<!-- include:navigation.html -->
<!-- include:footer.html -->
```

The included smoke template is [`templates/page-shell.html`](templates/page-shell.html).

Build it with:

```bash
node scripts/assemble-pages.mjs templates dist
```

The current production-facing pages retain static copies for simple hosting. The assembler provides the migration path to eliminate markup duplication without adding a framework.

## Running Locally

### Requirements

- A modern browser
- Python 3 or Node.js
- Internet access for Leaflet, fonts, and OpenStreetMap tiles

### Python server

```bash
python3 -m http.server 3000
```

Open:

```text
http://localhost:3000/index.html
```

### Node server

```bash
npx serve .
```

Opening files directly may work for basic pages, but a local HTTP server is recommended for map tiles, CSP behavior, and template development.

## Production Requirements

Before real deployment, add:

- Authentication and role-based authorization
- Server-side ICU reservations with atomic transactions
- Multi-user dispatch synchronization
- Immutable audit history and status ownership
- Real hospital capacity APIs
- Ambulance fleet and GPS APIs
- Oxygen and sensor ingestion
- Approved ABDM/ABHA integration
- Official facility names and coordinates
- Server-side validation and persistence
- FHIR profile validation
- Operational monitoring and incident recovery

## Alignment

The prototype is designed around workflows associated with:

- National Health Mission, Uttar Pradesh
- Ayushman Bharat Digital Mission
- 108 National Ambulance Service
- Ministry of Health and Family Welfare

These references describe the intended domain alignment only. They do not indicate certification, government ownership, or live integration.

## License

MIT License © 2026 SevaRoute Contributors.
