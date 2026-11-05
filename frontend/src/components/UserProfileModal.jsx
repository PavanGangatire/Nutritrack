import React, { useState } from 'react';
import { User, X, Check } from 'lucide-react';

const ALLERGEN_OPTIONS = ['Dairy', 'Gluten', 'Nuts', 'Fish', 'Soy'];

export default function UserProfileModal({ isOpen, onClose, profile, onSave }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({ ...profile });

  const handleAllergyToggle = (allergy) => {
    const current = formData.allergies || [];
    if (current.includes(allergy)) {
      setFormData({ ...formData, allergies: current.filter((a) => a !== allergy) });
    } else {
      setFormData({ ...formData, allergies: [...current, allergy] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700 }}>
            <User size={20} color="var(--primary)" /> Health Profile & RDA Settings
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Age (years)</label>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                min="30"
                max="200"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Physical Activity Level</label>
            <select
              value={formData.activity_level}
              onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
            >
              <option value="sedentary">Sedentary (Desk job / Little exercise)</option>
              <option value="light">Lightly Active (1-3 days/week)</option>
              <option value="moderate">Moderately Active (3-5 days/week)</option>
              <option value="active">Very Active (6-7 days/week)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Dietary Preference</label>
            <select
              value={formData.dietary_preference || 'vegetarian'}
              onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
              style={{ fontWeight: 600 }}
            >
              <option value="vegetarian">🟢 Vegetarian (No meat/fish/egg, dairy OK)</option>
              <option value="non-vegetarian">🔴 Non-Vegetarian (All foods allowed)</option>
              <option value="vegan">🌱 Vegan (Strict plant-based, no dairy/eggs/meat)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Known Dietary Allergens / Sensitivities</label>
            <div className="checkbox-group">
              {ALLERGEN_OPTIONS.map((allergy) => {
                const isSelected = (formData.allergies || []).includes(allergy);
                return (
                  <label
                    key={allergy}
                    className="checkbox-chip"
                    style={{
                      background: isSelected ? '#fee2e2' : '#f1f5f9',
                      color: isSelected ? '#b91c1c' : '#475569',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleAllergyToggle(allergy)}
                    />
                    {allergy}
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
