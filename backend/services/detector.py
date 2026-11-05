import os
import io
import base64
from PIL import Image
import numpy as np

# Lazy load YOLO to avoid startup crashes if ultralytics is still installing
_model = None
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "best.pt")

def get_yolo_model():
    """Load and cache the YOLO model."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        from ultralytics import YOLO
        _model = YOLO(MODEL_PATH)
    return _model

def detect_food_from_image(image_bytes: bytes, conf_threshold: float = 0.25):
    """
    Perform YOLOv8 inference on input image bytes.
    
    :param image_bytes: Raw bytes of the uploaded image file.
    :param conf_threshold: Minimum confidence score threshold (default 0.25).
    :return: dict containing:
             - detections: list of detected objects with label, confidence, and box
             - detected_classes: deduplicated list of detected food labels
             - annotated_image_base64: base64-encoded JPEG image with bounding boxes drawn
    """
    model = get_yolo_model()
    
    # Load image from bytes
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # Run YOLOv8 prediction with optimal 768px inference to detect both fine textures (pakodas) and thalis
    inference_size = 768 if max(img.size) >= 700 else 640
    results = model.predict(source=img, imgsz=inference_size, conf=conf_threshold)
    result = results[0]
    
    detections = []
    detected_classes = set()
    
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        cls_name = result.names[cls_id]
        confidence = float(box.conf[0].item())
        coords = [round(float(c), 2) for c in box.xyxy[0].tolist()]
        
        # Filter out background if present
        if cls_name.lower() == "background":
            continue
            
        detections.append({
            "class_name": cls_name,
            "confidence": round(confidence, 3),
            "box": coords
        })
        detected_classes.add(cls_name)
    
    # Generate annotated image
    annotated_array = result.plot()  # returns BGR numpy array
    # Convert BGR to RGB
    annotated_rgb = annotated_array[..., ::-1]
    annotated_pil = Image.fromarray(annotated_rgb)
    
    buffered = io.BytesIO()
    annotated_pil.save(buffered, format="JPEG", quality=85)
    img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {
        "success": True,
        "count": len(detections),
        "detections": detections,
        "detected_classes": sorted(list(detected_classes)),
        "annotated_image": f"data:image/jpeg;base64,{img_b64}"
    }
