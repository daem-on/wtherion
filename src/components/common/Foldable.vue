<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
</script>

<template>
	<div class="foldable">
		<h2 @click="open = !open">
			<slot name="title"></slot>
			{{ open ? "⯅" : "⯆" }}
		</h2>
		<div class="content" :class="{ open }">
			<slot></slot>
		</div>
	</div>
</template>

<style scoped>
.foldable .content {
	display: none;
}

.foldable .content.open {
	display: block;
}
</style>