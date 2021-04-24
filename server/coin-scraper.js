const rp = require('request-promise');

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
        'X-CMC_PRO_API_KEY': 'c9c6a6a6-ecf0-4871-882d-cc6d8840f2d5'
      },
      json: true,
      gzip: true
    };

    return rp(requestOptions);
  }
  
};