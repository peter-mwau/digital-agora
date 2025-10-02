import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Discussion Platform!!');
});

// Create HTTP server and attach Express app
const server = http.createServer(app);

// Create WebSocket server
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// --- Configuration ---
const AGENT_WEBHOOK_URL = process.env.AGENT_WEBHOOK_URL || 'http://localhost:8000/webhook';
const AGENT_TAG_URL = process.env.AGENT_TAG_URL || 'http://localhost:8000/tag';
const AGENT_SERVICE_SECRET = process.env.AGENT_SERVICE_SECRET || 'your_super_secret_webhook_token_here';
const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS || 100000;

// Rate limiting storage
const userLastRequest = new Map();

// --- Helper Function to call the Agent Webhook (for @agent mentions) ---
async function triggerAgentWebhook(messageData) {
    try {
        const payload = {
            thread_id: 'general',
            message_id: `msg_${Date.now()}`,
            query: messageData.message.replace(/@agent\b\s*,?\s*/i, '').trim(),
            user_id: messageData.authorId,
            user_name: messageData.author,
        };

        const headers = {
            'Authorization': `Bearer ${AGENT_SERVICE_SECRET}`
        };

        console.log('Sending webhook to agent service...');
        // Fire and forget for webhook
        axios.post(AGENT_WEBHOOK_URL, payload, { headers })
            .then(response => {
                console.log('Agent webhook acknowledged request.');
            })
            .catch(error => {
                console.error('Error calling agent webhook:', error.message);
            });

    } catch (error) {
        console.error('Failed to trigger agent webhook:', error);
    }
}

// --- Helper Function to generate tags for discussions ---
async function generateDiscussionTags(content, userId, userName) {
    try {
        const payload = {
            text: content,
            max_tags: 5
        };

        const headers = {
            'Authorization': `Bearer ${AGENT_SERVICE_SECRET}`,
            'Content-Type': 'application/json'
        };

        console.log('Requesting tags from agent service...');
        const response = await axios.post(AGENT_TAG_URL, payload, { headers });

        // Extract tags from the new response format
        if (response.data && response.data.tags) {
            return response.data.tags;
        }
        return [];
    } catch (error) {
        console.error('Tag generation failed:', error.message);
        throw error;
    }
}

// --- Public endpoint for tag generation ---
app.post('/api/generate-tags', async (req, res) => {
    try {
        const { content, userId, userName } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const tags = await generateDiscussionTags(content, userId, userName);
        res.json({ tags });

    } catch (error) {
        console.error('Tag generation failed:', error.message);
        res.status(500).json({ error: 'Failed to generate tags' });
    }
});

// --- Agent callback endpoint ---
app.post('/api/agent-response', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${AGENT_SERVICE_SECRET}`) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const { thread_id, message_id, text, agent_id } = req.body;
    console.log('Received agent response:', text);

    // Broadcast agent's message to all clients
    io.emit('receive_message', {
        message: text,
        author: 'AI Agent',
        authorId: agent_id || 'ai_agent_001',
        timestamp: new Date().toISOString()
    });

    res.json({ status: 'success', message: 'Agent response received' });
});

// --- Socket.io connection handling ---
io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle new discussion creation
    socket.on('new_discussion', async (data) => {
        console.log('New discussion created:', data);

        try {
            // Check if it's a reply (skip tag generation for replies)
            if (!data.isReply && !data.replyTo) {
                // Check if user mentioned @agent
                if (/@agent\b/i.test(data.content)) {
                    // Rate limiting for @agent mentions
                    const userId = data.authorId;
                    const now = Date.now();
                    const lastRequestTime = userLastRequest.get(userId) || 0;

                    if (now - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
                        socket.emit('receive_message', {
                            message: 'Please wait a moment before asking the agent again.',
                            authorId: 'system',
                            author: 'System',
                            timestamp: new Date().toISOString()
                        });
                        return;
                    }

                    userLastRequest.set(userId, now);

                    // Trigger agent webhook for @agent mentions
                    socket.emit('agent_thinking');
                    triggerAgentWebhook({
                        message: data.content,
                        authorId: data.authorId,
                        author: data.author
                    });
                } else {
                    // Generate tags for regular discussions (no @agent mention)
                    try {
                        const tags = await generateDiscussionTags(
                            data.content,
                            data.authorId,
                            data.author
                        );

                        // Add tags to the discussion data
                        const discussionWithTags = {
                            ...data,
                            tags: tags,
                            timestamp: new Date().toISOString()
                        };

                        // Broadcast to all other clients
                        socket.broadcast.emit('receive_discussion', discussionWithTags);
                        // Also send back to the sender with tags
                        socket.emit('receive_discussion', discussionWithTags);

                    } catch (error) {
                        // If tag generation fails, broadcast without tags
                        const discussionWithoutTags = {
                            ...data,
                            timestamp: new Date().toISOString()
                        };
                        socket.broadcast.emit('receive_discussion', discussionWithoutTags);
                        socket.emit('receive_discussion', discussionWithoutTags);
                    }
                }
            } else {
                // For replies, just broadcast without tag generation
                const replyData = {
                    ...data,
                    timestamp: new Date().toISOString()
                };
                socket.broadcast.emit('receive_discussion', replyData);
            }
        } catch (error) {
            console.error('Error handling new discussion:', error);
        }
    });

    // Handle regular messages (chat)
    socket.on('send_message', (data) => {
        console.log('Message received:', data);

        // Broadcast the user's message to everyone else
        socket.broadcast.emit('receive_message', {
            ...data,
            timestamp: new Date().toISOString()
        });

        // Check for @agent mentions in messages
        if (/@agent\b/i.test(data.message)) {
            const userId = data.authorId;
            const now = Date.now();
            const lastRequestTime = userLastRequest.get(userId) || 0;

            if (now - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
                socket.emit('receive_message', {
                    message: 'Please wait a moment before asking the agent again.',
                    authorId: 'system',
                    author: 'System',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            userLastRequest.set(userId, now);

            console.log('Agent mention detected in message!');
            socket.emit('agent_thinking');
            triggerAgentWebhook(data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server is running on port ${PORT}`);
});