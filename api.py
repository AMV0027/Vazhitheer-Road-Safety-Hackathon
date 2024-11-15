import os
import time
import logging
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from huggingface_hub import InferenceClient

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load environment variables
MBART_API_URL = os.getenv("MBART_API_URL", "https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "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")

if not HUGGINGFACE_API_KEY:
    raise ValueError("HUGGINGFACE_API_KEY environment variable is not set")

headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
client = InferenceClient(api_key=HUGGINGFACE_API_KEY)

indian_languages = {
    "Hindi": "hi_IN",
    "Bengali": "bn_IN",
    "Tamil": "ta_IN",
    "Telugu": "te_IN",
    "Marathi": "mr_IN",
    "Gujarati": "gu_IN",
    "Malayalam": "ml_IN",
    "Kannada": "kn_IN",
    "Punjabi": "pa_IN",
    "Urdu": "ur_IN",
    "Odia": "or_IN",
    "Assamese": "as_IN",
    "Nepali": "ne_IN"
}

class TranslationRequest(BaseModel):
    src_lang_code: str
    tgt_lang_code: str
    text: str

def translate_using_mbart(text, src_lang, tgt_lang):
    payload = {
        "inputs": text,
        "parameters": {"src_lang": src_lang, "tgt_lang": tgt_lang}
    }
    retries = 3
    for attempt in range(retries):
        response = requests.post(MBART_API_URL, headers=headers, json=payload)
        output = response.json()
        if "error" in output:
            if output["error"] == "Model facebook/mbart-large-50-many-to-many-mmt is currently loading":
                if attempt < retries - 1:
                    time.sleep(2)  # Wait for 2 seconds before retrying
                    continue
                else:
                    logger.error("Model is currently loading. Please try again later.")
                    raise HTTPException(status_code=503, detail="Model is currently loading. Please try again later.")
            else:
                logger.error(f"Translation error: {output['error']}")
                raise HTTPException(status_code=500, detail=output["error"])
        else:
            return output[0]["translation_text"]

def translate_using_mistral(text, target_lang):
    messages = [
        {"role": "system", "content": f"You are a helpful translation assistant who exactly translates the user query into {target_lang} language of India and returns the exact translation without any explanation, prefix, suffix."},
        {"role": "user", "content": text}
    ]
    response = client.chat_completion(
        model="meta-llama/Llama-3.2-1B-Instruct",
        messages=messages,
        max_tokens=1200
    )
    return response['choices'][0]['message']['content']

def generate_variations_using_mistral(text, target_lang):
    variations = []
    seeds = [42, 100, 200, 300, 400]  # Different seed values for variation

    for seed in seeds:
        messages = [
            {"role": "system", "content": f"Rephrase the user's query in {target_lang} language, providing only the rephrased version without any additional text, context, or formatting."},
            {"role": "user", "content": text}
        ]
        response = client.chat_completion(
            model="meta-llama/Llama-3.2-1B-Instruct",
            messages=messages,
            max_tokens=1200,
            seed=seed
        )
        variations.append(response['choices'][0]['message']['content'])

    return variations

@app.post("/translate/")
async def translate_message(request: TranslationRequest):
    src_lang_code = request.src_lang_code
    tgt_lang_code = request.tgt_lang_code
    text = request.text

    logger.info(f"Translating text from {src_lang_code} to {tgt_lang_code}")

    if tgt_lang_code in indian_languages:
        translation = translate_using_mbart(text, src_lang_code, indian_languages[tgt_lang_code])
    else:
        translation = translate_using_mistral(text, tgt_lang_code)

    logger.info(f"Translation result: {translation}")

    # Generate variations for the translated text
    variations = generate_variations_using_mistral(translation, tgt_lang_code)

    return {"translation": translation, "variations": variations}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
