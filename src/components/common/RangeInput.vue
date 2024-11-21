<script setup lang="ts">
const model = defineModel();

defineProps({
	min: { type: Number, default: 0 },
	max: { type: Number, default: 100 },
	step: { type: Number, default: 1 },
});
</script>

<template>
	<div>
		<input type="range" :min :max :step v-model="model" />
		<span>{{ model }}</span>
	</div>
</template>

<style scoped>
div {
	display: flex;
	align-items: center;
}

span {
	width: 3ch;
	text-align: end;
}
</style>