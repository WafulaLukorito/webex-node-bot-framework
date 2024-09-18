const Framework = require('./lib/framework'); // Assuming framework is properly required
const express = require('express');
const Webhook = require('./lib/webhook');
const app = express();
const port = process.env.PORT || 3000;

// Your Webex token
const webexToken = process.env.WEBEX_ACCESS_TOKEN || 'Zjc0YWUxYWItODUxMi00Y2NmLTk3NzgtYjkxYWQwOTBkNDBlYTY1YmY3ODctOWJh_PE93_7c22cb7b-3184-4c37-8843-ad0c638a78ff';

// Initialize the framework with Webex token and webhook URL
const framework = new Framework({
    token: webexToken, // Set the token directly here
    webhookUrl: process.env.WEBEX_WEBHOOK_URL || 'https://0b3a-102-213-49-8.ngrok-free.app/webex',
    botId: process.env.WEBEX_BOT_ID || 'Y2lzY29zcGFyazovL3VzL0FQUExJQF1NTEwNzc3NmUzMzN1Nw', // Example botId
    roomId: process.env.WEBEX_ROOM_ID || 'Y2lzY29zcGFyazovL3VzL1JPT00vZjM0ZjJiZDAtNzUzZS0xMWViLWI5YjItZjY4ZjQ2ZjM0ZmYy' // Example roomId
});

// Initialize the webhook handler
const webhookHandler = Webhook(framework);

// Define a simple 'hears' action for the bot
framework.hears('hello', (bot, trigger) => {
    console.log('Bot heard "hello" from:', trigger.personEmail);
    bot.say('Hello, world!')
        .then(() => console.log('Message sent successfully'))
        .catch((err) => console.error('Error sending message:', err));
});

// Set Webex token when initializing the framework
framework.setWebexToken(webexToken)
    .then((token) => {
        console.log('Webex token successfully set: ' + token);

        // Now you can start the server and handle webhook requests
        app.post('/webex', webhookHandler);

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to set Webex token:', error.message);
        process.exit(1); // Exit if token can't be set
    });
