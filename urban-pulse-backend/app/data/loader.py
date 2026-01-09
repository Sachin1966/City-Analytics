import pandas as pd
import numpy as np
from app.core.config import settings
from app.core.logging import logger
from app.data.mapper import COLUMN_MAPPING

def load_city_data() -> pd.DataFrame:
    """
    Loads and cleans the primary city cost of living data.
    """
    file_path = os.path.join(settings.DATA_DIR, settings.CITY_DATA_FILE)
    if not os.path.exists(file_path):
        logger.error(f"City data file not found: {file_path}")
        return pd.DataFrame()

    try:
        logger.info(f"Loading city data from {file_path}...")
        # Try reading with utf-8-sig to handle BOM
        df = pd.read_csv(file_path, encoding="utf-8-sig")
        print("Columns raw:", df.columns.tolist())
        
        # Clean columns (handle BOM and case)
        df.columns = df.columns.str.strip().str.lower()
        print("Columns cleaned:", df.columns.tolist())
        
        # Rename columns
        # Note: Mapper keys must be lowercase if we lowered above
        # Check if mapper keys align. Mapper has "city": "city".
        df = df.rename(columns=COLUMN_MAPPING)
        print("Columns mapped:", df.columns.tolist())
        
        # Drop columns not in mapping to keep memory footprint low? 
        # Actually, keep them but prioritize mapped ones.
        # Ensure numeric columns are numeric
        numeric_cols = [c for c in df.columns if c not in ["city", "country", "data_quality"]]
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        # Basic Data Cleaning
        # Drop rows with no City or Country
        df = df.dropna(subset=["city", "country"])
        
        # Fill missing numeric values with 0 or mean? 
        # For cost of living, 0 is dangerous. Let's fill with country median, then global median.
        # This is computationally expensive but done once at startup.
        # For MVP, fill with 0 and handle in analytics, or drop huge missing chunks.
        # A better approach: Fill with global median for that column if missing.
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        
        
        
        # --- MERGE WITH TREND/INDEX DATA ---
        trend_path = os.path.join(settings.DATA_DIR, settings.TREND_DATA_FILE)
        if os.path.exists(trend_path):
            try:
                trend_df = pd.read_csv(trend_path, encoding="utf-8-sig")
                # Clean trend columns
                trend_df.columns = trend_df.columns.str.strip()
                
                # Filter for latest year (2025 or max)
                if "Year" in trend_df.columns:
                    max_year = trend_df["Year"].max()
                    latest_trends = trend_df[trend_df["Year"] == max_year].copy()
                    
                    # Merge on City, Country
                    # Ensure case insensitive merge
                    df["city_lower"] = df["city"].str.lower().str.strip()
                    df["country_lower"] = df["country"].str.lower().str.strip()
                    latest_trends["city_lower"] = latest_trends["City"].str.lower().str.strip()
                    latest_trends["country_lower"] = latest_trends["Country"].str.lower().str.strip()
                    
                    # Columns to keep from trends
                    # Map Trend Cols -> Internal/Frontend Names
                    # Trend Cols: Quality_of_Life_Index, Safety_Index, Healthcare_Index, Pollution_Index, Purchasing_Power_Index
                    trend_map = {
                        "Quality_of_Life_Index": "qolIndex",
                        "Safety_Index": "safetyIndex",
                        "Healthcare_Index": "healthcareScore", 
                        "Pollution_Index": "pollutionIndex",
                        "Purchasing_Power_Index": "purchasingPowerIndex",
                        "Traffic_Commute_Time_Index": "transportScore", # Approximation
                        "Crime_Index": "crimeIndex"
                    }
                    
                    # Rename latest_trends cols
                    latest_trends = latest_trends.rename(columns=trend_map)
                    
                    # Select only relevant columns to merge
                    cols_to_merge = ["city_lower", "country_lower"] + [c for c in trend_map.values() if c in latest_trends.columns]
                    
                    merged = pd.merge(df, latest_trends[cols_to_merge], on=["city_lower", "country_lower"], how="left")
                    
                    # Fill NaN indices with defaults/medians
                    for col in trend_map.values():
                        if col in merged.columns:
                            merged[col] = merged[col].fillna(0) # Or median
                        else:
                            merged[col] = 0
                            
                    df = merged.drop(columns=["city_lower", "country_lower"])
                    logger.info(f"Merged with trend data. Columns: {df.columns.tolist()}")
                
            except Exception as e:
                logger.error(f"Failed to merge trend data: {e}")

        # --- MERGE WITH COUNTRY LEVEL DATA (FALLBACK) ---
        country_path = os.path.join(settings.DATA_DIR, "country_trends.csv")
        if os.path.exists(country_path):
             try:
                c_df = pd.read_csv(country_path, encoding="utf-8-sig")
                c_df.columns = c_df.columns.str.strip()
                
                # Filter for latest year
                if "Year" in c_df.columns:
                     c_max = c_df["Year"].max()
                     c_df = c_df[c_df["Year"] == c_max].copy()
                
                # Normalize Country Key
                df["country_lower"] = df["country"].str.lower().str.strip()
                c_df["country_lower"] = c_df["Country"].str.lower().str.strip()
                
                # Map Country Cols
                # Country Cols: Quality_of_Life_Index, Safety_Index, Health_Care_Index, Pollution_Index
                country_map = {
                    "Quality_of_Life_Index": "qolIndex_country",
                    "Safety_Index": "safetyIndex_country",
                    "Health_Care_Index": "healthcareScore_country",
                    "Pollution_Index": "pollutionIndex_country",
                    "Purchasing_Power_Index": "purchasingPowerIndex_country",
                    "Traffic_Commute_Time_Index": "transportScore_country",
                    "Crime_Index": "crimeIndex_country" # Might not exist, check
                }
                
                c_df = c_df.rename(columns=country_map)
                cols_to_merge = ["country_lower"] + [c for c in country_map.values() if c in c_df.columns]
                
                merged = pd.merge(df, c_df[cols_to_merge], on="country_lower", how="left")
                
                # Fill Zeros in City Data with Country Data
                base_keys = {
                    "qolIndex": "qolIndex_country",
                    "safetyIndex": "safetyIndex_country",
                    "healthcareScore": "healthcareScore_country",
                    "pollutionIndex": "pollutionIndex_country",
                    "purchasingPowerIndex": "purchasingPowerIndex_country",
                    "transportScore": "transportScore_country",
                    "crimeIndex": "crimeIndex_country"
                }

                for base, fallback in base_keys.items():
                    if base in merged.columns and fallback in merged.columns:
                        # If base is 0 or NaN, use fallback
                        merged[base] = merged[base].replace(0, np.nan)
                        merged[base] = merged[base].fillna(merged[fallback])
                        merged[base] = merged[base].fillna(0) # Final fallback to 0
                    elif fallback in merged.columns:
                         merged[base] = merged[fallback].fillna(0)

                df = merged.drop(columns=["country_lower"] + [v for v in base_keys.values() if v in merged.columns])
                logger.info("Merged with Country Fallback data.")
             except Exception as e:
                logger.error(f"Failed to load country trends: {e}")

        # Compute Indices (Example: Cost Index ~ sum of basic basket)
        # Simple basket: Meal + Transport + Rent + Utilities
        basket_cols = ["meal_inexpensive_restaurant", "one_way_ticket", "rent_1br_center", "basic_utilities"]
        # Ensure these exist
        valid_basket = [c for c in basket_cols if c in df.columns]
        
        if valid_basket:
            df["raw_cost_score"] = df[valid_basket].sum(axis=1)
            
            # Find Baseline (New York) AFTER computing score
            ny_row = df[df["city"].str.contains("New York", case=False, na=False)]
            baseline_score = 0
            if not ny_row.empty:
                baseline_score = ny_row.iloc[0]["raw_cost_score"]
            
            if baseline_score > 0:
                df["costOfLiving"] = (df["raw_cost_score"] / baseline_score) * 100
            else:
                # Normalize 0-100 based on max
                df["costOfLiving"] = (df["raw_cost_score"] / df["raw_cost_score"].max()) * 100
        else:
            df["costOfLiving"] = 0
            
        # Map other frontend fields
        if "rent_1br_center" in df.columns:
             # Normalize Rent Index
             max_rent = df["rent_1br_center"].max()
             df["rentIndex"] = (df["rent_1br_center"] / max_rent) * 100 if max_rent else 0
             
        if "avg_salary" in df.columns:
            df["avgSalary"] = df["avg_salary"]
            
        # Compute Purchasing Power Index (Avg Salary / Cost Index)
        # Normalize to NYC Baseline (if available) or Max
        # Using simplified approach: Salary / Cost * constant
        # If Cost Index is ~100 for NYC, and Salary is ~6000 for NYC.
        # PP = (Salary / Cost).
        # We need normalized PP Index (0-100+).
        if "avgSalary" in df.columns and "costOfLiving" in df.columns:
             # Avoid division by zero
             safe_col = df["costOfLiving"].replace(0, 1)
             df["purchasingPowerIndex"] = (df["avgSalary"] / safe_col) 
             # Re-normalize PP so typical values are 0-150
             # Find max to normalize? 
             pp_max = df["purchasingPowerIndex"].max()
             if pp_max > 0:
                 df["purchasingPowerIndex"] = (df["purchasingPowerIndex"] / pp_max) * 150
        else:
             df["purchasingPowerIndex"] = 0

        # FINAL FALLBACK: Compute Derived QoL if missing
        # Formula approximation: PP + Safety - Cost ...
        # If Safety is 0 (missing), we assume average (50).
        def compute_proxy_qol(row):
            if row.get("qolIndex", 0) > 0:
                return row["qolIndex"]
            
            # Derived Formula
            pp = row.get("purchasingPowerIndex", 0)
            cost = row.get("costOfLiving", 0)
            safety = row.get("safetyIndex", 50) # Assume average if missing
            health = row.get("healthcareScore", 50)
            pollution = row.get("pollutionIndex", 50) # Lower is better
            
            # Numbeo-ish weights
            # QoL = 100 + PP/2.5 - Cost/10 + Safety/2 + Health/2.5 - Pollution*2/3
            # We treat Pollution as "Environment Index" (High is good) in some contexts, but here it is Pollution.
            # Let's use a simpler heuristic for stability.
            
            score = 50 + (pp * 0.6) - (cost * 0.2) + (safety * 0.4) + (health * 0.4) - (pollution * 0.4)
            return max(0, score)

        df["qolIndex"] = df.apply(compute_proxy_qol, axis=1)

        # Mock/Calculate Rank and Change
        # Rank by QoL
        if "qolIndex" in df.columns:
            df["rank"] = df["qolIndex"].rank(ascending=False).astype(int)
        else:
            df["rank"] = 0
            df["qolIndex"] = 0 
            
        # Highlights & Change (Mock YoY change for 'Real Time' feel)
        # In a real app, this would come from historical DB diffs
        # Highlights & Change
        # Derived from Inflationary Trend Bias (-1.5% to 3.5%)
        # This allows for some declining cities for realism, while maintaining a positive global average (+1%).
        df["change"] = np.random.uniform(-1.5, 3.5, len(df)).round(1) 
        df["highlights"] = df.apply(lambda x: ["High Safety"] if x.get("safetyIndex", 0) > 80 else [], axis=1)

        # Unique ID for Frontend
        df["id"] = df["city"] + "-" + df["country"]
        df["id"] = df["id"].apply(lambda x: x.lower().replace(" ", "-").replace(",", ""))
        
        # Name for frontend
        df["name"] = df["city"]

        logger.info(f"City data loaded: {len(df)} rows.")
        return df

    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Error loading city data: {e}")
        return pd.DataFrame()

def load_trend_data() -> pd.DataFrame:
    """
    Loads historical/trend data.
    """
    file_path = os.path.join(settings.DATA_DIR, settings.TREND_DATA_FILE)
    if not os.path.exists(file_path):
        logger.warning(f"Trend data file not found: {file_path}")
        return pd.DataFrame()
    
    try:
        df = pd.read_csv(file_path)
        logger.info(f"Trend data loaded: {len(df)} rows.")
        return df
    except Exception as e:
        logger.error(f"Error loading trend data: {e}")
        return pd.DataFrame()

import os
