<script setup lang="ts">
import PanelContent from '../../common/PanelContent.vue';
import PanelSection from '../../common/PanelSection.vue';

defineProps<{
	selection: paper.Raster,
}>();
</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`opacity`)">
			<input type="range" v-model="selection.opacity" min="0" max="1" step="0.01" />
		</PanelSection>
	</PanelContent>
</template>