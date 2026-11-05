# Nutritrack — Intelligent Indian Food Recognition & Portion-Aware Nutrition Analysis

Nutritrack is an AI-powered dietary assessment web application designed specifically for Indian cuisine. It combines a custom **YOLOv8** object detection model (trained on 38 Indian food categories) with portion estimation, nutritional breakdown, Harris-Benedict RDA deficit calculations, allergen safety screening, and personalized Indian dietary recommendations.

---

## 🌟 Key Features

- **Automated Food Recognition**: Custom YOLOv8 model detects complex dishes and thali platters (e.g., Dal, Chole, Paneer Butter Masala, Samosa, Dosa, Idli, Gulab Jamun).
- **Per-Dish & Meal Nutrition**: Computes exact calories, protein, carbohydrates, fats, and dietary fiber per dish and for the entire meal based on portion size (Small / Medium / Large).
- **Personalized RDA & Deficiency Analysis**: Harris-Benedict BMR equation tailors daily nutrient targets based on age, gender, weight, height, and activity level.
- **Dietary Preference Filtering**: Strict filtering for **Vegetarian**, **Non-Vegetarian**, and **Vegan** diets.
- **Allergen Alerts**: Real-time alerts for common allergens (Dairy, Gluten, Nuts, Soy, Fish, Egg).
- **Smart Indian Dietary Boosters**: Recommends authentic Indian health snacks and accompaniments (e.g., Sprouted Moong Salad, Roasted Chana, Chaas, Paneer cubes) to fill specific nutrient gaps.
- **Human-in-the-Loop Controls**: Edit detected dish classes, tune portion sizes, adjust quantities, or add missing food items in 1 click.

---

## 🏗️ System Architecture

```
Nutritrack/
├── backend/
│   ├── app.py                      # Flask REST API entry point
│   ├── models/
│   │   └── best.pt                 # Trained YOLOv8 weights (38 classes)
│   ├── database/
│   │   ├── food_database.json      # 38-class Indian food database with macros & portions
│   │   ├── recommendation_foods.json # Curated Indian booster pool
│   │   └── db_helper.py            # Nutrition lookup helper
│   ├── services/
│   │   ├── detector.py             # YOLOv8 inference & bounding box renderer
│   │   ├── nutrition.py            # Harris-Benedict BMR, RDA & deficit gap logic
│   │   ├── allergen.py             # Allergen screening engine
│   │   └── recommender.py          # Personalized recommendation engine
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main application state & layout
│   │   ├── components/             # React modular UI components
│   │   │   ├── ImageUploader.jsx
│   │   │   ├── DetectedItems.jsx
│   │   │   ├── NutritionDashboard.jsx
│   │   │   ├── AllergenAlerts.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   └── UserProfileModal.jsx
│   │   └── data/fallbackFoods.js   # 38-dish offline fallback list
│   └── package.json
│
├── test_images/                    # Diverse Indian test meal images
├── run_backend.bat                 # 1-Click Windows backend launcher
└── run_frontend.bat                # 1-Click Windows frontend launcher
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+ / 3.11 / 3.13** (with Anaconda or standard Python)
- **Node.js (v18+)** & npm
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

---

### 2. Backend Setup (Flask API)

```bash
# Navigate to project root
pip install -r backend/requirements.txt

# Start Flask server
python backend/app.py
```
*Backend runs on `http://127.0.0.1:5000`.*

> **Windows Users**: You can also double-click `run_backend.bat`.

---

### 3. Frontend Setup (React + Vite)

```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

> **Windows Users**: You can also double-click `run_frontend.bat`.

---

## 🍲 Supported Indian Food Classes (38 Classes)

Aloo Gobi, Aloo Masala, Bhatura, Bhindi Masala, Biryani, Chai, Chapati, Chole, Coconut Chutney, Dal, Dosa, Dum Aloo, Fish Curry, Ghevar, Green Chutney, Gulab Jamun, Idli, Jalebi, Kebab, Kheer, Kulfi, Lassi, Mutton Curry, Onion Pakoda, Palak Paneer, Paneer Butter Masala, Papad, Peda, Poha, Puri, Rajma, Ras Malai, Rice, Samosa, Shahi Paneer, Uttapam, Vada, Watermelon.

---

## 📜 License & Acknowledgments

- Developed as a Final Year Engineering Project on Intelligent Dietary Assessment.
- Dataset and nutrition baselines adapted from standard Indian Food Composition Tables (IFCT / ICMR).
