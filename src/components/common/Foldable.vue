<script setup lang="ts">
import { ref } from 'vue';
import PanelContent from './PanelContent.vue';

const open = ref(false);
</script>

<template>
	<div class="foldable">
		<h2 @click="open = !open; $event.stopPropagation()">
			<slot name="title"></slot>
			{{ open ? "⯅" : "⯆" }}
		</h2>
		<PanelContent class="content" :class="{ open }">
			<slot></slot>
		</PanelContent>
	</div>
</template>

<style scoped>
.foldable {
	margin: 8px 0;
	border: var(--border-color) solid 1px;
	border-radius: 4px;
}

h2 {
	cursor: pointer;
	padding: 8px;
}

.foldable .content {
	padding: 8px;
}

.foldable .content:not(.open) {
	display: none;
}
</style>