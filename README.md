# Urban Pulse: City Analytics Platform

**Urban Pulse** is a comprehensive analytics dashboard designed for urban planners, data scientists, and government officials to visualize, compare, and analyze quality of life metrics across global cities.

## 🚀 Key Features

### 1. **Interactive Dashboard**
- **Real-time Analytics:** View live metrics for Cost of Living, Safety, and Healthcare.
- **Global Map:** Interactive visualization of city data points.
- **Trends & Insights:** AI-generated summaries of emerging urban trends.

### 2. **Advanced Analytics Engine**
- **City Comparison:** Side-by-side comparison of multiple cities across 10+ metrics.
- **QoL Calculators:** Customizable weights for Quality of Life scoring (Safety vs. Cost vs. Health).
- **Outlier Detection:** Automated highlighting of statistical anomalies in city data.

### 3. **Validation & Methodology**
- **Cross-Validation:** "No Ground Truth" mode for data verification.
- **Reliability Scores:** Confidence metrics displayed for each data source.
- **Methodology Page:** Transparency on data sources (Numbeo, World Bank) and calculation formulas.

### 4. **User Personalization (Settings)**
- **Profile Management:** Update display name, role, and language preferences.
- **Appearance:** Toggle **Dark/Light Mode**, Color-blind accessibility, and Layout Density.
- **Data Governance:** Set minimum data completeness thresholds and auto-exclusion rules.
- **Persistence:** All user preferences are saved locally and persist across sessions.

---

## 🛠️ Technology Stack

### **Frontend** (`urban-pulse-analytics`)
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI (Shadcn)
- **State Management:** React Context API + LocalStorage
- **Visualization:** Recharts & Lucide Icons

### **Backend** (`urban-pulse-backend`)
- **Framework:** FastAPI (Python)
- **Data Processing:** Pandas & NumPy
- **API Documentation:** Swagger UI (Data Models & Schemas)
- **Architecture:** Service-based (Analytics, Auth, Data Loaders)

---

## 📂 Project Structure

```
analyst/
├── urban-pulse-analytics/       # Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI (Header, Cards, Charts)
│   │   ├── contexts/            # Global State (Auth, Filter)
│   │   ├── pages/               # Views (Login, Dashboard, Settings)
│   │   └── lib/                 # Utilities (API client)
│   └── package.json
│
├── urban-pulse-backend/         # Backend API
│   ├── app/
│   │   ├── api/                 # Endpoints (endpoints.py)
│   │   ├── core/                # Config & Logging
│   │   ├── services/            # Business Logic (Analytics)
│   │   └── data/                # Data Loaders (CSV/JSON processing)
│   └── main.py                  # Entry Point
│
└── dataset/                     # Raw Data Files
```

---

## ⚡ Installation & Setup

### Prerequisites
- **Node.js** (v16+)
- **Python** (v3.9+)

### 1. Start the Backend Server
Navigate to the backend directory and run the FastAPI server using Uvicorn.

```bash
cd urban-pulse-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*   Server will start at: `http://localhost:8000`
*   API Documentation: `http://localhost:8000/docs`

### 2. Start the Frontend Application
Open a new terminal, navigate to the frontend directory, install dependencies, and start the development server.

```bash
cd urban-pulse-analytics
npm install
npm run dev
```
*   Application will run at: `http://localhost:5173` (or similar)

---

## 📖 Usage Guide

1.  **Login:**
    *   Use any email (e.g., `user@example.com`) to sign in.
    *   *Note:* The system uses robust client-side authentication simulation.

2.  **Explore Data:**
    *   Use the **Search Bar** in the header to find specific cities.
    *   Navigate to **"Insights"** to see rising trends.

3.  **Configure System:**
    *   Click your **User Icon** -> **Settings**.
    *   Adjust **QoL Weights** (Analytics Tab) or **Theme** (Appearance Tab) to customize your experience.
    *   Click **"Save Changes"** to persist your configuration.

---

## 🔌 API Reference (Brief)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/cities` | List all available cities with summary metrics. |
| `GET` | `/trends` | Get global or city-specific trend data points. |
| `GET` | `/map-cities` | Lightweight geolocation data for map rendering. |
| `GET` | `/data-sources` | Metadata about data origin and reliability. |

---

## 🔮 Future Roadmap

- [ ] **Database Integration:** Move from CSV loaders to PostgreSQL.
- [ ] **Predictive Modeling:** Integrate forecasting for future cost-of-living indices.
- [ ] **Multi-User Backend:** Implement JWT Auth and role-based access control (RBAC).

---

*Generated for Detailed Study & Review.*
