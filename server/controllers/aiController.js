const { generateText } = require('../utils/geminiClient')

async function generate(req, res, next) {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ message: 'prompt is required' })
    const text = await generateText(prompt)
    res.json({ text })
  } catch (err) {
    next(err)
  }
}

module.exports = { generate }
