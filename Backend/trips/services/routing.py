import math
import logging
import requests
from typing import Dict, Any, List, Tuple, Optional

logger = logging.getLogger(__name__)

# Known City Coordinate Registry (Used for precise geocoding lookup)
CITY_COORDINATES: Dict[str, Tuple[float, float]] = {
    'chicago': (41.8781, -87.6298),
    'chicago, il': (41.8781, -87.6298),
    'springfield': (39.7817, -89.6501),
    'springfield, il': (39.7817, -89.6501),
    'shreveport': (32.5252, -93.7502),
    'shreveport, la': (32.5252, -93.7502),
    'dallas': (32.7767, -96.7970),
    'dallas, tx': (32.7767, -96.7970),
    'houston': (29.7604, -95.3698),
    'houston, tx': (29.7604, -95.3698),
    'los angeles': (34.0522, -118.2437),
    'los angeles, ca': (34.0522, -118.2437),
    'phoenix': (33.4484, -112.0740),
    'phoenix, az': (33.4484, -112.0740),
    'atlanta': (33.7490, -84.3880),
    'atlanta, ga': (33.7490, -84.3880),
    'denver': (39.7392, -104.9903),
    'denver, co': (39.7392, -104.9903),
    'seattle': (47.6062, -122.3321),
    'seattle, wa': (47.6062, -122.3321),
    'new york': (40.7128, -74.0060),
    'new york, ny': (40.7128, -74.0060),
}

def geocode_location(location_name: str) -> Optional[Tuple[float, float]]:
    """
    Resolve city location name to (lat, lng) tuple.
    First checks coordinate registry, then falls back to Nominatim Geocoding API.
    """
    clean_name = location_name.strip().lower()
    if clean_name in CITY_COORDINATES:
        return CITY_COORDINATES[clean_name]

    # Check prefix matches
    for key, coords in CITY_COORDINATES.items():
        if clean_name.startswith(key) or key.startswith(clean_name):
            return coords

    # Nominatim API Lookup fallback
    try:
        url = "https://nominatim.openstreetmap.org/search"
        headers = {"User-Agent": "SpotterTripOS/1.0"}
        params = {"q": location_name, "format": "json", "limit": 1}
        resp = requests.get(url, params=params, headers=headers, timeout=3)
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                lat = float(data[0]['lat'])
                lng = float(data[0]['lon'])
                return (lat, lng)
    except Exception as e:
        logger.warning(f"Geocoding API request failed for {location_name}: {e}")

    return None


def haversine_miles(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """
    Calculate Haversine distance in miles between two (lat, lng) coordinates.
    Used for fuel stop waypoint interpolation along the OSRM route geometry.
    """
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 3958.8  # Earth radius in miles

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_route(origin_name: str, pickup_name: str, dropoff_name: str) -> Dict[str, Any]:
    """
    Query OSRM Routing Engine API for origin -> pickup -> dropoff.
    Returns dictionary with actual road distance, drive duration, and pathPoints.
    If OSRM API is unreachable, returns success=False with ROUTING_SERVICE_UNAVAILABLE.
    """
    origin_coords = geocode_location(origin_name)
    pickup_coords = geocode_location(pickup_name)
    dropoff_coords = geocode_location(dropoff_name)

    if not origin_coords or not pickup_coords or not dropoff_coords:
        return {
            "success": False,
            "error": f"Could not geocode one or more locations: {origin_name}, {pickup_name}, {dropoff_name}"
        }

    # Format OSRM coordinate string: lon,lat;lon,lat;lon,lat
    coords_str = f"{origin_coords[1]},{origin_coords[0]};{pickup_coords[1]},{pickup_coords[0]};{dropoff_coords[1]},{dropoff_coords[0]}"
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson"

    try:
        resp = requests.get(osrm_url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                osrm_route = data["routes"][0]
                distance_meters = osrm_route["distance"]
                duration_seconds = osrm_route["duration"]

                distance_miles = round(distance_meters * 0.000621371)
                drive_time_minutes = round(duration_seconds / 60)

                # Extract GeoJSON coordinates [lon, lat] and downsample if excessively dense
                coordinates_raw = osrm_route["geometry"]["coordinates"]
                if len(coordinates_raw) > 1500:
                    step = max(1, len(coordinates_raw) // 1500)
                    sampled = coordinates_raw[::step]
                    if coordinates_raw[-1] not in sampled:
                        sampled.append(coordinates_raw[-1])
                    coordinates_raw = sampled

                path_points = [{"lat": round(pt[1], 4), "lng": round(pt[0], 4)} for pt in coordinates_raw]

                return {
                    "success": True,
                    "origin": {"name": origin_name, "lat": origin_coords[0], "lng": origin_coords[1]},
                    "pickup": {"name": pickup_name, "lat": pickup_coords[0], "lng": pickup_coords[1]},
                    "destination": {"name": dropoff_name, "lat": dropoff_coords[0], "lng": dropoff_coords[1]},
                    "distanceMiles": distance_miles,
                    "driveTimeMinutes": drive_time_minutes,
                    "pathPoints": path_points,
                }
    except Exception as e:
        logger.error(f"OSRM routing request failed: {e}")

    # Explicit error response when OSRM is unreachable
    return {
        "success": False,
        "error": "ROUTING_SERVICE_UNAVAILABLE: Unable to connect to OSRM routing engine."
    }
