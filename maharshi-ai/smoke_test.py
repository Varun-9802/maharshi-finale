"""CPU smoke test: load the trained classifier and execute one inference."""
import numpy as np

from main import labels, model, prepare_image

assert model is not None
assert len(labels) == 38, f"Expected 38 labels, found {len(labels)}"

# A generated RGB image validates preprocessing and the model's input/output contract.
from PIL import Image
import io

buffer = io.BytesIO()
Image.fromarray(np.full((224, 224, 3), 127, dtype=np.uint8)).save(buffer, format="PNG")
batch = prepare_image(buffer.getvalue())
scores = model.predict(batch, verbose=0)

assert scores.shape == (1, 38), f"Unexpected model output shape: {scores.shape}"
assert np.isfinite(scores).all(), "Model returned non-finite scores"
assert abs(float(scores[0].sum()) - 1.0) < 0.05, "Model output does not look like probabilities"
print("Maharshi AI smoke test passed: model loaded and 38-class inference completed.")
