import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  const interaction = await ai.interactions.create({
    model: 'gemini-3-flash-preview',
    input: 'Say hello in Hebrew.',
    generation_config: {
      temperature: 1,
      max_output_tokens: 1024,
      top_p: 0.95,
      thinking_level: 'high',
    },
  });

  console.log(interaction.output_text);
}

main().catch((error) => {
  console.log('key exists:', Boolean(process.env.GEMINI_API_KEY));
  console.log('key length:', process.env.GEMINI_API_KEY?.length);
  console.error(error);
});
