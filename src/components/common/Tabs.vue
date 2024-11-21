<script setup lang="ts">
import { ref, useSlots } from 'vue';
import MenuButton from './MenuButton.vue';

const selected = ref(0);

const tabs = useSlots().default?.().filter(vnode => {
	return vnode.type === "div";
}).map((vnode, index) => ({
	label: vnode.props?.label || `Tab ${index + 1}`,
	content: vnode,
}));

</script>

<template>
	<div class="tab-layout">
		<nav>
			<MenuButton v-for="(tab, index) in tabs" :key="index" @click="selected = index">
				{{ tab.label }}
			</MenuButton>
		</nav>
		<article>
			<div v-for="(tab, index) in tabs" :key="index" v-show="selected === index">
				<component :is="tab.content"></component>
			</div>
		</article>
	</div>
</template>

<style scoped>

.tab-layout {
	display: flex;
	flex-direction: row;
}

nav {
	display: flex;
	flex-direction: column;

	padding-right: 8px;
	border-right: 1px solid var(--border-color);
	max-width: 200px;
}

article {
	padding: 0 12px;
	flex: 1;
	overflow: auto
}

</style>