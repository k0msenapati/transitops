# TransitOps

### Smart Transport Operations Platform

A centralized platform to manage the complete lifecycle of transport operations.

---

## The Problem
Many logistics companies still rely on spreadsheets and manual logbooks to manage their transport operations. This often leads to:
* Scheduling conflicts and double-booked drivers/vehicles.
* Underutilized vehicles.
* Missed maintenance schedules.
* Expired driver licenses on active runs.
* Inaccurate expense tracking and poor operational visibility.

## The Solution
TransitOps digitizes vehicle registries, driver safety profiles, dispatch tracking, garage maintenance, and expenses under a single console. The platform:
1. Enforces **Mandatory Business Rules** (e.g. blocking overloaded dispatches or suspended drivers).
2. Automates status transitions for vehicles and drivers.
3. Provides role-based scopes (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst) to prevent operational conflicts.
4. Computes real-time reports and vehicle ROI margins.

---

## Key Features
* **Vehicle Registry**: Master list of vehicles with max load capacity, acquisition costs, odometers, and active statuses.
* **Driver Management**: Profiles tracking safety scores, contact categories, and license validity.
* **Trip Dispatcher**: Schedule active runs with dynamic load capacity audits and license expiry checks.
* **Maintenance Logs**: Schedule vehicle repairs; auto-toggles vehicles to "In Shop" status, hiding them from the dispatch pool.
* **Fuel & Expenses**: Log liters, cost logs, and toll expenses to compute operational costs.
* **Reports & Analytics**: Real-time stats for Fuel Efficiency, Fleet Utilization, Operational Cost, and Vehicle ROI.

---

## Installation & Setup

<details>
<summary><b>1. Backend Server Setup (FastAPI + Python)</b></summary>

### Prerequisites
* Python 3.10+
* `uv` package manager installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

### Setup & Run Commands
```bash
# Navigate to backend
cd server

# Install dependencies and sync environment
uv sync

# Seed local database (creates users, vehicles, drivers, trips, fuel logs, and settings)
uv run python -m app.seed

# Run local development server
uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```
API Documentation will be hosted at: `http://localhost:8000/docs`
</details>

<details>
<summary><b>2. Frontend Client Setup (React + Vite)</b></summary>

### Prerequisites
* Node.js v18+
* `bun` package manager

### Setup & Run Commands
```bash
# Navigate to client
cd client

# Install packages
bun install

# Start Vite hot-reload development console
bun run dev
```
Local console will be hosted at: `http://localhost:5173/`
</details>

<details>
<summary><b>3. Running backend test suite</b></summary>

Run the core business logic test validation suite:
```bash
# Navigate to backend
cd server

# Run Pytest
uv run pytest
```
</details>

---

## Created By

| Creator | Contributions |
| :---: | :--- |
| [<img src="https://github.com/k0msenapati.png?size=80" width="80" style="border-radius:50%"/><br/>**k0msenapati**](https://github.com/k0msenapati) | Backend + Frontend |
| [<img src="https://github.com/Ayushb690.png?size=80" width="80" style="border-radius:50%"/><br/>**Ayushb690**](https://github.com/Ayushb690) | Frontend |
