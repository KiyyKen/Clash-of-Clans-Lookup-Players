# ⚔️ Clash of Clans Player & Clan Lookup (Fullstack App)

A modern, fast, and feature-rich fullstack web application for looking up live **Clash of Clans** player and clan statistics using the official Supercell API.

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)
![Express](https://img.shields.io/badge/Express-5.x-blue.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

---

## 🌟 Key Features

### 👤 Player Profile Lookup
- **Official Supercell Badges**: Live League badges (Dragon League, Titan, Legend, etc.) and Clan Badges.
- **Heroes & Equipment Showcase**: Interactive sub-tabs to switch between **Heroes** and **Hero Equipment** with visual level progress bars and `MAXED` indicators.
- **Home Village Stats**: Town Hall level (including weapon level for TH12+), EXP level, current & best trophies, war stars, attack & defense wins.
- **Donation Tracker**: Real-time troops sent vs received ratio.
- **Clan Capital**: Total capital gold contributed.
- **Builder Base**: Builder Hall level, trophies, best trophies, and Builder Base heroes (*Battle Machine* & *Battle Copter*).
- **Playstyle Labels**: Displays official playstyle labels with custom icons (e.g. *Active Donator, Veteran, Farming*).

### 🛡️ Clan Profile & Live Roster
- **Rich Clan Overview**: Level, clan points/trophies, member count (e.g. `40 / 50`), war league tier, capital hall level, trophy entry requirements, war frequency, and war win streak.
- **War Record Statistics**: Win / Loss / Tie record with smart private log handling.
- **Interactive Members Table**:
  - **One-Click Player Inspection**: Click any member in the table to instantly inspect their full profile.
  - **Live Filter**: Instant real-time search input to filter members by name or tag.
  - **Custom Sorting**: Sort members on the fly by **Trofi**, **Town Hall**, **Donasi**, or **Nama (A-Z)**.

### ⚡ User Experience & Performance
- **Dual Tab Search**: Switch seamlessly between **Cari Player** and **Cari Clan**.
- **Deep Linking**: Share direct links with friends via `?player=TAG` or `?clan=TAG` with a 1-click share button (🔗).
- **Search History (Recent Searches)**: Saves up to 8 recently viewed profiles in `localStorage`.
- **In-Memory Cache (2 Minutes TTL)**: Drastically reduces API latency from ~880ms down to **~4ms** on repeated lookups while conserving Supercell API quota.
- **3 Background Themes**:
  1. *Gradient Mode* (Clean & minimal)
  2. *Wallpaper Mode* (Official high-res Clash background)
  3. *Video Background Mode* (Atmospheric moving video with optional sound toggle 🔊)

---

## 📁 Project Structure

```text
Clash-of-Clans-Lookup-Players/
├── public/
│   ├── assets/
│   │   ├── bg.jpg              # Wallpaper background
│   │   ├── bg.mp4              # Video background
│   │   ├── clan-temp.svg
│   │   ├── star-temp.svg
│   │   ├── townhall-temp.svg
│   │   └── trophy-temp.svg
│   ├── app.js                  # Frontend logic & interactions
│   ├── index.html              # Frontend structure
│   └── style.css               # Modern glassmorphism styling
├── src/
│   └── server.js               # Express API backend with in-memory caching
├── .env.example                # Template for environment variables
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/KiyyKen/Clash-of-Clans-Lookup-Players.git
cd Clash-of-Clans-Lookup-Players
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
COC_API_KEY=your_supercell_api_token_here
PORT=3000
```

> [!IMPORTANT]
> The Clash of Clans developer portal requires your **Allowed IP Address** to match your current public IP. Check your current public IP (e.g. via [ipify.org](https://api.ipify.org)) and add it to your key in [developer.clashofclans.com](https://developer.clashofclans.com/).

### 3. Run the Server

**Development Mode (auto-reload via nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Open your browser at:
👉 **`http://localhost:3000`**

---

## 🔌 API Endpoints (Local Backend)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/player/:tag` | Fetches rich profile, heroes, equipment, and village stats |
| `GET` | `/players/:tag` | Alias route for `/player/:tag` |
| `GET` | `/clan/:tag` | Fetches clan details, war stats, capital level, and badge |
| `GET` | `/clans/:tag` | Alias route for `/clan/:tag` |
| `GET` | `/clan/:tag/members` | Fetches full member list with TH, rank, trophies, and donations |
| `GET` | `/clans/:tag/members` | Alias route for `/clan/:tag/members` |

---

## 📜 License
This project is open-source under the [ISC License](LICENSE).
Clash of Clans and its respective logos and assets are trademarks of Supercell Oy.
