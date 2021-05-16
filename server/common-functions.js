const rp = require('request-promise');

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

module.exports = {
    notifyOnDiscord
}