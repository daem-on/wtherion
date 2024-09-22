<script setup lang="ts">
import { computed, watch } from 'vue';
import { empty, useMultipleEditing } from '../../../multipleEditing';
import { drawLine } from '../../../objectDefs';
import { LineSettings } from '../../../objectSettings/model/LineSettings';
import getSettings from '../../../objectSettings/model/getSettings';
import subtypeList from "../../../res/subtype-list.json";
import { wallTypes } from '../../../res/wallTypes';
import { snapshot } from '../../../undo';
import BooleanInput from '../../common/BooleanInput.vue';
import CustomList from '../../common/CustomList.vue';
import NullableBooleanInput from '../../common/NullableBooleanInput.vue';
import PanelContent from '../../common/PanelContent.vue';
import PanelSection from '../../common/PanelSection.vue';

const props = defineProps<{
	selection: paper.Path[]
}>();

type Options = {
	type: string;
	subtype?: string;
	reverse?: boolean | typeof empty;
	invisible?: boolean | typeof empty;
};

const multipleEditing = useMultipleEditing<Options>({
	type: "" ,
	subtype: "",
	reverse: empty,
	invisible: empty,
});

const { optionsCache } = multipleEditing;

watch(() => props.selection, () => {
	multipleEditing.createDefaultOptions(props.selection.map(p => getSettings(p) as LineSettings));
}, { immediate: true });

const lineSettingsArray = computed(() => props.selection.map(p => getSettings(p) as LineSettings));

function modifyObject() {
	multipleEditing.modifyItems(lineSettingsArray.value);
	for (const line of props.selection) drawLine(line);
	snapshot("editMultipleLine");
}

const canHaveSubtype = computed(() => {
	return ["wall", "border", "water-flow"].includes(optionsCache.value.type);
});

</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="optionsCache.type" :options="wallTypes" :placeholder="$t(`mixed`)" :imageRoot="`assets/rendered`" />
		</PanelSection>
		<PanelSection :label="$t(`subtype.name`)" v-if="canHaveSubtype">
			<CustomList v-model="optionsCache.subtype" :options="subtypeList[optionsCache.type]" :imageRoot="`assets/rendered/subtype`" :placeholder="$t(`mixed`)" />
		</PanelSection>
		<PanelSection :label="$t(`reverse`)">
			<NullableBooleanInput v-if="multipleEditing.wasEmpty.value.reverse" :third="empty" v-model="optionsCache.reverse" />
			<BooleanInput v-else v-model="optionsCache.reverse" />
		</PanelSection>
		<PanelSection :label="$t(`invisible`)">
			<NullableBooleanInput v-if="multipleEditing.wasEmpty.value.invisible" :third="empty" v-model="optionsCache.invisible" />
			<BooleanInput v-else v-model="optionsCache.invisible" />
		</PanelSection>
		<PanelSection column>
			<button @click="modifyObject">{{ $t(`apply`) }}</button>
		</PanelSection>
	</PanelContent>
</template>