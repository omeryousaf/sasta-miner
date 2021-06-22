const moment = require('moment');
const axios = require('axios');
const { DISCORD_WEBHOOK_URLS } = require('./config');
const { notifyOnDiscord, logError } = require('./common-functions');

module.exports = class CoinGeckoScraper {
    constructor() {
        this.incomingCoins = [];
        this.storedCoinList = {};
        this.interval = 5000;
        this.discordWebhookKey = 'CGBajwaBot';
        if (process.env.NODE_ENV === 'dev') {
            this.discordWebhookKey = 'testWeirdoBot';
        }
    }

    coinManagement() {
        const callApi = async () => {
            try {
                // Get all coins
                let response = await axios.get('https://api.coingecko.com/api/v3/coins/list?include_platform=true');
                this.incomingCoins = response.data || [];
                const dictionarySize = Object.keys(this.storedCoinList).length;
                if (dictionarySize === 0) {
                    this.storeCoins()
                }
                else {
                    if (process.env.NODE_ENV === 'dev') {
                        this.incomingCoins.push({
                            id: 'dummy',
                            symbol: 'hellooo',
                            name: 'Dummy Gecko',
                            platforms: {
                                etherium: '1234',
                                bitcoin: ''
                            }
                        })
                    }
                    this.checkNewCoin()
                }
                this.interval = 5000;
                setTimeout(callApi, this.interval);
            } catch (error) {
                if (error.response.status == 429) {
                    const retryAfter = error.response.headers['retry-after'];
                    this.interval = retryAfter * 1000 + 2000
                    console.log(`Response Status = ${error.response.status} Interval = ${this.interval}`)
                    setTimeout(callApi, this.interval);
                }
                else {
                    logError(error);
                    setTimeout(callApi, this.interval);
                }
            }
        }
        setTimeout(callApi, this.interval);
    }

    storeCoins() {
        this.incomingCoins.map(coin => {
            this.storedCoinList[`${coin.id}`] = coin;
        })
    }
    checkNewCoin() {
        let discoveredAt = null;
        this.incomingCoins.map(coin => {
            if (!this.storedCoinList[`${coin.id}`]) {
                discoveredAt = new moment().toString();
                let { id, name, symbol } = coin;
                let platforms = Object.keys(coin.platforms).length > 0 ? Object.keys(coin.platforms).map((platformName) => {
                    return `\n\t\t${platformName}: ${coin.platforms[platformName] || null}`;
                }) : 'Not Found';
                let message = `New @ CoinGecko:\n\tid: ${id},\n\tsymbol: ${symbol},\n\tname: ${name},\n\ttoken_addresses: ${platforms},\nfound at ${discoveredAt}`;
                notifyOnDiscord(message, DISCORD_WEBHOOK_URLS[this.discordWebhookKey]);
                console.log(message);
                this.storedCoinList[`${coin.id}`] = coin;
            }
        })
    }
}

