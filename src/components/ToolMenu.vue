<script setup lang="ts">
import { computed } from 'vue';
import { activeToolRef } from '../tools';
import ToolButton from './common/ToolButton.vue';

const buttonsWithIcon = computed(() => {
	return activeToolRef.value.menu.flatMap(subMenu => subMenu.actions.filter(i => i.icon));
});
</script>

<template>
	<ToolButton
		v-for="item of buttonsWithIcon"
		:title="$t(item.label?? `${activeToolRef.definition.id}.menu.${item.name}`)"
		@click="item.callback()">

		<img :src="item.icon"  width="28" height="28" />
	</ToolButton>
</template>

<style scoped>
@media (prefers-color-scheme: dark) {
	img {
		filter: invert(1);
	}
}
</style>