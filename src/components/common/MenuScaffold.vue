<script setup lang="ts">
import { openMenu } from '../../menuSync';
import { ref, watch } from 'vue';

const open = ref(false);

const menuRef = ref<HTMLElement | null>(null);

defineProps({ closeOnClick: { type: Boolean, default: true } });

watch(open, value => {
	if (value) openMenu.value = menuRef.value;
});

watch(openMenu, value => {
	if (value !== menuRef.value) open.value = false;
}, { immediate: true });

defineExpose({ open });
</script>

<template>
	<div class="menu" :class="{ open }" ref="menuRef">
		<slot name="label" :toggle="() => open = !open"></slot>
		<Transition>
			<div class="menu-content" v-if="open"  @[closeOnClick&&`click`]="open = false">
				<slot></slot>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.menu {
	position: relative;
}

.menu .menu-content {
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 199;
	transform-origin: top left;
	transition: opacity 0.15s, transform 0.15s;
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