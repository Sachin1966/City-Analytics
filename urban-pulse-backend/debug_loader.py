
import sys
import os
import pandas as pd

# Add app to path
sys.path.append(os.getcwd())

from app.core.config import settings
from app.data.loader import load_city_data

print(f"Base Dir: {settings.BASE_DIR}")
print(f"Data Dir: {settings.DATA_DIR}")
print(f"City File: {settings.CITY_DATA_FILE}")
expected_path = os.path.join(settings.DATA_DIR, settings.CITY_DATA_FILE)
print(f"Expected Path Exists: {os.path.exists(expected_path)}")

from app.services.analytics import AnalyticsService

try:
    print("Attempting to instantiate AnalyticsService...")
    service = AnalyticsService()
    print("Service instantiated.")
    
    print("Calling get_cities()...")
    cities = service.get_cities()
    print(f"Got {len(cities)} cities.")
    
    if len(cities) > 0:
        print("Sample city:", cities[0]["name"])
        
    print("Calling get_map_cities()...")
    map_cities = service.get_map_data()
    print(f"Got {len(map_cities)} map cities.")

except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
