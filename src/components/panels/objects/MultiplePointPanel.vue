<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PointSettings } from '../../../objectSettings/model/PointSettings';
import getSettings from '../../../objectSettings/model/getSettings';
import NullableBooleanInput from '../../common/NullableBooleanInput.vue';
import PanelContent from '../../common/PanelContent.vue';
import PanelSection from '../../common/PanelSection.vue';
import CustomList from '../../common/CustomList.vue';
import BooleanInput from '../../common/BooleanInput.vue';
import symbolList from "../../../res/symbol-list.json";
import { drawPoint } from '../../../objectDefs';
import { snapshot } from '../../../undo';

const props = defineProps<{
	selection: paper.SymbolItem[]
}>();

type Options = {
	type: string;
	scale: string;
	invisible: boolean | undefined;
};

const stringOptions = ["type", "scale"];

const symbolCategories = new Map<string, string[]>(Object.entries(symbolList));

function createDefaultOptions(from: PointSettings[]): Options {
	const first = from[0];
	return {
		type: from.every(p => p.type === first.type) ? first.type : "",
		scale: from.every(p => p.scale === first.scale) ? first.scale : "",
		invisible: from.every(p => p.invisible === first.invisible) ? first.invisible : undefined,
	};
}

const optionsCache = ref<Options | undefined>(undefined);
const invisibleCanBeNull = ref<boolean>(false);

watch(() => props.selection, () => {
	optionsCache.value = createDefaultOptions(props.selection.map(p => getSettings(p)));
	invisibleCanBeNull.value = optionsCache.value.invisible === undefined;
}, { immediate: true });

const pointSettingsArray = computed(() => props.selection.map(p => getSettings(p)));

function modifyObject() {
	if (!optionsCache.value) return;
	const options = optionsCache.value;
	for (const option of stringOptions) {
		if (options[option] !== "") {
			for (const point of pointSettingsArray.value)
				point[option] = options[option];
		}
	}
	if (options.invisible !== undefined) {
		for (const point of pointSettingsArray.value)
			point.invisible = options.invisible;
	}
	for (const point of props.selection) drawPoint(point);
	snapshot("editMultiplePoint");
}
</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="optionsCache.type" :categories="symbolCategories" imageRoot="assets/rendered/point" :placeholder="$t(`mixed`)" />
		</PanelSection>
		<PanelSection :label="$t(`scale`)">
			<select v-model="optionsCache.scale">
				<option value="">{{ $t("mixed") }}</option>
				<option value="xs">XS</option>
				<option value="s">S</option>
				<option value="m">M</option>
				<option value="l">L</option>
				<option value="xl">XL</option>
			</select>
		</PanelSection>
		<PanelSection :label="$t(`invisible`)">
			<NullableBooleanInput v-if="invisibleCanBeNull" v-model="optionsCache.invisible" />
			<BooleanInput v-else v-model="optionsCache.invisible" />
		</PanelSection>
		<PanelSection column>
			<button @click="modifyObject">{{ $t("apply") }}</button>
		</PanelSection>
	</PanelContent>
</template>