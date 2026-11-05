import React from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function NutritionDashboard({ mealNutrition, dailyRDA, deficiencyAnalysis }) {
  if (!mealNutrition || !mealNutrition.meal_totals) return null;

  const totals     = mealNutrition.meal_totals;
  const items      = mealNutrition.items || [];
  const deficiency = deficiencyAnalysis || {};

  const getStatusBadge = (status) => {
    if (status === 'ADEQUATE') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700 }}>
          <CheckCircle size={12} /> Target Met
        </span>
      );
    }
    if (status === 'EXCESS') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d97706', fontSize: '0.72rem', fontWeight: 700 }}>
          <AlertTriangle size={12} /> High Intake
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700 }}>
        <ShieldAlert size={12} /> Deficit Gap
      </span>
    );
  };

  return (
    <div className="card">
      <div className="card-title">
        <Activity size={20} color="var(--primary)" /> Meal Nutritional Breakdown &amp; RDA Comparison
      </div>

      {/* ── Per-Dish Breakdown Table ── */}
      {items.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: '0.78rem', fontWeight: 700, color: '#334155',
            marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            🍽️ Per-Dish Nutrition Breakdown
          </h4>
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left',   color: '#475569', fontWeight: 700 }}>Dish</th>
                  <th style={{ padding: '8px 8px',  textAlign: 'center', color: '#f59e0b', fontWeight: 700 }}>Cal (kcal)</th>
                  <th style={{ padding: '8px 8px',  textAlign: 'center', color: '#10b981', fontWeight: 700 }}>Protein (g)</th>
                  <th style={{ padding: '8px 8px',  textAlign: 'center', color: '#6366f1', fontWeight: 700 }}>Carbs (g)</th>
                  <th style={{ padding: '8px 8px',  textAlign: 'center', color: '#f43f5e', fontWeight: 700 }}>Fats (g)</th>
                  <th style={{ padding: '8px 8px',  textAlign: 'center', color: '#06b6d4', fontWeight: 700 }}>Fiber (g)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const qty = item.quantity || 1;
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 600, color: '#1e293b' }}>
                        {item.display_name}
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginLeft: '5px' }}>
                          {item.weight_grams}g{qty > 1 ? ` × ${qty}` : ''}
                        </span>
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 700, color: '#f59e0b' }}>
                        {Math.round(item.calories * qty)}
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 600, color: '#10b981' }}>
                        {(item.protein_g * qty).toFixed(1)}
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 600, color: '#6366f1' }}>
                        {(item.carbs_g * qty).toFixed(1)}
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 600, color: '#f43f5e' }}>
                        {(item.fats_g * qty).toFixed(1)}
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 600, color: '#06b6d4' }}>
                        {(item.fiber_g * qty).toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr style={{ background: '#f0fdf4', borderTop: '2px solid #a7f3d0' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 800, color: '#064e3b' }}>
                    Total Meal
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, color: '#f59e0b' }}>{totals.calories}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, color: '#10b981' }}>{totals.protein_g}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, color: '#6366f1' }}>{totals.carbs_g}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, color: '#f43f5e' }}>{totals.fats_g}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, color: '#06b6d4' }}>{totals.fiber_g}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Total Energy Summary ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-hover)', textTransform: 'uppercase' }}>
            Total Meal Energy
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b' }}>
            {totals.calories} <span style={{ fontSize: '1rem', fontWeight: 600 }}>kcal</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#047857' }}>
            Meal Weight: {totals.weight_grams}g
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Daily Target (Harris-Benedict)</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {dailyRDA?.calories || 2000} kcal
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
            {((totals.calories / (dailyRDA?.calories || 2000)) * 100).toFixed(0)}% fulfilled
          </span>
        </div>
      </div>

      {/* ── Macronutrient Cards ── */}
      <div className="macro-grid">
        <div className="macro-box">
          <div className="label">Protein</div>
          <div className="val">{totals.protein_g}g</div>
          <div className="target">Target: {dailyRDA?.protein_g || 60}g</div>
          <div style={{ marginTop: '6px' }}>{getStatusBadge(deficiency?.protein_g?.status)}</div>
        </div>
        <div className="macro-box">
          <div className="label">Carbs</div>
          <div className="val">{totals.carbs_g}g</div>
          <div className="target">Target: {dailyRDA?.carbs_g || 250}g</div>
          <div style={{ marginTop: '6px' }}>{getStatusBadge(deficiency?.carbs_g?.status)}</div>
        </div>
        <div className="macro-box">
          <div className="label">Fats</div>
          <div className="val">{totals.fats_g}g</div>
          <div className="target">Target: {dailyRDA?.fats_g || 65}g</div>
          <div style={{ marginTop: '6px' }}>{getStatusBadge(deficiency?.fats_g?.status)}</div>
        </div>
        <div className="macro-box">
          <div className="label">Dietary Fiber</div>
          <div className="val">{totals.fiber_g}g</div>
          <div className="target">Target: {dailyRDA?.fiber_g || 30}g</div>
          <div style={{ marginTop: '6px' }}>{getStatusBadge(deficiency?.fiber_g?.status)}</div>
        </div>
      </div>

      {/* ── Progress Bars ── */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: '#334155' }}>
          Daily Intake vs RDA Fulfillment
        </h4>
        {[
          { key: 'calories',  label: 'Calories (kcal)',     current: totals.calories,  target: dailyRDA?.calories  || 2000, color: '#f59e0b' },
          { key: 'protein_g', label: 'Protein (g)',         current: totals.protein_g, target: dailyRDA?.protein_g || 60,   color: '#10b981' },
          { key: 'carbs_g',   label: 'Carbs (g)',           current: totals.carbs_g,   target: dailyRDA?.carbs_g   || 250,  color: '#6366f1' },
          { key: 'fiber_g',   label: 'Dietary Fiber (g)',   current: totals.fiber_g,   target: dailyRDA?.fiber_g   || 30,   color: '#06b6d4' }
        ].map((m) => {
          const pct = Math.min(100, Math.round((m.current / m.target) * 100));
          return (
            <div key={m.key} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                <span>{m.label}</span>
                <span>{pct}% ({m.current} / {m.target})</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: m.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
