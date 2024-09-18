const Framework = require('./lib/framework'); // Assuming framework is properly required
const express = require('express');
const Websocket = require('./lib/websocket');
const app = express();
const port = process.env.PORT || 3000;

// Your Webex token
const webexToken = process.env.WEBEX_ACCESS_TOKEN || 'your-webex-token-here';

// Initialize the framework with Webex token
const framework = new Framework({
    token: webexToken, // Set the token directly here
    botId: process.env.WEBEX_BOT_ID || 'your-bot-id-here',
    roomId: process.env.WEBEX_ROOM_ID || 'your-room-id-here'
});

// Initialize WebSocket for event listening
const websocket = new Websocket(framework);

// Define a simple 'hears' action for the bot
framework.hears('hello', (bot, trigger) => {
    console.log('Bot heard "hello" from:', trigger.personEmail);
    bot.say('Hello, world!')
        .then(() => console.log('Message sent successfully'))
        .catch((err) => console.error('Error sending message:', err));
});

// Set Webex token and initialize WebSocket
framework.setWebexToken(webexToken)
    .then((token) => {
        console.log('Webex token successfully set: ' + token);

        // Initialize WebSocket and start listening for events
        return websocket.init();
    })
    .then(() => {
        // Start express server (optional, not necessary for WebSocket)
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize WebSocket:', error.message);
        process.exit(1); // Exit if there's an issue with initialization
    });

// Handle cleanup on process exit
process.on('SIGINT', () => {
    websocket.cleanup()
        .then(() => {
            console.log('Cleaned up WebSocket connection');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error cleaning up WebSocket connection:', error.message);
            process.exit(1);
        });
});
