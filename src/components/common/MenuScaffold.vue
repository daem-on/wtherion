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
		<div class="menu-content" @click="open = false">
			<slot></slot>
		</div>
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

.menu.open .menu-content {
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
}

.menu .menu-content {
	display: none;
}
</style>