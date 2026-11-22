import tensorflow as tf

model = tf.keras.models.load_model(
    "models/best_mnv2_pv_original.keras",
    compile=False
)

backbone = model.layers[1]

print("BACKBONE:", backbone.name)
print("\nPREPROCESSING / RESCALING LAYERS:")

found = False

for layer in backbone.layers:
    if "rescal" in layer.name.lower() or "normal" in layer.name.lower():
        print(layer.name, layer.get_config())
        found = True

if not found:
    print("No explicit rescaling layer found inside backbone.")

print("\nFIRST 10 BACKBONE LAYERS:")
for layer in backbone.layers[:10]:
    print(layer.name, layer.__class__.__name__)
