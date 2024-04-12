<script setup lang="ts">
import { ref } from 'vue';
import PopoutScaffold from './PopoutScaffold.vue';

const popoutRef = ref<InstanceType<typeof PopoutScaffold> | null>(null);

function close() {
	popoutRef.value?.close();
}

function toggleBelow(event: MouseEvent) {
	if (popoutRef.value?.position) {
		close();
	} else {
		popoutRef.value?.openBelow(event.target as HTMLElement);
	}
}

defineProps({ closeOnClick: { type: Boolean, default: true } });

defineExpose({ close });
</script>

<template>
	<PopoutScaffold ref="popoutRef">
		<template #source="{ openBelow }">
			<slot name="label" :openBelow :toggleBelow></slot>
		</template>
		<div class="menu-content" @[closeOnClick&&`click`]="close()">
			<slot></slot>
		</div>
	</PopoutScaffold>
</template>

<style scoped>
</style>