import json
import os

# Path to the food database JSON file
DB_PATH = os.path.join(os.path.dirname(__file__), "food_database.json")

def load_food_database():
    """Load the JSON database into memory."""
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# Cache database in memory
FOOD_DB = {item["class_name"].strip().lower(): item for item in load_food_database()}

def get_food_nutrition(class_name: str, portion: str = "medium"):
    """
    Calculate nutritional values for a given detected food class and selected portion.
    
    :param class_name: Name of the food class from YOLO model (e.g. 'Aloo Gobi', 'Paneer Butter Masala')
    :param portion: 'small', 'medium', or 'large'
    :return: Dictionary containing portion weight and calculated nutrients (calories, protein, carbs, fats, fiber, allergens)
    """
    key = class_name.strip().lower()
    food = FOOD_DB.get(key)
    
    if not food:
        return None
    
    portion = portion.lower()
    if portion == "small":
        weight_g = food["portion_small_g"]
    elif portion == "large":
        weight_g = food["portion_large_g"]
    else:
        weight_g = food["portion_medium_g"]
        portion = "medium"
        
    factor = weight_g / 100.0
    
    return {
        "class_name": food["class_name"],
        "display_name": food["display_name"],
        "category": food["category"],
        "portion_selected": portion,
        "portion_unit": food["portion_unit"],
        "weight_grams": weight_g,
        "calories": round(food["calories_per_100g"] * factor, 1),
        "protein_g": round(food["protein_per_100g"] * factor, 1),
        "carbs_g": round(food["carbs_per_100g"] * factor, 1),
        "fats_g": round(food["fats_per_100g"] * factor, 1),
        "fiber_g": round(food["fiber_per_100g"] * factor, 1),
        "diet_type": food.get("diet_type", "veg"),
        "is_vegan": food.get("is_vegan", True),
        "allergens": food["allergens"],
        "ingredients": food["ingredients"]
    }

if __name__ == "__main__":
    # Test sample calculation
    sample = get_food_nutrition("Paneer Butter Masala", "medium")
    print("Sample Nutrition Calculation:")
    print(json.dumps(sample, indent=2))
