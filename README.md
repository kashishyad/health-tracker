# 🚑 SevaRoute (सेवारूट) — Rural Health Infrastructure & 108 Emergency Command Visualizer

**SevaRoute (सेवारूट)** is a high-performance, real-time regional health infrastructure tracker and 108 emergency routing command visualizer built for Eastern Uttar Pradesh (**Gorakhpur & Jaunpur Health Corridors**). Aligned with the **National Health Mission (NHM UP)**, **Ayushman Bharat Digital Mission (ABDM)**, and the **108 National Ambulance Service**.

---

## 🌟 Key Architectural Features

### 1. 🗺️ Authentic Leaflet GIS Command Map
- Built with **Leaflet.js 1.9.4** over high-resolution **CartoDB Dark Matter GIS tiles**.
- Geographically accurate latitude/longitude coordinates for **12 monitored facilities** in Eastern UP (Gorakhpur Central, Shahganj, Jaunpur Civil, Machhlishahr, Mariahu, Bansgaon, etc.).
- Active highway polyline corridors (**NH-31** and **NH-28**) with animated 108 ALS vehicle markers.
- Anti-overlapping status pins (`gis-pin-wrapper`) ensuring zero marker text collisions.

### 2. 📄 4 Isolated Navigation Pages
- **`index.html` (Executive Overview)**: High-level regional KPI metrics, active alert tickers, and primary infrastructure summary.
- **`hospitals.html` (Monitored Facilities Grid & Matrix Table)**: Filterable hospital cards, doctor rosters, ICU bed capacity, and compact matrix control table.
- **`map.html` (Tactical GIS Command Map)**: Full-height interactive Leaflet GIS map with active 108 Emergency Triage Stream.
- **`telemetry.html` (LMO Oxygen Tanks & ABDM Sat-Link Diagnostics)**: Real-time liquid oxygen storage tank levels (LMO Cryo) and cold-chain IoT diagnostic logs.

### 3. 🎨 Zero-FOUC Theme Engine (`localStorage` Persistence)
- Persistent **Dark Mode** and **High-Contrast Field Sunlight Mode** synced seamlessly across all 4 pages.
- Zero-FOUC (Flash of Unstyled Content) head script reads `sevaroute_theme` before DOM render.
- High-contrast color tokens exceeding **WCAG 2.1 AA** standards for outdoor daylight readability.

### 4. 🇮🇳 Authentic Tiranga Flag & 100% SVG Vector Icons
- Replaced all emojis with **100% clean SVG vector icons** (`<svg viewBox="0 0 24 24">`).
- Features the official **Indian Tiranga SVG Flag** including the 24-spoke Navy Blue Ashoka Chakra (`#000080`).

### 5. ⏱️ 12-Hour AM/PM Real-Time Clock & Keyboard Hotkeys
- Real-time topbar clock (`10:53:05 PM IST`) updated every second.
- **Global Keyboard Hotkeys**:
  - <kbd>Alt</kbd> + <kbd>S</kbd> — Open/Close 108 SOS Dispatch Modal.
  - <kbd>Alt</kbd> + <kbd>T</kbd> — Toggle Field Contrast Sunlight Mode.
  - <kbd>Alt</kbd> + <kbd>L</kbd> — Toggle Language (English / Hindi).

### 6. 🛡️ Real-Time Input Validation & ICU Bed Lock
- Real-time character length & numeric validation on Patient Name ($\ge 2$), Pickup Village ($\ge 3$), and ABHA ID.
- Glowing red borders (`.input-error`), shake animations (`inputShake`), and inline helper text.
- Automatic ICU bed deduction and live bed reservation upon dispatch confirmation.

---

## 📁 Codebase Directory Layout

```
health-tracker/
├── index.html            # Executive Overview Dashboard
├── hospitals.html        # Hospital Facility Grid & Control Matrix
├── map.html              # Tactical Leaflet GIS Map & Active 108 Queue
├── telemetry.html        # Liquid Oxygen Cryo Storage & ABDM Sat-Link
├── style.css             # Main Entry CSS Sheet (Imports sub-sheets)
├── css/
│   ├── base.css          # Design tokens, variables, typography & resets
│   ├── components.css    # Topbar, brand header, vitals grid, minimal footer
│   ├── map-matrix.css    # Leaflet pins, search toolbar, matrix table & feeds
│   └── themes.css        # Modal sheets, toast engine & Sunlight Mode overrides
├── js/
│   ├── app.js            # Core state, theme engine, hotkeys, clock & language
│   ├── mapInteractivity.js # Leaflet GIS initialization, pins & route lines
│   └── dispatchEngine.js # 108 SOS dispatch form validation & bed locking
└── components/
    ├── header.html       # Shared header component
    ├── footer.html       # Shared minimal single-line footer
    ├── modals.html       # Shared dispatch & telemetry modals
    └── map-incidents.html # Shared emergency incident stream card
```

---

## 🚀 How to Run Locally

Because SevaRoute uses standard HTML, CSS, and ES6 JavaScript, no build step or node compilation is required:

### Option 1: Direct File Opening
Double-click `index.html` or drag it into any modern web browser (Chrome, Firefox, Safari, Edge).

### Option 2: Static Web Server
```bash
# Python 3
python -m http.server 3000

# Node.js
npx serve .
```
Navigate to `http://localhost:3000` in your web browser.

---

## ⌨️ Emergency Keyboard Shortcuts

| Hotkey | Action | Description |
| :---: | :--- | :--- |
| <kbd>Alt</kbd> + <kbd>S</kbd> | **108 Emergency Dispatch** | Opens the emergency dispatch modal for immediate ICU bed reservation. |
| <kbd>Alt</kbd> + <kbd>T</kbd> | **Toggle Theme** | Switches between Dark Mode and High-Contrast Field Sunlight Mode. |
| <kbd>Alt</kbd> + <kbd>L</kbd> | **Toggle Language** | Switches system UI between English and Hindi (हिंदी). |

---

## 🏛️ Standard Compliance Alignment

- **National Health Mission (NHM UP)**
- **Ayushman Bharat Digital Mission (ABDM)**
- **108 National Ambulance Service (NAS UP)**
- **Ministry of Health and Family Welfare (MoHFW)**

---

## 📄 License

MIT License &copy; 2026 SevaRoute Contributors. Aligned with National Health Mission (NHM UP).
