const chai = require('chai');
const expect = chai.expect;
const sinon = require("sinon");
const FakeTimers = require("@sinonjs/fake-timers");
const proxyquire =  require('proxyquire');

describe('CoinMarketCap new arrivals alert service', () => {
  let clock;
  let scraper;

  beforeEach(() => {
    clock = FakeTimers.install();

  });

  afterEach(() => {
    clock.uninstall();
  });

  it(`should continue polling after a failure response from CMC server`, async () => {
    // Start the service and send a success reponse from the CMC data fetch handler method (that
    // makes the api request CMC servers and relays the response back to its caller).
    // Then fast forward the clock by one polling interval and assert that another call to the
    // CMC data fetching method is made but mock it to return a failure response this time.
    // Finally fast forward by an interval again and assert that the data fetching method is called
    // again as expected i-e the service is not interrupted by a bad response from CMC servers.
    const fakeNotifyOnDiscord = sinon.spy(() => {
      console.log('fake discord notification sent');
    });
    const CoinScraper = proxyquire('./coin-scraper', {
      './common-functions': {
        notifyOnDiscord: fakeNotifyOnDiscord
      }
    });
    scraper = new CoinScraper();
    let stubbedFetchDataFunc = sinon.stub(scraper, 'fetchMostRecentListedItems');
    // mock the stubbed data fetch function to return success response
    stubbedFetchDataFunc.returns(Promise.resolve({
      data: []
    }));
    scraper.startLookingForNewArrivals();
    let sentNotificationsCount = 1;
    expect(stubbedFetchDataFunc.callCount).to.equal(sentNotificationsCount);
    // move clock to next tick so that the initial async call inside the method called above
    // gets done and the code has reached setinterval
    await clock.next();
    // now proceed forward by one polling interval
    await clock.tick(6000);
    sentNotificationsCount++;
    expect(stubbedFetchDataFunc.callCount).to.equal(sentNotificationsCount);
    // mock the data fetch function to return with failure
    stubbedFetchDataFunc.returns(Promise.reject());
    await clock.tick(6000);
    sentNotificationsCount++;
    console.log(`stubbedFetchDataFunc callCount: ${stubbedFetchDataFunc.callCount}`);
    expect(stubbedFetchDataFunc.callCount).to.equal(sentNotificationsCount);
  });
});