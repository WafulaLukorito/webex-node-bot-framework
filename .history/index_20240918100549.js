require('dotenv').config(); // Load environment variables

var Framework = require('./lib/framework');
var express = require('express');
var bodyParser = require('body-parser');
var Webhook = require('./lib/webhook'); // Import the Webhook function

// Create an express app
var app = express();
app.use(bodyParser.json());

// Framework configuration
var config = {
  token: process.env.WEBEX_ACCESS_TOKEN,
  webhookUrl: process.env.EXTERNAL_URL,
  port: process.env.PORT || 3000,
  webhookSecret: process.env.WEBEX_SECRET || null // Add the secret if applicable
};

// Initialize the framework
var framework = new Framework(config);
framework.start();

// Framework event handlers
framework.on('initialized', () => {
  console.log('Bot framework initialized!');
});

// Handle incoming messages
framework.hears(/.*/, (bot, trigger) => {
  bot.say('Hello World!');
});

// Listen for incoming webhooks using the `Webhook` function
app.post('/webex', Webhook(framework));

// Start the express server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
