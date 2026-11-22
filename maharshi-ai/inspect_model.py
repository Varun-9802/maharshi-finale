import tensorflow as tf

model = tf.keras.models.load_model(
    "models/best_mnv2_pv_original.keras",
    compile=False
)

print("\nMODEL LAYERS:")
for layer in model.layers:
    print(
        layer.name,
        layer.__class__.__name__,
        "scale:", getattr(layer, "scale", None),
        "offset:", getattr(layer, "offset", None)
    )

print("\nOUTPUT ACTIVATION:")
print(model.layers[-1].get_config())
