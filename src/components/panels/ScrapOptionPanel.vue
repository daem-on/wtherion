<script setup lang="ts">
import { currentScrap } from "../../scrap";
import PanelContent from "../../components/common/PanelContent.vue";
import CustomList from "../common/CustomList.vue";
import PanelSection from "../common/PanelSection.vue";

const scrap = currentScrap;
</script>

<template>
	<PanelContent v-if="scrap">
		<h2>{{ $t("scrapSettingsTitle") }} - {{ scrap.name }}</h2>
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
			<textarea rows="2" v-model="scrap.settings.otherSettings"></textarea>
		</PanelSection>
	</PanelContent>
</template>

<style scoped>
textarea {
	min-width: 100%;
	max-width: 100%;
	font-family: monospace;
	height: auto;
}

h2 {
	margin: 8px 0;
	font-weight: bold;
	word-wrap: break-word;
}
</style>