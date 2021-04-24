<template>
	<div>
		<h1>Creepy Crypto Coins</h1>
		<div>
			<h4>New Arrivals between {{ viewLoadedAt }} and {{ newTimeFormatted }}</h4>
			<ul
				v-for="newCoin in newArrivals"
				:key="newCoin.id">
				<li>
					id: {{newCoin.id}} (discovered at: {{newCoin.discoveredAt}})
				</li>
			</ul>
		</div>
	</div>
</template>

<script type="text/javascript">
	import axios from 'axios';
	import moment from 'moment';
	export default {
		name: 'Coinage',
		data () {
      return {
        newCoinsList: [],
        newTimestamp: new moment(),
        previousCoinsMap: {},
        newArrivals: [],
        keepPolling: true,
        viewLoadedAt: new moment().format('hh:mm:ss, D-MMM-yyyy')
      }
    },
		async mounted () {
			try {
      	this.newCoinsList = await this.fetchData();
        this.newCoinsList = Array.isArray(this.newCoinsList) ? this.newCoinsList : [];
			} catch(err) {
				console.log(err);
			}
			this.updateCoinsDictionary();
			this.reportNewArrivals();

		},
		computed: {
			newTimeFormatted() {
				return this.newTimestamp.format('hh:mm:ss, D-MMM-yyyy')
			}
		},
		destroyed() {
			this.keepPolling = false;
		},
		methods: {
			fetchData() {
				this.newTimestamp = new moment();
				const url = 'https://api.coingecko.com/api/v3/coins/list';
				return axios.get(url)
				  .then(response => response.data)
				  .catch(error => console.log(error));
			},
			wait(milliSecs) {
				return new Promise(resolve => setTimeout(resolve, milliSecs));
			},
			updateCoinsDictionary() {
				this.newCoinsList.map(coin => {
				  this.previousCoinsMap[coin.id] = coin;
			  });
			},
			async reportNewArrivals() {
				const interval = 10 * 1000;
				await this.wait(interval);
				try {
	      	this.newCoinsList = await this.fetchData();
          this.newCoinsList = Array.isArray(this.newCoinsList) ? this.newCoinsList : [];
				} catch(err) {
					console.log(err);
				}
        this.newCoinsList.push({ id: 'dummy', name: 'hellooo'})
			  const coinsMapSize = Object.keys(this.previousCoinsMap).length;
			  let discoveredAt = null;
        this.newCoinsList.map(coin => {
    	    if(!this.previousCoinsMap[coin.id] && coinsMapSize) {
    	    	discoveredAt = new moment();
    		    alert(`new coin, id: ${coin.id}, found at ${discoveredAt.format('hh:mm:ss')} on ${discoveredAt.format('D-MMM-yyyy')}`);
    		    console.log(`new coin with id: ${coin.id} found at ${discoveredAt.format('hh:mm:ss')} on ${discoveredAt.format('D-MMM-yyyy')}`);
    		    this.newArrivals.push({
    		    	...coin,
    		    	discoveredAt: `${discoveredAt.format('hh:mm:ss')}, ${discoveredAt.format('D-MMM-yyyy')}`
    		    });
    	    }
        });
        this.updateCoinsDictionary();
        if(this.keepPolling) {
        	this.reportNewArrivals();
        }
			}
		}
	}
</script>