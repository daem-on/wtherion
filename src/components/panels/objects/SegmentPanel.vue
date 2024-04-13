<script setup lang="ts">
import PanelContent from "../../common/PanelContent.vue";
import PanelSection from "../../common/PanelSection.vue";
import getSettings from "../../../objectSettings/model/getSettings";
import { computed } from "vue";
import LineSettings from "../../../objectSettings/model/LineSettings";

const props = defineProps<{
	selection: paper.Path,
	selectedSegment: paper.Segment,
}>();

const settings = computed(() => getSettings(props.selection) as LineSettings);

const segmentSettings = computed({
	get: () => settings.value.segmentSettings[props.selectedSegment.index],
	set: (value: string) => settings.value.segmentSettings[props.selectedSegment.index] = value,
});
</script>

<template>
	<PanelContent>
		<h2>{{ $t("segment") }}</h2>
		<PanelSection :label="$t(`otherSettings`)" column>
			<textarea rows="2" v-model="segmentSettings"></textarea>
		</PanelSection>
	</PanelContent>
</template>

<style scoped>
h2 {
	margin-top: 0;
	font-weight: bold;
}

textarea {
	min-width: 100%;
	max-width: 100%;
	font-family: monospace;
	height: auto;
}
</style>