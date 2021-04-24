<template>
  <div>
    <h1>Freagin CMC Crypto Coins</h1>
    <div>
      <h4>New Arrivals between {{ viewLoadedAt }} and {{ newTimeFormatted }}</h4>
      <ul
        v-for="newCoin in newArrivals"
        :key="newCoin.id">
        <li>
          id: {{newCoin.id}} {{newCoin.symbol}} (discovered at: {{newCoin.formattedDateAdded}})
        </li>
      </ul>
    </div>
  </div>
</template>

<script type="text/javascript">
  import axios from 'axios';
  import moment from 'moment';
  export default {
    name: 'CMCCoinage',
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
        this.newArrivals = await this.fetchData();
        this.newArrivals = Array.isArray(this.newArrivals) ? this.newArrivals : [];
        this.newArrivals.map((coin) => {
          coin.formattedDateAdded = moment(coin.date_added).format('hh:mm:ss, D-MMM-yyyy');
          return;
        });
      } catch(err) {
        console.log(err);
      }
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
        const url = '/api/new-arrivals';
        return axios.get(url)
          .then(response => response.data)
          .catch(error => console.log(error));
      },
      wait(milliSecs) {
        return new Promise(resolve => setTimeout(resolve, milliSecs));
      }
    }
  }
</script>