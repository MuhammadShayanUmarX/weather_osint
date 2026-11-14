# 🇵🇰 Pakistan Weather OSINT & Environmental Intelligence Dashboard

A modern, high-precision Weather Intelligence Command Center focused on **Pakistan** (including Azad Jammu & Kashmir, Gilgit-Baltistan, Jammu & Kashmir, and Ladakh). Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Leaflet** / **react-leaflet**, and live meteorological data from **Open-Meteo**.

---

## 🌟 Key Features

- **🗺️ Interactive Leaflet Map with OpenStreetMap (Dark Mode & Satellite)**:
  - Custom dark filter on OpenStreetMap tiles without proprietary API keys.
  - Optional ESRI World Imagery high-resolution satellite basemap.
- **🛡️ Official Pakistan Sovereign Borders (GeoJSON)**:
  - High-precision border perimeter clearly marking Pakistan including Gilgit-Baltistan, Azad Jammu & Kashmir, Jammu & Kashmir, and Ladakh.
- **🚨 Active Rain Red Fence & Audio Beeps**:
  - Live rainfall perimeter visualization using pulsating red fencing (`@keyframes rainFencePulse`).
  - Web Audio API real-time acoustic beep alerts with toggle controls when active precipitation zones are identified.
- **❄️ Srdi (Cold) & 🔥 Garmi (Hot) Visual Zones**:
  - **Srdi Zones**: Cyan/Blue dashed perimeters for freezing and cold stations (≤ 14°C).
  - **Garmi Zones**: Amber/Orange dashed perimeters for warm, hot, and heatwave stations (≥ 26°C).
- **📍 Realtime Weather Badges across Pakistan**:
  - 30+ comprehensive observation stations across Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Gilgit-Baltistan, AJK, Jammu & Kashmir, and Ladakh.
  - Displays temperature, condition icons, rain alerts, humidity, wind velocity, and precipitation.
- **📊 Real-time Metric Trackers**:
  - Live summary cards: *Active Rain Fencing Radar*, *Srdi (Cold) Frontier*, *Garmi (Hot) Frontier*, and *Center Viewport Weather*.
  - Instant city search with automated map navigation.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 & TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS & Lucide Icons
- **Mapping Engine**: Leaflet & `react-leaflet` (v4)
- **Live Data Service**: Open-Meteo API (Free, zero-key, live batch requests)
- **Audio Alerts**: Web Audio API Sound Synthesizer

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or v20+ recommended)
- `npm` or `pnpm` / `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/weather_osint.git
   cd weather_osint
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
weather_osint/
├── public/
│   └── pakistan.geojson        # High-precision Pakistan border GeoJSON
├── src/
│   ├── components/             # Reusable UI & layout components
│   ├── config/
│   │   └── navigation.ts       # Cleaned navigation routes
│   ├── lib/
│   │   └── soundAlert.ts       # Web Audio API beeper for rain alerts
│   ├── pages/
│   │   └── Overview.tsx        # Main Weather Intelligence Command Center
│   ├── services/
│   │   └── liveWeather.ts      # Open-Meteo weather fetcher & stations grid
│   ├── App.tsx                 # Main application routes
│   ├── index.css               # Leaflet styling, dark filters & rain pulse animations
│   └── main.tsx                # React root mount
├── .gitignore                  # Git ignore rules for node_modules, dist, env
├── package.json                # Project dependencies and build scripts
├── README.md                   # Project documentation
└── vite.config.ts              # Vite configuration
```

---

## 📜 License

MIT License. Open source and community-driven meteorological intelligence.
