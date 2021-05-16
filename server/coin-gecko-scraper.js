const moment = require('moment');
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
                const CoinGecko = require('coingecko-api');
                const CoinGeckoClient = new CoinGecko();
                // Get all coins
                let response = await CoinGeckoClient.coins.list();
                this.incomingCoins = response.data || [];
                const dictionarySize = Object.keys(this.storedCoinList).length;
                if (dictionarySize === 0) {
                    this.storeCoins()
                    if(process.env.NODE_ENV === 'dev') {
                        this.incomingCoins.push({
                            id: 'dummy',
                            symbol: 'hellooo',
                            name: 'Dummy Gecko'
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
                let message = `New @ CoinGecko, id: ${coin.id}, symbol: ${coin.symbol}, name: ${coin.name}, found at ${discoveredAt}`;
                notifyOnDiscord(message, DISCORD_WEBHOOK_URLS['CGBajwaBot']);
                console.log(message);
                this.storedCoinList[`${coin.id}`] = coin;
            }
        })
        this.updateCoinList();
    }
}

