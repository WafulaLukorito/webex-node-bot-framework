const Framework = require('webex-node-bot-framework');
const fs = require('fs');
const Webex = require('webex');

// Load adaptive card JSON
const cardJson = JSON.parse(fs.readFileSync('./docs/input-card.json', 'utf8'));

// framework options
const config = {
  token: "Yzg2YzZhNjktM2Q2Yy00NWQyLTgyM2YtNGE1YmQxYTkzNjI0OTM4Y2RmMTQtZDY3_PE93_7c22cb7b-3184-4c37-8843-ad0c638a78ff"
};

// init framework
const framework = new Framework(config);

// Start framework
framework.start();

// Log when framework is initialized
framework.on("initialized", () => {
  console.log("Framework initialized successfully!");
});

// Handle spawn events when bot is added to a space
framework.on('spawn', (bot, id, addedBy) => {
  if (!addedBy) {
    console.log(`Bot is already in the space: ${bot.room.title}`);
  } else {
    bot.say('Hi there! I am your friendly bot. Say "hello" to interact with me!');
  }
});

// Listen for "hello" and send an adaptive card
framework.hears('hello', (bot, trigger) => {
  console.log('Message received, preparing to send card...');
  
  bot.sendCard(cardJson, 'Hello World! Jambo Dunia!')
    .then(() => console.log('Card sent successfully'))
    .catch((err) => console.error('Error sending card:', err));
});

// Handle unexpected inputs
framework.hears(/.*/gim, (bot, trigger) => {
  console.log(`Unrecognized input: "${trigger.message.text}"`);
  bot.say('Sorry, I do not understand that command.');
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Stopping framework...');
  framework.stop().then(() => process.exit(0));
});
