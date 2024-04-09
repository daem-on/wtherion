<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
</script>

<template>
	<div class="foldable">
		<h2 @click.stop="open = !open">
			<slot name="title"></slot>
			{{ open ? "⯅" : "⯆" }}
		</h2>
		<div v-if="open">
			<slot></slot>
		</div>
	</div>
</template>

<style scoped>
.foldable {
	margin: 8px 0;
	border: var(--border-color) solid 1px;
	border-radius: 4px;
}

h2 {
	cursor: pointer;
	padding: 8px;
}
</style>