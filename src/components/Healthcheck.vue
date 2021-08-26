<template>
  <div>
    <h1>Healthcheck of Polling Services</h1>
    <div>
      <h4>Last polled successfully at</h4>
      <div
        class="error"
        v-if="errorEncountered">
        <h5>An error was encountered. Please try again or create a ticket at our <a href="https://github.com/omeryousaf/sasta-miner/issues">issues page</a>.</h5>
      </div>
      <ul
        v-else>
        <li>
          CoinMarketCap: {{ cmcLastPolledSuccessfullyAt }}
        </li>
        <li>
          CoinGecko: {{ coinGeckoLastPolledSuccessfullyAt }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script type="text/javascript">
  import axios from 'axios';
  export default {
    name: 'Healthcheck',
    data () {
      return {
        cmcLastPolledSuccessfullyAt: '',
        coinGeckoLastPolledSuccessfullyAt: '',
        errorEncountered: false
      }
    },
    async created() {
      const url = '/api/coins-update';
      try {
        const response = await axios.get(url);
        this.cmcLastPolledSuccessfullyAt = response.data.cmcLastUpdate;
        this.coinGeckoLastPolledSuccessfullyAt = response.data.coinGeckoLastUpdate;
      } catch(error) {
        this.errorEncountered = true;
      }
    }
  }
</script>

<style scoped lang="scss">
  ul {
    text-align: left;
  }
</style>