<script setup lang="ts">
import { DialogData } from '@daem-on/graphite/modal';
import { headRef, moveHeadTo, statesRef, undo, redo } from '../../undo';
import MenuButton from '../common/MenuButton.vue';

defineProps<{ data: DialogData<void> }>();
</script>

<template>
	<div class="history">
		<div class="actions">
			<MenuButton @click="undo">{{ $t("menu.undo") }}</MenuButton>
			<MenuButton @click="redo">{{ $t("menu.redo") }}</MenuButton>
		</div>
		<div class="states">
			<div
				v-for="(state, index) in statesRef"
				:key="state.hash"
				@click="moveHeadTo(index)">
				<MenuButton :class="{ active: headRef === index }">{{ state.type }}</MenuButton>
			</div>
		</div>
	</div>
</template>

<style scoped>
.active {
	outline: 2px solid;
	outline-offset: -2px;
	outline-color: var(--primary-color);
}

.actions {
	display: flex;
	gap: 8px;
	margin-bottom: 8px;
}

.actions button {
	flex: 1;
	text-align: center;
}

.history {
	max-height: 500px;
}

.states {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
</style>