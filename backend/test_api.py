import json
import unittest
from app import app

class NutritrackAPITestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["model_file_present"], True)
        self.assertEqual(data["database_classes_loaded"], 38)
        print("PASS: Health Check endpoint verified (38 classes loaded, model present)")

    def test_get_foods(self):
        response = self.client.get("/api/foods")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["count"], 38)
        print("PASS: /api/foods endpoint verified (Returned all 38 dishes)")

    def test_meal_analysis_with_deficiency_and_allergy(self):
        # Scenario: User has 'Dairy' allergy and eats Chapati + Dal Tadka
        payload = {
            "user_profile": {
                "age": 21,
                "gender": "male",
                "weight_kg": 68.0,
                "height_cm": 172.0,
                "activity_level": "moderate",
                "allergies": ["Dairy"]
            },
            "meal_items": [
                {"food_name": "Chapati", "portion": "medium", "quantity": 2},
                {"food_name": "Dal", "portion": "medium", "quantity": 1}
            ]
        }
        response = self.client.post(
            "/api/analyze-meal",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Verify Meal Nutrition Calculated
        totals = data["meal_nutrition"]["meal_totals"]
        self.assertGreater(totals["calories"], 0)
        self.assertGreater(totals["protein_g"], 0)
        
        # Verify Deficiency Analysis
        deficiency = data["deficiency_analysis"]
        self.assertIn("protein_g", deficiency)
        self.assertIn("calories", deficiency)
        
        # Verify Allergen alerts (Chapati & Dal have no dairy, so alert should be False)
        self.assertFalse(data["allergen_alerts"]["has_allergen_alert"])
        
        # Verify Recommendations generated
        recommendations = data["recommendations"]
        self.assertGreater(len(recommendations), 0)
        print("PASS: Meal analysis endpoint verified (Nutrition, RDA, Deficiency & Recommendations)")

    def test_allergen_alert_triggered(self):
        # Scenario: User with Dairy allergy logs 'Paneer Butter Masala'
        payload = {
            "user_profile": {
                "age": 22,
                "gender": "female",
                "weight_kg": 55.0,
                "height_cm": 160.0,
                "allergies": ["Dairy"]
            },
            "meal_items": [
                {"food_name": "Paneer Butter Masala", "portion": "medium", "quantity": 1}
            ]
        }
        response = self.client.post(
            "/api/analyze-meal",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Allergen alert should be triggered!
        self.assertTrue(data["allergen_alerts"]["has_allergen_alert"])
        self.assertIn("Dairy", data["allergen_alerts"]["alerts"][0]["allergens_detected"])
        print("PASS: Allergen alert successfully detected and triggered for Dairy!")

if __name__ == "__main__":
    unittest.main()
