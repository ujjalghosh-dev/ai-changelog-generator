import express from 'express';
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

// Frontend Web Interface (English)
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: Arial; padding: 40px; max-width: 600px; margin: auto;">
            <h2>AI Changelog Generator</h2>
            <p>Enter your git commits below:</p>
            <textarea id="commits" rows="5" style="width: 100%; padding: 10px;" placeholder="Example: Fixed login bug and added dark mode"></textarea><br><br>
            <button onclick="generate()" style="padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer;">Generate Changelog</button>
            <h3>Result:</h3>
            <pre id="result" style="background: #f4f4f4; padding: 15px; white-space: pre-wrap;"></pre>
        </div>
        <script>
            async function generate() {
                const commits = document.getElementById('commits').value;
                document.getElementById('result').innerText = "AI is generating your changelog...";
                const res = await fetch('/generate-changelog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ commits })
                });
                const data = await res.json();
                document.getElementById('result').innerText = data.changelog || data.error;
            }
        </script>
    `);
});

const ai = new GoogleGenAI({ apiKey:process.env.GEMINI_API_KEY });

// Backend API Route
app.post('/generate-changelog', async (req, res) => {
    try {
        const { commits } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Read the following git commits and generate a professional, developer-friendly changelog:\n\n${commits}`,
        });
        res.json({ success: true, changelog: response.text });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running! Visit: http://localhost:3000');
});