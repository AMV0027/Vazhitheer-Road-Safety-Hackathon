import axios from 'axios';
import React, { useState } from 'react';

function App() {
  const [srcLangCode, setSrcLangCode] = useState('en_XX');
  const [tgtLangCode, setTgtLangCode] = useState('ta_IN');
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [variations, setVariations] = useState([]);

  const languages = [
    { code: 'en_XX', name: 'English' },
    { code: 'hi_IN', name: 'Hindi' },
    { code: 'bn_IN', name: 'Bengali' },
    { code: 'ta_IN', name: 'Tamil' },
    { code: 'te_IN', name: 'Telugu' },
    { code: 'mr_IN', name: 'Marathi' },
    { code: 'gu_IN', name: 'Gujarati' },
    { code: 'ml_IN', name: 'Malayalam' },
    { code: 'kn_IN', name: 'Kannada' },
    { code: 'pa_IN', name: 'Punjabi' },
    { code: 'ur_IN', name: 'Urdu' },
    { code: 'or_IN', name: 'Odia' },
    { code: 'as_IN', name: 'Assamese' },
    { code: 'ne_IN', name: 'Nepali' }
  ];

  const handleTranslate = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/translate/', {
        src_lang_code: srcLangCode,
        tgt_lang_code: tgtLangCode,
        text: text
      });
      setTranslation(response.data.translation);
      setVariations(response.data.variations);
    } catch (error) {
      console.error('Error translating text:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Lexichain AI Multilingual Translator</h1>
      </header>
      <div className="input-container mx-auto max-w-md">
        <select
          value={srcLangCode}
          onChange={(e) => setSrcLangCode(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <select
          value={tgtLangCode}
          onChange={(e) => setTgtLangCode(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Enter text to translate"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
        />
        <button
          onClick={handleTranslate}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Translate
        </button>
      </div>
      {translation && (
        <div className="translation-container mx-auto max-w-md mt-8">
          <h2 className="text-2xl font-bold mb-4">Translation:</h2>
          <p className="p-4 bg-gray-800 border border-gray-700 rounded">{translation}</p>
        </div>
      )}
      {variations.length > 0 && (
        <div className="variations-container mx-auto max-w-md mt-8">
          <h2 className="text-2xl font-bold mb-4">Variations:</h2>
          <ul className="list-none p-0">
            {variations.map((variation, index) => (
              <li key={index} className="p-4 bg-gray-800 border border-gray-700 rounded mb-2">
                {variation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
