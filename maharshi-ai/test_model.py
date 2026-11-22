
import tensorflow as tf
import json

MODEL_PATH = "models/best_mnv2_pv_original.keras"
LABEL_PATH = "models/labels_pv_original.json"

print("Loading Maharshi AI model...")

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

print("MODEL LOADED SUCCESSFULLY!")
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)

with open(LABEL_PATH, "r") as f:
    labels = json.load(f)

print("\nNumber of labels:", len(labels))
print("Labels:", labels)

print("\nMaharshi AI is ready for integration!")
