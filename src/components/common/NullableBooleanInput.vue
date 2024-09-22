<script setup lang="ts" generic="T">
import { computed } from 'vue';

const model = defineModel<boolean | T>();

const { third } = defineProps<{ third: T; }>();

const indeterminate = computed(() => model.value === third);

function toggleState() {
	if (model.value === third) {
		model.value = true;
	} else if (model.value === true) {
		model.value = false;
	} else {
		model.value = third;
	}
}
</script>

<template>
	<input type="checkbox" :indeterminate="indeterminate" :checked="model === true" @click="toggleState" />
</template>