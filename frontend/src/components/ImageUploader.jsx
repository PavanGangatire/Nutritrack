import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, Sparkles } from 'lucide-react';

const SAMPLE_IMAGES = [
  { label: '🌟 🍛 North Indian 4-Dish Meal (100% Detected)', file: 'plate_north_indian_4dish.jpg' },
  { label: '🌟 🥞 South Indian 4-Dish Feast (100% Detected)', file: 'plate_south_indian_4dish.jpg' },
  { label: '🌟 🥟 Tea-Time 4-Dish Snack Platter (100% Detected)', file: 'plate_snack_combo_4dish.jpg' },
  { label: '🌟 🫘 Rajma Rice Thali (100% Detected)', file: 'thali_rajma_rice.jpg' },
  { label: '🌟 🥞 Idli Dosa South Indian (100% Detected)', file: 'thali_idli_dosa.jpg' },
  { label: '🌟 🥟 Poha Samosa Breakfast (100% Detected)', file: 'thali_poha_samosa.jpg' },
  { label: '🌟 🍚 Biryani & Gulab Jamun Thali (100% Detected)', file: 'thali_biryani_kheer.jpg' },
  { label: '👑 🍱 Royal Indian Thali (9 Dishes Detected)', file: 'royal_thali_10_dishes.jpg' },
  { label: '👑 🍱 Grand Maharaja Feast (14+ Dishes Detected)', file: 'maharaja_thali_18_dishes.jpg' },
  { label: '🍱 Poori & Rice Thali', file: 'thali_poori_rice.jpg' },
  { label: '🍱 Classic Thali Plate', file: 'sample_thali.jpg' },
  { label: '🥟 Samosa', file: 'samosa.jpg' },
  { label: '🥞 Dosa', file: 'dosa.jpg' },
  { label: '🍛 Dal Tadka', file: 'dal_tadka.jpg' },
  { label: '🥘 Chole Bhature', file: 'chole_bhature.jpg' },
  { label: '🥣 Poha', file: 'poha.jpg' },
  { label: '🍲 Rajma', file: 'rajma.jpg' },
  { label: '🧅 Onion Pakoda', file: 'onion_pakoda.jpg' },
  { label: '🍩 Gulab Jamun', file: 'gulab_jamun.jpg' },
  { label: '🥨 Jalebi', file: 'jalebi.jpg' },
  { label: '⚪ Idli', file: 'idli.jpg' },
  { label: '🍚 Biryani', file: 'sample_biryani.jpg' }
];

export default function ImageUploader({ onDetect, isAnalyzing }) {
  const [dragOver, setDragOver] = useState(false);
  const [loadingSample, setLoadingSample] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onDetect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onDetect(file);
  };

  const loadSample = async (sample) => {
    setLoadingSample(sample.file);
    try {
      const response = await fetch(`/api/sample-images/${sample.file}`);
      if (!response.ok) {
        alert(`Could not load ${sample.file}`);
        return;
      }
      const blob = await response.blob();
      const file = new File([blob], sample.file, { type: 'image/jpeg' });
      onDetect(file);
    } catch (err) {
      console.error(err);
      alert('Error fetching sample image from backend');
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <Camera size={20} color="var(--primary)" /> Meal Image Input
      </div>

      <div
        className={`dropzone ${dragOver ? 'drag-active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
        />

        <div className="dropzone-icon">
          {isAnalyzing ? (
            <Loader2 className="animate-spin" size={28} color="var(--primary)" />
          ) : (
            <Upload size={28} />
          )}
        </div>

        {isAnalyzing ? (
          <div>
            <h4 style={{ fontWeight: 700, color: 'var(--primary)' }}>Running YOLOv8 Recognition...</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Detecting Indian food dishes & generating bounding boxes...
            </p>
          </div>
        ) : (
          <div>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>Click to upload meal photo</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              or drag and drop JPG / PNG (640×640 auto-preprocessed)
            </p>
          </div>
        )}
      </div>

      {/* Quick Test Samples */}
      <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
          <Sparkles size={14} color="#ea580c" /> Or test with sample images from dataset:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {SAMPLE_IMAGES.map((s) => (
            <button
              key={s.file}
              type="button"
              className="portion-btn"
              style={{
                fontSize: '0.78rem',
                padding: '5px 10px',
                background: loadingSample === s.file ? '#fed7aa' : '#f8fafc',
                borderColor: '#cbd5e1'
              }}
              onClick={(e) => {
                e.stopPropagation();
                loadSample(s);
              }}
              disabled={isAnalyzing}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
