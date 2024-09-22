<script setup lang="ts">
import { computed, watch } from 'vue';
import { empty, useMultipleEditing } from '../../../multipleEditing';
import { drawPoint } from '../../../objectDefs';
import getSettings from '../../../objectSettings/model/getSettings';
import symbolList from "../../../res/symbol-list.json";
import { snapshot } from '../../../undo';
import BooleanInput from '../../common/BooleanInput.vue';
import CustomList from '../../common/CustomList.vue';
import NullableBooleanInput from '../../common/NullableBooleanInput.vue';
import PanelContent from '../../common/PanelContent.vue';
import PanelSection from '../../common/PanelSection.vue';

const props = defineProps<{
	selection: paper.SymbolItem[]
}>();

type Options = {
	type: string;
	scale?: string;
	invisible?: boolean | typeof empty;
};

const symbolCategories = new Map<string, string[]>(Object.entries(symbolList));

const multipleEditing = useMultipleEditing<Options>({
	type: "",
	scale: "",
	invisible: empty,
});

const { optionsCache } = multipleEditing;

watch(() => props.selection, () => {
	multipleEditing.createDefaultOptions(props.selection.map(p => getSettings(p)));
}, { immediate: true });

const pointSettingsArray = computed(() => props.selection.map(p => getSettings(p)));

function modifyObject() {
	multipleEditing.modifyItems(pointSettingsArray.value);
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
			<NullableBooleanInput v-if="multipleEditing.wasEmpty.value.invisible" :third="empty" v-model="optionsCache.invisible" />
			<BooleanInput v-else v-model="optionsCache.invisible" />
		</PanelSection>
		<PanelSection column>
			<button @click="modifyObject">{{ $t("apply") }}</button>
		</PanelSection>
	</PanelContent>
</template>