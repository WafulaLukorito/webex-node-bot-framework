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
    botId: process.env.WEBEX_BOT_ID,
    roomId: process.env.WEBEX_ROOM_ID
});

// Set Webex token first
framework.setWebexToken(webexToken)
    .then((token) => {
        console.log('Webex token successfully set: ' + token);

        // Now initialize the Webex SDK
        framework.webex = Webex.init({
            credentials: {
                access_token: webexToken
            }
        });

        // Initialize WebSocket and start listening for events
        const websocket = new Websocket(framework);

        websocket.init()
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
        console.error('Failed to set Webex token:', error.message);
        process.exit(1); // Exit if token can't be set
    });

// Handle cleanup on process exit
process.on('SIGINT', () => {
    websocket.cleanup()
