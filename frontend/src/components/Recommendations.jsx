import React from 'react';
import { Sparkles, Lightbulb, Clock } from 'lucide-react';

export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title">
        <Sparkles size={20} color="var(--primary)" /> Smart Indian Nutrition Boosters &amp; Snacks
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Curated authentic Indian dietary additions (salads, beverages &amp; snacks) with exact portion sizes to bridge your detected nutrient gaps safely:
      </p>

      <div className="rec-grid">
        {recommendations.map((rec, idx) => {
          const isNonVeg = rec.diet_type === 'non_veg';
          const isVegan = rec.diet_badge && rec.diet_badge.includes('Vegan');
          const badgeBg = isNonVeg ? '#fee2e2' : isVegan ? '#ecfdf5' : '#dcfce7';
          const badgeColor = isNonVeg ? '#b91c1c' : isVegan ? '#047857' : '#15803d';

          return (
            <div key={idx} className="rec-card" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                  {rec.food_name}
                </h5>
                {rec.diet_badge && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: badgeBg,
                    color: badgeColor,
                    whiteSpace: 'nowrap'
                  }}>
                    {rec.diet_badge}
                  </span>
                )}
              </div>

              {/* Category & Portion */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                  {rec.category}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#047857', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  📏 {rec.serving_size}
                </span>
              </div>

              {/* Target Highlight */}
              <div className="nutrient-badge" style={{ marginBottom: '8px' }}>
                🎯 {rec.target_nutrient}: {rec.nutrient_highlight || `${rec.protein_g}g Protein`}
              </div>

              {/* Macro Chips */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fef3c7' }}>
                  {rec.calories} kcal
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1fae5' }}>
                  {rec.protein_g}g Protein
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#06b6d4', background: '#ecfeff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cffafe' }}>
                  {rec.fiber_g}g Fiber
                </span>
              </div>

              {/* Reason */}
              <p style={{ fontSize: '0.8rem', color: '#334155', margin: '4px 0 8px 0', lineHeight: '1.4' }}>
                {rec.reason}
              </p>

              {/* Dietitian Note */}
              {rec.dietitian_note && (
                <div style={{
                  marginTop: 'auto',
                  padding: '8px 10px',
                  background: '#f8fafc',
                  borderLeft: '3px solid var(--primary)',
                  borderRadius: '0 6px 6px 0',
                  fontSize: '0.75rem',
                  color: '#475569',
                  lineHeight: '1.35',
                  display: 'flex',
                  gap: '6px'
                }}>
                  <Lightbulb size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Dietitian Tip:</strong> {rec.dietitian_note}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
