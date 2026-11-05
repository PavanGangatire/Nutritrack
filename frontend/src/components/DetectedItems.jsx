import React, { useState } from 'react';
import { Utensils, Plus, Minus, ArrowRight, Trash2, PlusCircle, Edit3, Check } from 'lucide-react';
import { FALLBACK_FOODS } from '../data/fallbackFoods';

export default function DetectedItems({
  annotatedImage,
  detectedItems,
  availableFoods = [],
  onPortionChange,
  onQuantityChange,
  onAddItem,
  onUpdateDish,
  onRemoveItem,
  onCalculate,
  isCalculating,
  itemNutrition = []
}) {
  const [selectedFoodToAdd, setSelectedFoodToAdd] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Guarantee list of 38 foods is always available
  const foodOptions = (availableFoods && availableFoods.length > 0) ? availableFoods : FALLBACK_FOODS;

  const handleAdd = () => {
    if (!selectedFoodToAdd) {
      alert('Please select an Indian dish from the dropdown list before clicking Add.');
      return;
    }
    onAddItem(selectedFoodToAdd);
    setSelectedFoodToAdd('');
    setShowAddMenu(false);
  };

  const handleDishChange = (idx, newClassName) => {
    if (onUpdateDish && newClassName) {
      onUpdateDish(idx, newClassName);
    }
    setEditingIndex(null);
  };

  const NutrientBadge = ({ label, value, unit, color }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: '#fff', borderRadius: '8px', padding: '5px 10px',
      border: `1.5px solid ${color}33`, minWidth: '62px', flex: '1'
    }}>
      <span style={{ fontSize: '0.82rem', fontWeight: 800, color }}>{value}{unit}</span>
      <span style={{ fontSize: '0.67rem', color: '#94a3b8', fontWeight: 600, marginTop: '1px' }}>{label}</span>
    </div>
  );

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Utensils size={20} color="var(--primary)" /> Detected Food Items &amp; Portions
        </div>
      </div>

      {annotatedImage && (
        <div className="preview-container">
          <img src={annotatedImage} alt="YOLOv8 Detection with Bounding Boxes" />
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Verify detected items, tune portion sizes, edit misclassified dishes, or add missing ones:
        </p>

        <div className="detected-list">
          {detectedItems.map((item, idx) => {
            const nut = itemNutrition[idx] || null;
            const qty = item.quantity || 1;
            const isEditing = editingIndex === idx;

            return (
              <div
                key={`${item.food_name}-${idx}`}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: isEditing ? '2px solid var(--primary)' : '1px solid var(--border)',
                  marginBottom: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}
              >
                {/* ── Food Header Row ── */}
                <div
                  className="food-item-row"
                  style={{ marginBottom: 0, borderBottom: nut ? '1px dashed #e2e8f0' : 'none' }}
                >
                  <div className="food-info" style={{ flex: 1, minWidth: '160px' }}>
                    {isEditing ? (
                      /* Inline Dish Change Dropdown */
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <select
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1.5px solid var(--primary)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            maxWidth: '180px'
                          }}
                          defaultValue={item.food_name}
                          onChange={(e) => handleDishChange(idx, e.target.value)}
                        >
                          {foodOptions.map((f) => (
                            <option key={f.class_name} value={f.class_name}>
                              {f.display_name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          style={{
                            background: 'var(--primary-light)',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary-hover)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      /* Standard Food Name display with Change Dish trigger */
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4 style={{ margin: 0 }}>{item.display_name || item.food_name}</h4>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(idx)}
                          style={{
                            border: 'none',
                            background: '#f1f5f9',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="Wrong detection? Click to change dish"
                        >
                          <Edit3 size={11} />
                          <span>Change</span>
                        </button>
                      </div>
                    )}
                    <span style={{ display: 'block', marginTop: '2px', fontSize: '0.75rem', color: '#64748b' }}>
                      {item.category || 'Indian Dish'}
                      {item.isManual
                        ? ' • (Manually Added/Edited)'
                        : item.confidence
                        ? ` • ${(item.confidence * 100).toFixed(0)}% conf`
                        : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Portion chips */}
                    <div className="portion-chips">
                      {['small', 'medium', 'large'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`portion-btn ${item.portion === size ? 'active' : ''}`}
                          onClick={() => onPortionChange(idx, size)}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Quantity adjuster */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: '#f8fafc', padding: '2px 6px',
                      borderRadius: '16px', border: '1px solid var(--border)'
                    }}>
                      <button
                        type="button"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }}
                        onClick={() => onQuantityChange(idx, Math.max(1, qty - 1))}
                        title="Decrease quantity"
                      >
                        <Minus size={13} color="#64748b" />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }}
                        onClick={() => onQuantityChange(idx, qty + 1)}
                        title="Increase quantity"
                      >
                        <Plus size={13} color="#64748b" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                      onClick={() => onRemoveItem(idx)}
                      title="Remove this dish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* ── Per-Item Nutrition Panel ── */}
                {nut && (
                  <div style={{
                    padding: '8px 12px 10px',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)'
                  }}>
                    <div style={{
                      fontSize: '0.67rem', color: '#64748b', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px'
                    }}>
                      Nutrition — {nut.weight_grams}g{qty > 1 ? ` × ${qty} = ${nut.weight_grams * qty}g` : ''}
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <NutrientBadge label="Calories" value={Math.round(nut.calories * qty)} unit=" kcal" color="#f59e0b" />
                      <NutrientBadge label="Protein"  value={(nut.protein_g * qty).toFixed(1)} unit="g" color="#10b981" />
                      <NutrientBadge label="Carbs"    value={(nut.carbs_g * qty).toFixed(1)} unit="g" color="#6366f1" />
                      <NutrientBadge label="Fats"     value={(nut.fats_g * qty).toFixed(1)} unit="g" color="#f43f5e" />
                      <NutrientBadge label="Fiber"    value={(nut.fiber_g * qty).toFixed(1)} unit="g" color="#06b6d4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Add Missing Food ── */}
        <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border)', paddingTop: '14px' }}>
          {!showAddMenu ? (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}
              onClick={() => setShowAddMenu(true)}
            >
              <PlusCircle size={16} color="var(--primary)" /> + Add Missing Food (e.g. Chapati, Dal, Salad)
            </button>
          ) : (
            <div style={{
              background: '#f8fafc',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)'
            }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Select an Indian dish to add to this meal:
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '0.88rem',
                    background: '#fff'
                  }}
                  value={selectedFoodToAdd}
                  onChange={(e) => setSelectedFoodToAdd(e.target.value)}
                >
                  <option value="">-- Choose Indian Dish to Add ({foodOptions.length} dishes available) --</option>
                  {foodOptions.map((f) => (
                    <option key={f.class_name} value={f.class_name}>
                      {f.display_name} ({f.category})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 700 }}
                  onClick={handleAdd}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setShowAddMenu(false);
                    setSelectedFoodToAdd('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {detectedItems.length > 0 && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '18px', padding: '12px' }}
            onClick={onCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? 'Computing Nutrition...' : 'Recalculate Meal Nutrition'}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
