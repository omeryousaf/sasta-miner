const express = require('express');
const moment = require('moment');
const app = express();
const port = 3000;
const CoinScraper = require('./coin-scraper');
const { CUTOFF_DATE } = require('./constants');

app.use(express.static('dist'));

app.get('/api/new-arrivals', async (req, res) => {
  let newCoinsList;
  try {
    const scraper = new CoinScraper();
    const response = await scraper.scrapeCMC();
    newCoinsList = response.data;
    newCoinsList = Array.isArray(newCoinsList) ? newCoinsList : [];
    const cutoffDate = moment(new Date(req.query.cutoff_date || CUTOFF_DATE));
    newCoinsList = newCoinsList.filter((coin) => moment(coin.date_added).isAfter(cutoffDate));
    res.send(newCoinsList);
  } catch(err) {
    console.log(err);
    res.send({
      error: {
        message: `something bad happened, plz try gain or contact helpline.`
      }
    }).status(500);
  }
});

app.listen(port, () => {
  console.log(`server app listening at http://localhost:${port}`);
});