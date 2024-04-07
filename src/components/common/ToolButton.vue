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
	padding: 2px;
	line-height: 0;
	cursor: pointer;
	border-radius: 4px;
	overflow: hidden;
	border: none;
}

button.tool:hover,
button.tool.active {
	background-color: var(--card-color);
}
</style>