// api/generateAudio.js
import axios from 'axios';

export async function generateAudio(text, voice) {
  const response = await axios.post(
    'https://japaneast.tts.speech.microsoft.com/cognitiveservices/v1',
    `<speak version="1.0" xml:lang="${voice.languageCode}"><voice xml:lang="${voice.languageCode}" name="${voice.name}">${text}</voice></speak>`,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.REACT_APP_AZURE_API_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
      },
      responseType: 'arraybuffer',
    }
  );
  return new Blob([response.data], { type: 'audio/mpeg' });
}