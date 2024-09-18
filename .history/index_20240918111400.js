const Framework = require('./lib/framework'); // Assuming framework is properly required
const express = require('express');
const Webex = require('webex'); // Ensure Webex SDK is required
const Websocket = require('./lib/websocket'); // WebSocket implementation
const app = express();
const port = process.env.PORT || 3000;

// Your Webex token
const webexToken = process.env.WEBEX_ACCESS_TOKEN;

// Initialize the framework with Webex token, botId, and roomId
const framework = new Framework({
    token: webexToken, // Set the token directly here
    botId: process.env.WEBEX_BOT_ID,
    roomId: process.env.WEBEX_ROOM_ID
});

// Initialize Webex SDK instance
framework.webex = Webex.init({
    credentials: {
        access_token: webexToken
    }
});

// Fetch bot identity
framework.webex.people.get('me')
    .then((person) => {
        console.log('Bot identity fetched:', person.displayName);
        framework.person = person;  // Store the bot's identity in the framework

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
    })
    .catch((error) => {
        console.error('Error fetching bot identity:', error.message);
        process.exit(1); // Exit if bot identity can't be fetched
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
