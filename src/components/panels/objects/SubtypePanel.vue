<script setup lang="ts">
import PanelContent from "../../common/PanelContent.vue";
import PanelSection from "../../common/PanelSection.vue";
import CustomList from "../../common/CustomList.vue";
import getSettings from "../../../objectSettings/model/getSettings";
import { computed } from "vue";
import LineSettings from "../../../objectSettings/model/LineSettings";
import subtypes from "../../../res/subtype-list.json";
import BooleanInput from "../../common/BooleanInput.vue";

const props = defineProps<{
	selection: paper.Path,
	selectedSegment: paper.Segment,
}>();

const settings = computed(() => getSettings(props.selection) as LineSettings);

const subtype = computed({
	get: () => settings.value.subtypes[props.selectedSegment.index],
	set: (value: string) => settings.value.subtypes[props.selectedSegment.index] = value,
});

const segmentSettings = computed({
	get: () => settings.value.segmentSettings[props.selectedSegment.index],
	set: (value: string) => settings.value.segmentSettings[props.selectedSegment.index] = value,
});

const enableSubtype = computed({
	get: () => !!subtype.value,
	set: (value: boolean) => {
		if (!value) subtype.value = undefined;
		else subtype.value = "bedrock";
	}
});

type Entry = {index: number, subtype: string};

const subtypeEntries = computed<Entry[]>(() => Object.entries(settings.value.subtypes).map(([index, subtype]) => ({index: +index, subtype})));

const nextSubtype = computed<Entry>(() => {
	return subtypeEntries.value.find(({ index }) => index > props.selectedSegment.index);
});

const lastSubtype = computed<Entry>(() => {
	for (let i = subtypeEntries.value.length - 1; i >= 0; i--) {
		if (subtypeEntries.value[i].index < props.selectedSegment.index)
			return subtypeEntries.value[i];
	}
});

</script>

<template>
	<PanelContent>
		<p>
			<template v-if="lastSubtype">
				{{ $t(`subtype.hasSubtype`, lastSubtype) }}
			</template>
			<template v-else>
				{{ $t(`subtype.default`) }}
			</template>
		</p>
		<p>
			<template v-if="nextSubtype">
				{{ $t(`subtype.followedBy`, nextSubtype) }}
			</template>
			<template v-else>
				{{ $t(`subtype.last`) }}
			</template>
		</p>
		<PanelSection :label="$t(`defineSubtype`)">
			<BooleanInput v-model="enableSubtype" />
		</PanelSection>
		<template v-if="enableSubtype">
			<PanelSection :label="$t(`type`)">
				<CustomList v-model="subtype" :options="subtypes.wall.slice(1)" :imageRoot="`assets/rendered/subtype`" />
			</PanelSection>
			<PanelSection :label="$t(`otherSettings`)" column>
				<textarea rows="2" v-model="segmentSettings"></textarea>
			</PanelSection>
		</template>
	</PanelContent>
</template>

<style scoped>
textarea {
	min-width: 100%;
	max-width: 100%;
	font-family: monospace;
	height: auto;
}
</style>