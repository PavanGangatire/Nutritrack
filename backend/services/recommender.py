import os
import sys
import json

# Path to curated recommendation boosters database
REC_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "recommendation_foods.json")

def load_recommendation_pool():
    if os.path.exists(REC_DB_PATH):
        try:
            with open(REC_DB_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading recommendation_foods.json: {e}")
    return []

REC_POOL = load_recommendation_pool()

def generate_recommendations(
    deficiency_report: dict,
    user_allergies: list = None,
    consumed_foods: list = None,
    dietary_preference: str = "vegetarian"
):
    """
    Generate authentic, personalized Indian nutritional booster recommendations.
    Uses the dedicated Indian Nutrition Booster Collection instead of just main meal dishes,
    ensuring practical, dietitian-grade snacks, drinks, salads, and lean proteins are suggested.
    
    :param deficiency_report: Output from nutrition.calculate_deficiency
    :param user_allergies: List of strings e.g. ['Gluten', 'Dairy']
    :param consumed_foods: List of food names already eaten in this meal
    :param dietary_preference: 'vegetarian', 'non-vegetarian', or 'vegan'
    :return: List of recommended booster items with portion sizes, macros, and reasons.
    """
    user_allergies = [a.lower().strip() for a in (user_allergies or [])]
    consumed_foods = [f.lower().strip() for f in (consumed_foods or [])]
    diet_pref = (dietary_preference or "vegetarian").lower().strip()
    
    # 1. Filter the recommendation pool according to Diet Preference and Allergens
    safe_candidates = []
    for food in REC_POOL:
        dish_diet = food.get("diet_type", "veg")
        dish_vegan = food.get("is_vegan", True)
        
        # Dietary Preference Filter
        if diet_pref in ["vegetarian", "veg"]:
            if dish_diet == "non_veg":
                continue  # Exclude non-veg
        elif diet_pref == "vegan":
            if not dish_vegan or dish_diet == "non_veg":
                continue  # Exclude non-veg and dairy
                
        # Allergen Filter
        dish_allergens = [a.strip().lower() for a in food.get("allergens", "").split(",") if a.strip()]
        is_safe = True
        for ua in user_allergies:
            if any(ua in da for da in dish_allergens):
                is_safe = False
                break
                
        if is_safe:
            safe_candidates.append(food)
            
    # 2. Check Deficit Priorities
    protein_def = deficiency_report.get("protein_g", {})
    fiber_def   = deficiency_report.get("fiber_g", {})
    cal_def     = deficiency_report.get("calories", {})
    
    protein_gap = protein_def.get("deficiency_gap", 0) if protein_def.get("status") == "DEFICIENT" else 0
    fiber_gap   = fiber_def.get("deficiency_gap", 0) if fiber_def.get("status") == "DEFICIENT" else 0
    cal_gap     = cal_def.get("deficiency_gap", 0) if cal_def.get("status") == "DEFICIENT" else 0
    
    recommendations = []
    selected_ids = set()
    
    # Priority A: Protein Deficit
    if protein_gap > 3.0:
        # Rank by protein_g per serving
        protein_boosters = sorted(safe_candidates, key=lambda x: x.get("protein_g", 0), reverse=True)
        for item in protein_boosters[:2]:
            if item["id"] not in selected_ids:
                coverage_pct = min(100, round((item["protein_g"] / protein_gap) * 100)) if protein_gap > 0 else 0
                diet_badge = "🟢 Pure Veg" if item.get("diet_type") == "veg" else "🔴 Non-Veg"
                if item.get("is_vegan"):
                    diet_badge = "🌱 Vegan"
                    
                recommendations.append({
                    "food_name": item["food_name"],
                    "category": item["category"],
                    "diet_type": item["diet_type"],
                    "diet_badge": diet_badge,
                    "target_nutrient": "Protein",
                    "nutrient_highlight": f"{item['protein_g']}g Protein ({coverage_pct}% of remaining gap)",
                    "serving_size": item["serving_size"],
                    "calories": item["calories"],
                    "protein_g": item["protein_g"],
                    "carbs_g": item["carbs_g"],
                    "fats_g": item["fats_g"],
                    "fiber_g": item["fiber_g"],
                    "reason": f"Provides {item['protein_g']}g clean protein to cover {coverage_pct}% of your remaining {round(protein_gap, 1)}g deficit.",
                    "dietitian_note": item.get("dietitian_note", "")
                })
                selected_ids.add(item["id"])
                
    # Priority B: Fiber Deficit
    if fiber_gap > 2.0:
        fiber_boosters = sorted(
            [c for c in safe_candidates if c["id"] not in selected_ids],
            key=lambda x: x.get("fiber_g", 0),
            reverse=True
        )
        for item in fiber_boosters[:2]:
            if len(recommendations) < 4:
                coverage_pct = min(100, round((item["fiber_g"] / fiber_gap) * 100)) if fiber_gap > 0 else 0
                diet_badge = "🟢 Pure Veg" if item.get("diet_type") == "veg" else "🔴 Non-Veg"
                if item.get("is_vegan"):
                    diet_badge = "🌱 Vegan"
                    
                recommendations.append({
                    "food_name": item["food_name"],
                    "category": item["category"],
                    "diet_type": item["diet_type"],
                    "diet_badge": diet_badge,
                    "target_nutrient": "Dietary Fiber",
                    "nutrient_highlight": f"{item['fiber_g']}g Fiber ({coverage_pct}% of remaining gap)",
                    "serving_size": item["serving_size"],
                    "calories": item["calories"],
                    "protein_g": item["protein_g"],
                    "carbs_g": item["carbs_g"],
                    "fats_g": item["fats_g"],
                    "fiber_g": item["fiber_g"],
                    "reason": f"Rich in natural prebiotic fiber to satisfy {coverage_pct}% of your remaining {round(fiber_gap, 1)}g target.",
                    "dietitian_note": item.get("dietitian_note", "")
                })
                selected_ids.add(item["id"])
                
    # Priority C: General Hydration / Digestive / Light Healthy Addition
    if len(recommendations) < 3:
        remaining_pool = [c for c in safe_candidates if c["id"] not in selected_ids]
        # Prefer refreshing drinks/salads like Chaas or Kachumber or Papaya
        preferred_order = ["mint_chaas", "kachumber_salad", "fresh_papaya_bowl", "roasted_makhana", "clear_moong_dal_soup"]
        for pref_id in preferred_order:
            for c in remaining_pool:
                if c["id"] == pref_id and len(recommendations) < 3:
                    diet_badge = "🟢 Pure Veg" if c.get("diet_type") == "veg" else "🔴 Non-Veg"
                    if c.get("is_vegan"):
                        diet_badge = "🌱 Vegan"
                    recommendations.append({
                        "food_name": c["food_name"],
                        "category": c["category"],
                        "diet_type": c["diet_type"],
                        "diet_badge": diet_badge,
                        "target_nutrient": "Digestive & Probiotic Health",
                        "nutrient_highlight": f"{c['calories']} kcal | {c['serving_size']}",
                        "serving_size": c["serving_size"],
                        "calories": c["calories"],
                        "protein_g": c["protein_g"],
                        "carbs_g": c["carbs_g"],
                        "fats_g": c["fats_g"],
                        "fiber_g": c["fiber_g"],
                        "reason": "Light, wholesome addition to promote digestion and nutrient absorption.",
                        "dietitian_note": c.get("dietitian_note", "")
                    })
                    selected_ids.add(c["id"])
                    
    return recommendations[:4]
