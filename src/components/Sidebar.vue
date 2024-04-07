<script setup lang="ts">
import { computed, type Component } from 'vue';
import { activeToolRef } from '../tools';
import ObjectOptionPanel from './panels/ObjectOptionPanel.vue';
import MainMenu from './menu/MainMenu.vue';

const activeToolPanel = computed<Component | undefined>(() => {
	return activeToolRef.value?.definition.panel;
});
</script>
<template>
	<div class="sidebar">
		<MainMenu />
		<div class="sidebar-content">
			<component :is="activeToolPanel" />
			<ObjectOptionPanel />
		</div>
	</div>
</template>

<style scoped>
.sidebar {
	border-right: var(--border-color) solid 1px;
}
.sidebar-content {
	padding: 8px;
	background-color: var(--background-color);
}
</style>