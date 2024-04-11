<script setup lang="ts">
import { computed } from 'vue';
import getSettings, { PaperItemType } from '../../objectSettings/model/getSettings';
import { selectedObjects, selectedSegments } from '../../objectSettings/objectOptionPanel';
import LinePanel from './objects/LinePanel.vue';
import { activeToolRef } from '../../tools';
import SubtypePanel from './objects/SubtypePanel.vue';
import AreaPanel from './objects/AreaPanel.vue';
import PointObjectPanel from './objects/PointObjectPanel.vue';
import MultipleLinePanel from './objects/MultipleLinePanel.vue';
import MultiplePointPanel from './objects/MultiplePointPanel.vue';
import ScrapOptionPanel from './ScrapOptionPanel.vue';
import RasterPanel from './objects/RasterPanel.vue';

const first = computed<PaperItemType | undefined>(() => selectedObjects.value[0]);

const classNamesMatch = computed(() => {
	return selectedObjects.value.every(obj => obj.className === first.value.className);
});

const firstSettingsClass = computed(() => {
	return first.value ? getSettings(first.value)?.className : undefined;
});

const isLine = computed(() => {
	return firstSettingsClass.value === "LineSettings";
});

const isPoint = computed(() => {
	return firstSettingsClass.value === "PointSettings";
});

const isArea = computed(() => {
	return firstSettingsClass.value === "AreaSettings";
});

const isRaster = computed(() => {
	return first.value.className === "Raster";
});

const activeToolId = computed(() => {
	return activeToolRef.value?.definition.id;
});

const isSingleSegment = computed(() => {
	return selectedSegments.value.length === 1;
});
</script>

<template>
	<div class="object-option-panel">
		<template v-if="selectedObjects.length === 0">
			<ScrapOptionPanel />
		</template>
		<template v-else-if="selectedObjects.length > 1">
			<template v-if="classNamesMatch && activeToolId === `select`">
				<template v-if="isLine">
					<MultipleLinePanel :selection="(selectedObjects as paper.Path[])" />
				</template>
				<template v-else-if="isPoint">
					<MultiplePointPanel :selection="(selectedObjects as paper.Shape[])" />
				</template>
			</template>
			<template v-else>
				Mixed selection
			</template>
		</template>
		<template v-else>
			<template v-if="activeToolId === `detailselect`">
				<template v-if="isSingleSegment">
					<template v-if="first.data.therionData.type === `wall`">
						<SubtypePanel :selection="(first as paper.Path)" :selectedSegment="selectedSegments[0]" />
					</template>
				</template>
			</template>
			<template v-else-if="activeToolId === `select`">
				<template v-if="isLine">
					<LinePanel :selection="(first as paper.Path)" />
				</template>
				<template v-else-if="isArea">
					<AreaPanel :selection="(first as paper.Path)" />
				</template>
				<template v-else-if="isPoint">
					<PointObjectPanel :selection="(first as paper.Shape)" />
				</template>
				<template v-else-if="isRaster">
					<RasterPanel :selection="(first as any as paper.Raster)" />
				</template>
			</template>
		</template>
	</div>
</template>