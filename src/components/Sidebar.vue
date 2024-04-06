<script setup lang="ts">
import { activeToolRef } from '../tools';
import { type Component, computed } from 'vue';

const activeToolPanel = computed<Component | undefined>(() => {
	return activeToolRef.value?.definition.panel;
});
</script>
<template>
	<div class="sidebar">
		<component :is="activeToolPanel" />
	</div>
</template>

<style scoped>
.sidebar {
	position: absolute;
	padding: 8px;
	top: 30px;
	left: 48px;
	background-color: #fff;
	border-radius: 0 0 3px 0;
	z-index: 20;
	max-height: calc(100vh - 30px);
}
</style>