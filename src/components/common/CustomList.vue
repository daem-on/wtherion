<script setup lang="ts">
import { ref } from 'vue';
import MenuScaffold from './MenuScaffold.vue';

const model = defineModel<string>();

defineProps<{
	options: string[];
	imageRoot?: string;
	placeholder?: string;
}>();

const menuScaffoldRef = ref<InstanceType<typeof MenuScaffold> | null>(null);

const onKeydown = (e: KeyboardEvent) => {
	if (e.key === "Enter" || e.key === "Escape") menuScaffoldRef.value.open = false;
};

const select = (option: string) => {
	model.value = option;
};
</script>

<template>
	<MenuScaffold class="custom-list" ref="menuScaffoldRef" :closeOnClick="false">
		<template #label="{ toggle }">
			<input type="text" v-model="model" @click="toggle()" @keydown="onKeydown" :placeholder="placeholder" />
		</template>
		<div class="select-options">
			<div v-for="option in options" :key="option" @click="select(option)">
				<img v-if="imageRoot" :src="`${imageRoot}/${option || 'empty'}.svg`" class="crop-svg" />
				<p>{{ option || '(none)' }}</p>
			</div>
		</div>
	</MenuScaffold>
</template>

<style scoped>
.custom-list {
	position: relative;
	max-width: 50ch;
    min-width: 5ch;
	width: fit-content;
	user-select: none;
}

.select-options div {
	font-size: 0.85em;
	padding: 1px 3px;
	border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
	cursor: default;
	display: flex;
    flex-direction: column;
    align-items: center;
	border-radius: 4px;
}

.select-options div:hover {
	background-color: var(--card-color);
}

.custom-list .select-options {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	gap: 8px;
	padding: 8px;
	position: absolute;
	background-color: var(--background-color);
	border-radius: 4px;
	border: var(--border-color) 1px solid;
	top: 100%;
	left: 0;
	z-index: 99;
	max-height: 50vh;
	overflow-y: auto;
}

@media (prefers-color-scheme: dark) {
	img {
		filter: invert(1);
	}
}
</style>