const moment = require('moment');
const axios = require('axios');
const fs = require('fs')
const { DISCORD_WEBHOOK_URLS } = require('./config');

const notifyDiscordBots = (msg, botWebhookKeys) => {
  botWebhookKeys.map(botName => {
    notifyOnDiscord(msg, DISCORD_WEBHOOK_URLS[botName]);
  });
};

/** @todo: remove async from method declaration after removing await from its refs **/
const notifyOnDiscord = async (msg, discordWebhookUrl) => {
  try {
    const config = {
      url: discordWebhookUrl,
      method: 'POST',
      data: {
        content: msg
      },
      responseType: 'json'
    };
    await axios(config)
    console.log('sent notification to discord');
  } catch (error) {
    logError(error);
  }
};

const notifyOnTelegram = async (msg, webhookUrl) => {
  msg = msg || `Hello friends.. chai pi lo!`;
  try {
    const config = {
      url: `${webhookUrl}&text=${msg}`,
      method: 'GET',
      responseType: 'json'
    };
    await axios(config);
    console.log('sent notification to telegram bot');
  } catch (error) {
    logError(error);
  }
};

const logError = (error) => {
  let errorTiming = moment().toString();
  console.error(error, `at ${errorTiming}`);
  console.error(`stacktrace: `, error.stack);
}

const updateJsonFile = (coin) => {
  try {
    const jsString = fs.readFileSync(__dirname + '/lastUpdate.json', 'utf-8')
    let data = JSON.parse(jsString)
    if (coin == 'gecko') {
      data.coinGeckoLastUpdate = moment().toString()
    } else {
      data.cmcLastUpdate = moment().toString()
    }
    fs.writeFileSync(__dirname + '/lastUpdate.json', JSON.stringify(data, null, 2))
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  notifyDiscordBots,
  notifyOnTelegram,
  notifyOnDiscord,
  logError,
  updateJsonFile
}