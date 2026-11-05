import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from database.db_helper import FOOD_DB

def check_allergens(food_names: list, user_allergies: list):
    """
    Cross-reference detected food items with their ingredients and allergen tags
    against the user's health profile allergies.
    
    :param food_names: list of food names (strings) in the meal
    :param user_allergies: list of allergens declared by user (e.g. ['Dairy', 'Gluten', 'Nuts'])
    :return: dict with safety status, list of allergen alerts, and detailed warnings.
    """
    if not user_allergies:
        return {
            "has_allergen_alert": False,
            "alerts": []
        }
        
    normalized_user_allergies = [a.strip().lower() for a in user_allergies if a]
    alerts = []
    
    for food in food_names:
        key = food.strip().lower()
        food_data = FOOD_DB.get(key)
        if not food_data:
            continue
            
        dish_allergens = [a.strip() for a in food_data.get("allergens", "").split(",") if a.strip()]
        ingredients_str = food_data.get("ingredients", "")
        
        triggered_allergens = []
        for user_allergy in normalized_user_allergies:
            for dish_allergen in dish_allergens:
                if user_allergy in dish_allergen.lower():
                    triggered_allergens.append(dish_allergen)
                    
        triggered_allergens = list(set(triggered_allergens))
        if triggered_allergens:
            alerts.append({
                "food_name": food_data["display_name"],
                "severity": "HIGH",
                "allergens_detected": triggered_allergens,
                "message": f"Warning: {food_data['display_name']} contains {', '.join(triggered_allergens)}.",
                "ingredients": ingredients_str
            })
            
    return {
        "has_allergen_alert": len(alerts) > 0,
        "total_alerts": len(alerts),
        "alerts": alerts
    }
