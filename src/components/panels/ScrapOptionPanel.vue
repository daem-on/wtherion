<script setup lang="ts">
import { triggers } from "../../triggers";
import PanelContent from "../../components/common/PanelContent.vue";
import ScrapSettings from "../../objectSettings/model/ScrapSettings";
import getSettings from "../../objectSettings/model/getSettings";
import { onUnmounted, ref } from "vue";
import paper from "paper";
import CustomList from "../common/CustomList.vue";
import PanelSection from "../common/PanelSection.vue";

const scrap = ref<{ name: string, settings: ScrapSettings } | null>(null);

function handleLayerChange() {
	if (!paper.project) return;
	const result = getSettings(paper.project.activeLayer);
	if (result) {
		scrap.value = {
			name: paper.project.activeLayer.name,
			settings: result
		};
	} else {
		scrap.value = null;
	}
}
handleLayerChange();

triggers.onAny(["LayerAdded", "LayerRemoved", "LayersChanged"], handleLayerChange);

onUnmounted(() => {
	triggers.offAny(["LayerAdded", "LayerRemoved", "LayersChanged"], handleLayerChange);
});
</script>

<template>
	<PanelContent v-if="scrap">
		<PanelSection :label="$t(`scrap.projection`)">
			<CustomList v-model="scrap.settings.projection" :options="['plan', '[elevation 0]', 'extended', 'none']" :imageRoot="`assets/projection`" />
		</PanelSection>
		<PanelSection :label="$t(`scale`)">
			<input type="text" v-model="scrap.settings.scale" />
		</PanelSection>
		<PanelSection :label="$t(`scrap.author`)">
			<input type="text" v-model="scrap.settings.author" />
		</PanelSection>
		<PanelSection :label="$t(`scrap.copyright`)">
			<input type="text" v-model="scrap.settings.copyright" />
		</PanelSection>
		<PanelSection :label="$t(`scrap.stationNames`)">
			<input type="text" v-model="scrap.settings.stationNames" />
		</PanelSection>
		<PanelSection :label="$t(`otherSettings`)" column>
			<textarea v-model="scrap.settings.otherSettings"></textarea>
		</PanelSection>
	</PanelContent>
</template>