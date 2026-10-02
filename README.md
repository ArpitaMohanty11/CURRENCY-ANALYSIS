# Currency Analysis — Institutional FX Intelligence Terminal

Currency Analysis is a high-density, production-ready full-stack foreign exchange analytics platform inspired by **TradingView**, **Bloomberg Terminal**, and **Stripe Dashboard**. It provides institutional foreign exchange liquidity feeds, real-time rate tracking, interactive multi-timeframe charts, currency relative strength matrices, price trigger monitoring, automated report compilation (PDF/CSV), and AI macro insights.

---

## 🏛️ Architecture Overview

```mermaid
graph TD
    Client["React 19 + TypeScript + Vite + Tailwind CSS + Zustand + Recharts"]
    Client -->|REST API / Axios| API["FastAPI Application (Port 8000)"]
    API --> Routes["Routes Layer (/auth, /currencies, /analytics, /watchlists, /alerts, /reports, /admin)"]
    Routes --> Services["Services Layer (Auth, Currency, Analytics, Watchlist, Alert, Report, Admin)"]
    Services --> Repositories["Repositories Layer (Clean Database Interface)"]
    Repositories --> Database[("Supabase PostgreSQL / Resilient Store")]
    APScheduler["APScheduler Background Daemons"] -->|Tick Sync (15s)| Repositories
    APScheduler -->|Alert Monitor (30s)| Services
```

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4 + Custom Bloomberg Terminal Dark Theme & Glassmorphic Utilities
- **State Management**: Zustand
- **Routing**: React Router v7
- **Charts**: Recharts (Interactive Area, Multi-Series Comparison, and Volume Bar Visualizations)
- **HTTP Client**: Axios with JWT Bearer Interceptors & Auto-Reconnection
- **Icons**: Lucide React
- **Document Generation**: jsPDF + jsPDF-AutoTable

### Backend
- **Framework**: Python 3.12+ FastAPI
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Background Jobs**: APScheduler (`AsyncIOScheduler`)
  - **Rate Sync Job**: Ticks live exchange rates, spreads, and 24h highs/lows every 15s
  - **Alert Monitor Job**: Evaluates active price threshold triggers every 30s
  - **Market Summary Job**: Generates daily liquidity and turnover metrics every 24h
- **Security**: JWT (`python-jose`), Bcrypt password hashing (`passlib`), Role-Based Access Control (RBAC)

### Database
- **Primary**: Supabase PostgreSQL with Row-Level Security (RLS) policies
- **Resilient Fallback**: Zero-setup, live-populated in-memory repository layer guaranteeing immediate execution even before external cloud credentials are supplied.

---

## 💻 12 Frontend Pages

1. **Landing Page (`/`)**: Institutional marketing page featuring a live conversion simulator, real-time ticker, feature cards, and terminal CTA.
2. **Login Page (`/login`)**: High-security authentication portal with one-click demo access for **Trader** and **Admin**.
3. **Register Page (`/register`)**: Account provisioning with role profiles (FX Trader / Macro Analyst).
4. **Dashboard (`/dashboard`)**: The flagship trading terminal:
   - Live continuous marquee ticker tape
   - Top 4 market overview metrics (US Dollar Index DXY, FX Volatility Index CVIX, Breadth, Active Triggers)
   - Multi-timeframe Recharts chart (`24H`, `7D`, `30D`, `90D`, `1Y`) with Area/Line modes
   - Institutional Bid/Ask order depth visualizer
   - Top Gainers & Top Losers cards with live sparklines
   - Currency Relative Strength Index (CSI) matrix
   - AI FX Macro Insights card with sentiment scoring
   - Default Watchlist summary
5. **Currency Analytics (`/analytics`)**:
   - Technical Indicators Ribbon: RSI (14), SMA 20, 50, 200, Bollinger Bands, MACD, Summary Signal
   - Comparative Performance Chart: Base 100 normalized return curve between any two pairs
   - Turnover Volume distribution histogram
   - Empirical FX Correlation Matrix Heatmap across major currencies
6. **Currency Converter (`/converter`)**:
   - Real-time spot conversion with live bid/ask spread and zero-fee settlement breakdown
   - Inverse rate calculation toggle and 1-click currency swap
   - 30-day historical conversion trend chart
   - Multi-Currency Basket Valuation matrix (converts into 10 global currencies simultaneously)
7. **Historical Trends (`/trends`)**:
   - Historical OHLC daily settlement table
   - Range selection (`7D`, `30D`, `90D`, `1Y`)
   - Period high, low, standard deviation, and annualized volatility stats
   - One-click CSV table export
8. **Watchlists (`/watchlists`)**:
   - Multi-watchlist management (Create, Edit, Delete custom portfolios)
   - Add and remove currency pairs
   - Live rates, 24h change pills, sparklines, and bid/ask spreads
9. **Alerts (`/alerts`)**:
   - Arm triggers for price levels (`ABOVE`, `BELOW`) and percentage moves (`SURGE`, `DROP`)
   - Toggle triggers between active and paused
   - Real-time audit history of triggered alerts
10. **Reports (`/reports`)**:
    - Intelligence report generator (Daily FX Wrap, Weekly Volatility, Cross-Asset Correlation)
    - Direct CSV export from backend API
    - Client-side dynamic PDF compilation with branded styling
    - Historical report archive
11. **Profile & Settings (`/settings`)**:
    - User account status, email, role, and joined date
    - Portfolio base currency preference selector (USD, EUR, GBP, JPY, INR, CHF)
    - Live feed refresh interval slider (5s to 60s)
    - In-app and email notification toggles
    - Institutional API Key management and one-click copy
12. **Admin Dashboard (`/admin`)**:
    - Cluster health telemetry (uptime, database status, cached rates, active triggers)
    - APScheduler daemon job pipeline table
    - Manual rate synchronization trigger button
    - User accounts inspector with role tags
    - Security audit trail log

---

## 🗄️ Database Tables (12 Tables)

The complete SQL schema with Row-Level Security (RLS) is located at [`supabase/migrations/20260930_init.sql`](file:///d:/Data/dharmendra/currency_analysis/supabase/migrations/20260930_init.sql):

1. `users` — Authentication, roles, and profile information
2. `user_preferences` — Base currency, theme, notification channels
3. `currencies` — Master list of 20+ global currencies, symbols, flags
4. `exchange_rates` — Spot rates, bid, ask, 24h high/low, percentage changes
5. `watchlists` — User-created portfolio baskets
6. `watchlist_items` — Currency pairs assigned to watchlists
7. `alerts` — Active price threshold triggers
8. `alert_history` — Audit trail of executed triggers
9. `reports` — Generated intelligence briefs and documents
10. `currency_analytics` — RSI, SMA, and volatility calculations
11. `audit_logs` — System security and user action trail
12. `notification_logs` — In-app and email notification records

---

## 🔑 Pre-Configured Demo Credentials

For testing and demonstration, use the quick login buttons on [`/login`](http://localhost:5173/login) or enter:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **FX Trader** | `trader@currencyanalysis.com` | `trader123` | Full Terminal Access (Dashboard, Converter, Analytics, Watchlists, Alerts, Reports, Settings) |
| **Institutional Admin** | `admin@currencyanalysis.com` | `admin123` | Full Terminal + Supervisor Cluster Dashboard (`/admin`) |

---

## 🛠️ Quickstart Setup & Launch

### 1. Backend Setup (FastAPI)

```bash
# Navigate to the workspace
cd d:\Data\dharmendra\currency_analysis

# Install Python requirements
python -m pip install -r backend/requirements.txt

# Start the FastAPI server (Port 8000)
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

* API Documentation (Swagger / OpenAPI): `http://localhost:8000/docs`
* API Root: `http://localhost:8000/api`

### 2. Frontend Setup (React 19 + Vite)

```bash
# Navigate to the frontend directory
cd d:\Data\dharmendra\currency_analysis\frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

* Access the application in your browser at: `http://localhost:5173`

---

## 🧪 Testing & Verification

- **Production Frontend Bundle**: Run `npm run build` inside `frontend/` (Verified: `dist/` bundle created with zero errors).
- **Backend API Import**: Run `python -c "import backend.main as m; print(m.app.title)"` (Verified: `Currency Analysis Institutional FX API`).
- **Database Schema**: Execute [`supabase/migrations/20260930_init.sql`](file:///d:/Data/dharmendra/currency_analysis/supabase/migrations/20260930_init.sql) in your Supabase SQL Editor.
