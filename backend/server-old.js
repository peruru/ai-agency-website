require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const LLM_TO_USE = process.env.LLM_TO_USE || 'OPENROUTER';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = process.env.DEEPSEEK_URL;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL;
const OPENROUTER_URL = process.env.OPENROUTER_URL;

app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    const prompt = `You are expert in understanding web page. Go through the attached URL and and understand the details of business they are in. 
                    Summaries their business areas as list of bullet points. 
                    Based on the bunsiness areas they are into, identify potential touch points where AI can be implemented.
                    Also, identify potential AI solutions that can be implemented to improve their business.
                    Finally, provide a detailed report of the analysis.
                    Please provide the report in a clear and concise manner, with appropriate headings and subheadings.
                    URL: ${url} 
                    Result the following format:
                    1. Business Details
                    2. Potential Touch Points
                    3. Actionable AI Solutions
                    4. Summary of AI Soultions Report
                    `;
    
    
    if (LLM_TO_USE === 'DEEPSEEK') {
      console.log('Suneel: Using Deepseek');
      response = await axios.post(
        DEEPSEEK_URL,
        {
          model: DEEPSEEK_MODEL,
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      console.log('Suneel: Using OpenRouter');
      response = await axios.post(
        OPENROUTER_URL,
        {
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('Suneel: Analysis:', response.data.choices[0].message.content);
    res.json({ analysis: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));