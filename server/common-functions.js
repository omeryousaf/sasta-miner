const rp = require('request-promise');
const moment = require('moment');

const notifyOnDiscord = (msg, discordWebhookUrl) => {
    const requestOptions = {
        method: 'POST',
        uri: discordWebhookUrl,
        body: {
            content: msg
        },
        json: true
    };
    rp(requestOptions).then(function () {
        console.log('sent notification to discord');
    }).catch(function (err) {
        console.log(err);
    });
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