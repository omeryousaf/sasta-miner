const moment = require('moment');
const axios = require('axios');
const { TELEGRAM_WEBHOOK_URLS, DISCORD_WEBHOOK_URLS } = require('./config');
const { notifyOnTelegram, notifyOnDiscord, logError, updateJsonFile } = require(
    './common-functions');
const { COIN_GECKO_INTERVAL } = require('./constants');

module.exports = class CoinGeckoScraper {
    constructor() {
        this.coinsListApiConfig = {
            url: 'https://api.coingecko.com/api/v3/coins/list',
            method: 'get',
            params: {
                include_platform: true,
            },
            timeout: 20000 // 20 seconds
        };
        this.setIntervalRef;
        this.incomingCoins = [];
        this.storedCoinList = {};
        this.interval = COIN_GECKO_INTERVAL;
        this.telegramWebhookKey = 'TelegramBot';
        this.discordWebhookKey = 'CGBajwaBot';
        if (process.env.NODE_ENV === 'dev') {
            this.discordWebhookKey = 'testWeirdoBot';
        }
    }

    async flagNewArrivals(pollingInterval) {
        try {
            let response = await axios(this.coinsListApiConfig);
            updateJsonFile('gecko');
            console.log(response.data[response.data.length - 1]);
            this.incomingCoins = response.data || [];
            const dictionarySize = Object.keys(this.storedCoinList).length;
            if (dictionarySize === 0) {
                this.storeCoins()
            }
            else {
                if (process.env.NODE_ENV === 'dev') {
                    this.incomingCoins.push({
                        id: 'CG-dummy',
                        symbol: 'hellooo',
                        name: 'Dummy Gecko',
                        link: 'https://www.coingecko.com/en/coins/01coin',
                        platforms: {
                            etherium: '1234',
                            bitcoin: ''
                        }
                    })
                }
                this.checkNewCoin()
            }
            console.error(`Successfully polled`);
            if(pollingInterval > COIN_GECKO_INTERVAL) {
                this.startPollingWithInterval(COIN_GECKO_INTERVAL);
            }
        } catch (error) {
            console.error(`===== catch block of CG polling service ======`);
            if (error.response === undefined) {
                console.error('error.response is undefined');
            }
            else if (error.response.status === 429) {
                let retryAfter = error.response.headers['retry-after'];
                retryAfter = retryAfter * 1000 + 2000;
                console.error(`Response Status = ${error.response.status}, ` +
                    `retry after = ${retryAfter} milliseconds`);
                this.startPollingWithInterval(retryAfter);
            }
            logError(error);
        }
    }

    startPollingWithInterval(milliseconds) {
        clearInterval(this.setIntervalRef);
        console.error(`Switching to ${milliseconds}ms interval for CG polling service`);
        this.setIntervalRef = setInterval(() => {
            this.flagNewArrivals(milliseconds);
        }, milliseconds);
    }

    async coinManagement() {
        this.startPollingWithInterval(this.interval);
    }

    storeCoins() {
        this.incomingCoins.map(coin => {
            this.storedCoinList[`${coin.id}`] = coin;
        })
    }
    checkNewCoin() {
        let discoveredAt = null;
        this.incomingCoins.map(coin => {
            if (!this.storedCoinList[`${coin.id}`]) {
                discoveredAt = new moment().toString();
                let { id, name, symbol } = coin;
                let platforms = Object.keys(coin.platforms).length > 0 ? Object.keys(coin.platforms).map((platformName) => {
                    return `\n\t\t${platformName}: ${coin.platforms[platformName] || null}`;
                }) : 'Not Found';
                let message = `New @ CoinGecko:` +
                    `\n\tid: ${id},` +
                    `\n\tsymbol: ${symbol},` +
                    `\n\tname: ${name},` +
                    `\n\ttoken_addresses: ${platforms},` +
                    `\n\tlink: https://www.coingecko.com/en/coins/${id}` +
                    `\nfound at ${discoveredAt}.` +
                    `\nAlerts sponsored by upcoming Goat It Gaming platform on Solana. ` +
                      `https://goatit.app | https://discord.gg/goatitsol`;
                notifyOnTelegram(message, TELEGRAM_WEBHOOK_URLS[this.telegramWebhookKey]);
                notifyOnDiscord(message, DISCORD_WEBHOOK_URLS[this.discordWebhookKey]);
                console.log(message);
                this.storedCoinList[`${coin.id}`] = coin;
            }
        })
    }
}

