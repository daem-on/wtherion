<script setup lang="ts">
const model = defineModel();

defineProps<{
	options: string[];
	imageRoot?: string;
}>();
</script>

<template>
	<!-- TODO -->
	<select v-model="model">
		<option v-for="option in options" :value="option">{{ option }}</option>
	</select>
</template>