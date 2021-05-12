const moment = require('moment');
const rp = require('request-promise');
const { CMC_API_KEY, DISCORD_WEBHOOK_URLS } = require('./config');
const { notifyOnDiscord } = require('./common-functions');

module.exports = class CoinScraper {
  constructor() {
    this.mostRecentItems = [];
    this.previousItemsMap = {};
  }

  fetchMostRecentListedItems() {
    const requestOptions = {
      method: 'GET',
      uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
      qs: {
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

    return rp(requestOptions);
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
    if(process.env.NODE_ENV === 'dev') {
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