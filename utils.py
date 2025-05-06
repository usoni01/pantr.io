import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Example usage of environment variables
API_URL = os.getenv("API_URL", "http://127.0.0.1:5000")

def login(username, password):
    response = requests.post(f"{API_URL}/login", json={"username": username, "password": password})
    if response.status_code == 200:
        return response.json()["token"]
    else:
        raise ValueError("Invalid credentials")
    
    
def format_quantity(quantity, item=None):
    """Convert quantities to more practical units based on rules."""
    if item:
        # Rule: Items that are typically counted
        if any(keyword in item for keyword in ["bread", "egg", "tomato", "piece", "slice"]):
            return f"{quantity} pcs"
        # Rule: Items measured in tablespoons
        elif any(keyword in item for keyword in ["salt", "pepper", "seasoning", "powder"]):
            return f"{quantity} tbsp"
        # Rule: Liquids measured in milliliters
        elif any(keyword in item for keyword in ["water", "oil", "milk", "juice"]):
            return f"{quantity} ml"
        # Rule: Default to grams for other items
        else:
            return f"{quantity:.0f} g"
    # If no item is provided, raise an error
    raise ValueError("Item name is required to determine the unit.")