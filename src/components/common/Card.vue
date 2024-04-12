<script setup lang="ts">
defineProps<{
	column?: boolean;
	row?: boolean;
	scroll?: boolean;
	shadow?: boolean;
}>();
</script>

<template>
	<div class="card" :class="{ column, row, scroll, shadow }">
		<slot></slot>
	</div>
</template>

<style scoped>
.card {
	background-color: var(--background-color);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	padding: 4px;
}

.column, .row {
	display: flex;
	gap: 4px;
}

.column {
	flex-direction: column;
}

.row {
	flex-direction: row;
}

.scroll:not(.row) {
	overflow-y: auto;
}

.scroll.row {
	overflow-x: auto;
}

.shadow {
	box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}
</style>