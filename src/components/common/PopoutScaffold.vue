<script setup lang="ts">
import { arrow, autoUpdate, flip, offset, ReferenceElement, shift, useFloating, VirtualElement } from "@floating-ui/vue";
import { ref, watch, computed } from "vue";
import { StyleValue } from "vue/dist/vue.js";

type Position = { x: number, y: number };
const isOpen = ref(false);

const anchor = ref<ReferenceElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const animated = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);

const { floatingStyles, placement, middlewareData, update } = useFloating(anchor, floating, {
	open: isOpen,
	middleware: [
		offset(8),
		flip(),
		shift({ padding: 8 }),
		arrow({ element: arrowRef }),
	]
});

async function close() {
	await animateClose();
	isOpen.value = false;
}

function createVirtualElement(p: Position): VirtualElement {
	return {
		getBoundingClientRect: () => ({
			x: p.x,
			y: p.y,
			top: p.y,
			left: p.x,
			bottom: p.y,
			right: p.x,
			width: 0,
			height: 0,
		}),
	};
}

function _open(el: ReferenceElement) {
	anchor.value = el;
	isOpen.value = true;
}

function open(p: Position) {
	_open(createVirtualElement(p));
}

function openBelow(e: HTMLElement) {
	_open(e);
}

defineExpose({ isOpen, close, open, openBelow });

defineProps<{ omitBlocker?: true }>();

watch(animated, value => {
	if (value) {
		value.animate([
			{ opacity: 0, transform: "scale(0.9)" },
			{ opacity: 1, transform: "scale(1)" },
		], { duration: 150, easing: "ease-out"});
		isOpen.value = true;
	}
});

function animateClose(): Promise<Animation> {
	if (!animated.value) return;
	return animated.value.animate([
		{ opacity: 1, transform: "scale(1)" },
		{ opacity: 0, transform: "scale(0.9)" },
	], { duration: 150, easing: "ease" }).finished;
}

const arrowStyles = computed<StyleValue>(() => {
	const element = arrowRef.value;
	if (!element) return {};
	const data = middlewareData.value?.arrow;
	if (!data) return {};

	const place = placement.value.split("-")[0];
	const staticSide = {
		top: "bottom",
		right: "left",
		bottom: "top",
		left: "right",
	}[place];

	const transform = {
		top: "rotate(180deg)",
		right: "rotate(270deg)",
		bottom: "",
		left: "rotate(90deg)",
	}[place];
	
	return {
		position: "absolute",
		left: data.x != null ? `${data.x}px` : "",
		top: data.y != null ? `${data.y}px` : "",
		[staticSide]: "-8px",
		transform,
	};
});
</script>

<template>
	<slot name="source" :close :open :openBelow></slot>
	<Teleport to="body" v-if="isOpen">
		<div class="blocker" v-if="!omitBlocker" @click="close" @contextmenu.prevent="close"></div>
		<div class="popout" :style="floatingStyles" ref="floating">
			<div class="animated" ref="animated">
				<div class="arrow" :style="arrowStyles" ref="arrowRef">
					<svg xmlns="http://www.w3.org/2000/svg" width="12" height="9" viewBox="0 0 12 9">
						<path d="M0 9L6 0l6 9" fill="var(--background-color)" stroke="var(--border-color)"/>
					</svg>
				</div>
				<slot :close :open :openBelow :update></slot>
			</div>
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
	z-index: 199;
}

.animated {
	transform-origin: top;
}

.arrow {
	width: 12px;
	height: 9px;
	z-index: 1;
}

.arrow svg {
	display: block;
}
</style>