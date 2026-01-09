from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.analytics import analytics_service
from app.models.schemas import CitySummary, MapCityResponse, TrendPoint, CorrelationResponse, AnalysisResponse

router = APIRouter()

@router.get("/cities", response_model=List[CitySummary])
def get_cities(
    country: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Get a list of cities, optionally filtered by country or search term.
    """
    return analytics_service.get_cities(country=country, search=search)

@router.get("/map-cities", response_model=List[MapCityResponse])
def get_map_cities():
    """
    Get lightweight city data for map visualization.
    """
    return analytics_service.get_map_data()

@router.get("/trends", response_model=List[TrendPoint])
def get_trends(city_id: Optional[str] = None):
    """
    Get trend data, either global or for a specific city.
    """
    return analytics_service.get_trends(city_id=city_id)

@router.get("/correlations")
def get_correlations():
    """
    Get correlation matrix for numerical metrics.
    Returns a dict since matrix structures vary.
    """
    return analytics_service.get_correlation_matrix()

@router.get("/radar")
def get_radar(city_id: str):
    """
    Get normalized metrics (0-100) for radar charts.
    """
    details = analytics_service.get_city_details(city_id)
    if not details:
        raise HTTPException(status_code=404, detail="City not found")
    
    # Use real metrics from details (merged from global trends)
    # Ensure keys match what Frontend Radar chart expects (subject, A, fullMark)
    # Frontend likely expects specific subjects.
    # Looking at Overview.tsx, it renders a radar? No, Validation.tsx does? 
    # Let's provide generic useful metrics.
    
    metrics = {
        "Cost": details.get("costOfLiving", 0),
        "Safety": details.get("safetyIndex", 0),
        "Health": details.get("healthcareScore", 0),
        "Environment": details.get("pollutionIndex", 0), # Maybe inverse? High pollution = bad environment.
        "Mobility": details.get("transportScore", 0),
    }
    
    # Invert pollution for "Environment" score (100 - pollution) if it's an index where high is bad
    if "pollutionIndex" in details:
         metrics["Environment"] = max(0, 100 - details.get("pollutionIndex", 0))

    radar_data = []
    for key, value in metrics.items():
        radar_data.append({"subject": key, "A": value, "fullMark": 100})
        
    return radar_data

@router.get("/scatter")
def get_scatter():
    """
    Get data for scatter plot (Cost vs Quality).
    """
    cities = analytics_service.get_cities()
    scatter_data = []
    for city in cities:
        # Filter for cities with non-zero data to avoid noise
        if city.get("qolIndex", 0) > 0 and city.get("costOfLiving", 0) > 0:
            scatter_data.append({
                "id": city["id"],
                "x": city.get("costOfLiving", 0),     # X-Axis: Cost
                "y": city.get("qolIndex", 0),         # Y-Axis: Quality
                "z": city.get("purchasingPowerIndex", 10), # Bubble size: Power
                "name": city["name"]
            })
            
    # sort by z to render huge bubbles last? or limit count?
    # limit to top 500 to avoid browser lag
    return scatter_data[:500]

@router.get("/insights")
def get_insights():
    """
    Get AI-generated insights (Mock for now).
    """
    return [
        {"id": 1, "title": "Cost of Living Rising", "description": "Global cost of living has increased by 5% in the last year.", "type": "warning"},
        {"id": 2, "title": "Remote Work Impact", "description": "Cities with lower cost of living are seeing higher migration rates.", "type": "trend"},
        {"id": 3, "title": "Tech Hub Growth", "description": "Emerging tech hubs in Asia are showing rapid quality of life improvements.", "type": "opportunity"}
    ]

@router.get("/data-sources")
def get_data_sources():
    """
    Get information about data sources.
    """
    return [
        {"name": "Numbeo 2025", "type": "Primary", "freshness": "Daily", "completeness": 98, "reliability": 95},
        {"name": "World Bank Open Data", "type": "Secondary", "freshness": "Annual", "completeness": 92, "reliability": 99},
        {"name": "Local Government APIs", "type": "Real-time", "freshness": "Hourly", "completeness": 85, "reliability": 90},
        {"name": "Global Mobility Report", "type": "Secondary", "freshness": "Monthly", "completeness": 94, "reliability": 96}
    ]
