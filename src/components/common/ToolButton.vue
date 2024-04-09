<script setup lang="ts">
</script>

<template>
	<button class="tool">
		<slot></slot>
	</button>
</template>

<style scoped>
button.tool {
	display: inline-block;
	background-color: var(--background-color);
	text-align: center;
	width: 36px;
	height: 36px;
	display: flex;
	justify-content: center;
	align-items: center;
	line-height: 0;
	cursor: pointer;
	border-radius: 4px;
	overflow: hidden;
	border: none;
	flex-shrink: 0;
}

button.tool:hover,
button.tool.active {
	background-color: var(--hover-color);
}
</style>