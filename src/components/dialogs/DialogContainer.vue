<script setup lang="ts">
import { activeDialogList, removeDialog } from '../../modal';
</script>

<template>
	<div class="dialog-container">
		<div class="dialog-window" v-for="entry of activeDialogList" :style="entry.data.style">
			<div class="dialog-header">
				<h2>{{ $t(entry.data.title) }}</h2>
				<button @click="removeDialog(entry.data.id)">⨉</button>
			</div>
			<div class="dialog-content">
				<component :is="entry.component" :data="entry.data" />
			</div>
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

.dialog-window {
	position: absolute;
	align-self: center;
	justify-self: center;
	pointer-events: auto;

	z-index: 100;
	background-color: var(--background-color);
	border: var(--border-color) solid 1px;
	border-radius: 4px;
	box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
	min-width: 300px;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
}

.dialog-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px;
	border-bottom: var(--border-color) solid 1px;
}

.dialog-content {
	flex-grow: 1;
	padding: 8px;
	overflow-y: auto;
}
</style>