<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import Card from "./common/Card.vue";
import { tooltip } from "../tools/inspect";

type Position = { x: number; y: number };
const position = ref<Position>({ x: 0, y: 0 });

function listener(e: PointerEvent) {
	if (!tooltip.value) return;
	position.value = { x: e.x + 10, y: e.y };
}

document.addEventListener("pointermove", listener);

onUnmounted(() => {
	document.removeEventListener("pointermove", listener);
});
</script>

<template>
	<div class="tooltip" v-if="tooltip" :style="{ left: `${position.x}px`, top: `${position.y}px` }">
		<Card>{{ tooltip }}</Card>
	</div>
</template>

<style scoped>
.tooltip {
	position: absolute;
	z-index: 99;
}
</style>