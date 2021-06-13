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
}


const logError = (error) => {
    let errorTiming = moment().toString();
    console.log(error);
    console.log(`at ${errorTiming}`);
}

module.exports = {
    notifyOnDiscord,
    logError
}