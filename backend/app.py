import os
import sys
from flask import Flask, request, jsonify, send_from_directory

# Add root folder to sys.path
sys.path.append(os.path.dirname(__file__))

from database.db_helper import FOOD_DB, load_food_database
from services.nutrition import calculate_bmr_and_rda, calculate_meal_nutrition, calculate_deficiency
from services.allergen import check_allergens
from services.recommender import generate_recommendations

# Pre-load YOLO model at startup
try:
    from services.detector import get_yolo_model
    print("Pre-loading YOLOv8 model into memory...")
    get_yolo_model()
    print("YOLOv8 model loaded successfully!")
except Exception as e:
    print(f"Warning: Model pre-load deferred: {e}")

app = Flask(__name__)

try:
    from flask_cors import CORS
    CORS(app)
except ImportError:
    @app.after_request
    def add_cors_headers(response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend status and model presence."""
    model_path = os.path.join(os.path.dirname(__file__), "models", "best.pt")
    model_exists = os.path.exists(model_path)
    
    return jsonify({
        "status": "healthy",
        "service": "Nutritrack AI Backend",
        "model_file_present": model_exists,
        "database_classes_loaded": len(FOOD_DB)
    }), 200

@app.route("/api/foods", methods=["GET"])
def get_all_foods():
    """Retrieve all 38 food classes and standard portion definitions."""
    foods = load_food_database()
    return jsonify({
        "success": True,
        "count": len(foods),
        "foods": foods
    }), 200

@app.route("/api/sample-images/<filename>", methods=["GET"])
def get_sample_image(filename):
    """Serve test images for quick one-click testing in UI."""
    sample_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test_images")
    return send_from_directory(sample_dir, filename)

@app.route("/api/detect", methods=["POST"])
def detect_food():
    """
    Accepts an uploaded meal image and returns detected items + annotated image.
    Form data:
      - 'image': image file (jpg/png)
      - 'conf': confidence threshold float (optional, default 0.25)
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file provided in request (key: 'image')"}), 400
        
    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"error": "No selected file"}), 400
        
    conf = float(request.form.get("conf", 0.20))
    
    try:
        from services.detector import detect_food_from_image
        image_bytes = image_file.read()
        result = detect_food_from_image(image_bytes, conf_threshold=conf)
        return jsonify(result), 200
    except ModuleNotFoundError as e:
        return jsonify({
            "error": "Ultralytics/PyTorch module not installed yet.",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({"error": f"Detection failed: {str(e)}"}), 500

@app.route("/api/analyze-meal", methods=["POST"])
def analyze_meal():
    """
    Accepts meal items with portion sizes + user profile data.
    Returns complete nutritional report, RDA comparison, deficiency gaps, allergen alerts, and recommendations.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON payload required"}), 400
        
    user_profile = data.get("user_profile", {})
    meal_items = data.get("meal_items", [])
    
    if not meal_items:
        return jsonify({"error": "meal_items array cannot be empty"}), 400
        
    # 1. User Profile & BMR/RDA computation
    age = int(user_profile.get("age", 25))
    gender = user_profile.get("gender", "male")
    weight_kg = float(user_profile.get("weight_kg", 65.0))
    height_cm = float(user_profile.get("height_cm", 170.0))
    activity_level = user_profile.get("activity_level", "moderate")
    user_allergies = user_profile.get("allergies", [])
    
    bmr_data = calculate_bmr_and_rda(age, gender, weight_kg, height_cm, activity_level)
    
    # 2. Meal Nutrition Calculation
    nutrition_data = calculate_meal_nutrition(meal_items)
    
    # 3. Deficiency Analysis
    deficiency_report = calculate_deficiency(bmr_data["rda"], nutrition_data["meal_totals"])
    
    # 4. Allergen Safety Detection
    food_names = [item.get("food_name") for item in meal_items]
    allergen_report = check_allergens(food_names, user_allergies)
    
    # 5. Personalized Indian Dietary Recommendations
    dietary_preference = user_profile.get("dietary_preference", "vegetarian")
    recommendations = generate_recommendations(
        deficiency_report=deficiency_report,
        user_allergies=user_allergies,
        consumed_foods=food_names,
        dietary_preference=dietary_preference
    )
    
    return jsonify({
        "success": True,
        "bmr_kcal": bmr_data["bmr_kcal"],
        "daily_rda": bmr_data["rda"],
        "meal_nutrition": nutrition_data,
        "deficiency_analysis": deficiency_report,
        "allergen_alerts": allergen_report,
        "recommendations": recommendations
    }), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Nutritrack API Server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
