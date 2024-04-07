<script setup lang="ts">
import { computed } from 'vue';

const model = defineModel<boolean | undefined>();

const indeterminate = computed(() => model.value === undefined);

function toggleState() {
	if (model.value === undefined) {
		model.value = true;
	} else if (model.value === true) {
		model.value = false;
	} else {
		model.value = undefined;
	}
}
</script>

<template>
	<input type="checkbox" :indeterminate="indeterminate" :checked="model === true" @click="toggleState" />
</template>