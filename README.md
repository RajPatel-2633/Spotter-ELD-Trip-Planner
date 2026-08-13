# Spotter TripOS — AI-Powered Trucking Trip Planner & FMCSA ELD/RODS System

![Spotter TripOS Banner](https://img.shields.io/badge/Spotter_TripOS-v1.0.0-FF5722?style=for-the-badge&logo=truck)
![FMCSA Compliant](https://img.shields.io/badge/FMCSA_49_CFR_Part_395-Compliant-10B981?style=for-the-badge)
![Django REST Framework](https://img.shields.io/badge/Backend-Django_REST_Framework-092E20?style=for-the-badge&logo=django)
![React TypeScript](https://img.shields.io/badge/Frontend-React_TypeScript-61DAFB?style=for-the-badge&logo=react)
![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb)

---

## 🚛 Overview

**Spotter TripOS** is a full-stack commercial trucking logistics, trip planning, and Electronic Logging Device (ELD) / Record of Duty Status (RODS) management platform. 

It takes trip origin, pickup, dropoff locations, and driver cycle parameters to calculate real highway routing, enforce Federal Motor Carrier Safety Administration (FMCSA) Hours of Service (HOS) rules, schedule legal operational stops, and generate 24-hour continuous RODS daily log sheets formatted for print and digital inspection.

---

## 🔄 Core Logistics Pipeline Architecture

```
┌────────────────────────────────┐
│          USER INPUT            │
│ Origin • Pickup • Dropoff      │
│ Current Cycle Used (Hrs)       │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│     REAL OSRM ROAD ROUTING     │
│ Distance • Duration • Polyline │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│   FMCSA HOS ENGINE (PART 395)  │
│ 70h/8d • 11h Drive • 14h Duty  │
│ 30m Rest • 10h Shift Reset     │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│ CHRONOLOGICAL STOP SCHEDULER   │
│ Start • 30m Rest • 10h Reset   │
│ Fueling • Pickup • Dropoff     │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│  24-HOUR CONTINUOUS RODS LOGS  │
│ 00:00 ──► 24:00 (1440m/day)    │
│ Zero Gaps • Zero Overlaps      │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│ REACT COMMAND CENTER & PRINT   │
│ Leaflet Map • SVG ELD Grid     │
│ Form MCS-59 Print Sheet        │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│     MONGODB ATLAS PERSISTENCE  │
│ PyMongo Client • History API   │
└────────────────────────────────┘
```

---

## ✨ Key Features

- **🗺 Real Road Highway Routing**: Integrates OpenStreetMap Nominatim geocoding and live OSRM routing returning accurate highway distance, driving duration, and 1,600+ coordinate polyline path points rendered on Leaflet dark map tiles.
- **⏱ FMCSA HOS Rule Engine (49 CFR Part 395)**:
  - **70-Hour / 8-Day Rolling Cycle** enforcement.
  - **11-Hour Driving Limit** per shift.
  - **14-Hour Duty Window** per shift.
  - **Mandatory 30-Minute Rest Break** after 8 cumulative driving hours (*supports 2020 FMCSA HOS Final Rule 30m+ non-driving on-duty clock reset*).
  - **10-Hour Shift Reset** for overnight rests.
  - **Cycle Feasibility Guard** rejecting impossible trip requests.
- **📍 Chronological Stop Scheduling**:
  - Automatic **Fueling Stop** insertion every 1,000 miles (30 min `ON_DUTY`).
  - 60 min `ON_DUTY` Loading at Pickup location.
  - 60 min `ON_DUTY` Unloading at Dropoff location.
  - Exact arrival/departure ISO timestamps and mileage progression.
- **📊 24-Hour Continuous RODS Daily Logs**:
  - Event-derived daily log generator ensuring 100% mathematical reconciliation between scheduler driving minutes and RODS log sheets.
  - Guaranteed $00:00 \rightarrow 24:00$ coverage ($1,440\text{ minutes/day}$) with zero gaps and zero overlaps.
- **🖨 Production-Quality Printable Form MCS-59 Sheet**:
  - Dedicated `@media print` CSS formatted for **US Letter Landscape**.
  - Professional FMCSA Form MCS-59 layout with SVG step-line grid, daily totals summary, itemized duty change remarks, and driver certification signature block.
- **📅 Dynamic Date Propagation**:
  - Uses timezone-aware system dates (`timezone.localdate()`) so trip planning, stop ETAs, ELD logs, and print sheets reflect current dates dynamically.
- **💾 MongoDB Atlas Persistence**:
  - Automatic persistence of planned trips to MongoDB Atlas via PyMongo, with HTTP 503 database offline fallback.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v6
- **Mapping**: Leaflet + React-Leaflet (CartoDB Dark Tiles)
- **UI & Animations**: Framer Motion, Lucide React Icons
- **Styling**: Vanilla CSS (CSS Variables, Grid, Flexbox, High-Contrast `@media print`)

### Backend
- **Framework**: Django 4.2+ & Django REST Framework (DRF)
- **Routing Engine**: OSRM (Open Source Routing Machine API) + Nominatim Geocoding
- **Database**: PyMongo (MongoDB Atlas) + SQLite3 (Django auth)
- **CORS & Environment**: `django-cors-headers`, `python-dotenv`
- **Testing**: Django `TestCase` (17 Unit Tests)

---

## 📁 Repository Structure

```
Spotter-ELD-Trip-Planner/
├── Backend/
│   ├── config/               # Django Settings, URLs & WSGI
│   ├── trips/
│   │   ├── services/         # Core Logistics Services
│   │   │   ├── routing.py    # OSRM Geocoding & Road Geometry
│   │   │   ├── hos.py        # FMCSA HOS Rule Tracker
│   │   │   ├── scheduler.py  # Chronological Stop Scheduler
│   │   │   └── eld.py        # 24h Continuous RODS Log Generator
│   │   ├── tests/            # 17 Unit Tests for Routing, HOS, Scheduler, ELD
│   │   ├── db.py             # PyMongo MongoDB Atlas Connection
│   │   ├── serializers.py    # DRF Input Validation Serializers
│   │   ├── views.py          # API Endpoint Controllers (POST /plan, GET /history)
│   │   └── urls.py           # Backend API Routing
│   ├── .env                  # Backend Environment Variables
│   ├── manage.py             # Django CLI Tool
│   └── requirements.txt      # Python Dependencies
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/       # Sidebar & Topbar Command Center Layout
    │   │   ├── trip/         # TripForm, RouteMap, StopTimeline, Summary
    │   │   ├── eld/          # ELDGrid, ELDStats, ELDDayTabs, PrintableRODS
    │   │   ├── pages/        # Dashboard, Planner, ELD Logs, Fuel, Reports
    │   │   └── ui/           # Modals & UI Components
    │   ├── context/          # TripContext.tsx (Global State Manager)
    │   ├── services/         # tripService.ts (API Client)
    │   ├── types/            # trip.ts (TypeScript Interfaces)
    │   ├── App.tsx           # React Router Base
    │   └── index.css         # Design Tokens & Print Stylesheet
    ├── .env                  # Development API Configuration
    ├── .env.production       # Production API Configuration
    ├── package.json          # Node.js Dependencies
    └── vite.config.ts        # Vite Build Configuration
```

---

## 🚀 Quick Start & Setup Guide

### Prerequisites
- **Python**: 3.11+
- **Node.js**: 18+
- **npm**: 9+

---

### 1. Backend Setup (Django REST Framework)

```bash
# Navigate to Backend directory
cd Backend

# Create and activate virtual environment (Optional but recommended)
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create Backend/.env file
```

Create `Backend/.env`:
```env
SECRET_KEY=django-insecure-spotter-os-secret-key-2026
DEBUG=True
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MONGODB_URI=mongodb+srv://admin:admin123@cluster0.zogap5f.mongodb.net/spotter_trips?retryWrites=true&w=majority
```

Run migrations and start Django server:
```bash
python manage.py migrate
python manage.py runserver 8000
```
*Backend API server will run at `http://127.0.0.1:8000/api/trips/plan`.*

---

### 2. Frontend Setup (React TypeScript Vite)

```bash
# Navigate to Frontend directory
cd Frontend

# Install Node.js dependencies
npm install

# Create Frontend/.env file
```

Create `Frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

Start Vite dev server:
```bash
npm run dev
```
*Frontend Command Center will run at `http://localhost:5173`.*

---

## 🧪 Testing & Verification

### Run Backend Unit Tests (Django)
```bash
cd Backend
python manage.py test
```
*Executes 17 unit tests covering OSRM routing fallbacks, HOS rule tracking, multi-day stop scheduling, 24-hour RODS continuity, and MongoDB integration.*

### Run Frontend Production Build
```bash
cd Frontend
npm run build
```
*Compiles TypeScript and bundles production assets using Vite (0 compilation errors).*

---

## 📋 API Reference

### 1. Plan Compliant Trip
- **Endpoint**: `POST /api/trips/plan`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Dallas, TX",
  "dropoff_location": "Houston, TX",
  "current_cycle_used": 42.5
}
```
- **Response**: `200 OK` returning route geometry, HOS compliance summary, scheduled stops itinerary, and 24-hour continuous RODS daily logs.

### 2. Fetch Saved Trip History
- **Endpoint**: `GET /api/trips/history`
- **Response**: `200 OK` returning recent trip plans persisted in MongoDB Atlas.

---

## 📄 License

This project is open-source and built for assessment & demonstration purposes.
