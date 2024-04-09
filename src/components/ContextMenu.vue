<script setup lang="ts">
import { contextMenuPosition } from '../menu';
import { activeToolRef } from '../tools';
import { computed, onUnmounted, ref, watch } from 'vue';
import Foldable from './common/Foldable.vue';
import MenuButton from './common/MenuButton.vue';
import { openMenu } from '../menuSync';

const toolMenuContent = computed(() => {
	return activeToolRef.value?.menu;
});

function listener(event: MouseEvent) {
	if (contextMenuPosition.value) {
		contextMenuPosition.value = null;
	}
}

window.addEventListener('click', listener);

onUnmounted(() => {
	window.removeEventListener('click', listener);
});

const menuRef = ref<HTMLElement | null>(null);

watch(contextMenuPosition, value => {
	if (value) openMenu.value = menuRef.value;
});

watch(openMenu, value => {
	if (value !== menuRef.value) contextMenuPosition.value = null;
}, { immediate: true });
</script>

<template>
	<Transition>
		<div
			class="context-menu"
			v-if="contextMenuPosition"
			ref="menuRef"
			:style="{
				top: contextMenuPosition.y + 'px',
				left: contextMenuPosition.x + 'px'
			}">
		
			<template v-if="toolMenuContent">
				<Foldable v-for="subMenu in toolMenuContent" :key="subMenu.name">
					<template #title>
						{{ $t(subMenu.name) }}
					</template>
					<ul>
						<MenuButton
							v-for="action in subMenu.actions"
							:key="action.name"
							@click="action.callback()">
							{{ 
								$t(action.label?? `${activeToolRef.definition.id}.menu.${action.name}`)
							}}
						</MenuButton>
					</ul>
				</Foldable>
			</template>
		</div>
	</Transition>
</template>

<style scoped>
.context-menu {
	position: fixed;
	background-color: var(--background-color);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
	z-index: 299;
	transform-origin: top left;
	transition: opacity 0.15s, transform 0.15s;
	min-width: 200px;
	max-height: 80vh;
	overflow-y: auto;
}

.foldable {
	margin: 0;
	border: none;
	border-radius: 0;
}

.foldable:not(:last-child) {
	border-bottom: 1px solid var(--border-color);
}

.context-menu.v-enter-from, .context-menu.v-leave-to {
	opacity: 0;
	transform: scale(0.9);
}

.context-menu.v-enter-to, .context-menu.v-leave-from {
	opacity: 1;
	transform: scale(1);
}
</style>