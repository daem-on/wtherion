<script setup lang="ts">
import { computed, type Component } from 'vue';
import { activeToolRef } from '../tools';
import ObjectOptionPanel from './panels/ObjectOptionPanel.vue';

const activeToolPanel = computed<Component | undefined>(() => {
	return activeToolRef.value?.definition.panel;
});
</script>
<template>
	<div class="sidebar">
		<component :is="activeToolPanel" />
		<ObjectOptionPanel />
	</div>
</template>

<style scoped>
.sidebar {
	padding: 8px;
	background-color: var(--background-color);
	border-right: var(--border-color) solid 1px;
}
</style>