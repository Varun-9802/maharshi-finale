
from datasets import load_dataset

print("Downloading PlantVillage dataset...")

dataset = load_dataset(
    "mohanty/PlantVillage",
    "default"
)

print("\nDataset downloaded successfully!")
print(dataset)

dataset.save_to_disk("plantvillage_dataset")

print("\nDataset saved successfully!")
