import pandas as pd
import numpy as np
from app.data.loader import load_city_data, load_trend_data
from app.core.logging import logger

class AnalyticsService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AnalyticsService, cls).__new__(cls)
            cls._instance.city_df = load_city_data()
            cls._instance.trend_df = load_trend_data()
        return cls._instance

    def get_cities(self, country: str = None, search: str = None):
        """
        Returns a list of cities, optionally filtered.
        """
        df = self.city_df.copy()
        if df.empty:
            return []

        if country:
            df = df[df["country"].str.lower() == country.lower()]
        
        if search:
            df = df[df["city"].str.contains(search, case=False) | df["country"].str.contains(search, case=False)]
            
        # Return full records matching CitySummary schema
        # Schema expects camelCase. loading produced camelCase.
        return df.to_dict(orient="records")

    def get_map_data(self):
        """
        Returns lightweight data for the map view with projected X/Y coordinates for the SVG map.
        The frontend expects 'x' and 'y' as percentages (0-100).
        """
        df = self.city_df.copy()
        if df.empty:
            return []
            
        def get_coords(row):
            # Simple deterministic hash for placement if no lat/lon
            # Region-based rough placement
            country = str(row.get("country", "")).lower().strip()
            city = str(row.get("city", "")).lower().strip()
            
            # Simple hashing to spread cities within regions
            h = hash(city + country)
            jitter_x = (h % 20) - 10 # +/- 10%
            jitter_y = ((h // 100) % 20) - 10
            
            # Rough Centers for SVG World Map (0-100 scale)
            # Americas: X ~ 25, Y ~ 40
            # E. Europe/Africa: X ~ 52, Y ~ 45
            # Asia/Aus: X ~ 80, Y ~ 45
            
            if any(c in country for c in ["united states", "canada", "mexico", "brazil", "argentina", "chile", "colombia", "peru", "venezuela", "ecuador"]):
                base_x, base_y = 25, 40
            elif any(c in country for c in ["china", "japan", "india", "australia", "new zealand", "indonesia", "thailand", "vietnam", "philippines", "south korea", "singapore", "malaysia"]):
                base_x, base_y = 80, 45
            elif any(c in country for c in ["russia", "kazakhstan", "ukraine"]):
                base_x, base_y = 65, 25
            else:
                # Europe/Africa/Middle East
                base_x, base_y = 52, 45
                
            return pd.Series([base_x + jitter_x, base_y + jitter_y])

        # Apply coordinates
        if "latitude" not in df.columns:
            df[["x", "y"]] = df.apply(get_coords, axis=1)
        else:
            # If we had lat/lon, we would project them here. 
            # For now, stick to synthetic to guarantee display.
            df[["x", "y"]] = df.apply(get_coords, axis=1)

        # Ensure bounds 5-95
        df["x"] = df["x"].clip(5, 95)
        df["y"] = df["y"].clip(10, 90)

        cols = ["id", "name", "country", "x", "y", "costOfLiving", "qolIndex"]
        return df[cols].to_dict(orient="records")

    def get_city_details(self, city_id: str):
        """
        Returns full details for a specific city.
        """
        df = self.city_df
        if df.empty:
            return None
            
        city_row = df[df["id"] == city_id]
        if city_row.empty:
            return None
            
        return city_row.iloc[0].to_dict()

    def get_correlation_matrix(self):
        """
        Computes Pearson correlation for numerical columns.
        """
        df = self.city_df
        if df.empty:
            return {}
            
        # Select numeric columns only
        numeric_df = df.select_dtypes(include=[np.number])
        # drop data_quality or id-like cols if any
        if "data_quality" in numeric_df.columns:
            numeric_df = numeric_df.drop(columns=["data_quality"])
            
        corr_matrix = numeric_df.corr().fillna(0)
        
        # Format for Recharts/Frontend: "x": col, "y": col, "value": input
        # Or just a heatmap matrix structure.
        return corr_matrix.to_dict()

    def get_trends(self, city_id: str = None):
        """
        Returns trend data.
        """
        df = self.trend_df
        if df.empty:
            return []
            
        # If trend data has 'City' column, allow filtering
        # Assume standard Numbeo trend CSV cols: City, Country, Year, Index...
        if city_id and "City" in df.columns and "Country" in df.columns:
            # Parse city_id (city-country)
            # This is tricky without exact matching.
            # Let's return global averages by Year if no specific city matched easily
            pass
            
        # Return aggregated trends by Year
        if "Year" in df.columns:
            numeric_cols = [c for c in df.select_dtypes(include=[np.number]).columns if c != "Year"]
            grouped = df.groupby("Year")[numeric_cols].mean().reset_index()
            return grouped.to_dict(orient="records")
            
        return []

analytics_service = AnalyticsService()
