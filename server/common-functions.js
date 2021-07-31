const moment = require('moment');
const axios = require('axios');


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
      url:`${webhookUrl}&text=${msg}`,
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

module.exports = {
    notifyOnTelegram,
    notifyOnDiscord,
    logError
}