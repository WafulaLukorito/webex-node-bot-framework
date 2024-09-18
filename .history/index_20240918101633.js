const framework = require('./lib/framework'); // Assuming framework is properly required
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Your Webex token
const webexToken = process.env.WEBEX_ACCESS_TOKEN || 'your-default-token-here';
const framework = new Framework({
    token: process.env.WEBEX_ACCESS_TOKEN,
    webhookUrl: process.env.WEBEX_WEBHOOK_URL
  });

// Set Webex token when initializing the framework
framework.setWebexToken(webexToken)
  .then((token) => {
    console.log('Webex token successfully set: ' + token);

    // Now you can start the server
    app.post('/webex', framework.webhook());

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to set Webex token:', error.message);
    process.exit(1); // Exit if token can't be set
  });
