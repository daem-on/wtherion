<script setup lang="ts">
import { computed, ref } from 'vue';
import MenuScaffold from './MenuScaffold.vue';

const model = defineModel<string>();
type CategoryMap = Map<string | null, string[]>;

const props = defineProps<{
	imageRoot?: string;
	placeholder?: string;
	options?: string[];
	categories?: CategoryMap;
}>();

const menuScaffoldRef = ref<InstanceType<typeof MenuScaffold> | null>(null);

const onKeydown = (e: KeyboardEvent) => {
	if (e.key === "Enter" || e.key === "Escape") menuScaffoldRef.value.open = false;
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
</script>

<template>
	<MenuScaffold class="custom-list" ref="menuScaffoldRef" :closeOnClick="false">
		<template #label="{ toggle }">
			<input type="text" v-model="model" @click="toggle()" @keydown="onKeydown" :placeholder="placeholder" />
		</template>
		<div class="select-categories">
			<div v-for="[category, options] in categories" :key="category" class="category">
				<h3 v-if="category">{{ category }}</h3>
				<div class="select-options">
					<div v-for="option in options" :key="option" @click="select(option)">
						<img v-if="imageRoot" :src="getImageUrl(imageRoot, category, option)" />
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
	width: fit-content;
	user-select: none;
}

.select-categories {
	display: flex;
	flex-direction: column;
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

img {
	max-width: 100px;
    max-height: 100px;
    min-height: 50px;
}
</style>