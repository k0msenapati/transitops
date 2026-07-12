import io
import csv
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import UserRole
from app.utils.dependencies import RoleRequired
from app.services.analytics import analytics_service

router = APIRouter(tags=["analytics"])


@router.get(
    "/dashboard",
    dependencies=[Depends(RoleRequired([UserRole.FLEET_MANAGER, UserRole.DISPATCHER]))],
)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return analytics_service.get_dashboard_stats(db)


@router.get(
    "/reports",
    dependencies=[
        Depends(RoleRequired([UserRole.FLEET_MANAGER, UserRole.FINANCIAL_ANALYST]))
    ],
)
def get_reports(db: Session = Depends(get_db)):
    return analytics_service.get_vehicle_reports(db)


@router.get(
    "/reports/export",
    dependencies=[
        Depends(RoleRequired([UserRole.FLEET_MANAGER, UserRole.FINANCIAL_ANALYST]))
    ],
)
def export_reports_csv(db: Session = Depends(get_db)):
    report_data = analytics_service.get_vehicle_reports(db)

    output = io.StringIO()
    writer = csv.writer(output)

    # Headers
    writer.writerow(
        [
            "Vehicle ID",
            "Registration Number",
            "Model",
            "Type",
            "Distance Travelled (km)",
            "Revenue (INR)",
            "Expenses (INR)",
            "Net Profit (INR)",
            "Fuel Efficiency (km/L)",
            "ROI (%)",
        ]
    )

    for r in report_data:
        writer.writerow(
            [
                r["vehicle_id"],
                r["registration_number"],
                r["model"],
                r["type"],
                r["distance_travelled"],
                r["revenue"],
                r["expenses"],
                r["net_profit"],
                r["fuel_efficiency"],
                r["roi"],
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=fleet_roi_report.csv"},
    )
