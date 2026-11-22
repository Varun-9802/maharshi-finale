export type RiskLevel = 'Low' | 'Moderate' | 'High'

export const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
]

export const commonSymptoms = [
  'Brown or black spots',
  'Yellowing leaves',
  'Leaf curling',
  'White powdery coating',
  'Wilting',
  'No visible symptoms',
]

type SampleResult = {
  disease: string
  description: string
  risk: RiskLevel
  score: number
  recommendations: string[]
}

const sampleResults: Record<string, SampleResult> = {
  tomato: {
    disease: 'Early Blight (Alternaria solani)',
    description: 'Brown spots with ring-like patterns on older leaves can be associated with early blight. This text is an illustrative example, not an image-model finding.',
    risk: 'High',
    score: 78,
    recommendations: [
      'Remove and safely destroy the affected lower leaves.',
      'Avoid overhead watering; water the base of plants in the morning.',
      'Improve air flow by staking plants and spacing them properly.',
      'Consult your local Krishi Vigyan Kendra before using any fungicide.',
    ],
  },
  paddy: {
    disease: 'Leaf Blast (Magnaporthe oryzae)',
    description: 'Diamond-shaped grey lesions on paddy leaves can be associated with leaf blast. This text is an illustrative example, not an image-model finding.',
    risk: 'Moderate',
    score: 55,
    recommendations: [
      'Avoid excess nitrogen fertiliser during humid periods.',
      'Keep bunds and field edges free of weeds.',
      'Maintain a steady water level in the field.',
      'Seek expert advice if lesions spread to the neck or panicle.',
    ],
  },
}

const defaultResult: SampleResult = {
  disease: 'Fungal Leaf Spot (possible)',
  description: 'The sample analysis screen uses this placeholder for demonstration. No image inference has been run for this crop.',
  risk: 'Moderate',
  score: 52,
  recommendations: [
    'Remove heavily affected leaves and keep the field clean.',
    'Water early in the day so leaves dry quickly.',
    'Avoid working in the field when plants are wet.',
    'Ask a local agricultural expert to review uncertain symptoms.',
  ],
}

export function getSampleResult(crop: string): SampleResult {
  return sampleResults[crop.trim().toLowerCase()] ?? defaultResult
}
