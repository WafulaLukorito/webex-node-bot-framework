const Framework = require('./lib/framework'); // Assuming framework is properly required
const express = require('express');
const Webex = require('webex'); // Ensure Webex SDK is required
const Websocket = require('./lib/websocket'); // WebSocket implementation
const fs = require('fs'); // For reading the JSON file
const app = express();
const port = process.env.PORT || 3000;

// Your Webex token
const webexToken = process.env.WEBEX_ACCESS_TOKEN || "Yzg2YzZhNjktM2Q2Yy00NWQyLTgyM2YtNGE1YmQxYTkzNjI0OTM4Y2RmMTQtZDY3_PE93_7c22cb7b-3184-4c37-8843-ad0c638a78ff";

if (!webexToken) {
    console.error("Error: Webex access token is missing");
    process.exit(1);
}

// Initialize the framework with Webex token, botId, and roomId
const framework = new Framework({
    token: webexToken,
    botId: process.env.WEBEX_BOT_ID || "Y2lzY29zcGFyazovL3VzL0FQUExJQ0FUSU9OL2E2NzYyMmYzLTU5MjctNDU3NC1iNjcxLThlNzYwODc3MzM1NQ",
    roomId: process.env.WEBEX_ROOM_ID || "bc327a00-7413-11ef-a019-816da62b36fd"
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

// Read the Adaptive Card JSON
const cardPath = './docs/input-card.json';
let adaptiveCard;

fs.readFile(cardPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading Adaptive Card JSON:', err);
        return;
    }
    adaptiveCard = JSON.parse(data);
    console.log('Adaptive Card JSON loaded successfully');
});

// Handle Slack message events and respond with the Adaptive Card
framework.hears('hello', (bot, trigger) => {
    console.log('Message received from:', trigger.personEmail);

    // Log before sending the card
    console.log('Preparing to send Adaptive Card...');

    bot.say({
        markdown: 'Here is an Adaptive Card:',
        attachments: [{
            contentType: "application/vnd.microsoft.card.adaptive",
            content: adaptiveCard
        }]
    })
    .then(() => {
        console.log('Adaptive Card sent successfully');
    })
    .catch((err) => {
        console.error('Error sending Adaptive Card:', err);
    });
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