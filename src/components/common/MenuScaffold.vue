<script setup lang="ts">
import { openMenu } from '../../menuSync';
import { ref, watch } from 'vue';

const open = ref(false);

defineProps<{
	label?: string;
}>();

const menuRef = ref<HTMLElement | null>(null);

watch(open, value => {
	if (value) openMenu.value = menuRef.value;
});

watch(openMenu, value => {
	if (value !== menuRef.value) open.value = false;
}, { immediate: true });

</script>

<template>
	<div class="menu" :class="{ open }" ref="menuRef">
		<button @click="open = !open">
			<slot name="label">
				{{ label }}
			</slot>
		</button>
		<Transition>
			<div class="menu-content" v-if="open" @click="open = false">
				<slot></slot>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.menu {
	position: relative;
}

button {
	border: none;
	background: none;
	color: inherit;
	padding: 4px 8px;
	margin: 4px;
	border-radius: 4px;
}

button:hover {
	background-color: var(--hover-color);
}

.menu .menu-content {
	display: flex;
	flex-direction: column;
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 199;
	background-color: var(--background-color);
	color: var(--text-color);
	border: var(--border-color) solid 1px;
	border-radius: 4px;
	padding: 8px;
	width: 200px;
	max-height: 90vh;
	overflow-y: auto;
	transform-origin: top left;
	transition: opacity 0.2s, transform 0.2s;
}

.menu-content.v-enter-from, .menu-content.v-leave-to {
	opacity: 0;
	transform: scale(0.9);
}

.menu-content.v-enter-to, .menu-content.v-leave-from {
	opacity: 1;
	transform: scale(1);
}
</style>