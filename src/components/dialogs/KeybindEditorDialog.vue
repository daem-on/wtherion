<script setup lang="ts">
import { DialogData } from 'grapht/modal';
import { KeySpec, currentBinds, getActionList, getKeySpec, persistCustomKeybinds } from '../../input';
import { computed, onUnmounted, ref, watch } from 'vue';

defineProps<{ data: DialogData<void> }>();

const actions = getActionList();

function removeBind(action: string, keySpec: KeySpec) {
	const boundActions = currentBinds.get(keySpec);
	if (!boundActions) return;
	boundActions.delete(action);
	if (boundActions.size === 0) currentBinds.delete(keySpec);
}

const editing = ref<string | null>(null);

const actionToBindingCache = computed(() => {
	const cache = new Map<string, Set<KeySpec>>();
	for (const [keySpec, boundActions] of currentBinds) {
		for (const action of boundActions) {
			const set = cache.get(action);
			if (!set) {
				cache.set(action, new Set([keySpec]));
			} else {
				set.add(keySpec);
			}
		}
	}
	return cache;
});

function camelCaseToTitleCase(str: string) {
	return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

const actionDisplayNames = computed(() => {
	const map = new Map<string, string>();
	for (const action of actions) {
		const parts = action.split('.');
		map.set(action, parts.map(camelCaseToTitleCase).join(' > '));
	}
	return map;
});

watch(currentBinds, () => {
	persistCustomKeybinds();
});

const modifiers = ['Shift', 'Control', 'Alt', 'Meta'];
const listener = (e: KeyboardEvent) => {
	if (!editing.value) return;
	if (e.key === 'Escape') {
		editing.value = null;
		return;
	}

	if (modifiers.includes(e.key)) return;

	const spec = getKeySpec(e, false);
	if (!spec) return;
	
	const boundActions = currentBinds.get(spec);
	if (!boundActions) {
		currentBinds.set(spec, new Set([editing.value]));
	} else {
		boundActions.add(editing.value);
	}

	editing.value = null;
};

document.addEventListener('keydown', listener);

onUnmounted(() => {
	document.removeEventListener('keydown', listener);
});
</script>

<template>
	<div>
		<table>
			<thead>
				<tr>
					<th>{{ $t('keybinds.action') }}</th>
					<th>{{ $t('keybinds.key') }}</th>
					<th></th>
				</tr>
			</thead>
			<tr v-for="action in actions" :key="action">
				<td class="action">
					{{ actionDisplayNames.get(action) }}
				</td>
				<td class="binding-list">
					<span v-for="keySpec in actionToBindingCache.get(action)" class="bind" :class="{
						'conflict': currentBinds.get(keySpec).size > 1
					}">
						{{ keySpec }}
						<button @click="removeBind(action, keySpec)">⨉</button>
					</span>
					<template v-if="editing !== action">
						<button class="add-binding" @click="editing = action">add</button>
					</template>
					<template v-else>
						<span class="nowrap">{{ $t('keybinds.pressKey') }}</span>
					</template>
				</td>
			</tr>
		</table>
	</div>
</template>

<style scoped>
table {
	width: 600px;
}

td {
	padding: 4px;
}

tr:not(:last-child) {
	border-bottom: #c4c4c434 solid 1px;
}

.action {
	width: 260px;
}

.binding-list {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4px;
	flex-wrap: wrap;
	min-height: 42px;
}

.nowrap {
	white-space: nowrap;
	text-wrap: nowrap;
}

.bind {
	display: inline-block;
	padding: 4px;
	border: var(--border-color) solid 1px;
	border-radius: 4px;
}

.bind button {
	margin-left: 4px;
	background: none;
	border: none;
	cursor: pointer;
}

.bind.conflict {
	color: rgb(224, 87, 87);
}

.add-binding {
	visibility: hidden;
}

td.binding-list:hover .add-binding {
	visibility: visible;
}
</style>