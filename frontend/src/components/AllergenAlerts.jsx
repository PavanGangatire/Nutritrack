import React from 'react';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function AllergenAlerts({ allergenAlerts }) {
  if (!allergenAlerts) return null;

  if (!allergenAlerts.has_allergen_alert) {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CheckCircle2 size={20} color="#16a34a" />
        <div>
          <h4 style={{ color: '#166534', fontSize: '0.9rem', fontWeight: 700 }}>Allergen Safety Check: All Clear</h4>
          <p style={{ color: '#15803d', fontSize: '0.8rem', marginTop: '2px' }}>
            No declared allergens found in the detected food items.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {allergenAlerts.alerts.map((alert, idx) => (
        <div key={idx} className="alert-box">
          <div className="alert-icon">
            <AlertOctagon size={24} />
          </div>
          <div className="alert-content">
            <h4>Allergen Alert: {alert.food_name}</h4>
            <p><strong>Trigger:</strong> {alert.allergens_detected.join(', ')}</p>
            <p style={{ marginTop: '4px' }}>{alert.message}</p>
            {alert.ingredients && (
              <p style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '4px' }}>
                <strong>Ingredients:</strong> {alert.ingredients}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
