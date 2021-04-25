const rp = require('request-promise');
const { CMC_API_KEY } = require('./config');

module.exports = class CoinScraper {
  scrapeCMC() {
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
  
};