<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);

defineProps<{
	fullWidth?: boolean;
	noMargin?: boolean;
	noBorder?: boolean;
}>();
</script>

<template>
	<div class="foldable" :class="{ fullWidth, noMargin, noBorder }">
		<h2 @click.stop="open = !open" tabindex="0">
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

.fullWidth {
	width: 100%;
	border-radius: 0;
	border-left: none;
	border-right: none;
}

.noMargin {
	margin: 0;
}

.noBorder {
	border: none;
}
</style>