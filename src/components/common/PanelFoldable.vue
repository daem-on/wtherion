<script setup lang="ts">
import Foldable from './Foldable.vue';
import PanelContent from './PanelContent.vue';
</script>
<template>
	<Foldable>
		<template #title>
			<slot name="title"></slot>
		</template>
		<PanelContent>
			<slot></slot>
		</PanelContent>
	</Foldable>
</template>
<style scoped>
.panel-content {
	padding: 8px;
}
</style>