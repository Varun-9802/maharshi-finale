
import os
import json
import io
from pathlib import Path

import numpy as np
import tensorflow as tf

from PIL import Image, ImageOps, UnidentifiedImageError
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.applications import mobilenet_v2

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "best_mnv2_pv_original.keras"
LABEL_PATH = BASE_DIR / "models" / "labels_pv_original.json"

# Default preprocessing for MobileNetV2.
# Can be changed after validating the original training pipeline.
PREPROCESS_MODE = os.getenv("MAHARSHI_PREPROCESS", "mobilenet_v2")

MAX_FILE_SIZE = 10 * 1024 * 1024

app = FastAPI(
    title="Maharshi AI API",
    description="Plant disease detection and crop risk assessment",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading Maharshi AI model...")

model = tf.keras.models.load_model(
    str(MODEL_PATH),
    compile=False
)

with open(LABEL_PATH, "r", encoding="utf-8") as f:
    labels = json.load(f)

if isinstance(labels, dict):
    labels = [labels[str(i)] for i in range(len(labels))]

if len(labels) != model.output_shape[-1]:
    raise ValueError("Number of labels does not match model outputs")

print("Maharshi AI model loaded successfully!")
print("Number of disease classes:", len(labels))


def prepare_image(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = image.resize((160, 160))

    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid or unsupported image"
        )

    image_array = np.asarray(image, dtype=np.float32)

    if PREPROCESS_MODE == "mobilenet_v2":
        image_array = mobilenet_v2.preprocess_input(image_array)

    elif PREPROCESS_MODE == "zero_one":
        image_array = image_array / 255.0

    elif PREPROCESS_MODE == "raw":
        pass

    else:
        raise RuntimeError("Invalid preprocessing configuration")

    return np.expand_dims(image_array, axis=0)


@app.get("/")
def home():
    return {
        "message": "Welcome to Maharshi AI",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Maharshi AI",
        "model_loaded": model is not None,
        "classes": len(labels)
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if file.content_type not in [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Upload a JPG, PNG or WEBP image"
        )

    image_bytes = await file.read(MAX_FILE_SIZE + 1)

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image size must be below 10 MB"
        )

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty"
        )

    processed_image = prepare_image(image_bytes)

    try:
        predictions = model.predict(
            processed_image,
            verbose=0
        )[0]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Model prediction failed"
        )

    predicted_index = int(np.argmax(predictions))
    confidence = float(predictions[predicted_index])

    disease_label = labels[predicted_index]

    crop, disease = disease_label.split("___", 1)

    top_indices = np.argsort(predictions)[-3:][::-1]

    top_predictions = []

    for index in top_indices:
        label = labels[int(index)]
        top_predictions.append({
            "label": label,
            "confidence": round(float(predictions[index]) * 100, 2)
        })

    return {
        "success": True,
        "crop": crop,
        "disease": disease,
        "confidence": round(confidence * 100, 2),
        "predicted_class": disease_label,
        "top_predictions": top_predictions
    }
