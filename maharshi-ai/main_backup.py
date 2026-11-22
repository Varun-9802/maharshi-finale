
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Maharshi AI API",
    description="Crop disease detection and risk assessment",
    version="1.0.0"
)

# Allow requests from the Maharshi website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your website URL before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to Maharshi AI",
        "status": "Backend running successfully"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Maharshi AI"
    }
