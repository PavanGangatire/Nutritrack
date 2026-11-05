import React, { useState, useEffect } from 'react';
import { Salad, User, Settings } from 'lucide-react';
import UserProfileModal from './components/UserProfileModal';
import ImageUploader from './components/ImageUploader';
import DetectedItems from './components/DetectedItems';
import NutritionDashboard from './components/NutritionDashboard';
import AllergenAlerts from './components/AllergenAlerts';
import Recommendations from './components/Recommendations';
import { FALLBACK_FOODS } from './data/fallbackFoods';

const DEFAULT_PROFILE = {
  age: 22,
  gender: 'male',
  weight_kg: 68,
  height_cm: 172,
  activity_level: 'moderate',
  dietary_preference: 'vegetarian',
  allergies: ['Dairy'],
};

export default function App() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nutritrack_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [availableFoods, setAvailableFoods] = useState(FALLBACK_FOODS);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);

  // Nutritional results from backend
  const [analysisResult, setAnalysisResult] = useState(null);

  // Fetch all 38 supported foods on mount
  useEffect(() => {
    fetch('/api/foods')
      .then((res) => res.json())
      .then((data) => {
        if (data.foods) setAvailableFoods(data.foods);
      })
      .catch((err) => console.error('Error fetching foods:', err));
  }, []);

  // Save profile changes
  const handleSaveProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('nutritrack_profile', JSON.stringify(newProfile));
    if (detectedItems.length > 0) {
      triggerAnalysis(detectedItems, newProfile);
    }
  };

  // 1. Detect food from uploaded image
  const handleDetectImage = async (file) => {
    setIsDetecting(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Failed to detect food items from image');
        setIsDetecting(false);
        return;
      }

      setAnnotatedImage(data.annotated_image);

      // Map detected classes to portion selection items
      const items = (data.detected_classes || []).map((className) => ({
        food_name: className,
        display_name: className,
        portion: 'medium',
        quantity: 1,
      }));

      setDetectedItems(items);

      if (items.length > 0) {
        await triggerAnalysis(items, profile);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend server at http://127.0.0.1:5000');
    } finally {
      setIsDetecting(false);
    }
  };

  // 2. Calculate complete meal nutrition
  const triggerAnalysis = async (itemsToAnalyze, currentProfile = profile) => {
    if (!itemsToAnalyze || itemsToAnalyze.length === 0) {
      setAnalysisResult(null);
      return;
    }
    setIsCalculating(true);

    try {
      const payload = {
        user_profile: currentProfile,
        meal_items: itemsToAnalyze.map((it) => ({
          food_name: it.food_name,
          portion: it.portion,
          quantity: it.quantity,
        })),
      };

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setAnalysisResult(data);
      } else {
        alert(data.error || 'Failed to compute nutrition analysis');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  // Portion change handler
  const handlePortionChange = (idx, newPortion) => {
    const updated = [...detectedItems];
    updated[idx].portion = newPortion;
    setDetectedItems(updated);
    triggerAnalysis(updated);
  };

  // Quantity change handler
  const handleQuantityChange = (idx, newQty) => {
    const updated = [...detectedItems];
    updated[idx].quantity = newQty;
    setDetectedItems(updated);
    triggerAnalysis(updated);
  };

  // Add missing food item manually
  const handleAddItem = (foodName) => {
    const foodObj = availableFoods.find((f) => f.class_name === foodName);
    const newItem = {
      food_name: foodName,
      display_name: foodObj ? foodObj.display_name : foodName,
      category: foodObj ? foodObj.category : 'Indian Dish',
      portion: 'medium',
      quantity: 1,
      isManual: true,
    };
    const updated = [...detectedItems, newItem];
    setDetectedItems(updated);
    triggerAnalysis(updated);
  };

  // Update/re-label a detected dish (e.g., change Fish Curry to Dal)
  const handleUpdateDish = (idx, newFoodName) => {
    const foodObj = availableFoods.find((f) => f.class_name === newFoodName);
    const updated = [...detectedItems];
    updated[idx] = {
      ...updated[idx],
      food_name: newFoodName,
      display_name: foodObj ? foodObj.display_name : newFoodName,
      category: foodObj ? foodObj.category : 'Indian Dish',
      isManual: true,
    };
    setDetectedItems(updated);
    triggerAnalysis(updated);
  };

  // Remove food item
  const handleRemoveItem = (idx) => {
    const updated = detectedItems.filter((_, i) => i !== idx);
    setDetectedItems(updated);
    triggerAnalysis(updated);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Salad size={24} />
          </div>
          <div className="brand-title">
            <h1>Nutritrack</h1>
            <p>Intelligent Indian Food Recognition & Portion-Aware Nutrition Analysis</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="profile-pill"
            onClick={() => setIsProfileModalOpen(true)}
            title="Edit profile & RDA parameters"
          >
            <User size={16} />
            <span>
              {profile.gender === 'male' ? 'Male' : 'Female'}, {profile.age}y ({profile.weight_kg}kg) • {profile.dietary_preference === 'non-vegetarian' ? '🔴 Non-Veg' : profile.dietary_preference === 'vegan' ? '🌱 Vegan' : '🟢 Veg'}
            </span>
            <Settings size={14} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Left Column: Image Upload & Detection & Portions */}
        <div className="left-col">
          <ImageUploader onDetect={handleDetectImage} isAnalyzing={isDetecting} />

          <DetectedItems
            annotatedImage={annotatedImage}
            detectedItems={detectedItems}
            availableFoods={availableFoods}
            onPortionChange={handlePortionChange}
            onQuantityChange={handleQuantityChange}
            onAddItem={handleAddItem}
            onUpdateDish={handleUpdateDish}
            onRemoveItem={handleRemoveItem}
            onCalculate={() => triggerAnalysis(detectedItems)}
            isCalculating={isCalculating}
            itemNutrition={analysisResult?.meal_nutrition?.items || []}
          />
        </div>

        {/* Right Column: Nutritional Dashboard, Allergens & Recommendations */}
        <div className="right-col">
          {analysisResult ? (
            <>
              <AllergenAlerts allergenAlerts={analysisResult.allergen_alerts} />

              <NutritionDashboard
                mealNutrition={analysisResult.meal_nutrition}
                dailyRDA={analysisResult.daily_rda}
                deficiencyAnalysis={analysisResult.deficiency_analysis}
              />

              <Recommendations recommendations={analysisResult.recommendations} />
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <Salad size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'var(--text-main)', fontWeight: 700 }}>Awaiting Meal Image</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '6px', maxWidth: '380px', margin: '6px auto 0' }}>
                Upload an Indian food image on the left. The system will detect food items with bounding boxes,
                compute portion-aware calories, identify nutrient deficiencies, and alert you of allergens.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
