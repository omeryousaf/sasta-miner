const moment = require('moment');
const rp = require('request-promise');
const { CMC_API_KEY, DISCORD_WEBHOOK_URLS } = require('./config');

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
        'limit': '500',
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
  
  notifyOnDiscord(msg) {
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

  wait(milliSecs) {
    return new Promise(resolve => setTimeout(resolve, milliSecs));
  }

  updateDictionary() {
    this.mostRecentItems.map(coin => {
      this.previousItemsMap[`${coin.id}`] = coin;
    });
  }

  async flagNewArrivals() {
    const interval = 20 * 1000;
    await this.wait(interval);
    this.mostRecentItems = await this.fetchMostRecentListedItems();
    this.mostRecentItems = Array.isArray(this.mostRecentItems) ? this.mostRecentItems : [];
    this.mostRecentItems.push({ id: 'dummy', symbol: 'hellooo'})
    const dictionarySize = Object.keys(this.previousItemsMap).length;
    let discoveredAt = null;
    let message = null;
    this.mostRecentItems.map(coin => {
      if(!this.previousItemsMap[`${coin.id}`] && dictionarySize) {
        discoveredAt = new moment();
        message = `new coin, id: ${coin.id}, found at ${discoveredAt.format('HH:mm:ss')} on ${discoveredAt.format('D-MMM-yyyy')}`;
        this.notifyOnDiscord(message);
        console.log(message);
      }
    });
    this.updateDictionary();
    this.flagNewArrivals();
  }

  async startLookingForNewArrivals () {
    try {
      const response = await this.fetchMostRecentListedItems();
      this.mostRecentItems = response.data;
      this.mostRecentItems = Array.isArray(this.mostRecentItems) ? this.mostRecentItems : [];
      this.updateDictionary();
      this.flagNewArrivals();
    } catch(err) {
      console.log(err);
    }
  }
};