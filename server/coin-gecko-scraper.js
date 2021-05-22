const moment = require('moment');
const axios = require('axios');
const { DISCORD_WEBHOOK_URLS } = require('./config');
const { notifyOnDiscord } = require('./common-functions');

module.exports = class CoinGeckoScraper {
    constructor() {
        this.incomingCoins = [];
        this.storedCoinList = {};
    }

    async coinManagement() {
        setInterval(async () => {
            try {
                // Get all coins
                let response = await axios.get('https://api.coingecko.com/api/v3/coins/list?include_platform=true');
                this.incomingCoins = response.data || [];
                const dictionarySize = Object.keys(this.storedCoinList).length;
                if (dictionarySize === 0) {
                    this.storeCoins()
                    if (process.env.NODE_ENV === 'dev') {
                        this.incomingCoins.push({
                            id: 'dummy',
                            symbol: 'hellooo',
                            name: 'Dummy Gecko',
                            platforms: {
                                etherium: '1234',
                                bitcoin: '2345'
                            }
                        })
                    }
                }
                this.checkNewCoin()
            }
            catch (error) {
                let errorTiming = moment().toString();
                console.log(`${error} at ${errorTiming}`)
            }

        }, 5000);
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
                let platforms = Object.keys(coin.platforms).length === 0 ? 'Not Found' : JSON.stringify(coin.platforms);

                let message = `New @ CoinGecko, id: ${id}, symbol: ${symbol}, name: ${name}, platforms: ${platforms} found at ${discoveredAt}`;
                notifyOnDiscord(message, DISCORD_WEBHOOK_URLS['CGBajwaBot']);
                console.log(message);
                this.storedCoinList[`${coin.id}`] = coin;
            }
        })
    }
}

