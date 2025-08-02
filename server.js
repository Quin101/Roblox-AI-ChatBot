// AI API Server for Roblox Integration
// Save this as server.js and run with: node server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// IMPORTANT: Add your OpenAI API key here
const OPENAI_API_KEY = 'your-openai-api-key-here'; // Get from https://platform.openai.com/

// Alternative: Use Claude API
// const ANTHROPIC_API_KEY = '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';

// Chat endpoint for Roblox
app.post('/chat', async (req, res) => {
    try {
        const { message, player, timestamp } = req.body;
        
        console.log(`📢 Received message from ${player}: ${message}`);
        
        // Call OpenAI API
        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo', // or 'gpt-4' for better responses
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful AI assistant in a Roblox game. Keep responses under 200 characters so they fit on the game screen. Be friendly, helpful, and engaging. The player's name is ${player}.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 100,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const aiResponse = openaiResponse.data.choices[0].message.content.trim();
        console.log(`🤖 AI Response: ${aiResponse}`);
        
        // Send response back to Roblox
        res.json({
            success: true,
            response: aiResponse,
            player: player,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Fallback response if AI fails
        res.json({
            success: false,
            response: "Sorry, I'm having trouble thinking right now. Please try again!",
            error: error.message
        });
    }
});

// Alternative endpoint using Claude API (Anthropic)
app.post('/chat-claude', async (req, res) => {
    try {
        const { message, player } = req.body;
        
        const claudeResponse = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-3-sonnet-20240229',
                max_tokens: 100,
                messages: [
                    {
                        role: 'user',
                        content: `You are a helpful AI in a Roblox game. Keep responses under 200 characters. Player ${player} says: ${message}`
                    }
                ]
            },
            {
                headers: {
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const aiResponse = claudeResponse.data.content[0].text;
        
        res.json({
            success: true,
            response: aiResponse,
            player: player
        });
        
    } catch (error) {
        console.error('❌ Claude Error:', error.message);
        res.json({
            success: false,
            response: "My Claude brain is taking a break. Try again soon!",
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Server is running!', 
        timestamp: new Date().toISOString(),
        endpoints: ['/chat', '/chat-claude']
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AI API Server running on port ${PORT}`);
    console.log(`📡 Roblox can now connect to: http://your-domain.com:${PORT}/chat`);
    console.log(`🔑 Make sure to add your API keys!`);
});

// Export for serverless deployment (Vercel, Netlify, etc.)
module.exports = app;