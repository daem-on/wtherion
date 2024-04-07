<script setup lang="ts">
import { activeDialogList } from '../../modal';
</script>

<template>
	<div class="dialog-container">
		<div v-for="entry of activeDialogList">
			<h2>{{ entry.data.title }}</h2>
			<component v-for="entry of activeDialogList" :is="entry.component" :data="entry.data" />
		</div>
	</div>
</template>

<style scoped>
.dialog-container {
	position: absolute;
	display: grid;
	grid-template-rows: 100vh;
	grid-template-columns: 100vw;
	pointer-events: none;
}

.dialog-container > div {
	position: absolute;
	align-self: center;
	justify-self: center;
	pointer-events: auto;

	background-color: var(--background-color);
	border: var(--border-color) solid 1px;
	border-radius: 4px;
	box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
	min-width: 300px;
	z-index: 100;
}
</style>