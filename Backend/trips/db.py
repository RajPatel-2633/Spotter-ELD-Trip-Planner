import logging
from django.conf import settings
from pymongo import MongoClient
from pymongo.errors import PyMongoError

logger = logging.getLogger(__name__)

_mongo_client = None

def get_db():
    """
    Get PyMongo database client singleton instance for MongoDB Atlas.
    Safely handles unconfigured or placeholder connection strings.
    """
    global _mongo_client
    uri = getattr(settings, 'MONGODB_URI', '')
    
    # Check if URI is missing or still contains placeholder brackets
    if not uri or '<' in uri or '>' in uri:
        _mongo_client = None
        return None

    if _mongo_client is None:
        try:
            _mongo_client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        except Exception as e:
            logger.error(f"Failed to initialize PyMongo client: {e}")
            return None

    try:
        db = _mongo_client.get_default_database()
        return db
    except Exception as e:
        logger.error(f"Failed to get default MongoDB database: {e}")
        return None

def save_trip_plan(plan_data: dict) -> bool:
    """
    Non-blocking save of trip plan to MongoDB Atlas.
    Returns True if saved successfully, False if skipped/error.
    Does NOT throw exceptions so API response remains reliable.
    """
    try:
        db = get_db()
        if db is None:
            logger.info("MongoDB URI not set or contains placeholders; skipping database persist.")
            return False

        trips_collection = db['trips']
        trips_collection.insert_one(plan_data.copy())
        logger.info(f"Trip plan {plan_data.get('id')} saved to MongoDB Atlas.")
        return True
    except PyMongoError as pe:
        logger.error(f"PyMongo error saving trip plan: {pe}")
        return False
    except Exception as ex:
        logger.error(f"Unexpected error saving trip plan: {ex}")
        return False
