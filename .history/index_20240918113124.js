const Framework = require('./lib/framework'); // Assuming framework is properly required
const express = require('express');
const Webex = require('webex'); // Ensure Webex SDK is required
const Websocket = require('./lib/websocket'); // WebSocket implementation
const app = express();
const port = process.env.PORT || 3000;

// Your Webex token
const webexToken = "ZGExNDBjOTctZDk3My00MTMzLTgxYTUtNzVkNDYwNTZhMmQxZTdkZDJmZjItZGI1_P0A1_bdd2aed2-da17-481d-bd6f-b43037ee90b7" 

if (!webexToken) {
    console.error("Error: Webex access token is missing");
    process.exit(1);
}

// Initialize the framework with Webex token, botId, and roomId
const framework = new Framework({
    token: webexToken, // Pass the token here
    botId: process.env.WEBEX_BOT_ID,
    roomId: process.env.WEBEX_ROOM_ID
});

// Set Webex token first and initialize the Webex SDK
framework.setWebexToken(webexToken)
    .then((token) => {
        console.log('Webex token successfully set: ' + token);

        // Initialize Webex SDK after the token is confirmed to be set
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
        .then(() => {
            console.log('Cleaned up WebSocket connection');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error cleaning up WebSocket connection:', error.message);
            process.exit(1);
        });
});
