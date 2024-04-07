<script setup lang="ts">
const model = defineModel();
</script>

<template>
	<input type="number" v-model="model" />
</template>

<style scoped>
input {
	width: 8ch;
}
</style>