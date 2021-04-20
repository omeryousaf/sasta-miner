<template>
	<div class="flex">
		<img class="logo" src="../assets/logo.png">
	</div>
</template>

<script type="text/javascript">
	export default {
		name: 'TopNav',
		components: {}
	}
</script>
<style scoped>
	.flex {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.logo {
		max-width: 40px;
	}
</style>