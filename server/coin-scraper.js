const moment = require('moment');
const axios = require('axios')
const { CMC_API_KEY, DISCORD_WEBHOOK_URLS } = require('./config');
const { notifyOnDiscord } = require('./common-functions');

module.exports = class CoinScraper {
  constructor() {
    this.mostRecentItems = [];
    this.previousItemsMap = {};
  }

  async fetchMostRecentListedItems() {
    try {
      const config = {
        url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
        method: 'get',
        params: {
          'start': '1',
          'limit': '200',
          'sort': 'date_added',
          'sort_dir': 'asc',
          'aux': 'date_added'
        },
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY
        },
        json: true,
        gzip: true
      };
      const response = await axios(config)
      // The response coming from api can be accessed through response.data.data that is why we are returning response.data from here
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }


  wait(milliSecs) {
    return new Promise(resolve => setTimeout(resolve, milliSecs));
  }

  updateDictionary() {
    this.mostRecentItems.map(coin => {
      this.previousItemsMap[`${coin.id}`] = coin;
    });
  }

  async flagNewArrivals() {
    const interval = 6 * 1000;
    await this.wait(interval);
    const response = await this.fetchMostRecentListedItems();
    this.mostRecentItems = response.data;
    this.mostRecentItems = Array.isArray(this.mostRecentItems) ? this.mostRecentItems : [];
    if (process.env.NODE_ENV === 'dev') {
      this.mostRecentItems.push({
        id: 'dummy',
        symbol: 'hellooo',
        quote: {
          USD: {
            market_cap: 12345.67890
          }
        }
      });
    }
    const dictionarySize = Object.keys(this.previousItemsMap).length;
    let discoveredAt = null;
    let message = null;
    this.mostRecentItems.map(coin => {
      if (!this.previousItemsMap[`${coin.id}`] && dictionarySize) {
        discoveredAt = new moment().toString();
        message = `New @ CoinMarketCap, id: ${coin.id}, symbol: ${coin.symbol}, market_cap: ${coin.quote.USD.market_cap}, found at ${discoveredAt}`;
        notifyOnDiscord(message, DISCORD_WEBHOOK_URLS['CMCBajwaBot']);
        console.log(message);
      }
    });
    this.updateDictionary();
    this.flagNewArrivals();
  }

  async startLookingForNewArrivals() {
    try {
      const response = await this.fetchMostRecentListedItems();
      for (let i = 0; i <= 5; i++) {
        console.log(response.data[i])
      }
      this.mostRecentItems = response.data;
      this.mostRecentItems = Array.isArray(this.mostRecentItems) ? this.mostRecentItems : [];
      this.updateDictionary();
      this.flagNewArrivals();
    } catch (err) {
      let errorTiming = moment().toString();
      console.log(`${err} at ${errorTiming}`);
    }
  }
};