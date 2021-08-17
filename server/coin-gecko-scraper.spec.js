const chai = require('chai');
const expect = chai.expect;
const sinon = require("sinon");
const FakeTimers = require("@sinonjs/fake-timers");
const proxyquire =  require('proxyquire');
const axios = require('axios');

describe('Coingecko new arrivals alert service', () => {
  let clock;
  let fakeNotifyOnDiscord;
  let fakeNotifyOnTelegram;
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
    fakeNotifyOnDiscord = sinon.spy(() => {
      console.log('fake discord notification sent');
    });
    fakeNotifyOnTelegram = sinon.spy(() => {
      console.log('fake discord Telegram sent');
    });
  });

  afterEach(() => {
    clock.uninstall();
  });

  describe(`Error handler of the polling api call`, () => {
    it(`should not crash the scraper if the api call throws an error with a 'response' property set as undefined`,
      async () => {
        const CoinGeckoScraper = proxyquire('./coin-gecko-scraper', {
          './common-functions': {
            notifyOnDiscord: fakeNotifyOnDiscord,
            notifyOnTelegram: fakeNotifyOnTelegram
          }
        });
        const scraper = new CoinGeckoScraper();
        // mock api call to return the error with 'response' property as undefined
        let stubbedFetchDataFunc = sinon.stub(axios, 'get');
        stubbedFetchDataFunc.returns(Promise.reject({
          response: undefined
        }));
        scraper.coinManagement();
        // verify that the first api call is fired
        await clock.tick(5000);
        expect(stubbedFetchDataFunc.callCount).to.equal(1);
        // verify that the next api call is fired (after the last one threw the error)
        await clock.tick(5000);
        expect(stubbedFetchDataFunc.callCount).to.equal(2);
        axios.get.restore();
      });
  });

  it.skip(`should identify all new coins from the next coins fetch request`, async () => {
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