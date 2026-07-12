# TransitOps Console

Logistics and transport management system frontend console.

## Tech Stack
* **Framework**: React + Vite
* **Styling**: Tailwind CSS
* **Routing**: Wouter
* **Data Fetching**: TanStack React Query
* **Forms**: React Hook Form

## Target Workspaces by Role
* **Fleet Manager**: Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.
* **Dispatcher**: Creates trips, assigns vehicles and drivers, and monitors active deliveries.
* **Safety Officer**: Ensures driver compliance, tracks license validity, and monitors safety scores.
* **Financial Analyst**: Reviews operational expenses, fuel consumption, maintenance costs, and profitability.

## Mandatory Business Rules Enforced
* Retired or In Shop vehicles must never appear in the dispatch selection.
* Drivers with expired licenses or Suspended status cannot be assigned to trips.
* A driver or vehicle already marked On Trip cannot be assigned to another trip.
* Cargo Weight must not exceed the vehicle's maximum load capacity.
* Dispatching a trip automatically changes both the vehicle and driver status to On Trip.
* Completing a trip automatically changes both the vehicle and driver status back to Available.
* Cancelling a dispatched trip restores the vehicle and driver to Available.
* Creating an active maintenance record automatically changes vehicle status to In Shop.
* Closing maintenance restores the vehicle to Available (unless retired).

## Reports & Analytics Displayed
* **Fuel Efficiency**: Distance / Fuel
* **Fleet Utilization (%)**
* **Operational Cost**: Fuel + Maintenance
* **Vehicle ROI**: `(Revenue - (Maintenance + Fuel)) / Acquisition Cost`

## Installation & Setup

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Build production bundle
bun run build
```
