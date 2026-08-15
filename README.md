# 🚑 SevaRoute — Rural Health Infrastructure Tracker

**SevaRoute (सेवारूट)** is an emergency routing and health resource visualizer designed for Indian rural networks, Tier-3 cities, and village primary healthcare systems (aligned with the **National Health Mission**, **Ayushman Bharat Digital Mission (ABDM)**, and **108 National Ambulance Service**).

Built purely with **Semantic HTML5 & Vanilla CSS3** (100% self-contained, zero external JS dependencies).

---

## 🌟 Key Features

- **Health Status Color System**:
  - 🔴 **Critical Red** (`#ef4444`): High ICU occupancy (>90%), oxygen reserve < 6h, emergency divert alerts, low antivenom.
  - 🟡 **Warning Amber** (`#f59e0b`): ICU occupancy 70–90%, oxygen reserve 6–18h, transit/weather delays.
  - 🟢 **Stable Green** (`#10b981`): ICU capacity available, oxygen > 24h, full trauma team active, green corridor route open.
- **Real-Time CSS `@keyframes` Telemetry Signals**:
  - Concentric glowing radar waves (`signal-pulse`) around facility beacons and KPI badges.
  - Breathing glow on active hospital cards (`breath-critical`, `breath-warning`, `breath-stable`).
  - Shimmering gradient flow along ICU and Oxygen capacity progress bars.
  - 360° tactical radar sweep across the GIS rural topology map.
  - Flowing route animations indicating active 108 ambulance green corridors.
  - High-visibility emergency beacon strobes on en-route vehicles.
  - Smooth live emergency incident dispatch feed ticker.
- **Multi-District Support**:
  - **Gorakhpur Division (Terai Corridor)**: District Civil Hospital Central, Sub-District Hospital Bansgaon, Sahjanwa CHC, Kusumhi Tribal PHC, Pipraich Taluka Hospital, Mobile Field Unit #04.
  - **Jaunpur District (Gomti River Basin Corridor)**: Pt. Deendayal Upadhyay District Hospital (Jaunpur Civil), Shahganj SDH, Mariahu CHC, Machhlishahr SDH, Baksha PHC, Kerakat CHC.
- **Dual-Corridor SVG GIS Transit Visualizer**: Renders the Gomti River basin, NH-31 expressway, Jaunpur central hub, moving 108 ambulances, and green corridor routes.
- **Pure CSS Interactive Controls**:
  - Multi-district sector tabs (All UP Districts, Gorakhpur Sector, Jaunpur Sector).
  - Health status filter tabs (All Statuses, Critical Alerts, Caution / Low O2, Ready).
  - Field Sunlight / High-Contrast Emergency Mode toggle.
  - Checkbox-backed modal sheets for **108 Emergency Route Dispatch & Bed Lock** and **Network Diagnostics & Sat-Link Telemetry Logs**.

---

## 📁 Repository Structure

```
.
├── index.html        # Main dashboard interface with all 12 facilities, SVG map & modals
├── style.css         # Complete CSS design system, color variables & @keyframes
└── README.md         # Documentation & deployment guide
```

---

## 🚀 How to Run Locally

Since this project is built exclusively with HTML and CSS, simply open `index.html` in any modern web browser:

- Double click `index.html` in your file explorer, OR
- Serve with any static web server:
  ```bash
  # Python
  python -m http.server 3000

  # Node
  npx serve .
  ```

---

## 🏛️ Compliances & Alignments

- **Ayushman Bharat Digital Mission (ABDM)**
- **108 National Ambulance Service (NAS)**
- **Ministry of Health and Family Welfare (MoHFW)**
- **National Health Authority (NHA)**

---

## 📄 License

MIT License &copy; 2026 SevaRoute Contributors.
