<script setup lang="ts">
import { computed, type Component } from 'vue';
import { activeToolRef } from '../tools';
import ObjectOptionPanel from './panels/ObjectOptionPanel.vue';
import MainMenu from './menu/MainMenu.vue';
import ScrapPanel from './panels/ScrapPanel.vue';

const activeToolPanel = computed<Component | undefined>(() => {
	return activeToolRef.value?.definition.panel;
});
</script>
<template>
	<div class="sidebar">
		<div class="sidebar-content">
			<MainMenu />
			<div class="panel with-padding">
				<component :is="activeToolPanel" />
			</div>
			<div class="panel with-padding">
				<ObjectOptionPanel />
			</div>
			<div class="spacer"></div>
			<div class="panel">
				<ScrapPanel />
			</div>
		</div>
	</div>
</template>

<style scoped>
.sidebar {
	border-right: var(--border-color) solid 1px;
}
.sidebar-content {
	background-color: var(--background-color);
	display: flex;
	flex-direction: column;
	height: 100%;
}
.spacer {
	flex-grow: 1;
}
.panel {
	border-top: 1px solid;
	border-bottom: 1px solid;
	border-color: var(--border-color);
	flex-shrink: 0;
}
.panel.with-padding {
	padding: 10px 8px;
}
.panel:empty {
	display: none;
}
.panel + .panel {
	border-top: none;
}
</style>