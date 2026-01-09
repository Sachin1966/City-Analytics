from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CitySummary(BaseModel):
    id: str
    name: str = Field(..., alias="city") # Frontend uses 'name', backend DF has 'name' and 'city'. 
    country: str
    qolIndex: float
    rank: int
    change: float
    highlights: List[str] = []
    costOfLiving: float
    avgSalary: float
    rentIndex: float
    pollutionIndex: float
    crimeIndex: float
    transportScore: float
    healthcareScore: float
    
    # Lat/Lng optional for map
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    
    model_config = {"extra": "allow", "populate_by_name": True}

class MapCityResponse(BaseModel):
    id: str
    name: str
    country: str
    x: float
    y: float
    qolIndex: float
    costOfLiving: float
    
    model_config = {"extra": "allow"}

class CityDetail(BaseModel):
    id: str
    name: str
    country: str
    qolIndex: float
    # Allow extra fields for all specific prices
    model_config = {"extra": "allow"}

class TrendPoint(BaseModel):
    year: int = Field(..., alias="Year")
    # Allow extra average indices
    model_config = {"extra": "allow"}

class CorrelationResponse(BaseModel):
    # Flexible dictionary structure for matrix
    matrix: Dict[str, Dict[str, float]] 

class AnalysisResponse(BaseModel):
    data: List[Any]
    meta: Dict[str, Any] = {}
