const chai = require('chai');
const expect = chai.expect;
const sinon = require("sinon");
const FakeTimers = require("@sinonjs/fake-timers");
const proxyquire =  require('proxyquire');

describe('Coingecko new arrivals alert service', () => {
  let clock;
  const initialCoinsData = [{
    id: '01coin',
    symbol: 'zoc',
    name: '01 Coin'
  }, {
    id: '104',
    symbol: 'DEFIT',
    name: 'Digital Fitness'
  }];
  const newScrapedData = [
    ...initialCoinsData, {
      id: '9162',
      symbol: "BLUE",
      name: "Blue Swap"
    }, {
      id: 'shit123',
      symbol: 'SHIC',
      name: 'Shit Coin'
    }
  ];

  beforeEach(() => {
    clock = FakeTimers.install();
  });

  afterEach(() => {
    clock.uninstall();
  });

  it(`should identify all new coins from the next coins fetch request`, async () => {
    // Set coingecko scraper's stored coins list with some initial coins data. Then make the
    // coingecko library's `coins.list()` method to return two new coins. Move the clock forward
    // by enough interval so that a new api call to fetch coins data is triggered.
    // Verify that both new coins returned by the coin fetch call are detected by the service (
    // indicated by how many times the `notifyOnDiscord` method is called by the service).
    class MockCoinGecko {
      get coins() {
        return {
          list: () => Promise.resolve({
            data: newScrapedData
          })
        }
      }
    }
    const fakeNotifyOnDiscord = sinon.spy(() => {
      console.log('fake discord notification sent');
    });
    const CoinGecko = proxyquire('./coin-gecko-scraper', {
      'coingecko-api': MockCoinGecko,
      './common-functions': {
        notifyOnDiscord: fakeNotifyOnDiscord
      }
    });
    const scraper = new CoinGecko();
    initialCoinsData.map((coin) => {
      scraper.storedCoinList[`${coin.id}`] = coin;
    });
    scraper.coinManagement();
    await clock.tick(5000);
    console.log('this line should appear after all logs from source code');
    const expectedNotificationCalls = 2;
    expect(fakeNotifyOnDiscord.callCount).to.equal(expectedNotificationCalls);
  });
});