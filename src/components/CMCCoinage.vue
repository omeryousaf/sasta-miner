<template>
  <div>
    <h1>Freagin CMC Crypto Coins</h1>
    <div>
      <h4>New Arrivals, from {{ cutoffDate }} to date</h4>
      <ul
        v-for="newCoin in newArrivals"
        :key="newCoin.id">
        <li>
          id: {{newCoin.id}}, symbol: {{newCoin.symbol}} (added at: {{newCoin.formattedDateAdded}})
        </li>
      </ul>
    </div>
  </div>
</template>

<script type="text/javascript">
  import axios from 'axios';
  import moment from 'moment';
  import { CUTOFF_DATE } from '../constants';
  export default {
    name: 'CMCCoinage',
    data () {
      return {
        newArrivals: [],
        cutoffDate: moment(new Date(CUTOFF_DATE)).format('D-MMM-yyyy HH:mm:ss')
      }
    },
    async mounted () {
      try {
        this.newArrivals = await this.fetchData();
        this.newArrivals = Array.isArray(this.newArrivals) ? this.newArrivals : [];
        this.newArrivals.map((coin) => {
          coin.formattedDateAdded = moment(coin.date_added).format('HH:mm:ss, D-MMM-yyyy');
          return;
        });
      } catch(err) {
        console.log(err);
      }
    },
    methods: {
      fetchData() {
        const url = '/api/new-arrivals';
        const qs = `?cutoff_date=${CUTOFF_DATE}`;
        return axios.get(`${url}${qs}`)
          .then(response => response.data)
          .catch(error => console.log(error));
      },
      wait(milliSecs) {
        return new Promise(resolve => setTimeout(resolve, milliSecs));
      }
    }
  }
</script>