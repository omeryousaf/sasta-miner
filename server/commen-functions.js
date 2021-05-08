const rp = require('request-promise');
const { DISCORD_WEBHOOK_URLS } = require('./config');


const notifyOnDiscord = (msg) => {
    const requestOptions = {
        method: 'POST',
        uri: DISCORD_WEBHOOK_URLS[0],
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

module.exports = {
    notifyOnDiscord
}