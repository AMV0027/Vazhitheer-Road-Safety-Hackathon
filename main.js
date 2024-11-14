const axios = require('axios');

// Define the Hugging Face Inference API endpoints and your API key
const mbartAPI_URL = "https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt";
const gemmaAPI_URL = "https://api-inference.huggingface.co/models/google/gemma-2-2b-it";
const headers = {
    "Authorization": "Bearer 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" // Replace with your actual Hugging Face API key
};

// Indian languages supported by the MBART model
const indianLanguages = {
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
};

// Define the input message for translation
const article = "Wearing a helmet is essential for your safety when riding a bike. Failure to wear one may result in a penalty.";

// Function to query the API and get the translation
const query = async (API_URL, payload) => {
    try {
        const response = await axios.post(API_URL, payload, { headers });
        return response.data;
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
};

// Function to translate using the MBART model (for Indian languages)
const translateUsingMBART = async (text, srcLang, tgtLang) => {
    const payload = {
        inputs: text,
        parameters: {
            src_lang: srcLang,
            tgt_lang: tgtLang
        }
    };

    const output = await query(mbartAPI_URL, payload);

    if (output && output[0] && output[0].translation_text) {
        const translatedMessage = output[0].translation_text;
        console.log(`Original Message: ${text}`);
        console.log(`Translated Message (${tgtLang}): ${translatedMessage}`);
    } else {
        console.log("Error in translation:", output);
    }
};

// Function to translate using the Gemma model (for non-Indian languages)
const translateUsingGemma = async (text, targetLang) => {
    const messages = [
        { role: "user", content: `Translate the following text to ${targetLang}: '${text}'` }
    ];

    const payload = {
        messages: messages,
        max_tokens: 500
    };

    const output = await query(gemmaAPI_URL, payload);

    if (output && output.choices && output.choices[0] && output.choices[0].delta && output.choices[0].delta.content) {
        const translatedMessage = output.choices[0].delta.content;
        console.log(`Original Message: ${text}`);
        console.log(`Translated Message (${targetLang}): ${translatedMessage}`);
    } else {
        console.log("Error in translation:", output);
    }
};

// Function to handle translation logic
const translateMessage = async (srcLangCode, tgtLangCode) => {
    if (indianLanguages[tgtLangCode]) {
        // Translate using MBART for Indian languages
        await translateUsingMBART(article, srcLangCode, indianLanguages[tgtLangCode]);
    } else {
        // For non-Indian languages or unknown languages, use Gemma model
        console.log(`Using Gemma model for translation to ${tgtLangCode}`);
        await translateUsingGemma(article, tgtLangCode);
    }
};

// Example: Translate from English to Hindi (hi_IN)
const srcLangCode = "en_XX";  // Source language: English
const tgtLangCode = "Sindhi";  // Target language: Tamil (ta_IN)

// Call the translation function
translateMessage(srcLangCode, tgtLangCode);

// To use different languages, simply change `tgtLangCode`
// For instance, to use a non-Indian language, such as French:
// translateMessage(srcLangCode, "French");
