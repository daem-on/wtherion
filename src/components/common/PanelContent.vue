<template>
	<div class="panel-content">
		<slot></slot>
	</div>
</template>

<style scoped>
.panel-content {
	display: flex;
	flex-direction: column;
	padding: 8px;
}
</style>