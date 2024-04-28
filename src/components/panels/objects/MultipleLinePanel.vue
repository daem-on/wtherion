<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import LineSettings from '../../../objectSettings/model/LineSettings';
import getSettings from '../../../objectSettings/model/getSettings';
import subtypeList from "../../../res/subtype-list.json";
import NullableBooleanInput from '../../common/NullableBooleanInput.vue';
import PanelContent from '../../common/PanelContent.vue';
import PanelSection from '../../common/PanelSection.vue';
import CustomList from '../../common/CustomList.vue';
import BooleanInput from '../../common/BooleanInput.vue';
import { wallTypes } from '../../../res/wallTypes';
import { drawLine } from '../../../objectDefs';
import { snapshot } from '../../../undo';

const props = defineProps<{
	selection: paper.Path[]
}>();

type Options = {
	type: string;
	subtype: string;
	reverse: boolean | undefined;
	invisible: boolean | undefined;
};

const stringOptions = ["type", "subtype"];

function createDefaultOptions(from: LineSettings[]): Options {
	const first = from[0];
	return {
		type: from.every(p => p.type === first.type) ? first.type : "",
		subtype: from.every(p => p.subtype === first.subtype) ? first.subtype : "",
		reverse: from.every(p => p.reverse === first.reverse) ? first.reverse : undefined,
		invisible: from.every(p => p.invisible === first.invisible) ? first.invisible : undefined,
	};
}

const optionsCache = ref<Options | undefined>(undefined);
const reverseCanBeNull = ref<boolean>(false);
const invisibleCanBeNull = ref<boolean>(false);

watch(() => props.selection, () => {
	optionsCache.value = createDefaultOptions(props.selection.map(p => getSettings(p) as LineSettings));
	reverseCanBeNull.value = optionsCache.value.reverse === undefined;
	invisibleCanBeNull.value = optionsCache.value.invisible === undefined;
}, { immediate: true });

const lineSettingsArray = computed(() => props.selection.map(p => getSettings(p) as LineSettings));

function modifyObject() {
	if (!optionsCache.value) return;
	const options = optionsCache.value;
	for (const option of stringOptions) {
		if (options[option] !== "") {
			for (const line of lineSettingsArray.value)
				line[option] = options[option];
		}
	}
	if (options.reverse !== undefined) {
		for (const line of lineSettingsArray.value)
			line.reverse = options.reverse;
	}
	if (options.invisible !== undefined) {
		for (const line of lineSettingsArray.value)
			line.invisible = options.invisible;
	}
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
			<NullableBooleanInput v-if="reverseCanBeNull" v-model="optionsCache.reverse" />
			<BooleanInput v-else v-model="optionsCache.reverse" />
		</PanelSection>
		<PanelSection :label="$t(`invisible`)">
			<NullableBooleanInput v-if="invisibleCanBeNull" v-model="optionsCache.invisible" />
			<BooleanInput v-else v-model="optionsCache.invisible" />
		</PanelSection>
		<PanelSection column>
			<button @click="modifyObject">{{ $t(`apply`) }}</button>
		</PanelSection>
	</PanelContent>
</template>