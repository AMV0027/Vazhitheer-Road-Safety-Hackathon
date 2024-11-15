import requests

mbart_api_url = "https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt"
headers = {"Authorization": "Bearer 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"}

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
    "Maithili": "mai_IN",
    "Sanskrit": "sa_IN",
    "Konkani": "kok_IN",
    "Sindhi": "sd_IN",
    "Kashmiri": "ks_IN",
    "Nepali": "ne_IN"
}

article = "Wearing a helmet is essential for your safety when riding a bike. Failure to wear one may result in a penalty."

def translate_using_mbart(text, src_lang, tgt_lang):
    payload = {
        "inputs": text,
        "parameters": {"src_lang": src_lang, "tgt_lang": tgt_lang}
    }
    response = requests.post(mbart_api_url, headers=headers, json=payload)
    output = response.json()
    if "error" in output:
        print("Error:", output["error"])
    else:
        print(output[0]["translation_text"])

def translate_message(src_lang_code, tgt_lang_code):
    if tgt_lang_code in indian_languages:
        translate_using_mbart(article, src_lang_code, indian_languages[tgt_lang_code])
    else:
        print(f"Translation to {tgt_lang_code} is not supported.")

src_lang_code = "en_XX"
tgt_lang_code = "Tamil"

translate_message(src_lang_code, tgt_lang_code)
