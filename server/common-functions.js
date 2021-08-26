const moment = require('moment');
const axios = require('axios');
const fs = require('fs')


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
    console.log(error);
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
    console.log(error);
  }
};

const logError = (error) => {
  let errorTiming = moment().toString();
  console.log(error);
  console.log(`at ${errorTiming}`);
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
  notifyOnTelegram,
  notifyOnDiscord,
  logError,
  updateJsonFile
}