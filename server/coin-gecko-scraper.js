const rp = require('request-promise');
const { notifyOnDiscord } = require('./commenFunctions');


module.exports = class CoinGeckoScraper {
    constructor() {
        this.incomingCoins = [];
        this.storedCoinList = {};
    }

    async coinManagement() {
        console.log('----Process Start, Searching For Coin----')
        setInterval(async () => {
            try {
                //1. Import coingecko-api
                const CoinGecko = require('coingecko-api');
                //2. Initiate the CoinGecko API Client
                const CoinGeckoClient = new CoinGecko();
                //3. Get all coins
                let response = await CoinGeckoClient.coins.list();
                this.incomingCoins = response.data
                const dictionarySize = Object.keys(this.storedCoinList).length;
                if (dictionarySize === 0) {
                    this.storeCoins()
                }
                else {
                    console.log('--Searching for new coin--')
                    this.checkNewCoin()
                }
            }
            catch (error) {
                console.log(error)
            }

        }, 5000);
    }

    storeCoins() {
        this.incomingCoins.map(coin => {
            this.storedCoinList[`${coin.id}`] = coin;
        })
        console.log('--All coins are stored--')
    }
    checkNewCoin() {
        this.incomingCoins.map(coin => {
            if (!this.storedCoinList[`${coin.id}`]) {
                message = `New Gecko Coin found, Id =  ${coin.id}, and Name = ${coin.name}`;
                notifyOnDiscord(message);
                this.updateCoinList(coin);
            }
        })

    }
    updateCoinList() {
        this.incomingCoins.map(coin => {
            this.storedCoinList[`${coin.id}`] = coin;
        });
    }
}

