<script setup lang="ts">
import { ref, watch } from 'vue';

type Position = { x: number, y: number };
const position = ref<Position | null>(null);

async function close() {
	await animateClose();
	position.value = null;
}

function open(p: Position) {
	position.value = p;
}

function openBelow(e: HTMLElement) {
	const rect = e.getBoundingClientRect();
	open({ x: rect.left, y: rect.bottom });
}

defineExpose({ position, close, open, openBelow });

defineProps<{ omitBlocker?: true }>();

function fitInBounds(p: Position, e: HTMLElement): void {
	if (p.y + e.clientHeight > window.innerHeight || p.x + e.clientWidth > window.innerWidth) {
		const x = Math.min(p.x, window.innerWidth - e.clientWidth);
		const y = Math.min(p.y, window.innerHeight - e.clientHeight);
		position.value = { x, y };
	}
}

const elementRef = ref<HTMLElement | null>(null);

watch(elementRef, value => {
	if (value) {
		fitInBounds(position.value!, value);
		value.animate([
			{ opacity: 0, transform: "scale(0.9)" },
			{ opacity: 1, transform: "scale(1)" },
		], { duration: 150, easing: "ease-out"});
	}
});

function animateClose(): Promise<Animation> {
	if (!elementRef.value) return;
	return elementRef.value.animate([
		{ opacity: 1, transform: "scale(1)" },
		{ opacity: 0, transform: "scale(0.9)" },
	], { duration: 150, easing: "ease" }).finished;
}
</script>

<template>
	<slot name="source" :close :open :openBelow></slot>
	<Teleport to="body" v-if="position">
		<div class="blocker" v-if="!omitBlocker" @click="close" @contextmenu.prevent="close"></div>
		<div class="popout" :style="{ left: `${position.x}px`, top: `${position.y}px` }" ref="elementRef">
			<slot :close :open :openBelow></slot>
		</div>
	</Teleport>
</template>

<style scoped>
.blocker {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	z-index: 198;
}

.popout {
	position: fixed;
	z-index: 200;
	transform-origin: top left;
}
</style>