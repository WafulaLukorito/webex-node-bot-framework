const Framework = require('./lib/framework'); // Assuming framework is properly required
const express = require('express');
const Webhook = require('./lib/webhook');
const app = express();
const port = process.env.PORT || 3000;

// Your Webex token
const webexToken = process.env.WEBEX_ACCESS_TOKEN || 'your-default-token-here';

// Initialize the framework with Webex token and webhook URL
const framework = new Framework({
    token: webexToken, // Set the token directly here
    webhookUrl: process.env.WEBEX_WEBHOOK_URL || 'your-default-webhook-url-here'
});

// Initialize the webhook handler
const webhookHandler = Webhook(framework);

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
