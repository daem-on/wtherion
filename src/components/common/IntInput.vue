<script setup lang="ts">
const model = defineModel();
</script>

<template>
	<input type="number" step="1" v-model="model" />
</template>