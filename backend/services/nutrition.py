import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from database.db_helper import get_food_nutrition

def calculate_bmr_and_rda(age: int, gender: str, weight_kg: float, height_cm: float, activity_level: str = "moderate"):
    """
    Compute Basal Metabolic Rate (BMR) and Recommended Dietary Allowances (RDA)
    using the Harris-Benedict Equation as detailed in the Nutritrack project specification.
    """
    gender_norm = gender.strip().lower()
    
    # Harris-Benedict Equation
    if gender_norm in ["male", "m"]:
        bmr = 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age)
    
    # Activity multipliers
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }
    multiplier = activity_multipliers.get(activity_level.lower(), 1.55)
    tdee = bmr * multiplier  # Total Daily Energy Expenditure (Calorie RDA)
    
    # Standard ICMR-NIN Recommended Dietary Allowances
    protein_target = round(weight_kg * 1.0, 1)                  # 1.0g per kg body weight
    carbs_target = round((tdee * 0.55) / 4.0, 1)                # 55% of calories from carbs (4 kcal/g)
    fats_target = round((tdee * 0.25) / 9.0, 1)                 # 25% of calories from healthy fats (9 kcal/g)
    fiber_target = 30.0                                         # ICMR recommendation for adults (30g)
    
    return {
        "bmr_kcal": round(bmr, 1),
        "rda": {
            "calories": round(tdee, 1),
            "protein_g": protein_target,
            "carbs_g": carbs_target,
            "fats_g": fats_target,
            "fiber_g": fiber_target
        }
    }

def calculate_meal_nutrition(meal_items: list):
    """
    Calculate the total nutritional content of a meal based on portion size selections.
    
    :param meal_items: list of dicts, each e.g. {"food_name": "Dal", "portion": "medium", "quantity": 1}
    :return: dict with per-item breakdown and aggregated totals.
    """
    items_breakdown = []
    totals = {
        "weight_grams": 0.0,
        "calories": 0.0,
        "protein_g": 0.0,
        "carbs_g": 0.0,
        "fats_g": 0.0,
        "fiber_g": 0.0
    }
    
    for item in meal_items:
        food_name = item.get("food_name", "")
        portion = item.get("portion", "medium")
        quantity = int(item.get("quantity", 1))
        
        info = get_food_nutrition(food_name, portion)
        if not info:
            continue
            
        scaled_weight = round(info["weight_grams"] * quantity, 1)
        scaled_calories = round(info["calories"] * quantity, 1)
        scaled_protein = round(info["protein_g"] * quantity, 1)
        scaled_carbs = round(info["carbs_g"] * quantity, 1)
        scaled_fats = round(info["fats_g"] * quantity, 1)
        scaled_fiber = round(info["fiber_g"] * quantity, 1)
        
        totals["weight_grams"] += scaled_weight
        totals["calories"] += scaled_calories
        totals["protein_g"] += scaled_protein
        totals["carbs_g"] += scaled_carbs
        totals["fats_g"] += scaled_fats
        totals["fiber_g"] += scaled_fiber
        
        item_data = dict(info)
        item_data["quantity"] = quantity
        item_data["total_calories"] = scaled_calories
        item_data["total_protein"] = scaled_protein
        item_data["total_carbs"] = scaled_carbs
        item_data["total_fats"] = scaled_fats
        item_data["total_fiber"] = scaled_fiber
        items_breakdown.append(item_data)
        
    for k in totals:
        totals[k] = round(totals[k], 1)
        
    return {
        "items": items_breakdown,
        "meal_totals": totals
    }

def calculate_deficiency(rda: dict, meal_totals: dict):
    """
    Compare intake against RDA targets: Deficiency = RDA - Intake.
    """
    report = {}
    for nutrient, target in rda.items():
        intake = meal_totals.get(nutrient, 0.0)
        gap = round(max(0.0, target - intake), 1)
        pct = round(min(100.0, (intake / target * 100.0)) if target > 0 else 100.0, 1)
        
        status = "DEFICIENT" if pct < 70 else ("ADEQUATE" if pct <= 110 else "EXCESS")
        
        report[nutrient] = {
            "target_rda": target,
            "current_intake": intake,
            "deficiency_gap": gap,
            "percent_fulfilled": pct,
            "status": status
        }
    return report
