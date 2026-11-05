import os
import sys
import json

# Ensure paths
sys.path.append(os.path.dirname(__file__))

from services.detector import detect_food_from_image
from services.nutrition import calculate_bmr_and_rda, calculate_meal_nutrition, calculate_deficiency
from services.allergen import check_allergens
from services.recommender import generate_recommendations

def run_test_on_image(image_path: str):
    print(f"\n=======================================================")
    print(f" Testing Nutritrack Pipeline on: {os.path.basename(image_path)}")
    print(f"=======================================================\n")
    
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return
        
    with open(image_path, "rb") as f:
        img_bytes = f.read()
        
    print("[1] Running YOLOv8 Detection...")
    detection_res = detect_food_from_image(img_bytes, conf_threshold=0.25)
    
    detected = detection_res["detected_classes"]
    print(f"Detected {len(detection_res['detections'])} items across classes: {detected}")
    for d in detection_res["detections"]:
        print(f" - {d['class_name']}: {d['confidence']*100:.1f}% confidence, Box: {d['box']}")
        
    if not detected:
        print("No items detected above threshold.")
        return
        
    # Simulate User Profile
    user_profile = {
        "age": 22,
        "gender": "male",
        "weight_kg": 68.0,
        "height_cm": 172.0,
        "activity_level": "moderate",
        "allergies": ["Dairy"]
    }
    
    # Simulate portion selection (defaulting to Medium for detected items)
    meal_items = [{"food_name": c, "portion": "medium", "quantity": 1} for c in detected]
    
    print("\n[2] User Profile & Harris-Benedict RDA Target:")
    bmr_data = calculate_bmr_and_rda(
        user_profile["age"], user_profile["gender"],
        user_profile["weight_kg"], user_profile["height_cm"],
        user_profile["activity_level"]
    )
    print(f" - BMR: {bmr_data['bmr_kcal']} kcal")
    print(f" - Daily Targets: {bmr_data['rda']}")
    
    print("\n[3] Calculating Portion-Aware Nutrition:")
    nutrition = calculate_meal_nutrition(meal_items)
    for item in nutrition["items"]:
        print(f" - {item['display_name']} ({item['portion_selected']}, {item['weight_grams']}g): {item['calories']} kcal, {item['protein_g']}g protein, {item['carbs_g']}g carbs, {item['fats_g']}g fat")
    print(f" Total Meal: {nutrition['meal_totals']}")
    
    print("\n[4] Allergen Check (User Allergies: Dairy):")
    allergy_res = check_allergens(detected, user_profile["allergies"])
    if allergy_res["has_allergen_alert"]:
        for alert in allergy_res["alerts"]:
            print(f"  [ALERT] {alert['message']}")
    else:
        print("  [SAFE] No conflicting allergens found in this meal.")
        
    print("\n[5] Deficiency Analysis:")
    deficiency = calculate_deficiency(bmr_data["rda"], nutrition["meal_totals"])
    for nut, val in deficiency.items():
        print(f" - {nut}: {val['current_intake']} / {val['target_rda']} ({val['percent_fulfilled']}%) -> {val['status']}")
        
    print("\n[6] Personalized Food Recommendations:")
    recs = generate_recommendations(deficiency, user_profile["allergies"], detected)
    for r in recs:
        print(f" - Suggestion: {r['food_name']} ({r['target_nutrient']}) -> {r['reason']}")
        
    print("\n[Done] Pipeline test completed successfully!")

if __name__ == "__main__":
    img = sys.argv[1] if len(sys.argv) > 1 else "test_images/sample_thali.jpg"
    run_test_on_image(img)
