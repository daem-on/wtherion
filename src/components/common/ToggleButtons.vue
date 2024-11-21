<script setup lang="ts" generic="T">

const model = defineModel<T>();

type OptionDef = {
	label: string;
	value: T;
	image?: string;
};

const props = defineProps<{
	options: OptionDef[];
}>();
</script>

<template>
	<div class="toggle-buttons">
		<button v-for="option in props.options" :key="option.label" @click="model = option.value" :class="{ 'active': model === option.value }">
			<img v-if="option.image" :src="option.image" />
			<div>{{ option.label || `(${$t('none')})` }}</div>
		</button>
	</div>
</template>

<style scoped>
button {
	height: 100%;
	width: 120px;
	border: none;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	border-radius: 4px;
	flex-shrink: 0;
}

button:hover {
	background-color: var(--card-color);
}

button.active {
	background-color: var(--hover-color);
}

img {
	max-height: 80px;
	border-radius: 4px;
}

.toggle-buttons {
	border: 1px solid var(--border-color);
	border-radius: 4px;
	height: 110px;
	max-width: 100%;

	display: flex;
	overflow: auto;
	scrollbar-width: thin;
}
</style>