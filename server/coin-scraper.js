const moment = require('moment');
const axios = require('axios')
const { TELEGRAM_WEBHOOK_URLS, CMC_API_KEY } = require('./config');
const { notifyDiscordBots, notifyOnTelegram, logError, updateJsonFile } = require(
  './common-functions');

module.exports = class CoinScraper {
  constructor() {
    this.mostRecentItems = [];
    this.previousItemsMap = {};
    this.telegramWebhookKey = 'TelegramBot';
    this.discordWebhookKeys = ['CMCBajwaBot', 'yetToBeNamedBot'];
    if(process.env.NODE_ENV === 'dev') {
      this.discordWebhookKeys = ['testWeirdoBot'];
    }
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
          'sort_dir': 'desc',
          'aux': 'date_added,platform'
        },
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY
        }
      };
      const response = await axios(config)
      // The response coming from api can be accessed through response.data.data that is why
      // we are returning response.data from here
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  updateDictionary() {
    this.mostRecentItems.map(coin => {
      this.previousItemsMap[`${coin.id}`] = coin;
    });
  }

  async flagNewArrivals() {
    try {
      const response = await this.fetchMostRecentListedItems();
      updateJsonFile('cmc');
      this.mostRecentItems = response.data;
      this.mostRecentItems = Array.isArray(this.mostRecentItems) ? this.mostRecentItems : [];

      if (process.env.NODE_ENV === 'dev') {
        this.mostRecentItems.push({
          id: 'CMC-dummy',
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
      let tokenAddress = null;
      this.mostRecentItems.map(coin => {
        if (!this.previousItemsMap[`${coin.id}`] && dictionarySize) {
          discoveredAt = new moment().toString();
          tokenAddress = coin.platform ? coin.platform.token_address : coin.platform;
          message = `New @ CoinMarketCap:` + 
            `\n\tid: ${coin.id},` +
            `\n\tsymbol: ${coin.symbol},` +
            `\n\tmarket_cap: ${coin.quote.USD.market_cap},` +
            `\n\ttoken_address: ${tokenAddress},` +
            `\nfound at ${discoveredAt}.`;
          notifyOnTelegram(message, TELEGRAM_WEBHOOK_URLS[this.telegramWebhookKey]);
          notifyDiscordBots(message, this.discordWebhookKeys);
          console.log(message);
        }
      });
      this.updateDictionary();
    } catch(error) {
      logError(error);
    }
  }

  async startLookingForNewArrivals() {
    try {
      const response = await this.fetchMostRecentListedItems();
      this.mostRecentItems = response.data;
      this.mostRecentItems = Array.isArray(this.mostRecentItems) ? this.mostRecentItems : [];
      this.updateDictionary();
      const interval = 6 * 1000;
      setInterval(() => {
        this.flagNewArrivals();
      }, interval);
    } catch (err) {
      logError(err);
    }
  }

};