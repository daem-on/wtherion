<script setup lang="ts">
import { computed } from 'vue';
import getSettings, { PaperItemType } from '../../objectSettings/model/getSettings';
import { selectedObjects } from '../../objectSettings/objectOptionPanel';
import LinePanel from './objects/LinePanel.vue';
import { activeToolRef } from '../../tools';
import SubtypePanel from './objects/SubtypePanel.vue';
import AreaPanel from './objects/AreaPanel.vue';
import PointObjectPanel from './objects/PointObjectPanel.vue';
import MultipleLinePanel from './objects/MultipleLinePanel.vue';
import MultiplePointPanel from './objects/MultiplePointPanel.vue';

const first = computed<PaperItemType | undefined>(() => selectedObjects.value[0]);

const classNamesMatch = computed(() => {
	return selectedObjects.value.every(obj => obj.className === first.value.className);
});

const isPath = computed(() => {
	return first.value?.className === "Path";
});

const isShape = computed(() => {
	return first.value?.className === "Shape";
});

const isLine = computed(() => {
	return isPath.value && getSettings(first.value).className === "LineSettings";
});

const isPoint = computed(() => {
	return isShape.value && getSettings(first.value).className === "PointSettings";
});

const isArea = computed(() => {
	return isPath.value && getSettings(first.value).className === "AreaSettings";
});

const activeToolId = computed(() => {
	return activeToolRef.value?.definition.id;
});

const isSingleSegment = computed(() => {
	return isLine.value && (first.value as paper.Path)
		.segments
		.filter(seg => seg.selected)
		.length === 1;
});
</script>

<template>
	<div class="object-option-panel">
		<template v-if="selectedObjects.length === 0">
			No objects selected
		</template>
		<template v-else-if="selectedObjects.length > 1">
			<template v-if="classNamesMatch && activeToolId === `select`">
				<template v-if="isLine">
					<MultipleLinePanel :selection="selectedObjects" />
				</template>
				<template v-else-if="isPoint">
					<MultiplePointPanel :selection="selectedObjects" />
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
						<SubtypePanel :selection="first" />
					</template>
				</template>
			</template>
			<template v-else-if="activeToolId === `select`">
				<template v-if="isLine">
					<LinePanel :selection="selectedObjects" />
				</template>
				<template v-else-if="isArea">
					<AreaPanel :selection="selectedObjects" />
				</template>
				<template v-else-if="isPoint">
					<PointObjectPanel :selection="(first as paper.Shape)" />
				</template>
			</template>
		</template>
	</div>
</template>