<script setup lang="ts">
import { currentScrap } from "../../scrap";
import PanelContent from "../../components/common/PanelContent.vue";
import CustomList from "../common/CustomList.vue";
import PanelSection from "../common/PanelSection.vue";
import Foldable from "../common/Foldable.vue";
import ArbitrarySettingSection from "./fragments/ArbitrarySettingSection.vue";

const scrap = currentScrap;
</script>

<template>
	<Foldable fullWidth noBorder>
		<template #title>
			<h2>{{ $t("scrapSettingsTitle") }} - {{ scrap.name }}</h2>
		</template>
		<PanelContent v-if="scrap" class="content">
			<PanelSection :label="$t(`scrap.projection`)">
				<CustomList v-model="scrap.settings.projection" :options="['plan', 'elevation 0', 'extended', 'none']" :imageRoot="`assets/projection`" />
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
			<h3>{{ $t(`otherSettings`) }}</h3>
			<ArbitrarySettingSection
				:editing="scrap.settings"
				:exclude="['projection', 'scale', 'author', 'copyright', 'stationNames']" />
		</PanelContent>
	</Foldable>
</template>

<style scoped>
textarea {
	min-width: 100%;
	max-width: 100%;
	font-family: monospace;
	height: auto;
}

h2 {
	display: inline;
	margin: 8px 0;
	font-weight: bold;
	word-wrap: break-word;
}

.content {
	padding: 8px;
}
</style>