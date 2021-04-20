<template>
	<div class="layout">
		<TopNav class="top"/>
		<SideNav class="side"/>
		<Content class="main"/>
	</div>
</template>

<script type="text/javascript">
	import TopNav from '@/components/TopNav';
	import SideNav from '@/components/SideNav';
	import Content from '@/components/Content';

	export default {
		name: 'Layout',
    components: {
      TopNav,
      SideNav,
      Content
    }
	}
</script>

<style scoped lang="scss">
	.top {
		grid-area: t;
		background-color: lightblue;
	}
	.side {
		grid-area: s;
		background-color: lightgreen;
	}
	.main {
		grid-area: m;
	}
	.layout {
		display: grid;
		grid-template-columns: 150px auto;
		grid-template-rows: 50px auto;
		grid-template-areas:'t t'
												's m';
		height: 100vh;
	}
</style>