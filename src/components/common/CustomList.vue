<script setup lang="ts">
import { computed, ref } from 'vue';
import MenuScaffold from './MenuScaffold.vue';

const model = defineModel<string>();
type CategoryMap = Map<string | null, string[]>;

const props = defineProps<{
	imageRoot: string;
	placeholder?: string;
	options?: string[];
	categories?: CategoryMap;
}>();

const menuScaffoldRef = ref<InstanceType<typeof MenuScaffold> | null>(null);

const onKeydown = (e: KeyboardEvent) => {
	if (e.key === "Enter" || e.key === "Escape") menuScaffoldRef.value.close();
};

const select = (option: string) => {
	model.value = option;
};

const categories = computed<CategoryMap | undefined>(() => {
	if (props.options) {
		return new Map([ [null, props.options] ]);
	} else {
		return props.categories;
	}
});

function getImageUrl(imageRoot: string, category: string | null, option: string) {
	const categoryPath = category ? `${category}/` : "";
	return `${imageRoot}/${categoryPath}${option || "empty"}.svg`;
}

const containerRef = ref<HTMLElement | null>(null);

const currentExists = computed(() => {
	if (props.options)
		return props.options.includes(model.value);
	else
		return Array.from(categories.value?.values() ?? []).flat().includes(model.value);
});

const currentCategory = computed(() => {
	if (props.options) return null;
	for (const [category, options] of categories.value ?? []) {
		if (options.includes(model.value)) return category;
	}
});
</script>

<template>
	<MenuScaffold ref="menuScaffoldRef">
		<template #label="{ openBelow }">
			<div class="custom-list input-container" ref="containerRef">
				<div class="current-image" @click="openBelow(containerRef)">
					<img v-if="currentExists" :src="getImageUrl(imageRoot, currentCategory, model)" />
				</div>
				<input type="text" v-model="model" @keydown="onKeydown" :placeholder="placeholder" />
			</div>
		</template>
		<div class="select-categories">
			<div v-for="[category, options] in categories" :key="category" class="category">
				<h3 v-if="category">{{ category }}</h3>
				<div class="select-options">
					<div v-for="option in options" :key="option" @click="select(option)">
						<img :src="getImageUrl(imageRoot, category, option)" />
						<p>{{ option || `(${$t('none')})` }}</p>
					</div>
				</div>
			</div>
		</div>
	</MenuScaffold>
</template>

<style scoped>
.custom-list {
	position: relative;
	max-width: 50ch;
    min-width: 5ch;
}

.select-categories {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 8px;
	background-color: var(--background-color);
	border-radius: 4px;
	border: var(--border-color) 1px solid;
	/* z-index: 99; */
	max-height: 50vh;
	overflow-y: auto;
}

h3 {
	font-size: 1em;
	margin-bottom: 8px;
}

.category:not(:last-child) {
	border-bottom: var(--border-color) 1px solid;
	padding-bottom: 8px;
}

.select-options div {
	font-size: 0.85em;
	padding: 1px 3px;
	border-color: transparent transparent var(--border-color) transparent;
	cursor: default;
	display: flex;
    flex-direction: column;
    align-items: center;
	text-align: center;
	border-radius: 4px;
}

.select-options div:hover {
	background-color: var(--card-color);
}

.select-options {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	gap: 8px;
}

@media (prefers-color-scheme: dark) {
	img {
		filter: invert(1);
	}
}

.select-options img {
	max-width: 100px;
    max-height: 100px;
    min-height: 50px;
}

.input-container {
	display: flex;
	flex-direction: column;
	align-items: stretch;
}

.current-image {
	border-radius: 4px 4px 0 0;
	border: var(--border-color) 1px solid;
	border-bottom: none;
	background-color: var(--background-color);
	display: flex;
	justify-content: center;
	align-items: center;
	height: 50px;
	padding: 4px;
	cursor: pointer;
}

.current-image:hover {
	background-color: var(--card-color);
}

.current-image img {
	max-width: 100px;
	height: 100%;
}

.input-container input {
	border-radius: 0 0 4px 4px;
}
</style>