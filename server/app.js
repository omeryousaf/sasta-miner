const express = require('express');
const moment = require('moment');
const app = express();
const port = 3000;
const CoinGeckoScraper = require('./coin-gecko-scraper');
const CoinScraper = require('./coin-scraper');
const { CUTOFF_DATE } = require('./constants');

app.use(express.static('dist'));

const scraper = new CoinScraper();
const coinGeckoScraper = new CoinGeckoScraper();

// start new arrivals tracker & notifier service
//scraper.startLookingForNewArrivals();
coinGeckoScraper.coinManagement();

app.get('/api/new-arrivals', async (req, res) => {
  let newCoinsList;
  try {
    const response = await scraper.fetchMostRecentListedItems();
    newCoinsList = response.data;
    newCoinsList = Array.isArray(newCoinsList) ? newCoinsList : [];
    const cutoffDate = moment(new Date(req.query.cutoff_date || CUTOFF_DATE));
    newCoinsList = newCoinsList.filter((coin) => {
      return moment(coin.date_added).isSame(cutoffDate) || moment(coin.date_added).isAfter(cutoffDate)
    });
    res.send(newCoinsList);
  } catch (err) {
    console.log(err);
    res.send({
      error: {
        message: `something bad happened, plz try gain or contact helpline.`
      }
    }).status(500);
  }
});

app.get('/api/notify', (req, res) => {
  scraper.notifyOnDiscord('hello boyses! testing 123!! did any of you click the contact us page ? sup nigga!');
  res.send({ success: 'yes' });
});

app.get('*', (req, res) => {
  res.sendFile('/dist/index.html', { root: '.' });
});

app.listen(port, () => {
  console.log(`server app listening at http://localhost:${port}`);
});