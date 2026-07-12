# TransitOps API

Logistics and transport management system backend.

## Roles & Access
* **Fleet Manager**: Full asset registry, maintenance logs, and settings CRUD.
* **Dispatcher**: Create and dispatch trips.
* **Safety Officer**: Driver compliance registry and safety scores.
* **Financial Analyst**: Fuel logs, operational expenses, and analytics reports.

## Database Entities
* **Users**: Operator accounts & roles.
* **Vehicles**: Fleet registry (Available, On Trip, In Shop, Retired).
* **Drivers**: Operator registry (Available, On Trip, Off Duty, Suspended).
* **Trips**: Lifecycle states (Draft -> Dispatched -> Completed / Cancelled).
* **Maintenance Logs**: Active shop logs (Auto-toggles vehicle to In Shop).
* **Fuel Logs**: Liters & cost transactions.
* **Expenses**: Miscellaneous costs (Tolls, others).
* **Settings**: Depot configurations (Name, currency, units).

## Directory Structure
```text
server/
├── app/
│   ├── core/                  # Database connection and security setup
│   ├── models/                # Database models
│   ├── repository/            # Database query interfaces
│   ├── schemas/               # Request and response validation schemas
│   ├── services/              # Core business logic
│   ├── routers/               # API endpoints
│   ├── seed.py                # Database seeder
│   └── main.py                # Application entrypoint
├── tests/                     # Pytest suite
└── pyproject.toml             # Python dependencies
```

## Installation

### 1. Setup Environment
```bash
# Install uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# Navigate to server
cd server

# Create virtual environment & install dependencies
uv venv
uv sync
```

### 2. Seed Database
Seeds 4 users (password: `pass`), 5 vehicles, 5 drivers, trips, fuel logs, tolls, and settings.
```bash
uv run python -m app.seed
```

### 3. Run App
```bash
uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```
API Documentation: http://localhost:8000/docs

### 4. Run Tests
```bash
uv run pytest
```
