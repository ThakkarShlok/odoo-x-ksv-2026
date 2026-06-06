const { GoogleGenAI } = require('@google/genai')

let client

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set')
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }
  return client
}

async function generateText(prompt, modelName = 'gemini-2.0-flash') {
  const response = await getClient().models.generateContent({
    model: modelName,
    contents: prompt,
  })
  return response.text
}

async function generateWithSystem(prompt, systemInstruction, modelName = 'gemini-2.0-flash') {
  const response = await getClient().models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction,
    },
  })
  return response.text
}

module.exports = { generateText, generateWithSystem }