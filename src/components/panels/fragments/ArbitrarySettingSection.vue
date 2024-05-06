<script setup lang="ts">
import { ReactiveMap, getEntryRef } from '../../../objectSettings/reactiveMap';
import { WritableComputedRef, computed, defineProps, ref } from 'vue';

const props = defineProps<{
	editing: ReactiveMap<Record<any, any>>,
	exclude: string[],
}>();

const models = computed(() => {
	return Array.from(props.editing.map.entries())
		.map(([key]) => key)
		.filter(key => !props.exclude.includes(key))
		.map<[string, WritableComputedRef<string>]>(key => {
			return [key, getEntryRef(props.editing, key)];
		});
});

const newKey = ref("");
const newValue = ref("");

const newKeyValid = computed(() => {
	return newKey.value.length > 0
		&& !props.editing.map.has(newKey.value)
		&& !props.exclude.includes(newKey.value);
});

function addKey() {
	if (newKeyValid.value) {
		props.editing.map.set(newKey.value, newValue.value);
		newKey.value = "";
		newValue.value = "";
	}
}
</script>

<template>
	<div v-for="[key, model] of models" :key="key">
		<label>{{ key }}</label>
		<input type="text" v-model="model.value" />
		<button @click="editing.map.delete(key)">⨉</button>
	</div>
	<form @submit.prevent="addKey()">
		<input type="text" v-model="newKey" :class="{ invalid: !newKeyValid && newKey.length }" />
		<input type="text" v-model="newValue" />
		<button type="submit" :disabled="!newKeyValid">Add</button>
	</form>
</template>

<style scoped>
div {
	display: flex;
	flex-direction: row;
	gap: 4px;
	align-items: center;
	border-top: 1px solid var(--border-color);
	padding: 8px 0;
}

form {
	display: flex;
	flex-direction: row;
	gap: 4px;
	align-items: center;
	border-top: 1px solid var(--border-color);
	padding-top: 8px;
}

.invalid {
	border-color: #ff9090;
	outline-color: #ff9090;
}
</style>