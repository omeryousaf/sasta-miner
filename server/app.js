const express = require('express');
const app = express();
const port = 3000;
const CoinScraper = require('./coin-scraper');

app.use(express.static('dist'));

app.get('/api/new-arrivals', async (req, res) => {
  let newCoinsList;
  try {
    const scraper = new CoinScraper();
    const response = await scraper.scrapeCMC();
    newCoinsList = response.data;
    newCoinsList = Array.isArray(newCoinsList) ? newCoinsList : [];
  } catch(err) {
    console.log(err);
  }
  res.send(newCoinsList);
});

app.listen(port, () => {
  console.log(`server app listening at http://localhost:${port}`);
});