import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import http from 'http';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

dotenv.config();

const app = express();
app.use(bodyParser.json());
// app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Welcome to the Discussion Platform!!');
});

// Create HTTP server and attach Express app
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected');

    ws.on('message', (message) => {
        // Broadcast received message to all clients
        for (const client of clients) {
            if (client.readyState === ws.OPEN) {
                client.send(message);
            }
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

// default to 3000 so Vite dev server proxy (which targets 3000) will work out of the box
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server is running on port ${PORT}`);
});

// Pin endpoints removed: frontend is expected to call Pinata directly via client-side helpers.

// AI respond endpoint: proxy to Gemini/Vertex AI using service account
app.post('/api/ai/respond', express.json(), async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'prompt required' });

        // Obtain service client and access token
        const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
        const client = await auth.getClient();
        const project = process.env.GOOGLE_PROJECT_ID;
        const region = process.env.GOOGLE_REGION || 'us-central1';
        const model = process.env.GEMINI_MODEL; // e.g. projects/PROJECT/locations/REGION/models/MODEL_ID

        if (!model) return res.status(500).json({ error: 'GEMINI_MODEL not configured' });

        const url = `https://${region}-aiplatform.googleapis.com/v1/${model}:predict`;

        const response = await client.request({
            url,
            method: 'POST',
            data: {
                instances: [{ content: prompt }],
                parameters: { maxOutputTokens: 512 }
            }
        });

        // Try to extract a simple text reply from the Vertex AI response body.
        // Vertex AI response shapes vary; prefer common fields if present.
        const data = response.data;
        let textReply = null;
        try {
            if (data?.predictions && Array.isArray(data.predictions) && data.predictions.length) {
                const p = data.predictions[0];
                textReply = p?.content || p?.text || (typeof p === 'string' ? p : JSON.stringify(p));
            } else if (data?.[0] && (data[0].content || data[0].text)) {
                textReply = data[0].content || data[0].text;
            } else if (data?.response && typeof data.response === 'string') {
                textReply = data.response;
            } else if (typeof data === 'string') {
                textReply = data;
            } else {
                // fallback to stringified payload so clients can inspect
                textReply = JSON.stringify(data);
            }
        } catch (e) {
            textReply = JSON.stringify(data);
        }

        return res.json({ text: textReply, raw: data });
    } catch (err) {
        console.error('AI proxy error', err.response ? err.response.data : err.message);
        return res.status(500).json({ error: 'ai request failed', details: err.response ? err.response.data : err.message });
    }
});